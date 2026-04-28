import { supabase } from '@/lib/supabase';
import { executeProductSearchCapsule, executeKnowledgeCapsule, executeCartOperatorCapsule, executeStorefrontBudgetRescueCapsule, executeStorefrontCheckoutReadinessCapsule, executeStorefrontCompatibilityCheckCapsule, executeStorefrontInventoryOutlookCapsule, executeStorefrontKittingBasketCapsule, executeAuthenticatedOrderTrackingCapsule, executeAuthenticatedWarrantyTriageCapsule, executeAuthenticatedLoyaltyStatusCapsule } from '@/services/ai-capsule-orchestrator.service';
import { isPilotActive } from '@/lib/pilot-activation';
import { buildCesarinHumanizedSearchMessage } from '@/lib/cesarin-stage1';
import { rerankCesarinSuggestedProducts, type CesarinPreferenceSummary } from '@/lib/cesarin-stage3';
import { buildCesarinAdaptiveConversationView } from '@/lib/cesarin-stage4';
import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
import { resolveCesarinTurnCommercialJudgment, type CesarinCommercialMove } from '@/lib/cesarin-commercial-judgment';
import {
    compactCesarinCopy,
    mergeConversationalPrefix,
    getEffectiveConversationalPrefix,
    isMeaningfullyDistinct,
    normalizeCompactText,
    splitIntoSentences,
} from '@/lib/cesarin-text-utils';
import {
    resolveAITelemetryContract,
    shouldClientLogAITelemetry,
} from '@/lib/ai-telemetry-contract';
import { getProductsByIds } from '@/services/products.service';
import { resolveStorefrontAttachmentOffers } from '@/services/storefront-attachments.service';
import type { Product } from '@/types/product';
import type { AIPreferences, IAContext, CustomerProfile } from '@/types/customer';
import type { InternalResolvedProduct } from '@/types/ai-capsule';

export interface ConciergeMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    suggestedProducts?: (Product | InternalResolvedProduct)[];
    intent?: 'search' | 'info' | 'support' | 'recommendation' | 'whatsapp';
    turn_analysis?: ConciergeTurnAnalysis;
    catalog_gate?: ConciergeCatalogGate;
    source_context?: ConciergeSourceContext;
    action?: {
        label: string;
        url: string;
        type: 'whatsapp' | 'link';
    };
    capsule_contract?: any;
}

interface ConciergeProductSearchMemoryContext {
    preference_summary?: CesarinPreferenceSummary | null;
}

type ConciergeTurnPriority = 'primary' | 'secondary' | 'mixed' | 'unknown';
type ConciergeCatalogGateReason =
    | 'search_leading'
    | 'explicit_product_request'
    | 'clarification_first'
    | 'non_catalog_lane'
    | 'out_of_domain';

export interface ConciergeTurnAnalysis {
    primary_intent: string | null;
    secondary_intents: string[];
    turn_priority: ConciergeTurnPriority;
    current_turn_decision: string | null;
    turn_focus?: string | null;
    commercial_move?: CesarinCommercialMove | null;
}

export interface ConciergeCatalogGate {
    is_open: boolean;
    reason: ConciergeCatalogGateReason;
    primary_intent: string | null;
    explicit_product_request: boolean;
    search_leading: boolean;
    needs_clarification: boolean;
}

