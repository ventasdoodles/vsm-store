import type { SimulationResult } from '@/types/cesarin';

export type AdminDecisionTraceEvidenceKind =
    | 'authoritative_runtime'
    | 'partial_runtime'
    | 'simulated';

export interface AdminDecisionTraceView {
    evidenceKind: AdminDecisionTraceEvidenceKind;
    evidenceLabel: string;
    evidenceShortLabel: string;
    evidenceDetail: string;
    analystIntent: string | null;
    finalIntent: string | null;
    routingPath: string | null;
    routeKind: 'capsule' | 'non_capsule' | 'unknown';
    routeLabel: string;
    routedCapsule: string | null;
    guardrailOverrides: string[];
    injectedTools: string[];
    executionStatus: string | null;
    degradedReason: string | null;
    retrievalSource: string | null;
    matchStrategy: string | null;
    responseText: string | null;
    offeredProducts: Array<{ id: string; name: string; slug: string }>;
}

interface BuildAdminDecisionTraceInput {
    responseText?: string | null;
    aiLogicDebug?: Record<string, unknown> | null;
    forceEvidenceKind?: AdminDecisionTraceEvidenceKind | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asBoolean(value: unknown): boolean {
    return value === true || value === 'true';
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value
              .map((entry) => asString(entry))
              .filter((entry): entry is string => entry !== null)
        : [];
}

function extractOfferedProducts(value: unknown): Array<{ id: string; name: string; slug: string }> {
    if (!Array.isArray(value)) return [];

    return value
        .map((entry) => asRecord(entry))
        .filter((entry): entry is Record<string, unknown> => entry !== null)
        .filter((entry) => asString(entry.id) && asString(entry.name) && asString(entry.slug))
        .map((entry) => ({
            id: asString(entry.id)!,
            name: asString(entry.name)!,
            slug: asString(entry.slug)!,
        }));
}

function humanizeCapsuleName(capsule: string | null): string {
    if (!capsule) return 'Sin capsula';

    switch (capsule) {
        case 'product_search_integrity':
            return 'Capsula de producto';
        case 'knowledge_rag_foundation':
            return 'Capsula documental';
        case 'cart_operator':
            return 'Capsula de carrito';
        case 'analyst_refinement':
            return 'Refinamiento del analyst';
        default:
            return capsule;
    }
}

export function buildAdminDecisionTraceView({
    responseText = null,
    aiLogicDebug = null,
    forceEvidenceKind = null,
}: BuildAdminDecisionTraceInput): AdminDecisionTraceView {
    const debug = asRecord(aiLogicDebug) ?? {};
    const guardrailTelemetry = asRecord(debug.guardrail_telemetry) ?? {};
    const rawAnalystReport = asRecord(debug.raw_analyst_report) ?? {};
    const analystReport = asRecord(debug.analyst_report) ?? {};

    const analystIntent =
        asString(guardrailTelemetry.analyst_intent)
        ?? asString(debug.analyst_intent)
        ?? asString(rawAnalystReport.intent)
        ?? asString(analystReport.intent);

    const finalIntent = asString(debug.detected_intent) ?? asString(debug.intent);
    const routedCapsule = asString(debug.sommelier_routed_capsule) ?? asString(debug.capsule_name);
    const routingPath = asString(debug.routing_path);
    const guardrailOverrides = [
        ...asStringArray(guardrailTelemetry.guardrail_overrides),
        ...asStringArray(debug.guardrail_overrides),
    ].filter((value, index, self) => self.indexOf(value) === index);
    const injectedTools = [
        ...asStringArray(guardrailTelemetry.injected_tools),
        ...asStringArray(debug.injected_tools),
    ].filter((value, index, self) => self.indexOf(value) === index);
    const executionStatus =
        asString(debug.capsule_execution_status)
        ?? asString(debug.execution_status)
        ?? asString(debug.status);
    const degradedReason =
        asString(debug.sommelier_fallback_reason)
        ?? asString(debug.degraded_reason)
        ?? asString(debug.error_type);
    const retrievalSource =
        asString(debug.capsule_retrieval_source)
        ?? asString(debug.retrieval_source);
    const matchStrategy =
        asString(debug.capsule_match_strategy)
        ?? asString(debug.match_strategy);
    const offeredProducts = extractOfferedProducts(debug.offered_products);

    const routeKind: AdminDecisionTraceView['routeKind'] = routedCapsule
        ? 'capsule'
        : (finalIntent || routingPath)
            ? 'non_capsule'
            : 'unknown';

    const routeLabel = routeKind === 'capsule'
        ? `${humanizeCapsuleName(routedCapsule)}${routingPath ? ` · ${routingPath}` : ''}`
        : routeKind === 'non_capsule'
            ? `Sin capsula${routingPath ? ` · ${routingPath}` : ''}`
            : 'Ruta no disponible';

    const hasRuntimeDecisionEvidence = Boolean(
        analystIntent
        || finalIntent
        || routingPath
        || routedCapsule
        || executionStatus
        || degradedReason
        || retrievalSource
        || matchStrategy
        || guardrailOverrides.length > 0
        || injectedTools.length > 0
        || offeredProducts.length > 0,
    );

    const isSimulation = forceEvidenceKind === 'simulated' || asBoolean(debug.is_simulation);
    const evidenceKind: AdminDecisionTraceEvidenceKind = forceEvidenceKind
        ?? (isSimulation
            ? 'simulated'
            : hasRuntimeDecisionEvidence
                ? 'authoritative_runtime'
                : 'partial_runtime');

    const evidenceLabel = evidenceKind === 'authoritative_runtime'
        ? 'Evidencia runtime'
        : evidenceKind === 'partial_runtime'
            ? 'Evidencia parcial'
            : 'Evidencia simulada';

    const evidenceShortLabel = evidenceKind === 'authoritative_runtime'
        ? 'Runtime'
        : evidenceKind === 'partial_runtime'
            ? 'Parcial'
            : 'Simulada';

    const evidenceDetail = evidenceKind === 'authoritative_runtime'
        ? 'Lectura basada en telemetria persistida y campos reales de decision.'
        : evidenceKind === 'partial_runtime'
            ? 'La lectura conserva verdad persistida, pero faltan piezas causales para una explicacion completa.'
            : 'Traza de laboratorio o simulacion. Sirve para QA u operador, no equivale a runtime productivo.';

    return {
        evidenceKind,
        evidenceLabel,
        evidenceShortLabel,
        evidenceDetail,
        analystIntent,
        finalIntent,
        routingPath,
        routeKind,
        routeLabel,
        routedCapsule,
        guardrailOverrides,
        injectedTools,
        executionStatus,
        degradedReason,
        retrievalSource,
        matchStrategy,
        responseText,
        offeredProducts,
    };
}

export function buildAdminDecisionTraceViewFromSimulationResult(result: SimulationResult): AdminDecisionTraceView {
    const aiLogicDebug: Record<string, unknown> = {
        is_simulation: true,
        detected_intent: result.detected_intent ?? null,
        sommelier_routed_capsule: result.capsule_name ?? null,
        injected_tools: result.tools_called ?? [],
        capsule_execution_status: result.status ?? null,
        sommelier_fallback_reason: result.fallback_used ? (result.reasons[0] ?? 'fallback_used') : null,
        product_card_count: result.product_cards_count ?? null,
    };

    return buildAdminDecisionTraceView({
        responseText: result.response ?? null,
        aiLogicDebug,
        forceEvidenceKind: 'simulated',
    });
}
