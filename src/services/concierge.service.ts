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
                    });
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

                    if (rerankedProducts.length > 0) {
                        capsuleContract.resolved_products = actionableConversation.visibleProducts;
                    }
                    (capsuleContract as any).next_step_view = actionableConversation.nextStep;

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
                        has_product_cards: (capsuleContract.resolved_products?.length ?? 0) > 0,
                        product_card_count: capsuleContract.resolved_products?.length ?? 0,
                        zero_results: (capsuleContract.resolved_products?.length ?? 0) === 0,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: capsuleContract.resolved_products?.map(p => ({ id: p.id, name: p.name, slug: p.slug })) ?? [],
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                    });

                    let finalMessage = actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft;
                    if (data.conversational_prefix && (capsuleContract.execution_status === 'SUCCESS' || capsuleContract.match_strategy === 'FEATURED_FALLBACK')) {
                        // Limpiar doble espaciado
                        finalMessage = `${data.conversational_prefix} ${finalMessage}`.replace(/\s+/g, ' ').trim();
                    }

                    return {
                        message: buildCesarinHumanizedSearchMessage({
                            query,
                            baseMessage: finalMessage,
                            matchStrategy: capsuleContract.match_strategy,
                            suggestedProducts: capsuleContract.resolved_products,
                        }) || finalMessage,
                        suggestedProducts: capsuleContract.resolved_products || [],
                        intent: 'search',
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
                    });
                    return {
                        message: capsuleContract.ui_render_hint,
                        intent: 'info', 
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
                    });
                    return {
                        // The UI renderer will intercept this message using ui_render_mode later
                        message: 'Actualizando tu carrito...',
                        intent: 'search', 
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
                has_product_cards: genericProducts.length > 0,
                product_card_count: genericProducts.length,
                zero_results: genericProducts.length === 0,
                error_type: unknownCapsule ? 'UNKNOWN_CAPSULE' : null
            });
            return {
                message: data.message || data.text || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                suggestedProducts: data.products,
                intent: data.intent,
                action: data.action,
                capsule_contract: data.routed_capsule ? { capsule_name: data.routed_capsule } : null
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
