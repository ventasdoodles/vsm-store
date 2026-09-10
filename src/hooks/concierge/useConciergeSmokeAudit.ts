import { useCallback, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ConciergeMessage } from '@/services';
import {
    CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
    CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS,
    isCustomerIntelligenceNoWriteSmokeActive,
} from '@/lib/customer-intelligence-no-write-smoke';
export { CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT };

export const NO_WRITE_SMOKE_QUERY_PARAM = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.triggerQueryParam;
export const NO_WRITE_SMOKE_CONTRACT_PARAM = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.contractQueryParam;
export const NO_WRITE_SMOKE_RAG_QUALITY_PARAM = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.ragQualityQueryParam;
export const NO_WRITE_SMOKE_REQUEST_FIELD = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.requestField;
export const NO_WRITE_SMOKE_AUDIT_FIELD = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.auditField;
export const NO_WRITE_SMOKE_EDGE_METADATA_PRESENT_FIELD = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.edgeMetadataPresentField;
export const NO_WRITE_SMOKE_REQUEST_CONTRACT_PRESENT_FIELD = CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.requestContractPresentField;
export const NO_WRITE_SMOKE_QUESTION = '¿Cuáles son las opciones de envío o pago?';
export const NO_WRITE_RAG_QUALITY_PROMPTS = [
    { category: 'payment_method', prompt: '¿Aceptan tarjeta o cómo puedo pagar?' },
    { category: 'shipping_scope', prompt: '¿Hacen envíos a todo México y es a domicilio?' },
    { category: 'shipping_cost', prompt: '¿Cuánto cuesta el envío por DHL?' },
    { category: 'combined_payment_shipping', prompt: NO_WRITE_SMOKE_QUESTION },
    { category: 'store_hours_limitation', prompt: '¿A qué hora abren hoy?' },
    { category: 'unsupported_delivery_guarantee', prompt: '¿Me garantizas entrega mañana a domicilio?' },
] as const;

export type NoWriteSmokeAuditContext = {
    prompt_category?: string;
    prompt_label?: string;
    status?: 'ok' | 'blocked' | 'error' | 'pending';
    error_type?: string;
};

export function shouldAutoRunNoWriteSmoke(): boolean {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    return params.get(NO_WRITE_SMOKE_QUERY_PARAM) === 'true'
        && params.get(NO_WRITE_SMOKE_CONTRACT_PARAM) === CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT
        && !params.has(NO_WRITE_SMOKE_RAG_QUALITY_PARAM);
}

export function shouldAutoRunNoWriteRagQualitySmoke(): boolean {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    return params.get(NO_WRITE_SMOKE_QUERY_PARAM) === 'true'
        && params.get(NO_WRITE_SMOKE_CONTRACT_PARAM) === CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT
        && params.get(NO_WRITE_SMOKE_RAG_QUALITY_PARAM) === 'true';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object';
}

export function extractNoWriteSmokeMetadata(value: unknown): Record<string, unknown> | null {
    if (!isRecord(value)) return null;

    const direct = value[NO_WRITE_SMOKE_REQUEST_FIELD];
    if (isCustomerIntelligenceNoWriteSmokeActive(direct)) return direct as Record<string, unknown>;

    const capsuleContract = value.capsule_contract;
    if (isRecord(capsuleContract) && isCustomerIntelligenceNoWriteSmokeActive(capsuleContract[NO_WRITE_SMOKE_REQUEST_FIELD])) {
        return capsuleContract[NO_WRITE_SMOKE_REQUEST_FIELD] as Record<string, unknown>;
    }

    return null;
}

export function buildNoWriteSmokeAuditSummary(response: {
    message?: string | null;
    capsule_contract?: Record<string, unknown>;
}, context: NoWriteSmokeAuditContext = {}): Record<string, unknown> {
    const contract = response.capsule_contract ?? {};
    const metadata = isRecord(contract[NO_WRITE_SMOKE_REQUEST_FIELD]) ? contract[NO_WRITE_SMOKE_REQUEST_FIELD] : {};

    return {
        prompt_category: context.prompt_category ?? null,
        prompt_label: context.prompt_label ?? null,
        status: context.status ?? 'ok',
        error_type: context.error_type ?? null,
        metadata_present: Boolean(metadata.active),
        [NO_WRITE_SMOKE_EDGE_METADATA_PRESENT_FIELD]: Boolean(metadata.active),
        [NO_WRITE_SMOKE_REQUEST_CONTRACT_PRESENT_FIELD]: Boolean(metadata.active),
        contract: typeof metadata.contract === 'string' ? metadata.contract : null,
        suppressed_writes: Array.isArray(metadata.suppressed_writes) ? metadata.suppressed_writes : [],
        suppressed_calls: Array.isArray(metadata.suppressed_calls) ? metadata.suppressed_calls : [],
        capsule_name: typeof contract.capsule_name === 'string' ? contract.capsule_name : null,
        knowledge_answer_present: typeof response.message === 'string' && response.message.trim().length > 0,
        main_message_present: typeof contract.ui_render_hint === 'string' && contract.ui_render_hint.trim().length > 0,
        match_strategy: typeof contract.match_strategy === 'string' ? contract.match_strategy : null,
        resolved_chunk_count: Array.isArray(contract.resolved_chunks) ? contract.resolved_chunks.length : 0,
    };
}

