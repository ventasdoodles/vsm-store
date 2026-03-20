import { supabase } from '@/lib/supabase';
import { executeProductSearchCapsule, executeKnowledgeCapsule, executeCartOperatorCapsule } from '@/services/ai-capsule-orchestrator.service';
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

/**
 * AI Concierge Service [Wave 70 - Hyper-Personalization]
 * 
 * Manages client-side AI interactions for product discovery and assistance.
 * Leverages Gemini API through Supabase Edge Functions.
 */
async function logAITelemetry(fields: {
    customer_id: string | null;
    query: string;
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
}): Promise<void> {
    try {
        await supabase.from('ai_analytics').insert({ is_simulation: false, ...fields });
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
                    is_pilot: typeof window !== 'undefined' && sessionStorage.getItem('vsm_storefront_ai_pilot_enabled') === 'true'
                }
            });

            // --- PIPELINE DIAGNOSTIC: Supabase Invoke Result ---
            console.warn(`[Concierge Diag] invoke completed in ${Date.now() - invokeStart}ms`);
            console.warn(`[Concierge Diag] error:`, error ? JSON.stringify(error).slice(0, 300) : 'null');
            console.warn(`[Concierge Diag] data keys:`, data ? Object.keys(data) : 'null');
            console.warn(`[Concierge Diag] data.requires_client_capsule:`, data?.requires_client_capsule);
            console.warn(`[Concierge Diag] data.capsule_name:`, data?.capsule_name);
            console.warn(`[Concierge Diag] data.text exists:`, !!data?.text);
            console.warn(`[Concierge Diag] data.message exists:`, !!data?.message);
            console.warn(`[Concierge Diag] data.error exists:`, !!data?.error);

            if (error) {
                console.error('[Concierge Diag] THROW PATH — Supabase invoke error:', JSON.stringify(error).slice(0, 500));
                throw error;
            }
            
            // --- AI/LLM ROUTING: CLOUD TO CLIENT CAPSULE DELEGATION ---
            if (data.requires_client_capsule) {
                if (data.capsule_name === 'product_search_integrity') {
                    console.warn('[Concierge] Executing Product Search Integrity Capsule internally...');
                    const capsuleContract = await executeProductSearchCapsule(data.tool_args);
                    void logAITelemetry({
                        customer_id: customerProfile?.id ?? null,
                        query,
                        detected_intent: 'search',
                        routed_capsule: 'product_search_integrity',
                        requires_client_capsule: true,
                        capsule_match_success: true,
                        fallback_used: false,
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: (capsuleContract.resolved_products?.length ?? 0) > 0,
                        product_card_count: capsuleContract.resolved_products?.length ?? 0,
                        zero_results: (capsuleContract.resolved_products?.length ?? 0) === 0,
                        error_type: null
                    });
                    return {
                        message: capsuleContract.customer_response_draft,
                        suggestedProducts: capsuleContract.resolved_products || [],
                        intent: 'search',
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'knowledge_rag_foundation') {
                    console.warn('[Concierge] Executing Knowledge RAG Foundation Capsule internally...');
                    const capsuleContract = await executeKnowledgeCapsule(data.tool_args);
                    void logAITelemetry({
                        customer_id: customerProfile?.id ?? null,
                        query,
                        detected_intent: 'info',
                        routed_capsule: 'knowledge_rag_foundation',
                        requires_client_capsule: true,
                        capsule_match_success: true,
                        fallback_used: false,
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: false,
                        error_type: null
                    });
                    return {
                        message: capsuleContract.ui_render_hint,
                        intent: 'info', 
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'cart_operator') {
                    console.warn('[Concierge] Executing Cart Operator Capsule internally...');
                    const capsuleContract = await executeCartOperatorCapsule(data.tool_args);
                    void logAITelemetry({
                        customer_id: customerProfile?.id ?? null,
                        query,
                        detected_intent: 'search',
                        routed_capsule: 'cart_operator',
                        requires_client_capsule: true,
                        capsule_match_success: true,
                        fallback_used: false,
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: false,
                        error_type: null
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
            void logAITelemetry({
                customer_id: customerProfile?.id ?? null,
                query,
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
