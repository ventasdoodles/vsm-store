import { supabase } from '@/lib/supabase';

export type ConversionEventType =
    | 'ai_cta_rendered'
    | 'ai_cta_clicked'
    | 'cart_mutation_result'
    | 'cart_opened'
    | 'checkout_started'
    | 'order_created'
    | 'payment_completed';

export type ConversionSource = 'cesarin' | 'manual';

export type ConversionEventMetadata = Record<string, unknown>;

const CESARIN_SESSION_KEY = 'cesarin_session_id';
let memorySessionId: string | null = null;

function createSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `cesarin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateCesarinSessionId(): string {
    if (typeof window === 'undefined') {
        memorySessionId = memorySessionId ?? createSessionId();
        return memorySessionId;
    }

    const existing = window.sessionStorage.getItem(CESARIN_SESSION_KEY);
    if (existing) return existing;

    const sessionId = createSessionId();
    window.sessionStorage.setItem(CESARIN_SESSION_KEY, sessionId);
    return sessionId;
}

export function getCesarinSessionId(): string | null {
    if (typeof window === 'undefined') return memorySessionId;
    return window.sessionStorage.getItem(CESARIN_SESSION_KEY);
}

export async function recordConversationConversionEvent(input: {
    sessionId?: string | null;
    eventType: ConversionEventType;
    metadata?: ConversionEventMetadata;
}): Promise<void> {
    try {
        await supabase.from('conversation_conversion_events').insert({
            session_id: input.sessionId ?? null,
            event_type: input.eventType,
            metadata: input.metadata ?? {},
        });
    } catch {
        // Conversion measurement is causal evidence, not runtime control flow.
    }
}

export function emitConversationConversionEvent(input: {
    sessionId?: string | null;
    eventType: ConversionEventType;
    metadata?: ConversionEventMetadata;
}): void {
    void recordConversationConversionEvent(input);
}