export function buildNoWriteSmokePendingAuditSummary(): Record<string, unknown> {
    return {
        prompt_category: 'rag_quality_smoke',
        prompt_label: null,
        status: 'pending',
        error_type: null,
        metadata_present: false,
        [NO_WRITE_SMOKE_EDGE_METADATA_PRESENT_FIELD]: false,
        [NO_WRITE_SMOKE_REQUEST_CONTRACT_PRESENT_FIELD]: true,
        contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
        suppressed_writes: [],
        suppressed_calls: [],
        capsule_name: null,
        knowledge_answer_present: false,
        main_message_present: false,
        match_strategy: null,
        resolved_chunk_count: 0,
    };
}

export function waitForNoWriteSmokePreflightPaint(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

export interface UseConciergeSmokeAuditOptions {
    user: User | null;
    authLoading: boolean;
    addMessage: (msg: Partial<ConciergeMessage>) => void;
    setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    runAssistantTurn: (params: {
        displayContent: string;
        requestContent: string;
        noWriteSmoke?: boolean;
        smokeAudit?: boolean;
        smokeAuditContext?: NoWriteSmokeAuditContext;
    }) => Promise<void>;
}

export function useConciergeSmokeAudit({
    user,
    authLoading,
    addMessage,
    setIsOpen,
    runAssistantTurn,
}: UseConciergeSmokeAuditOptions) {
    const noWriteSmokeAutoRunRef = useRef(false);

    const runNoWriteSmoke = useCallback(async () => {
        if (authLoading) return;

        if (!user) {
            addMessage({
                content: 'No-write smoke blocked: authenticated session required.',
                capsule_contract: {
                    [NO_WRITE_SMOKE_AUDIT_FIELD]: {
                        metadata_present: false,
                        contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
                        blocked_reason: 'authenticated_session_required',
                    },
                },
            } as Partial<ConciergeMessage>);
            return;
        }

        await runAssistantTurn({
            displayContent: NO_WRITE_SMOKE_QUESTION,
            requestContent: NO_WRITE_SMOKE_QUESTION,
            noWriteSmoke: true,
            smokeAudit: true,
            smokeAuditContext: {
                prompt_category: 'combined_payment_shipping',
                prompt_label: NO_WRITE_SMOKE_QUESTION,
            },
        });
    }, [addMessage, authLoading, runAssistantTurn, user]);

    const runNoWriteRagQualitySmoke = useCallback(async () => {
        if (authLoading) return;

        if (!user) {
            addMessage({
                content: 'No-write RAG quality smoke blocked: authenticated session required.',
                capsule_contract: {
                    [NO_WRITE_SMOKE_AUDIT_FIELD]: {
                        prompt_category: 'rag_quality_smoke',
                        prompt_label: null,
                        status: 'blocked',
                        metadata_present: false,
                        contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
                        blocked_reason: 'authenticated_session_required',
                    },
                },
            } as Partial<ConciergeMessage>);
            return;
        }

        addMessage({
            content: 'No-write RAG quality smoke pending: six-prompt audit armed before execution.',
            capsule_contract: {
                [NO_WRITE_SMOKE_AUDIT_FIELD]: buildNoWriteSmokePendingAuditSummary(),
            },
        } as Partial<ConciergeMessage>);
        await waitForNoWriteSmokePreflightPaint();

        for (const { category, prompt } of NO_WRITE_RAG_QUALITY_PROMPTS) {
            await runAssistantTurn({
                displayContent: prompt,
                requestContent: prompt,
                noWriteSmoke: true,
                smokeAudit: true,
                smokeAuditContext: {
                    prompt_category: category,
                    prompt_label: prompt,
                },
            });
        }
    }, [addMessage, authLoading, runAssistantTurn, user]);

    useEffect(() => {
        if (authLoading || noWriteSmokeAutoRunRef.current) return;

        if (shouldAutoRunNoWriteRagQualitySmoke()) {
            noWriteSmokeAutoRunRef.current = true;
            setIsOpen(true);
            void runNoWriteRagQualitySmoke();
            return;
        }

        if (shouldAutoRunNoWriteSmoke()) {
            noWriteSmokeAutoRunRef.current = true;
            setIsOpen(true);
            void runNoWriteSmoke();
        }
    }, [authLoading, runNoWriteRagQualitySmoke, runNoWriteSmoke, setIsOpen]);

    return {
        runNoWriteSmoke,
        runNoWriteRagQualitySmoke,
    };
}
