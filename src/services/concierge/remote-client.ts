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
        let finalMetadata = null;

        if (reader) {
            let buffer = '';
            let currentEventType = '';

            const processLine = (line: string) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    currentEventType = '';
                    return;
                }
                if (trimmed.startsWith('event: ')) {
                    currentEventType = trimmed.slice(7).trim();
                    return;
                }
                if (trimmed.startsWith('data: ')) {
                    const rawData = trimmed.slice(6);
                    if (currentEventType === 'text') {
                        try {
                            const newText = JSON.parse(rawData);
                            options?.onChunk?.(newText);
                        } catch {
                            options?.onChunk?.(rawData);
                        }
                    } else if (currentEventType === 'metadata') {
                        try {
                            finalMetadata = JSON.parse(rawData);
                        } catch {
                            // ignore parse error on partial metadata
                        }
                    }
                }
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    processLine(line);
                }
            }

            if (buffer.trim()) {
                processLine(buffer);
            }
        }
        
        if (finalMetadata) {
            return finalMetadata;
        } else {
            throw new Error('Stream finished without metadata');
        }
    } else {
        return await res.json();
    }
}
