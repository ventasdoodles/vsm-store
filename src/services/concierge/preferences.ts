import { supabase } from '@/lib/supabase';















import type { AIPreferences, CustomerProfile, IAContext } from '@/types/customer';


export async function updatePreferences(customerId: string, preferences: AIPreferences, iaContext?: Partial<IAContext>): Promise<void> {
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
    }

export async function getMyIntelligence(): Promise<unknown> {
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
    }

export function getPersonalizedBanner(segment: string): { 
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
