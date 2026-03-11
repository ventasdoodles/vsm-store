/**
 * // ─── SERVICIO: loyaltyIA.service ───
 * // Arquitectura: Service Layer (Database → Services → Hooks → Components)
 * // Proposito principal: Cerebro de IA para el programa de recompensas. 
 *    Gestiona propuestas dinámicas generadas por Gemini (Edge Function) 
 *    y consultas de inteligencia de cliente 360.
 * // Regla / Notas: Sin `any`. No select *. Sin lógica de UI.
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

export interface CustomerIntelligence {
    segment: string;
    health_status: string;
}

/**
 * Solicita una nueva recompensa inteligente al motor de IA (Edge Function)
 */
export async function generateSmartReward(customerId: string): Promise<SmartLoyaltyProposition | null> {
    try {
        const { data, error } = await supabase.functions.invoke('loyalty-intelligence', {
            body: { customerId }
        });

        if (error) {
            console.warn('[loyaltyIA.service] Edge Function failed:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.warn('[loyaltyIA.service] generateSmartReward unexpected error:', err);
        return null;
    }
}

/**
 * Obtiene la propuesta de IA vigente para un cliente.
 * Usa selectores explícitos (Precision Fetching).
 */
export async function getActiveIAProposition(customerId: string): Promise<SmartLoyaltyProposition | null> {
    const { data, error } = await supabase
        .from('smart_loyalty_propositions')
        .select('id, customer_id, coupon_code, generated_code, personalized_message, discount_value, discount_type, expires_at, is_claimed')
        .eq('customer_id', customerId)
        .eq('is_claimed', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[loyaltyIA.service] Error fetching IA proposition:', error);
        return null;
    }

    return data;
}

/**
 * Consulta la vista de inteligencia 360 del cliente.
 * Reemplaza la query directa en el hook (§1.1).
 */
export async function getCustomerIntelligence360(customerId: string): Promise<CustomerIntelligence | null> {
    const { data, error } = await supabase
        .from('customer_intelligence_360')
        .select('segment, health_status')
        .eq('customer_id', customerId)
        .single();

    if (error) {
        // Silent fail — no todos los usuarios tienen registro 360 aún
        return null;
    }

    return data;
}

/**
 * Marca una propuesta de IA como reclamada
 */
export async function claimIAProposition(propositionId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('smart_loyalty_propositions')
            .update({ is_claimed: true })
            .eq('id', propositionId);

        if (error) {
            console.warn('[loyaltyIA.service] Failed to claim IA proposition:', error);
        }
    } catch (err) {
        console.warn('[loyaltyIA.service] claimIAProposition unexpected error:', err);
    }
}
