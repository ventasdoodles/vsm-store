import { ToolResult } from '../tools.ts';

export type GeminiTokenUsageTelemetry = {
    model: string;
    promptTokenCount: number | null;
    candidatesTokenCount: number | null;
    totalTokenCount: number | null;
    cachedContentTokenCount: number | null;
};

export function sanitizeTokenCount(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function buildGeminiTokenUsageTelemetry(
    model: string,
    usageMetadata: unknown,
): GeminiTokenUsageTelemetry | null {
    if (!usageMetadata || typeof usageMetadata !== 'object') {
        return null;
    }

    const usage = usageMetadata as Record<string, unknown>;
    return {
        model,
        promptTokenCount: sanitizeTokenCount(usage.promptTokenCount),
        candidatesTokenCount: sanitizeTokenCount(usage.candidatesTokenCount),
        totalTokenCount: sanitizeTokenCount(usage.totalTokenCount),
        cachedContentTokenCount: sanitizeTokenCount(usage.cachedContentTokenCount),
    };
}

export type TelemetryContractReason = 'capsule_handoff' | 'edge_logged' | 'edge_insert_failed';

export function buildTelemetryContract(input: {
    owner: 'edge' | 'client';
    edgeLogged: boolean;
    reason: TelemetryContractReason;
}) {
    return {
        owner: input.owner,
        edge_logged: input.edgeLogged,
        client_should_log_fallback: input.owner === 'client' || !input.edgeLogged,
        reason: input.reason,
    };
}

export function extractTelemetryNextStepTruth(raw: unknown): {
    next_step_family: string | null;
    assist_action_present: boolean;
} {
    const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null;

    return {
        next_step_family: typeof record?.family === 'string' ? record.family : null,
        assist_action_present: Boolean(record?.assistAction),
    };
}

export function resolveTelemetryRetrievalSource(toolResults: ToolResult[]): string | null {
    const successfulNames = new Set(
        toolResults
            .filter((result) => result.status === 'success')
            .map((result) => result.name),
    );

    if (successfulNames.has('public_url_context')) return 'PUBLIC_URL_CONTEXT';
    if (successfulNames.has('public_web_search')) return 'PUBLIC_WEB_SEARCH';
    if (successfulNames.has('get_inventory_outlook')) return 'INVENTORY_OUTLOOK';
    if (successfulNames.has('storefront_compatibility_check')) return 'COMPATIBILITY_CHECK';
    if (successfulNames.has('check_compatibility')) return 'COMPATIBILITY_CHECK';
    if (successfulNames.has('track_order')) return 'ORDER_TRACKING';
    if (successfulNames.has('knowledge_rag_foundation') || successfulNames.has('get_store_policy')) return 'STORE_POLICY';
    if (successfulNames.has('search_products')) return 'SEARCH_PRODUCTS';

    return null;
}
