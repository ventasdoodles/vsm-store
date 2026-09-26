import { supabase } from '@/lib/supabase';
import { isPilotActive } from '@/lib/pilot-activation';
import { CustomerIntelligenceRequestSchema } from '@/lib/contracts/ai-edge-contract';
import { buildCustomerIntelligenceNoWriteSmokeRequestFields } from '@/lib/customer-intelligence-no-write-smoke';
import { attachCustomerIntelligenceNoWriteSmokeMetadata } from './helpers';
import type { CustomerProfile } from '@/types/customer';

export interface ExecuteConciergeRemoteChatParams {
    query: string;
    history: { role: 'user' | 'assistant'; content: string }[];
    customerProfile?: CustomerProfile;
    audio?: string;
    mimeType?: string;
    cesarinSessionId?: string | null;
    options?: { noWriteSmoke?: boolean; onChunk?: (text: string) => void };
}

export async function executeConciergeRemoteChat({
    query,
    history,
    customerProfile,
    audio,
    mimeType,
    cesarinSessionId,
    options,
}: ExecuteConciergeRemoteChatParams): Promise<Record<string, any>> {
    const token = (await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
    const requestBody = { 
        action: 'concierge_chat', 
        query,
        history,
        audio,
        mimeType,
        cesarin_session_id: cesarinSessionId ?? null,
        customerContext: customerProfile ? {
            id: customerProfile.id,
            name: customerProfile.full_name,
            preferences: customerProfile.ai_preferences,
            ia_context: customerProfile.ia_context,
            last_interactions: customerProfile.last_interactions
        } : null,
        is_pilot: isPilotActive(),
        stream: !!options?.onChunk,
        ...(options?.noWriteSmoke ? buildCustomerIntelligenceNoWriteSmokeRequestFields() : {}),
    };

    // === CONTRACT ENFORCEMENT: Schema-First Validation ===
    const validatedRequestBody = CustomerIntelligenceRequestSchema.parse(requestBody);

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-intelligence`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(validatedRequestBody)
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        const error = new Error(`HTTP error! status: ${res.status} body: ${errText}`);
        
        try {
            const errJson = JSON.parse(errText);
            if (errJson && errJson.no_write_smoke) {
                attachCustomerIntelligenceNoWriteSmokeMetadata(error, errJson.no_write_smoke);
            }
        } catch (_e) {
            // Not JSON, ignore
        }
        
        throw error;
    }

    if (options?.onChunk && res.headers.get('Content-Type')?.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let finalMetadata: Record<string, any> | null = null;
        let receivedText = false;

        if (reader) {
            let buffer = '';

            // === SSE State Machine (WHATWG Server-Sent Events spec) ===
            // Per-event buffers: `data` lines accumulate until a pure blank line
            // terminates the event; the event type resets after each dispatch.
            let dataLines: string[] = [];
            let eventType = '';

            const dispatchEvent = () => {
                if (dataLines.length === 0) {
                    eventType = '';
                    return;
                }
                // Multiple `data:` lines of the same event are joined with '\n'.
                const payload = dataLines.join('\n');
                dataLines = [];

                if (eventType === 'text') {
                    // The backend serializes text chunks as JSON strings. Accept the
                    // parsed value ONLY when it is a real string; otherwise emit the
                    // raw payload untouched, so JSON primitives like `1` or `true`
                    // are never mutated into numbers/booleans.
                    let chunk = payload;
                    try {
                        const parsed = JSON.parse(payload);
                        if (typeof parsed === 'string') {
                            chunk = parsed;
                        }
                    } catch {
                        // Raw text payload: emit as-is.
                    }
                    options?.onChunk?.(chunk);
                    receivedText = true;
                } else if (eventType === 'metadata') {
                    try {
                        finalMetadata = JSON.parse(payload);
                    } catch {
                        // Malformed metadata: ignore.
                    }
                }
                eventType = '';
            };

            const processLine = (line: string) => {
                // Pure blank line: end of event -> dispatch.
                if (line.length === 0) {
                    dispatchEvent();
                    return;
                }
                // Comment line (starts with ':'): ignore.
                if (line.startsWith(':')) {
                    return;
                }
                // Field parsing: "field: value" / "field:value". Exactly one leading
                // space after the colon is removed; every other whitespace byte in
                // the value is preserved verbatim (no .trim() anywhere, so Markdown
                // indentation and bullet formatting inside `data:` survive intact).
                const colonIndex = line.indexOf(':');
                const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
                let value = colonIndex === -1 ? '' : line.slice(colonIndex + 1);
                if (value.startsWith(' ')) {
                    value = value.slice(1);
                }

                if (field === 'event') {
                    eventType = value;
                } else if (field === 'data') {
                    dataLines.push(value);
                }
                // 'id', 'retry' and unknown fields are ignored.
            };

            // Extracts every complete line from `buffer` (LF, CR or CRLF
            // terminated), leaving any incomplete tail in `buffer`.
            const consumeCompleteLines = (): string[] => {
                const lines: string[] = [];
                let start = 0;

                for (;;) {
                    const lfIndex = buffer.indexOf('\n', start);
                    const crIndex = buffer.indexOf('\r', start);

                    if (lfIndex === -1 && crIndex === -1) break;

                    let end: number;
                    let next: number;

                    if (crIndex !== -1 && (lfIndex === -1 || crIndex < lfIndex)) {
                        if (crIndex === buffer.length - 1) {
                            // Ambiguous trailing CR: it may be the first half of a
                            // CRLF pair split across chunks. Wait for more bytes.
                            break;
                        }
                        if (buffer.charCodeAt(crIndex + 1) === 10) {
                            end = crIndex;
                            next = crIndex + 2;
                        } else {
                            end = crIndex;
                            next = crIndex + 1;
                        }
                    } else {
                        end = lfIndex;
                        next = lfIndex + 1;
                    }

                    lines.push(buffer.slice(start, end));
                    start = next;
                }

                if (start > 0) {
                    buffer = buffer.slice(start);
                }
                return lines;
            };

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    for (const line of consumeCompleteLines()) {
                        processLine(line);
                    }
                }

                // Flush any pending multi-byte sequence held by the decoder.
                buffer += decoder.decode();
                for (const line of consumeCompleteLines()) {
                    processLine(line);
                }
            } catch (err) {
                // If a TCP reset or network error occurs during streaming,
                // we break the loop and rely on the graceful degradation
                // block below to return partial metadata.
            }

            // EOF: per WHATWG spec, if the stream ends in the middle of an
            // event (no final empty line), the pending event MUST be discarded.
            // We do not dispatch the incomplete event.
        }
        
        if (finalMetadata) {
            return finalMetadata;
        }

        if (receivedText) {
            // The stream ended before the metadata event arrived (e.g. network
            // cut). Never discard the text the user already read: return partial
            // metadata so the UI keeps the message on screen.
            return { partial: true };
        }

        throw new Error('Stream finished without metadata');
    } else {
        return await res.json();
    }
}
