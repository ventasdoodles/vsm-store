/**
 * // ─── SERVICIO: gamification.service ───
 * // Arquitectura: Service Layer (Database → Services → Hooks → Components)
 * // Proposito principal: CRUD para mecánicas de gamificación: Ruleta de Premios.
 *    getWheelConfig, canSpin, recordSpin con premio atómico.
 * // Regla / Notas: Sin `any`. Funciones async puras. Selectores explícitos (no select *).
 */
import { supabase } from '@/lib/supabase';

/* ─── Tipos ─── */

export interface WheelPrize {
    id: string;
    label: string;
    type: 'points' | 'coupon' | 'empty';
    value: { amount?: number; discount?: number; type?: string; code?: string };
    probability: number;
    color: string;
}

export interface WheelAttempt {
    id: string;
    customer_id: string;
    prize_id: string;
    result_data: { amount?: number; discount?: number; type?: string; code?: string };
    created_at: string;
}

/* ─── Queries ─── */

/**
 * Obtiene la configuración activa de la ruleta (segmentos y probabilidades).
 */
export const gamificationService = {
    async getWheelConfig(): Promise<WheelPrize[]> {
        const { data, error } = await supabase
            .from('wheel_config')
            .select('id, label, type, value, probability, color')
            .eq('is_active', true)
            .order('probability', { ascending: false });

        if (error) throw error;
        return (data ?? []) as WheelPrize[];
    },

    /**
     * Verifica si el usuario puede girar (límite: 1 giro por 24h).
     * Utiliza RPC atómica en Supabase para evitar race conditions.
     */
    async canSpin(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .rpc('can_user_spin', { user_id: userId });

        if (error) {
            console.error('[gamificationService] canSpin RPC error:', error.message);
            return false;
        }
        return !!data;
    },

    /**
     * Registra el giro y aplica el premio.
     * Inserta en wheel_attempts y acredita V-Coins si el premio es de tipo 'points'.
     */
    async recordSpin(userId: string, prize: WheelPrize): Promise<void> {
        const { error } = await supabase
            .from('wheel_attempts')
            .insert({
                customer_id: userId,
                prize_id: prize.id,
                result_data: prize.value,
            });

        if (error) throw error;

        // Acreditar V-Coins si el premio es de puntos
        if (prize.type === 'points' && prize.value.amount && prize.value.amount > 0) {
            const { error: pointsError } = await supabase.rpc('process_loyalty_points', {
                p_user_id: userId,
                p_amount: prize.value.amount,
                p_type: 'earned',
                p_description: `🎡 Ruleta de premios: ${prize.label}`,
            });

            if (pointsError) {
                if (import.meta.env.DEV) {
                    console.error('[gamificationService] Error acreditando V-Coins:', pointsError.message);
                }
            }
        }
    },
};
