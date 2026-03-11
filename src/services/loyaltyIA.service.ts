/**
 * loyaltyIA.service - VSM Store
 * 
 * Servicio para la lógica y gestión de loyaltyIA.
 * @module services/loyaltyIA.service
 */

import { supabase } from '@/lib/supabase';

export interface SmartLoyaltyProposition {
    id: string;
    customer_id: string;
    coupon_code: string;
    generated_code: string;
    personalized_message: string;
    discount_value: number;
    discount_type: 'percentage' | 'fixed';
    expires_at: string;
    is_claimed: boolean;
}

/**
 * Solicita una nueva recompensa inteligente al motor de IA
 */
export async function generateSmartReward(customerId: string): Promise<SmartLoyaltyProposition | null> {
    try {
        const { data, error } = await supabase.functions.invoke('loyalty-intelligence', {
            body: { customerId }
        });

        if (error) {
            console.warn('Supabase Function loyalty-intelligence failed (likely CORS or missing):', error);
            return null;
        }
        return data;
    } catch (err) {
        console.warn('Unexpected error in generateSmartReward:', err);
        return null;
    }
}

/**
 * Obtiene la propuesta de IA vigente para un cliente (si existe y no ha expirado)
 */
export async function getActiveIAProposition(customerId: string): Promise<SmartLoyaltyProposition | null> {
    const { data, error } = await supabase
        .from('smart_loyalty_propositions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_claimed', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching IA proposition:', error);
        return null;
    }

    return data;
}

/**
 * Marca una propuesta de IA como reclamada
 */
export async function claimIAProposition(propositionId: string) {
    try {
        const { error } = await supabase
            .from('smart_loyalty_propositions')
            .update({ is_claimed: true })
            .eq('id', propositionId);

        if (error) {
            console.warn('Failed to claim IA proposition:', error);
        }
    } catch (err) {
        console.warn('Unexpected error in claimIAProposition:', err);
    }
}
