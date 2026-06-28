






import { type CesarinCommercialMove } from '@/lib/cesarin-commercial-judgment';

import {
    compactCesarinCopy,
    normalizeCompactText,
    splitIntoSentences
} from '@/lib/cesarin-text-utils';


import {
    isCustomerIntelligenceNoWriteSmokeActive,
    type CustomerIntelligenceNoWriteSmokeMetadata
} from '@/lib/customer-intelligence-no-write-smoke';




import type { Product } from '@/types/product';


import type { InternalResolvedProduct } from '@/types/ai-capsule';
import { ConciergeCatalogGate, ConciergeCatalogGateReason, ConciergeMessage, ConciergeSourceContext, ConciergeTurnAnalysis, ConciergeTurnPriority } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object';
}

export function extractCustomerIntelligenceNoWriteSmokeMetadata(value: unknown): CustomerIntelligenceNoWriteSmokeMetadata | null {
    if (!isRecord(value)) return null;

    const direct = value.no_write_smoke;
    if (isCustomerIntelligenceNoWriteSmokeActive(direct)) return direct;

    const capsuleContract = value.capsule_contract;
    if (isRecord(capsuleContract) && isCustomerIntelligenceNoWriteSmokeActive(capsuleContract.no_write_smoke)) {
        return capsuleContract.no_write_smoke;
    }

    return null;
}

export function attachCustomerIntelligenceNoWriteSmokeMetadata(error: unknown, metadata: unknown): Error {
    const normalizedError = error instanceof Error ? error : new Error(String(error));

    if (isCustomerIntelligenceNoWriteSmokeActive(metadata)) {
        Object.defineProperties(normalizedError, {
            no_write_smoke: {
                value: metadata,
                enumerable: false,
            },
            capsule_contract: {
                value: { no_write_smoke: metadata },
                enumerable: false,
            },
        });
    }

    return normalizedError;
}

export function resolveFallbackCurrentTurnDecision(primaryIntent: string | null | undefined): string | null {
    const canonicalIntent = canonicalizeTurnIntent(primaryIntent);

    if (!canonicalIntent) return null;
    if (canonicalIntent === 'UNKNOWN') return 'ASK_CLARIFYING_QUESTION';
    if (canonicalIntent === 'CHIT_CHAT' || canonicalIntent === 'OUT_OF_DOMAIN') {
        return 'DIRECT_ANSWER';
    }

    return 'USE_CAPABILITY';
}

export function normalizeTurnPriority(value: unknown): ConciergeTurnPriority {
    if (Array.isArray(value)) {
        if (value.length > 1) return 'mixed';
        if (value.length === 1) return 'primary';
        return 'unknown';
    }

    return value === 'primary'
        || value === 'secondary'
        || value === 'mixed'
        || value === 'unknown'
        ? value
        : 'unknown';
}

export function canonicalizeTurnIntent(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const normalized = value.trim();
    if (!normalized) return null;

    switch (normalized.toUpperCase()) {
        case 'SEARCH':
        case 'RECOMMENDATION':
            return 'PRODUCT_SEARCH';
        case 'INFO':
        case 'SUPPORT':
            return 'POLICY_INQUIRY';
        default:
            return normalized.toUpperCase();
    }
}

export function isSearchLeadingIntent(intent: string | null | undefined): boolean {
  const canonical = canonicalizeTurnIntent(intent);
  return canonical === 'PRODUCT_SEARCH' || canonical === 'KIT_ASSEMBLY' || canonical === 'BUDGET_RESCUE';
}