export interface ConciergeSourceContext {
    label: string;
    brief?: string;
    sources: Array<{ title: string; url: string }>;
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

function normalizeTurnPriority(value: unknown): ConciergeTurnPriority {
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

function canonicalizeTurnIntent(value: unknown): string | null {
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

function isSearchLeadingIntent(intent: string | null | undefined): boolean {
  const canonical = canonicalizeTurnIntent(intent);
  return canonical === 'PRODUCT_SEARCH' || canonical === 'KIT_ASSEMBLY' || canonical === 'BUDGET_RESCUE';
}

function hasInventorySpecificProductReference(query: string): boolean {
    const normalized = (query || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return /\b(stock|inventario|disponibilidad|agotado|agotada|restock|regresa|regreso|vuelve|queda|hay)\b.*\b(del|de la|de los|de las|el|la|los|las)\b\s+[a-z0-9][a-z0-9\s-]{2,}/.test(normalized);
}

function hasGroundedProductSearchDraft(input: {
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

function hasDegradingUncertainty(value: string): boolean {
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

function messagePreservesCompactDraft(candidate: string, compactDraft: string): boolean {
    const normalizedCandidate = normalizeCompactText(candidate);
    const normalizedDraft = normalizeCompactText(compactDraft);
    if (!normalizedCandidate || !normalizedDraft) return false;
    if (normalizedCandidate.includes(normalizedDraft)) return true;

    const materialSentences = splitIntoSentences(compactDraft)
        .map((sentence) => normalizeCompactText(sentence))
        .filter((sentence) => sentence.length >= 12);

    return materialSentences.length > 0 && materialSentences.every((sentence) => normalizedCandidate.includes(sentence));
}

function dropsVisibleProductAnchor(input: {
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

function normalizeCatalogGateReason(value: unknown): ConciergeCatalogGateReason {
    if (value === 'search_leading' || value === 'explicit_product_request' || value === 'non_catalog_lane' || value === 'out_of_domain') {
        return value;
    }

    if (value === 'clarification_needed' || value === 'clarification_first') {
        return 'clarification_first';
    }

    return 'non_catalog_lane';
}

function normalizeSourceContext(raw: unknown): ConciergeSourceContext | undefined {
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
    capsuleContract?: any;
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

function normalizeServerCatalogGate(
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

function normalizeTurnAnalysis(raw: unknown, fallback: Partial<ConciergeTurnAnalysis> = {}): ConciergeTurnAnalysis {
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

function getFallbackTurnAnalysis(data: {
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

function extractTelemetryNextStepTruth(raw: unknown): {
    next_step_family: string | null;
    assist_action_present: boolean;
} {
    const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null;

    return {
        next_step_family: typeof record?.family === 'string' ? record.family : null,
        assist_action_present: Boolean(record?.assistAction),
    };
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function deriveCheckoutBridgeAction(rawSignal: unknown): ConciergeMessage['action'] | undefined {
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

function deriveOrderTrackingBridgeAction(rawSignal: unknown): ConciergeMessage['action'] | undefined {
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

/**
 * AI Concierge Service [Wave 70 - Hyper-Personalization]
 * 
 * Manages client-side AI interactions for product discovery and assistance.
 * Leverages Gemini API through Supabase Edge Functions.
 */
async function logAITelemetry(fields: {
    session_id?: string | null;
    customer_id: string | null;
    query: string;
    response_text: string | null;
    detected_intent: string | null;
    routed_capsule: string | null;
    requires_client_capsule: boolean;
    capsule_match_success: boolean;
    fallback_used: boolean;
    response_latency_ms: number;
    has_product_cards: boolean;
    product_card_count: number;
    zero_results: boolean;
    error_type: 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' | 'UNKNOWN_CAPSULE' | null;
    offered_products?: Array<{ id: string; name: string; slug: string }>;
    analyst_intent?: string | null;
    guardrail_overrides?: string[];
    injected_tools?: string[];
    capsule_execution_status?: string | null;
    capsule_match_strategy?: string | null;
    capsule_retrieval_source?: string | null;
    routing_path?: 'pre_routed' | 'fallback_handled' | null;
    turn_primary_intent?: string | null;
    turn_secondary_intents?: string[];
    turn_priority?: ConciergeTurnPriority;
    current_turn_decision?: string | null;
    turn_focus?: string | null;
    catalog_gate_open?: boolean | null;
    catalog_gate_reason?: string | null;
    next_step_family?: string | null;
    assist_action_present?: boolean;
    source_context_present?: boolean;
    retrieval_source?: string | null;
}): Promise<void> {
    try {
        await supabase.from('ai_analytics').insert({
            session_id: fields.session_id ?? null,
            customer_id: fields.customer_id,
            query: fields.query,
            response_text: fields.response_text,
            detected_intent: fields.detected_intent,
            primary_intent: fields.turn_primary_intent ?? null,
            current_turn_decision: fields.current_turn_decision ?? null,
            turn_focus: fields.turn_focus ?? null,
            catalog_gate_open: fields.catalog_gate_open ?? null,
            catalog_gate_reason: fields.catalog_gate_reason ?? null,
            next_step_family: fields.next_step_family ?? null,
            assist_action_present: fields.assist_action_present ?? false,
            source_context_present: fields.source_context_present ?? false,
            retrieval_source: fields.retrieval_source ?? fields.capsule_retrieval_source ?? null,
            ai_logic_debug: {
                is_simulation: false,
                detected_intent: fields.detected_intent,
                sommelier_routed_capsule: fields.routed_capsule,
                requires_client_capsule: fields.requires_client_capsule,
                routing_path: fields.routing_path ?? null,
                semantic_match_success: fields.capsule_match_success,
                fallback_used: fields.fallback_used,
                latency_ms: fields.response_latency_ms,
                has_product_cards: fields.has_product_cards,
                product_card_count: fields.product_card_count,
                zero_results: fields.zero_results,
                error_type: fields.error_type,
                cart_action_detected: fields.routed_capsule === 'cart_operator',
                offered_products: fields.offered_products ?? [],
                analyst_intent: fields.analyst_intent ?? null,
                guardrail_overrides: fields.guardrail_overrides ?? [],
                injected_tools: fields.injected_tools ?? [],
                capsule_execution_status: fields.capsule_execution_status ?? null,
                capsule_match_strategy: fields.capsule_match_strategy ?? null,
                primary_intent: fields.turn_primary_intent ?? null,
                capsule_retrieval_source: fields.capsule_retrieval_source ?? null,
                retrieval_source: fields.retrieval_source ?? fields.capsule_retrieval_source ?? null,
                turn_primary_intent: fields.turn_primary_intent ?? null,
                turn_secondary_intents: fields.turn_secondary_intents ?? [],
                turn_priority: fields.turn_priority ?? null,
                current_turn_decision: fields.current_turn_decision ?? null,
                turn_focus: fields.turn_focus ?? null,
                catalog_gate_open: fields.catalog_gate_open ?? null,
                catalog_gate_reason: fields.catalog_gate_reason ?? null,
                next_step_family: fields.next_step_family ?? null,
                assist_action_present: fields.assist_action_present ?? false,
                source_context_present: fields.source_context_present ?? false,
            }
        });
    } catch {
        // silent — telemetry must never block or affect user response
    }
}

const searchCache = new Map<string, any>();

export const conciergeService = {
    /**
     * Sends a message to the AI Assistant and returns a structured response.
     */
    async chat(
        query: string, 
        history: { role: 'user' | 'assistant', content: string }[], 
        customerProfile?: CustomerProfile,
        audio?: string,
        mimeType?: string,
        cesarinSessionId?: string | null,
    ): Promise<{
        message: string;
        suggestedProducts?: (Product | InternalResolvedProduct)[];
        intent?: ConciergeMessage['intent'];
        turn_analysis?: ConciergeTurnAnalysis;
        catalog_gate?: ConciergeCatalogGate;
        source_context?: ConciergeSourceContext;
        action?: ConciergeMessage['action'];
        capsule_contract?: any; // Exposing it structurally as requested
    }> {
        const invokeStart = Date.now();
        const effectiveTelemetrySessionId = cesarinSessionId ?? null;
        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'concierge_chat', 
                    query,
                    history,
                    audio,
                    mimeType,
                    cesarin_session_id: effectiveTelemetrySessionId,
                    customerContext: customerProfile ? {
                        id: customerProfile.id,
                        name: customerProfile.full_name,
                        preferences: customerProfile.ai_preferences,
                        ia_context: customerProfile.ia_context,
                        last_interactions: customerProfile.last_interactions
                    } : null,
                    is_pilot: isPilotActive()
                }
            });

            if (error) {
                throw error;
            }

            const turnAnalysis = normalizeTurnAnalysis(
                data.turn_analysis
                    ?? data.turn_profile
                    ?? data.debug?.turn_analysis
                    ?? data.debug?.current_turn_analysis
                    ?? data.debug?.turn_profile
                    ?? data.debug?.guardrail_telemetry?.turn_profile,
                getFallbackTurnAnalysis({
                    intent: data.intent ?? null,
                    routed_capsule: data.routed_capsule ?? null,
                    capsule_name: data.capsule_name ?? null,
                }),
            );
            const derivedCatalogGate = buildConciergeCatalogGate({
                query,
                turnAnalysis,
                intent: data.intent ?? null,
                assistantMessage: data.message ?? data.text ?? null,
                capsuleContract: data.capsule_contract ?? null,
            });
            const catalogGate = normalizeServerCatalogGate(
                data.catalog_gate
                    ?? data.debug?.catalog_gate
                    ?? data.debug?.guardrail_telemetry?.catalog_gate,
                derivedCatalogGate,
            );
            const sourceContext = normalizeSourceContext(
                data.source_context
                    ?? data.debug?.source_context
                    ?? data.debug?.external_context,
            );
            
            // --- AI/LLM ROUTING: CLOUD TO CLIENT CAPSULE DELEGATION ---
            if (data.requires_client_capsule) {
                if (data.capsule_name === 'product_search_integrity') {
                    const capsuleContract = await executeProductSearchCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const preferenceSummary = (data.memory_context as ConciergeProductSearchMemoryContext | null | undefined)?.preference_summary ?? null;
                    const rerankedProducts = rerankCesarinSuggestedProducts({
                        query,
                        products: capsuleContract.resolved_products ?? [],
                        preferenceSummary,
                    });
                    const commercialJudgment = resolveCesarinTurnCommercialJudgment({
                        query,
                        history,
                        preferenceSummary,
                        matchStrategy: capsuleContract.match_strategy,
                        visibleProductCount: rerankedProducts.length,
                        turnAnalysis,
                    });
                    const commercialTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialJudgment.move,
                    };
                    const adaptiveConversation = buildCesarinAdaptiveConversationView({
                        query,
                        history,
                        products: rerankedProducts,
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        preferenceSummary,
                        matchStrategy: capsuleContract.match_strategy,
                        turnAnalysis: commercialTurnAnalysis,
                    });
                    const shouldShowCatalogSurfaces = catalogGate.is_open;
                    const shouldAttemptAttachmentLookup = shouldShowCatalogSurfaces
                        && adaptiveConversation.visibleProducts.length > 0
                        && commercialJudgment.supportLevel === 'strong'
                        && !commercialJudgment.approximate
                        && !commercialJudgment.currentTurnCompare
                        && !commercialJudgment.currentTurnExplore
                        && (commercialJudgment.move === 'ADD_READY' || commercialJudgment.move === 'REVIEW_ONE');
                    const attachmentOffer = shouldAttemptAttachmentLookup
                        ? await resolveStorefrontAttachmentOffers([adaptiveConversation.visibleProducts[0]!.id])
                            .then((offers) => offers[0] ?? null)
                            .catch(() => null)
                        : null;
                    const enrichedVisibleProductsById = adaptiveConversation.visibleProducts.length > 0
                        ? await getProductsByIds(adaptiveConversation.visibleProducts.map((product) => product.id))
                            .then((products) => Object.fromEntries(products.map((product) => [product.id, product])))
                            .catch(() => ({} as Record<string, Product>))
                        : {};
                    const actionableConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary,
                        matchStrategy: capsuleContract.match_strategy,
                        adaptiveMode: adaptiveConversation.mode,
                        visibleProducts: adaptiveConversation.visibleProducts,
                        enrichedProductsById: enrichedVisibleProductsById,
                        baseMessage: adaptiveConversation.message,
                        turnAnalysis: commercialTurnAnalysis,
                        commercialMove: commercialJudgment.move,
                        capsuleTruthSignals: (capsuleContract as any).truth_signals ?? null,
                        capsuleHelpContract: (capsuleContract as any).help_contract ?? null,
                        capsuleAttachmentOffer: attachmentOffer,
                        capsuleReplenishmentSignal: (capsuleContract as any).replenishment_signal ?? null,
                    });

                    if (shouldShowCatalogSurfaces && rerankedProducts.length > 0) {
                        capsuleContract.resolved_products = actionableConversation.visibleProducts;
                    } else {
                        capsuleContract.resolved_products = [];
                    }
                    capsuleContract.attachment_offer = attachmentOffer ?? undefined;
                    const compactBaseMessage = compactCesarinCopy(
                        actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        2,
                    );
                    const compactNextStepGuidance = compactCesarinCopy(actionableConversation.nextStep.guidance, 1);
                    const renderableNextStepGuidance = Boolean(
                        compactNextStepGuidance
                        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance),
                    )
                        ? compactNextStepGuidance
                        : undefined;
                    const hasMaterialNextStepAction = Boolean(
                        actionableConversation.nextStep.primaryAction
                        || actionableConversation.nextStep.secondaryAction
                        || actionableConversation.nextStep.assistAction,
                    );
                    const compactNextStepView = shouldShowCatalogSurfaces
                        && actionableConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...actionableConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    const telemetryNextStep = extractTelemetryNextStepTruth(compactNextStepView);
                    (capsuleContract as any).next_step_view = compactNextStepView;
                    (capsuleContract as any).turn_analysis = commercialTurnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'search',
                        routed_capsule: 'product_search_integrity',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.match_strategy === 'FEATURED_FALLBACK' || capsuleContract.match_strategy === 'NO_MATCH',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: shouldShowCatalogSurfaces && (capsuleContract.resolved_products?.length ?? 0) > 0,
                        product_card_count: shouldShowCatalogSurfaces ? capsuleContract.resolved_products?.length ?? 0 : 0,
                        zero_results: !shouldShowCatalogSurfaces || (capsuleContract.resolved_products?.length ?? 0) === 0,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: capsuleContract.resolved_products?.map(p => ({ id: p.id, name: p.name, slug: p.slug })) ?? [],
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: commercialTurnAnalysis.primary_intent,
                        turn_secondary_intents: commercialTurnAnalysis.secondary_intents,
                        turn_priority: commercialTurnAnalysis.turn_priority,
                        current_turn_decision: commercialTurnAnalysis.current_turn_decision,
                        turn_focus: commercialTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: telemetryNextStep.next_step_family,
                        assist_action_present: telemetryNextStep.assist_action_present,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });

                    const finalMessage = mergeConversationalPrefix(
                        actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft,
                        getEffectiveConversationalPrefix({
                            message: actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: commercialTurnAnalysis,
                            sourceContext,
                        }),
                        8,
                    );

                    const humanizedMessage = shouldShowCatalogSurfaces && isSearchLeadingIntent(turnAnalysis.primary_intent)
                        ? buildCesarinHumanizedSearchMessage({
                            query,
                            baseMessage: finalMessage,
                            matchStrategy: capsuleContract.match_strategy,
                            suggestedProducts: capsuleContract.resolved_products,
                        })
                        : finalMessage;
                    const conciseMessage = resolveGroundedProductSearchMessage({
                        capsuleDraft: capsuleContract.customer_response_draft,
                        candidateMessage: humanizedMessage || finalMessage,
                        products: capsuleContract.resolved_products,
                        shouldShowCatalogSurfaces,
                        executionStatus: capsuleContract.execution_status,
                        truthSignals: (capsuleContract as any).truth_signals ?? null,
                        maxSentences: 8,
                    });

                    return {
                        message: conciseMessage,
                        suggestedProducts: shouldShowCatalogSurfaces ? (capsuleContract.resolved_products || []) : [],
                        intent: 'search',
                        turn_analysis: commercialTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'storefront_kitting_basket') {
                    const capsuleContract = await executeStorefrontKittingBasketCapsule(data.tool_args);
                    const kitProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const shouldShowCatalogSurfaces = catalogGate.is_open;
                    const visibleProducts = shouldShowCatalogSurfaces ? kitProducts : [];
                    const commercialMove = capsuleContract.match_strategy === 'FULL_KIT'
                        ? 'ADD_READY'
                        : capsuleContract.match_strategy === 'PARTIAL_KIT'
                            ? 'REVIEW_ONE'
                            : 'KEEP_EXPLORING';
                    const kitTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'KIT_ASSEMBLY',
                        turn_focus: 'kitting',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: capsuleContract.match_strategy === 'FULL_KIT'
                            ? 'READY_TO_CLOSE'
                            : capsuleContract.match_strategy === 'PARTIAL_KIT'
                                ? 'SOFT_REASSURE'
                                : 'EXPLORE_LIGHT',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(kitProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: kitTurnAnalysis,
                        commercialMove,
                    });
                    const compactBaseMessage = compactCesarinCopy(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        2,
                    );
                    const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
                    const renderableNextStepGuidance = Boolean(
                        compactNextStepGuidance
                        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance),
                    )
                        ? compactNextStepGuidance
                        : undefined;
                    const hasMaterialNextStepAction = Boolean(
                        adaptiveConversation.nextStep.primaryAction
                        || adaptiveConversation.nextStep.secondaryAction
                        || adaptiveConversation.nextStep.assistAction,
                    );
                    const compactNextStepView = shouldShowCatalogSurfaces
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as any).resolved_products = visibleProducts;
                    (capsuleContract as any).next_step_view = compactNextStepView;
                    (capsuleContract as any).turn_analysis = kitTurnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'search',
                        routed_capsule: 'storefront_kitting_basket',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.match_strategy !== 'FULL_KIT',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: shouldShowCatalogSurfaces && visibleProducts.length > 0,
                        product_card_count: shouldShowCatalogSurfaces ? visibleProducts.length : 0,
                        zero_results: !shouldShowCatalogSurfaces || visibleProducts.length === 0,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: kitTurnAnalysis.primary_intent,
                        turn_secondary_intents: kitTurnAnalysis.secondary_intents,
                        turn_priority: kitTurnAnalysis.turn_priority,
                        current_turn_decision: kitTurnAnalysis.current_turn_decision,
                        turn_focus: kitTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
                        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });

                    const finalMessage = mergeConversationalPrefix(
                        adaptiveConversation.message || capsuleContract.customer_response_draft,
                        getEffectiveConversationalPrefix({
                            message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: kitTurnAnalysis,
                            sourceContext,
                        }),
                        shouldShowCatalogSurfaces ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', shouldShowCatalogSurfaces ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'recommendation',
                        turn_analysis: kitTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'storefront_budget_rescue') {
                    const capsuleContract = await executeStorefrontBudgetRescueCapsule(data.tool_args);
                    const cheaperProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const shouldShowCatalogSurfaces = catalogGate.is_open;
                    const visibleProducts = shouldShowCatalogSurfaces ? cheaperProducts : [];
                    const commercialMove = capsuleContract.match_strategy === 'CHEAPER_ALTERNATIVE_FOUND'
                        ? visibleProducts.length >= 2
                            ? 'COMPARE_TWO'
                            : 'REVIEW_ONE'
                        : capsuleContract.match_strategy === 'PROMO_ALREADY_BEST_VALUE'
                            || capsuleContract.match_strategy === 'REVIEW_CURRENT_OPTION'
                            ? 'REVIEW_ONE'
                            : 'KEEP_EXPLORING';
                    const budgetTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'BUDGET_RESCUE',
                        turn_focus: 'budget',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN'
                            ? 'EXPLORE_LIGHT'
                            : 'SOFT_REASSURE',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(cheaperProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: budgetTurnAnalysis,
                        commercialMove,
                    });
                    const compactBaseMessage = compactCesarinCopy(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        visibleProducts.length > 0 ? 2 : 3,
                    );
                    const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
                    const renderableNextStepGuidance = Boolean(
                        compactNextStepGuidance
                        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance),
                    )
                        ? compactNextStepGuidance
                        : undefined;
                    const hasMaterialNextStepAction = Boolean(
                        adaptiveConversation.nextStep.primaryAction
                        || adaptiveConversation.nextStep.secondaryAction
                        || adaptiveConversation.nextStep.assistAction,
                    );
                    const compactNextStepView = visibleProducts.length > 0
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as any).resolved_products = visibleProducts;
                    (capsuleContract as any).next_step_view = compactNextStepView;
                    (capsuleContract as any).turn_analysis = budgetTurnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'recommendation',
                        routed_capsule: 'storefront_budget_rescue',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: visibleProducts.length > 0,
                        product_card_count: visibleProducts.length,
                        zero_results: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: budgetTurnAnalysis.primary_intent,
                        turn_secondary_intents: budgetTurnAnalysis.secondary_intents,
                        turn_priority: budgetTurnAnalysis.turn_priority,
                        current_turn_decision: budgetTurnAnalysis.current_turn_decision,
                        turn_focus: budgetTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
                        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });

                    const finalMessage = mergeConversationalPrefix(
                        adaptiveConversation.message || capsuleContract.customer_response_draft,
                        getEffectiveConversationalPrefix({
                            message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: budgetTurnAnalysis,
                            sourceContext,
                        }),
                        visibleProducts.length > 0 ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'recommendation',
                        turn_analysis: budgetTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'storefront_compatibility_check') {
                    const capsuleContract = await executeStorefrontCompatibilityCheckCapsule(data.tool_args);
                    const compatibilityProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const visibleProducts = compatibilityProducts;
                    const commercialMove = capsuleContract.match_strategy === 'COMPATIBLE'
                        ? visibleProducts.length >= 2
                            ? 'COMPARE_TWO'
                            : 'REVIEW_ONE'
                        : capsuleContract.match_strategy === 'REVIEW_PRODUCT'
                            ? visibleProducts.length >= 2
                                ? 'COMPARE_TWO'
                                : 'REVIEW_ONE'
                            : 'KEEP_EXPLORING';
                    const compatibilityTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'COMPATIBILITY_CHECK',
                        turn_focus: 'compatibility',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: visibleProducts.length >= 2 ? 'GUIDED_COMPARE' : 'SOFT_REASSURE',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(compatibilityProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: compatibilityTurnAnalysis,
                        commercialMove,
                    });
                    const compactBaseMessage = compactCesarinCopy(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        visibleProducts.length > 0 ? 2 : 3,
                    );
                    const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
                    const renderableNextStepGuidance = Boolean(
                        compactNextStepGuidance
                        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance),
                    )
                        ? compactNextStepGuidance
                        : undefined;
                    const hasMaterialNextStepAction = Boolean(
                        adaptiveConversation.nextStep.primaryAction
                        || adaptiveConversation.nextStep.secondaryAction
                        || adaptiveConversation.nextStep.assistAction,
                    );
                    const compactNextStepView = visibleProducts.length > 0
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as any).resolved_products = visibleProducts;
                    (capsuleContract as any).next_step_view = compactNextStepView;
                    (capsuleContract as any).turn_analysis = compatibilityTurnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'storefront_compatibility_check',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: visibleProducts.length > 0,
                        product_card_count: visibleProducts.length,
                        zero_results: capsuleContract.match_strategy === 'NO_GROUNDED_MATCH'
                            || capsuleContract.match_strategy === 'NEEDS_MORE_CONTEXT',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: compatibilityTurnAnalysis.primary_intent,
                        turn_secondary_intents: compatibilityTurnAnalysis.secondary_intents,
                        turn_priority: compatibilityTurnAnalysis.turn_priority,
                        current_turn_decision: compatibilityTurnAnalysis.current_turn_decision,
                        turn_focus: compatibilityTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
                        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });

                    const finalMessage = mergeConversationalPrefix(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        getEffectiveConversationalPrefix({
                            message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: compatibilityTurnAnalysis,
                            sourceContext,
                        }),
                        visibleProducts.length > 0 ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'info',
                        turn_analysis: compatibilityTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'knowledge_rag_foundation') {
                    const capsuleContract = await executeKnowledgeCapsule(data.tool_args);
                    const prefixedKnowledgeMessage = mergeConversationalPrefix(
                        capsuleContract.ui_render_hint ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.ui_render_hint ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.ui_render_hint ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'knowledge_rag_foundation',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.match_strategy === 'LOW_CONFIDENCE_FALLBACK' || capsuleContract.match_strategy === 'NO_MATCH',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: false,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        message: prefixedKnowledgeMessage || capsuleContract.ui_render_hint,
                        intent: 'info', 
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'storefront_inventory_outlook') {
                    const capsuleContract = await executeStorefrontInventoryOutlookCapsule(data.tool_args);
                    const inventoryProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const visibleProducts = inventoryProducts;
                    const supportsReview = capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_ONLINE'
                        || capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_OMNICHANNEL';
                    const commercialMove = supportsReview ? 'REVIEW_ONE' : 'KEEP_EXPLORING';
                    const inventoryTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'INVENTORY_OUTLOOK',
                        turn_focus: 'inventory',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: supportsReview
                            ? 'SOFT_REASSURE'
                            : capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED'
                                ? 'SOFT_REASSURE'
                                : 'EXPLORE_LIGHT',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(inventoryProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: inventoryTurnAnalysis,
                        commercialMove,
                    });
                    const compactBaseMessage = compactCesarinCopy(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        visibleProducts.length > 0 ? 2 : 3,
                    );
                    const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
                    const renderableNextStepGuidance = Boolean(
                        compactNextStepGuidance
                        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance),
                    )
                        ? compactNextStepGuidance
                        : undefined;
                    const hasMaterialNextStepAction = Boolean(
                        adaptiveConversation.nextStep.primaryAction
                        || adaptiveConversation.nextStep.secondaryAction
                        || adaptiveConversation.nextStep.assistAction,
                    );
                    const shouldShowNextStep = visibleProducts.length > 0
                        && (supportsReview || capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED');
                    const compactNextStepView = shouldShowNextStep
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as any).resolved_products = visibleProducts;
                    (capsuleContract as any).next_step_view = compactNextStepView;
                    (capsuleContract as any).turn_analysis = inventoryTurnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'storefront_inventory_outlook',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: visibleProducts.length > 0,
                        product_card_count: visibleProducts.length,
                        zero_results: capsuleContract.inventory_outlook_signal.kind === 'PRODUCT_NOT_FOUND',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: inventoryTurnAnalysis.primary_intent,
                        turn_secondary_intents: inventoryTurnAnalysis.secondary_intents,
                        turn_priority: inventoryTurnAnalysis.turn_priority,
                        current_turn_decision: inventoryTurnAnalysis.current_turn_decision,
                        turn_focus: inventoryTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
                        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });

                    const finalMessage = mergeConversationalPrefix(
                        adaptiveConversation.message || capsuleContract.customer_response_draft,
                        getEffectiveConversationalPrefix({
                            message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: inventoryTurnAnalysis,
                            sourceContext,
                        }),
                        visibleProducts.length > 0 ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'info',
                        turn_analysis: inventoryTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'authenticated_order_tracking') {
                    const capsuleContract = await executeAuthenticatedOrderTrackingCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const action = deriveOrderTrackingBridgeAction(capsuleContract.order_tracking_signal);
                    const prefixedTrackingMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'support',
                        routed_capsule: 'authenticated_order_tracking',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.order_tracking_signal.kind !== 'FOUND',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: Boolean(action),
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        message: prefixedTrackingMessage || capsuleContract.customer_response_draft,
                        intent: 'support',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        action,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'authenticated_warranty_triage') {
                    const capsuleContract = await executeAuthenticatedWarrantyTriageCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const prefixedWarrantyMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'support',
                        routed_capsule: 'authenticated_warranty_triage',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.warranty_triage_signal.kind === 'NO_RELEVANT_ORDER'
                            || capsuleContract.warranty_triage_signal.kind === 'AUTH_REQUIRED',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        message: prefixedWarrantyMessage || capsuleContract.customer_response_draft,
                        intent: 'support',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'authenticated_loyalty_status') {
                    const capsuleContract = await executeAuthenticatedLoyaltyStatusCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const prefixedLoyaltyMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'authenticated_loyalty_status',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.loyalty_status_signal.kind === 'AUTH_REQUIRED'
                            || capsuleContract.loyalty_status_signal.kind === 'NO_LOYALTY_DATA',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        message: prefixedLoyaltyMessage || capsuleContract.customer_response_draft,
                        intent: 'info',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'storefront_checkout_readiness') {
                    const capsuleContract = await executeStorefrontCheckoutReadinessCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const action = deriveCheckoutBridgeAction(capsuleContract.checkout_readiness_signal);
                    const checkoutTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        primary_intent: 'CHECKOUT_READINESS',
                        turn_focus: 'checkout',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const prefixedCheckoutMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: checkoutTurnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'support',
                        routed_capsule: 'storefront_checkout_readiness',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.checkout_readiness_signal.kind !== 'READY_TO_CHECKOUT'
                            && capsuleContract.checkout_readiness_signal.kind !== 'PAYMENT_METHOD_INFO'
                            && capsuleContract.checkout_readiness_signal.kind !== 'SHIPPING_INFO_AVAILABLE',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: checkoutTurnAnalysis.primary_intent,
                        turn_secondary_intents: checkoutTurnAnalysis.secondary_intents,
                        turn_priority: checkoutTurnAnalysis.turn_priority,
                        current_turn_decision: checkoutTurnAnalysis.current_turn_decision,
                        turn_focus: checkoutTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: Boolean(action),
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as any).turn_analysis = checkoutTurnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        message: prefixedCheckoutMessage || capsuleContract.customer_response_draft,
                        intent: 'support',
                        turn_analysis: checkoutTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        action,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'cart_operator') {
                    const capsuleContract = await executeCartOperatorCapsule(data.tool_args);
                    const prefixedCartMessage = mergeConversationalPrefix(
                        'Actualizando tu carrito...',
                        getEffectiveConversationalPrefix({
                            message: 'Actualizando tu carrito...',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        2,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: null,
                        detected_intent: 'cart_operation',
                        routed_capsule: 'cart_operator',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: false,
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: false,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        // The UI renderer will intercept this message using ui_render_mode later
                        message: prefixedCartMessage,
                        intent: 'search', 
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract
                    };
                }
            }

            // Generic path: no capsule required, OR requires_client_capsule=true but capsule_name unrecognized (UNKNOWN_CAPSULE)
            const unknownCapsule = data.requires_client_capsule === true;
            const genericProducts = data.products ?? [];
            const genericNextStepTelemetry = extractTelemetryNextStepTruth(
                data.capsule_contract?.next_step_view ?? data.next_step_view ?? null,
            );
            const telemetryContract = resolveAITelemetryContract({
                telemetry_contract: data.telemetry_contract,
                server_telemetry_logged: data.server_telemetry_logged,
                requires_client_capsule: data.requires_client_capsule,
            });
            const genericMessage = mergeConversationalPrefix(
                data.message || data.text || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                getEffectiveConversationalPrefix({
                    message: data.message || data.text || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                    prefix: data.conversational_prefix,
                    turnAnalysis,
                    sourceContext,
                }),
                catalogGate.is_open ? 2 : 3,
            );
            // Prefer the explicit edge/client ownership contract when present.
            if (shouldClientLogAITelemetry(telemetryContract)) void logAITelemetry({
                session_id: effectiveTelemetrySessionId,
                customer_id: customerProfile?.id ?? null,
                query,
                response_text: data.text ?? data.message ?? null,
                detected_intent: data.intent ?? null,
                routed_capsule: unknownCapsule ? (data.capsule_name ?? null) : null,
                requires_client_capsule: data.requires_client_capsule ?? false,
                capsule_match_success: false,
                fallback_used: true,
                response_latency_ms: Date.now() - invokeStart,
                has_product_cards: catalogGate.is_open && genericProducts.length > 0,
                product_card_count: catalogGate.is_open ? genericProducts.length : 0,
                zero_results: !catalogGate.is_open || genericProducts.length === 0,
                error_type: unknownCapsule ? 'UNKNOWN_CAPSULE' : null,
                turn_primary_intent: turnAnalysis.primary_intent,
                turn_secondary_intents: turnAnalysis.secondary_intents,
                turn_priority: turnAnalysis.turn_priority,
                current_turn_decision: turnAnalysis.current_turn_decision,
                turn_focus: turnAnalysis.turn_focus ?? null,
                catalog_gate_open: catalogGate.is_open,
                catalog_gate_reason: catalogGate.reason,
                next_step_family: genericNextStepTelemetry.next_step_family,
                assist_action_present: genericNextStepTelemetry.assist_action_present,
                source_context_present: Boolean(sourceContext),
                retrieval_source: null,
            });
            return {
                message: genericMessage,
                suggestedProducts: catalogGate.is_open ? data.products : [],
                intent: data.intent,
                turn_analysis: turnAnalysis,
                catalog_gate: catalogGate,
                source_context: sourceContext,
                action: data.action,
                capsule_contract: data.routed_capsule ? { capsule_name: data.routed_capsule, turn_analysis: turnAnalysis, catalog_gate: catalogGate } : { turn_analysis: turnAnalysis, catalog_gate: catalogGate }
            };
        } catch (error) {
            console.error('Concierge Chat Error:', error);
            const _errMsg = error instanceof Error ? error.message : String(error);
            const _errType: 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' =
                _errMsg === 'REQUEST_TIMEOUT' ? 'TIMEOUT'
                : (_errMsg.includes('429') || _errMsg.includes('RESOURCE_EXHAUSTED') || _errMsg.includes('quota')) ? 'QUOTA'
                : 'EDGE_ERROR';
            void logAITelemetry({
                session_id: effectiveTelemetrySessionId,
                customer_id: customerProfile?.id ?? null,
                query,
                response_text: null,
                detected_intent: null,
                routed_capsule: null,
                requires_client_capsule: false,
                capsule_match_success: false,
                fallback_used: true,
                response_latency_ms: Date.now() - invokeStart,
                has_product_cards: false,
                product_card_count: 0,
                zero_results: false,
                error_type: _errType,
                catalog_gate_open: null,
                catalog_gate_reason: null,
                next_step_family: null,
                assist_action_present: false,
                source_context_present: false,
                retrieval_source: null,
            });
            // SLICE 2D: Re-throw error so the hook can classify it and render explicit Retry UI
            throw error;
        }
    },

    /**
     * Semantic Search implementation via Vector Embeddings (if available) or AI Parsing.
     */
    async semanticSearch(query: string): Promise<Product[]> {
        const cacheKey = `semantic:${query.toLowerCase().trim()}`;
        if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'semantic_search', 
                    query 
                }
            });

            if (error) throw error;
            const products = data.products || [];
            searchCache.set(cacheKey, products);
            return products;
        } catch (error) {
            console.error('Semantic Search Error:', error);
            return [];
        }
    },

    /**
     * Vector-based Neural Search [Wave 120]
     * Uses pgvector and Gemini Embeddings for high-precision semantic matching.
     */
    async neuralSearch(query: string, matchThreshold: number = 0.5, matchCount: number = 8): Promise<Product[]> {
        const cacheKey = `neural:${query.toLowerCase().trim()}`;
        if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

        try {
            const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('embeddings-processor', {
                body: { text: query }
            });

            if (embeddingError) throw embeddingError;
            if (!embeddingData.embedding) throw new Error('No embedding returned from processor');

            const { data: matchedProducts, error: matchError } = await supabase.rpc('match_products', {
                query_embedding: embeddingData.embedding,
                match_threshold: matchThreshold,
                match_count: matchCount
            });

            if (matchError) throw matchError;
            const products = matchedProducts || [];
            searchCache.set(cacheKey, products);
            return products;
        } catch (error) {
            console.error('Neural Search Error:', error);
            return this.semanticSearch(query);
        }
    },

    /**
     * Persists AI-extracted preferences into the customer's profile.
     * Part of Wave 80 - Cognitive Loyalty.
     */
    async updatePreferences(
        customerId: string,
        preferences: AIPreferences,
        iaContext?: Partial<IAContext>
    ): Promise<void> {
        try {
            const updateData: Partial<CustomerProfile> = {
                ai_preferences: preferences,
                updated_at: new Date().toISOString()
            };
            
            if (iaContext) {
                updateData.ia_context = iaContext;
            }

            const { error } = await supabase
                .from('customer_profiles')
                .update(updateData)
                .eq('id', customerId);

            if (error) throw error;
        } catch (error) {
            console.error('Update Preferences Error:', error);
        }
    },

    /**
     * Unified Customer Intelligence (Wave 90 Consolidation)
     */
    async getMyIntelligence(): Promise<unknown> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('customer_intelligence_360')
                .select('*')
                .eq('customer_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching intelligence:', error);
            return null;
        }
    },

    getPersonalizedBanner(segment: string): { 
        id: string; 
        title: string; 
        subtitle: string; 
        cta: string; 
        link: string; 
        type: 'recovery' | 'reward' | 'welcome' | 'promo'; 
        bgClass: string; 
    } | null {
        const banners: Record<string, { 
            id: string; 
            title: string; 
            subtitle: string; 
            cta: string; 
            link: string; 
            type: 'recovery' | 'reward' | 'welcome' | 'promo'; 
            bgClass: string; 
        }> = {
            'En Riesgo': {
                id: 'recovery-banner',
                title: '¡Te extrañamos mucho!',
                subtitle: 'Vuelve y obtén un 15% de descuento en tu próxima compra.',
                cta: 'Usar Cupón: VOLVER15',
                link: '/categories/vape',
                type: 'recovery',
                bgClass: 'from-rose-600 to-crimson-700'
            },
            'Campeón': {
                id: 'loyalty-reward',
                title: 'Status: Campeón 🏆',
                subtitle: 'Gracias por ser parte del 1% más leal. Tienes envíos gratis en todo.',
                cta: 'Ver Beneficios',
                link: '/profile/loyalty',
                type: 'reward',
                bgClass: 'from-amber-500 to-vape-700'
            },
            'Nuevo': {
                id: 'welcome-featured',
                title: 'Bienvenido a VSM Store',
                subtitle: '¿No sabes por dónde empezar? Mira nuestra Guía de Vapeo 2026.',
                cta: 'Ver Guía',
                link: '/blog/guia-inicio',
                type: 'welcome',
                bgClass: 'from-vape-600 to-herbal-600'
            }
        };
        return banners[segment] || null;
    }
};
