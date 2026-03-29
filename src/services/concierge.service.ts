import { supabase } from '@/lib/supabase';
import { executeProductSearchCapsule, executeKnowledgeCapsule, executeCartOperatorCapsule } from '@/services/ai-capsule-orchestrator.service';
import { isPilotActive } from '@/lib/pilot-activation';
import { buildCesarinHumanizedSearchMessage } from '@/lib/cesarin-stage1';
import { rerankCesarinSuggestedProducts, type CesarinPreferenceSummary } from '@/lib/cesarin-stage3';
import { buildCesarinAdaptiveConversationView } from '@/lib/cesarin-stage4';
import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
import { getProductsByIds } from '@/services/products.service';
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
}

export interface ConciergeCatalogGate {
    is_open: boolean;
    reason: ConciergeCatalogGateReason;
    primary_intent: string | null;
    explicit_product_request: boolean;
    search_leading: boolean;
    needs_clarification: boolean;
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
    return canonical === 'PRODUCT_SEARCH';
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

function normalizeGateText(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeCompactText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function splitIntoSentences(value: string): string[] {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    return normalized.match(/[^.!?]+[.!?]*/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [normalized];
}

function isRedundantClosingSentence(sentence: string): boolean {
    const normalized = normalizeCompactText(sentence);
    return /^(si quieres|si ya te gusto|si te late|si gustas|te conviene|vete por|yo arrancaria|yo me iria|para no hacerla larga|para no alargarla|te dejo unas opciones|te dejo unas cercanas|te paso|te muestro|si quieres te muestro|si quieres te paso|si quieres te dejo|si quieres te saco)/.test(normalized);
}

function areMeaningfullyDistinct(left: string, right: string): boolean {
    const normalizedLeft = normalizeCompactText(left);
    const normalizedRight = normalizeCompactText(right);

    if (!normalizedLeft || !normalizedRight) return true;
    if (normalizedLeft === normalizedRight) return false;
    if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return false;

    return true;
}

function compactCesarinCopy(value: string, maxSentences = 3): string {
    const seen = new Set<string>();
    const sentences: string[] = [];

    for (const sentence of splitIntoSentences(value)) {
        const normalized = normalizeCompactText(sentence);
        if (!normalized) continue;
        if (seen.has(normalized)) continue;
        if (isRedundantClosingSentence(sentence) && sentences.length > 0) continue;

        seen.add(normalized);
        sentences.push(sentence);

        if (sentences.length >= maxSentences) break;
    }

    return sentences.join(' ').replace(/\s+/g, ' ').trim();
}

function hasExplicitProductRequest(text: string): boolean {
    return /(recomi|recomend|opcion|opciones|producto|productos|modelo|modelos|muestr|enseñ|ensen|sugier|busco|quiero ver|quiero algo|quiero uno|alternativ|similar|parecid|ver opciones|ver productos|que me recomiendas|dame opciones|dame productos)/.test(text);
}

function hasClarificationNeed(text: string, turnAnalysis: ConciergeTurnAnalysis | null | undefined): boolean {
    if (turnAnalysis?.current_turn_decision === 'ASK_CLARIFYING_QUESTION') return true;
    return /(no se|todavia no|aun no|me falta|me hace falta|no tengo claro|necesito aclarar|quiero saber|solo quiero saber|estoy viendo|depende de|me refiero a|mejor dime|primero aclara|antes de|sin definir)/.test(text)
        && !hasExplicitProductRequest(text);
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
    const queryText = normalizeGateText(input.query);
    const assistantText = normalizeGateText(input.assistantMessage);
    const combinedText = `${queryText} ${assistantText}`.trim();
    const explicitProductRequest = hasExplicitProductRequest(combinedText);
    const searchLeading = isSearchLeadingIntent(primaryIntent);
    const hardNoCatalogLane = primaryIntent === 'POLICY_INQUIRY'
        || primaryIntent === 'INVENTORY_OUTLOOK'
        || primaryIntent === 'ORDER_TRACKING'
        || primaryIntent === 'COMPATIBILITY_CHECK'
        || primaryIntent === 'CART_OPERATION'
        || primaryIntent === 'PUBLIC_INFO'
        || primaryIntent === 'CHIT_CHAT'
        || primaryIntent === 'OUT_OF_DOMAIN';
    const needsClarification = hasClarificationNeed(combinedText, input.turnAnalysis)
        || primaryIntent === 'UNKNOWN';
    const hasCatalogContent = input.has_catalog_content === true;

    if (!input.turnAnalysis && hasCatalogContent && !hardNoCatalogLane) {
        return {
            is_open: true,
            reason: 'search_leading',
            primary_intent: primaryIntent,
            explicit_product_request: explicitProductRequest,
            search_leading: searchLeading,
            needs_clarification: false,
        };
    }

    let is_open = false;
    let reason: ConciergeCatalogGateReason = 'non_catalog_lane';

    if (hardNoCatalogLane) {
        reason = 'non_catalog_lane';
    } else if (searchLeading && !needsClarification) {
        is_open = true;
        reason = 'search_leading';
    } else if (explicitProductRequest && !needsClarification) {
        is_open = true;
        reason = 'explicit_product_request';
    } else if (needsClarification) {
        reason = 'clarification_first';
    }

    return {
        is_open,
        reason,
        primary_intent: primaryIntent,
        explicit_product_request: explicitProductRequest,
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
    };
}

function getFallbackTurnAnalysis(data: {
    intent?: string | null;
    routed_capsule?: string | null;
    capsule_name?: string | null;
    conversation_mode_hint?: string | null;
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
                : capsule === 'cart_operator'
                    ? 'CART_OPERATION'
                    : null);

    return {
        primary_intent,
        secondary_intents: [],
        turn_priority: primary_intent ? 'primary' : 'unknown',
        current_turn_decision: primary_intent ?? data.conversation_mode_hint ?? null,
    };
}

/**
 * AI Concierge Service [Wave 70 - Hyper-Personalization]
 * 
 * Manages client-side AI interactions for product discovery and assistance.
 * Leverages Gemini API through Supabase Edge Functions.
 */
async function logAITelemetry(fields: {
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
}): Promise<void> {
    try {
        await supabase.from('ai_analytics').insert({
            customer_id: fields.customer_id,
            query: fields.query,
            response_text: fields.response_text,
            detected_intent: fields.detected_intent,
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
                capsule_retrieval_source: fields.capsule_retrieval_source ?? null,
                turn_primary_intent: fields.turn_primary_intent ?? null,
                turn_secondary_intents: fields.turn_secondary_intents ?? [],
                turn_priority: fields.turn_priority ?? null,
                current_turn_decision: fields.current_turn_decision ?? null,
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
        mimeType?: string
    ): Promise<{
        message: string;
        suggestedProducts?: (Product | InternalResolvedProduct)[];
        intent?: ConciergeMessage['intent'];
        turn_analysis?: ConciergeTurnAnalysis;
        catalog_gate?: ConciergeCatalogGate;
        action?: ConciergeMessage['action'];
        capsule_contract?: any; // Exposing it structurally as requested
    }> {
        const invokeStart = Date.now();
        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'concierge_chat', 
                    query,
                    history,
                    audio,
                    mimeType,
                    customerContext: customerProfile ? {
                        id: customerProfile.id,
                        name: customerProfile.full_name,
                        preferences: customerProfile.ai_preferences,
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
                    conversation_mode_hint: data.conversation_mode_hint ?? data.debug?.conversation_mode_hint ?? null,
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
            
            // --- AI/LLM ROUTING: CLOUD TO CLIENT CAPSULE DELEGATION ---
            if (data.requires_client_capsule) {
                if (data.capsule_name === 'product_search_integrity') {
                    const capsuleContract = await executeProductSearchCapsule(data.tool_args);
                    const preferenceSummary = (data.memory_context as ConciergeProductSearchMemoryContext | null | undefined)?.preference_summary ?? null;
                    const rerankedProducts = rerankCesarinSuggestedProducts({
                        query,
                        products: capsuleContract.resolved_products ?? [],
                        preferenceSummary,
                    });
                    const adaptiveConversation = buildCesarinAdaptiveConversationView({
                        query,
                        history,
                        products: rerankedProducts,
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        preferenceSummary,
                        matchStrategy: capsuleContract.match_strategy,
                        modeHint: isSearchLeadingIntent(turnAnalysis.primary_intent) ? null : 'EXPLORE_LIGHT',
                    });
                    const shouldShowCatalogSurfaces = catalogGate.is_open;
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
                    });

                    if (shouldShowCatalogSurfaces && rerankedProducts.length > 0) {
                        capsuleContract.resolved_products = actionableConversation.visibleProducts;
                    } else {
                        capsuleContract.resolved_products = [];
                    }
                    const compactNextStepView = shouldShowCatalogSurfaces
                        ? {
                            ...actionableConversation.nextStep,
                            guidance: compactCesarinCopy(actionableConversation.nextStep.guidance, 1),
                        }
                        : undefined;
                    (capsuleContract as any).next_step_view = compactNextStepView;
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;

                    void logAITelemetry({
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
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                    });

                    let finalMessage = compactCesarinCopy(actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft, shouldShowCatalogSurfaces ? 2 : 3);
                    if (data.conversational_prefix && (capsuleContract.execution_status === 'SUCCESS' || capsuleContract.match_strategy === 'FEATURED_FALLBACK')) {
                        const compactPrefix = compactCesarinCopy(data.conversational_prefix, 1);
                        if (compactPrefix && areMeaningfullyDistinct(compactPrefix, finalMessage)) {
                            finalMessage = `${compactPrefix} ${finalMessage}`.replace(/\s+/g, ' ').trim();
                        }
                    }

                    const humanizedMessage = shouldShowCatalogSurfaces && isSearchLeadingIntent(turnAnalysis.primary_intent)
                        ? buildCesarinHumanizedSearchMessage({
                            query,
                            baseMessage: finalMessage,
                            matchStrategy: capsuleContract.match_strategy,
                            suggestedProducts: capsuleContract.resolved_products,
                        })
                        : finalMessage;
                    const conciseMessage = compactCesarinCopy(humanizedMessage || finalMessage, shouldShowCatalogSurfaces ? 2 : 3);

                    return {
                        message: conciseMessage,
                        suggestedProducts: shouldShowCatalogSurfaces ? (capsuleContract.resolved_products || []) : [],
                        intent: 'search',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'knowledge_rag_foundation') {
                    const capsuleContract = await executeKnowledgeCapsule(data.tool_args);
                    void logAITelemetry({
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
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        message: capsuleContract.ui_render_hint,
                        intent: 'info', 
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'cart_operator') {
                    const capsuleContract = await executeCartOperatorCapsule(data.tool_args);
                    void logAITelemetry({
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
                    });
                    (capsuleContract as any).turn_analysis = turnAnalysis;
                    (capsuleContract as any).catalog_gate = catalogGate;
                    return {
                        // The UI renderer will intercept this message using ui_render_mode later
                        message: 'Actualizando tu carrito...',
                        intent: 'search', 
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        capsule_contract: capsuleContract
                    };
                }
            }

            // Generic path: no capsule required, OR requires_client_capsule=true but capsule_name unrecognized (UNKNOWN_CAPSULE)
            const unknownCapsule = data.requires_client_capsule === true;
            const genericProducts = data.products ?? [];
            // Skip client-side telemetry if the edge function already logged this interaction (Sommelier path)
            if (!data.server_telemetry_logged) void logAITelemetry({
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
            });
            return {
                message: data.message || data.text || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                suggestedProducts: catalogGate.is_open ? data.products : [],
                intent: data.intent,
                turn_analysis: turnAnalysis,
                catalog_gate: catalogGate,
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
                error_type: _errType
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