export function hasInventorySpecificProductReference(query: string): boolean {
    const normalized = (query || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return /\b(stock|inventario|disponibilidad|agotado|agotada|restock|regresa|regreso|vuelve|queda|hay)\b.*\b(del|de la|de los|de las|el|la|los|las)\b\s+[a-z0-9][a-z0-9\s-]{2,}/.test(normalized);
}

export function hasGroundedProductSearchDraft(input: {
    draft?: string | null;
    products?: Array<Pick<Product | InternalResolvedProduct, 'name'>> | null;
    shouldShowCatalogSurfaces: boolean;
    executionStatus?: string | null;
    truthSignals?: { direct_answer_complete?: boolean } | null;
}): boolean {
    const normalizedDraft = normalizeCompactText(input.draft ?? '');
    const products = input.products ?? [];

    if (!normalizedDraft || !input.shouldShowCatalogSurfaces || input.executionStatus !== 'SUCCESS' || products.length === 0) {
        return false;
    }

    if (input.truthSignals?.direct_answer_complete === true) return true;

    const mentionsVisibleProduct = products.some((product) => {
        const normalizedName = normalizeCompactText(product.name ?? '');
        return normalizedName.length >= 4 && normalizedDraft.includes(normalizedName);
    });
    if (mentionsVisibleProduct) return true;

    const hasCatalogTruthCue = /\b(ruta|rutas|opcion|opciones|alternativa|alternativas|cercan|perfil|sabor|nicotina|caladas|compatible|compatibilidad|stock|disponible|activas|vigente|exacto|tal cual|vape|liquido|pod|kit|mg|ml)\b/.test(normalizedDraft);
    const hasGroundingVerb = /\b(real|reales|rescate|encontre|ubico|veo|trae|viene|aparece|sirve|coincide|queda|disponible|activas|stock|cercan|perfil)\b/.test(normalizedDraft);

    return hasCatalogTruthCue && hasGroundingVerb;
}

export function hasDegradingUncertainty(value: string): boolean {
    const normalized = normalizeCompactText(value);
    if (!normalized) return false;

    if (/\bno (veo|encontre|ubico)\b/.test(normalized) && normalized.includes('tal cual')) {
        return true;
    }

    return [
        /\bno (la |lo |las |los )?(tengo|traigo|veo|ubico|encuentro|encontre|pude|logre)\b.{0,50}\b(clara|claro|certeza|referencia|confirmar|salida clara)\b/,
        /\b(seguir|sigamos|seguimos)\b.{0,30}\b(explorando|viendo opciones|buscando)\b/,
        /\b(ando verde|me agarro en curva|se me cruzaron los cables|vender humo)\b/,
        /\b(no la vi tal cual|no lo vi tal cual|exacta no me brinco|exacto exacto no me salio|no me quedo cerrada)\b/,
    ].some((pattern) => pattern.test(normalized));
}

export function messagePreservesCompactDraft(candidate: string, compactDraft: string): boolean {
    const normalizedCandidate = normalizeCompactText(candidate);
    const normalizedDraft = normalizeCompactText(compactDraft);
    if (!normalizedCandidate || !normalizedDraft) return false;
    if (normalizedCandidate.includes(normalizedDraft)) return true;

    const materialSentences = splitIntoSentences(compactDraft)
        .map((sentence) => normalizeCompactText(sentence))
        .filter((sentence) => sentence.length >= 12);

    return materialSentences.length > 0 && materialSentences.every((sentence) => normalizedCandidate.includes(sentence));
}

export function dropsVisibleProductAnchor(input: {
    candidate: string;
    draft: string;
    products?: Array<Pick<Product | InternalResolvedProduct, 'name'>> | null;
}): boolean {
    const normalizedCandidate = normalizeCompactText(input.candidate);
    const normalizedDraft = normalizeCompactText(input.draft);
    const anchoredNames = (input.products ?? [])
        .map((product) => normalizeCompactText(product.name ?? ''))
        .filter((name) => name.length >= 4 && normalizedDraft.includes(name));

    return anchoredNames.length > 0 && anchoredNames.some((name) => !normalizedCandidate.includes(name));
}

export function resolveGroundedProductSearchMessage(input: {
    capsuleDraft?: string | null;
    candidateMessage?: string | null;
    products?: Array<Pick<Product | InternalResolvedProduct, 'name'>> | null;
    shouldShowCatalogSurfaces: boolean;
    executionStatus?: string | null;
    truthSignals?: { direct_answer_complete?: boolean } | null;
    maxSentences: number;
}): string {
    const candidate = compactCesarinCopy(input.candidateMessage ?? '', input.maxSentences);
    const compactDraft = compactCesarinCopy(input.capsuleDraft ?? '', input.maxSentences);

    if (!hasGroundedProductSearchDraft({
        draft: input.capsuleDraft,
        products: input.products,
        shouldShowCatalogSurfaces: input.shouldShowCatalogSurfaces,
        executionStatus: input.executionStatus,
        truthSignals: input.truthSignals,
    })) {
        return candidate || compactDraft;
    }

    if (!candidate) return compactDraft;

    const candidatePreservesDraft = messagePreservesCompactDraft(candidate, compactDraft);
    const candidateDropsProductAnchor = dropsVisibleProductAnchor({
        candidate,
        draft: compactDraft,
        products: input.products,
    });
    const candidateAddsWeakUncertainty = normalizeCompactText(candidate) !== normalizeCompactText(compactDraft)
        && hasDegradingUncertainty(candidate)
        && !hasDegradingUncertainty(compactDraft);

    if (!candidatePreservesDraft || candidateDropsProductAnchor || candidateAddsWeakUncertainty) {
        return compactDraft;
    }

    return candidate;
}

export function normalizeCatalogGateReason(value: unknown): ConciergeCatalogGateReason {
    if (value === 'search_leading' || value === 'explicit_product_request' || value === 'non_catalog_lane' || value === 'out_of_domain') {
        return value;
    }

    if (value === 'clarification_needed' || value === 'clarification_first') {
        return 'clarification_first';
    }

    return 'non_catalog_lane';
}

export function normalizeSourceContext(raw: unknown): ConciergeSourceContext | undefined {
    if (!raw || typeof raw !== 'object') return undefined;

    const record = raw as Record<string, unknown>;
    const label = typeof record.label === 'string' && record.label.trim()
        ? record.label.trim()
        : 'Contexto publico';
    const brief = typeof record.brief === 'string' && record.brief.trim()
        ? record.brief.trim()
        : undefined;
    const sources = Array.isArray(record.sources)
        ? record.sources
            .map((source) => {
                if (!source || typeof source !== 'object') return null;
                const entry = source as Record<string, unknown>;
                return typeof entry.title === 'string' && typeof entry.url === 'string'
                    ? { title: entry.title, url: entry.url }
                    : null;
            })
            .filter((source): source is { title: string; url: string } => Boolean(source))
            .slice(0, 2)
        : [];

    if (!brief && sources.length === 0) return undefined;

    return {
        label,
        brief,
        sources,
    };
}

export function buildConciergeCatalogGate(input: {
    query: string;
    turnAnalysis?: ConciergeTurnAnalysis | null;
    intent?: ConciergeMessage['intent'] | string | null;
    assistantMessage?: string | null;
    capsuleContract?: Record<string, any>;
    has_catalog_content?: boolean;
}): ConciergeCatalogGate {
    const primaryIntent = canonicalizeTurnIntent(
        input.turnAnalysis?.primary_intent
            ?? input.capsuleContract?.turn_analysis?.primary_intent
            ?? input.intent
            ?? null,
    );
    const searchLeading = isSearchLeadingIntent(primaryIntent);
    const inventorySpecificProductReference = hasInventorySpecificProductReference(input.query);
    const hardNoCatalogLane = primaryIntent === 'POLICY_INQUIRY'
        || primaryIntent === 'WARRANTY_SUPPORT'
        || primaryIntent === 'CHECKOUT_READINESS'
        || primaryIntent === 'INVENTORY_OUTLOOK'
        || primaryIntent === 'ORDER_TRACKING'
        || primaryIntent === 'LOYALTY_SUPPORT'
        || primaryIntent === 'COMPATIBILITY_CHECK'
        || primaryIntent === 'CART_OPERATION'
        || primaryIntent === 'PUBLIC_INFO'
        || primaryIntent === 'CHIT_CHAT'
        || primaryIntent === 'OUT_OF_DOMAIN';
    // Trust model-first: use turn_analysis.current_turn_decision from the server
    // rather than local regex walls for clarification/product-request detection.
    const needsClarification = input.turnAnalysis?.current_turn_decision === 'ASK_CLARIFYING_QUESTION'
        || primaryIntent === 'UNKNOWN';
    const hasCatalogContent = input.has_catalog_content === true;

    if (!input.turnAnalysis && hasCatalogContent && !hardNoCatalogLane) {
        return {
            is_open: true,
            reason: 'search_leading',
            primary_intent: primaryIntent,
            explicit_product_request: false,
            search_leading: searchLeading,
            needs_clarification: false,
        };
    }

    let is_open = false;
    let reason: ConciergeCatalogGateReason = 'non_catalog_lane';

    if (
        primaryIntent === 'INVENTORY_OUTLOOK'
        && input.turnAnalysis?.current_turn_decision === 'USE_CAPABILITY'
        && inventorySpecificProductReference
        && !needsClarification
    ) {
        is_open = true;
        reason = 'explicit_product_request';
    } else if (needsClarification) {
        reason = 'clarification_first';
    } else if (hardNoCatalogLane) {
        reason = 'non_catalog_lane';
    } else if (searchLeading && !needsClarification) {
        is_open = true;
        reason = 'search_leading';
    }

    return {
        is_open,
        reason,
        primary_intent: primaryIntent,
        explicit_product_request: false,
        search_leading: searchLeading,
        needs_clarification: needsClarification,
    };
}

export function normalizeServerCatalogGate(
    raw: unknown,
    fallback: ConciergeCatalogGate,
): ConciergeCatalogGate {
    const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null;
    if (!record || typeof record.is_open !== 'boolean') {
        return fallback;
    }

    const fallbackIntent = canonicalizeTurnIntent(fallback.primary_intent);
    const forceDerivedGate =
        fallbackIntent === 'INVENTORY_OUTLOOK'
        || fallbackIntent === 'POLICY_INQUIRY'
        || fallbackIntent === 'WARRANTY_SUPPORT'
        || fallbackIntent === 'ORDER_TRACKING'
        || fallbackIntent === 'LOYALTY_SUPPORT'
        || fallbackIntent === 'COMPATIBILITY_CHECK'
        || fallbackIntent === 'CART_OPERATION'
        || fallbackIntent === 'PUBLIC_INFO'
        || fallbackIntent === 'CHIT_CHAT'
        || fallbackIntent === 'OUT_OF_DOMAIN';

    if (forceDerivedGate) {
        return fallback;
    }

    return {
        is_open: record.is_open,
        reason: normalizeCatalogGateReason(record.reason),
        primary_intent: fallback.primary_intent,
        explicit_product_request: typeof record.explicit_product_request === 'boolean'
            ? record.explicit_product_request
            : fallback.explicit_product_request,
        search_leading: typeof record.search_leading === 'boolean'
            ? record.search_leading
            : fallback.search_leading,
        needs_clarification: typeof record.clarification_required === 'boolean'
            ? record.clarification_required
            : fallback.needs_clarification,
    };
}

export function normalizeTurnAnalysis(raw: unknown, fallback: Partial<ConciergeTurnAnalysis> = {}): ConciergeTurnAnalysis {
    const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const secondaryIntents = Array.from(new Set([
        ...(Array.isArray(record.secondary_intents) ? record.secondary_intents : []),
        ...(fallback.secondary_intents ?? []),
    ].map((value) => canonicalizeTurnIntent(value)).filter((value): value is string => Boolean(value))));

    return {
        primary_intent: canonicalizeTurnIntent(record.primary_intent ?? fallback.primary_intent ?? null),
        secondary_intents: secondaryIntents,
        turn_priority: normalizeTurnPriority(record.turn_priority ?? fallback.turn_priority),
        current_turn_decision: typeof record.current_turn_decision === 'string'
            ? record.current_turn_decision
            : fallback.current_turn_decision ?? null,
        turn_focus: typeof record.turn_focus === 'string'
            ? record.turn_focus
            : fallback.turn_focus ?? null,
        commercial_move: typeof record.commercial_move === 'string'
            ? record.commercial_move as CesarinCommercialMove
            : fallback.commercial_move ?? null,
    };
}

export function getFallbackTurnAnalysis(data: {
    intent?: string | null;
    routed_capsule?: string | null;
    capsule_name?: string | null;
}): ConciergeTurnAnalysis {
    const capsule = typeof data.capsule_name === 'string'
        ? data.capsule_name
        : typeof data.routed_capsule === 'string'
            ? data.routed_capsule
            : null;
    const intent = canonicalizeTurnIntent(data.intent);
    const primary_intent = intent
        ?? (capsule === 'product_search_integrity'
            ? 'PRODUCT_SEARCH'
                : capsule === 'knowledge_rag_foundation'
                    ? 'POLICY_INQUIRY'
                : capsule === 'storefront_budget_rescue'
                    ? 'BUDGET_RESCUE'
                : capsule === 'storefront_checkout_readiness'
                    ? 'CHECKOUT_READINESS'
                : capsule === 'storefront_compatibility_check'
                    ? 'COMPATIBILITY_CHECK'
                : capsule === 'storefront_kitting_basket'
                    ? 'KIT_ASSEMBLY'
                : capsule === 'storefront_inventory_outlook'
                    ? 'INVENTORY_OUTLOOK'
                    : capsule === 'authenticated_warranty_triage'
                        ? 'WARRANTY_SUPPORT'
                : capsule === 'authenticated_loyalty_status'
                    ? 'LOYALTY_SUPPORT'
                : capsule === 'cart_operator'
                    ? 'CART_OPERATION'
                    : null);

    return {
        primary_intent,
        secondary_intents: [],
        turn_priority: primary_intent ? 'primary' : 'unknown',
        current_turn_decision: resolveFallbackCurrentTurnDecision(primary_intent),
        turn_focus: null,
        commercial_move: null,
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

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

export function deriveCheckoutBridgeAction(rawSignal: unknown): ConciergeMessage['action'] | undefined {
    const signal = rawSignal && typeof rawSignal === 'object'
        ? rawSignal as Record<string, unknown>
        : null;

    if (!signal) return undefined;

    if (
        signal.kind === 'READY_TO_CHECKOUT'
        && signal.can_proceed_to_checkout === true
        && signal.can_submit_checkout === true
        && signal.blocker_reason === 'none'
        && !isNonEmptyString(signal.open_order_id)
    ) {
        return {
            label: 'Abrir checkout',
            url: '/checkout',
            type: 'link',
        };
    }

    if (
        signal.kind === 'CART_BLOCKER'
        && signal.blocker_reason === 'open_recoverable_order'
        && isNonEmptyString(signal.open_order_id)
    ) {
        return {
            label: 'Retomar orden abierta',
            url: `/orders/${encodeURIComponent(signal.open_order_id)}`,
            type: 'link',
        };
    }

    return undefined;
}

export function deriveOrderTrackingBridgeAction(rawSignal: unknown): ConciergeMessage['action'] | undefined {
    const signal = rawSignal && typeof rawSignal === 'object'
        ? rawSignal as Record<string, unknown>
        : null;

    if (!signal) return undefined;

    if (
        signal.kind === 'FOUND'
        && isNonEmptyString(signal.order_id)
        && signal.payment_method === 'mercadopago'
        && signal.payment_status === 'pending'
        && signal.order_status !== 'cancelled'
    ) {
        return {
            label: 'Continuar pago pendiente',
            url: `/payment/pending?order_id=${encodeURIComponent(signal.order_id)}`,
            type: 'link',
        };
    }

    return undefined;
}
