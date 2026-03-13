import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';
import type { AIPreferences, IAContext } from '@/types/customer';

export interface ConciergeMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    suggestedProducts?: Product[];
    intent?: 'search' | 'info' | 'support' | 'recommendation';
}

/**
 * AI Concierge Service [Wave 70 - Hyper-Personalization]
 * 
 * Manages client-side AI interactions for product discovery and assistance.
 * Leverages Gemini API through Supabase Edge Functions.
 */
export const conciergeService = {
    /**
     * Sends a message to the AI Assistant and returns a structured response.
     */
    async chat(query: string, history: { role: 'user' | 'assistant', content: string }[], customerProfile?: any): Promise<{ 
        message: string; 
        suggestedProducts?: Product[];
        intent?: ConciergeMessage['intent'];
    }> {
        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'concierge_chat', 
                    query,
                    history,
                    customerContext: customerProfile ? {
                        id: customerProfile.id,
                        name: customerProfile.full_name,
                        preferences: customerProfile.preferences,
                        last_interactions: customerProfile.last_interactions
                    } : null
                }
            });

            if (error) throw error;
            
            return {
                message: data.message || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                suggestedProducts: data.products,
                intent: data.intent
            };
        } catch (error) {
            console.error('Concierge Chat Error:', error);
            return {
                message: "Parece que mi conexión está un poco inestable. Por favor, intenta de nuevo en un momento."
            };
        }
    },

    /**
     * Semantic Search implementation via Vector Embeddings (if available) or AI Parsing.
     */
    async semanticSearch(query: string): Promise<Product[]> {
        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'semantic_search', 
                    query 
                }
            });

            if (error) throw error;
            return data.products || [];
        } catch (error) {
            console.error('Semantic Search Error:', error);
            return [];
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
            const updateData: any = {
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
    async getMyIntelligence(): Promise<any> {
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

    getPersonalizedBanner(segment: string): any {
        const banners: Record<string, any> = {
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
