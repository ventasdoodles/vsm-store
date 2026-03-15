/**
 * // ─── SERVICIO: loyalty.service ───
 * // Arquitectura: Service Layer (Database → Services → Hooks → Components)
 * // Proposito principal: CRUD del programa de lealtad V-Coins: tiers, puntos,
 *    historial, canje, referidos y stats admin.
 * // Regla / Notas: Sin `any`. Selectores explícitos. Named exports.
 *    La lógica de negocio reside en `lib/domain/loyalty`.
 */

import { supabase } from '@/lib/supabase';
import { getStoreSettings } from './settings.service';
import { 
    TierId, 
    LOYALTY_TIERS, 
    getLoyaltyTier, 
    getNextTierProgress as calculateProgress,
    TierDefinition
} from '@/lib/domain/loyalty';

// ─── Re-exports de tipos de dominio (para compatibilidad) ──────────
export type Tier = TierId;
export type TierInfo = TierDefinition;

export interface PointsTransaction {
    id: string;
    points: number;
    transaction_type: 'earned' | 'spent' | 'expired' | 'adjustment';
    description: string;
    order_id: string | null;
    created_at: string;
}

export interface ReferralStats {
    count: number;
    completed: number;
    pending: number;
    pointsEarned: number;
}

/** Tier dinámico configurable desde el panel de admin */
export interface DynamicTier {
    id: string;
    name?: string;
    threshold?: number;
    multiplier: number;
    benefits?: string[];
}

// ─── Get tier from total spent ───────────────────
/** @deprecated Use getLoyaltyTier from lib/domain/loyalty */
export function getTierFromSpent(totalSpent: number): Tier {
    return getLoyaltyTier(totalSpent);
}

// ─── Tier info ───────────────────────────────────
export function getTierInfo(tier: Tier, dynamicTiers?: DynamicTier[] | null): TierInfo {
    if (dynamicTiers && Array.isArray(dynamicTiers)) {
        const found = dynamicTiers.find(t => t.id === tier);
        if (found) {
            return {
                id: found.id as TierId,
                label: found.name || found.id,
                minSpent: found.threshold ?? 0,
                discount: found.multiplier > 1 ? (found.multiplier - 1) * 10 : 0,
                freeShipping: found.id !== 'bronze',
                freeShippingMin: found.id === 'silver' ? 1000 : 0,
                benefits: found.benefits || [],
                color: LOYALTY_TIERS[found.id as TierId]?.color || '#ffffff'
            };
        }
    }
    return LOYALTY_TIERS[tier] || LOYALTY_TIERS.bronze;
}

// ─── Progreso al siguiente tier ──────────────────
export function getProgressToNextTier(totalSpent: number, _dynamicTiers?: DynamicTier[] | null) {
    const p = calculateProgress(totalSpent);
    return {
        currentTier: p.currentTier as Tier,
        nextTier: p.nextTier as Tier,
        progress: p.progress,
        remaining: p.amountToNext
    };
}

// ─── Balance de puntos (RPC) ─────────────────────
export async function getPointsBalance(customerId: string): Promise<number> {
    const { data, error } = await supabase
        .rpc('get_customer_points_balance', { p_customer_id: customerId });

    if (error) {
        console.error('Error obteniendo balance:', error);
        return 0;
    }
    return data ?? 0;
}

// ─── Agregar puntos de lealtad (compra) ──────────
export async function addLoyaltyPoints(
    customerId: string,
    points: number,
    orderId: string,
    description: string
) {
    const { error } = await supabase.rpc('process_loyalty_points', {
        p_user_id: customerId,
        p_amount: points,
        p_type: 'earned',
        p_description: description,
        p_order_id: orderId
    });

    if (error) {
        console.error('Error agregando puntos (RPC):', error);
        // No lanzar para no bloquear el flujo de compra
    }
}

// ─── Historial de puntos ─────────────────────────
export async function getPointsHistory(customerId: string): Promise<PointsTransaction[]> {
    const { data, error } = await supabase
        .from('loyalty_points')
        .select('id, points, transaction_type, description, order_id, created_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return (data ?? []) as PointsTransaction[];
}

// ─── Canjear puntos ──────────────────────────────
export async function redeemPoints(
    customerId: string,
    points: number,
    orderId?: string
): Promise<{ discount: number }> {
    const settings = await getStoreSettings();
    const config = settings?.loyalty_config || {
        points_per_currency: 0.1,
        currency_per_point: 0.1,
        min_points_to_redeem: 100,
        max_points_per_order: 1000,
        points_expiry_days: 365,
        enable_loyalty: true
    };

    if (!config.enable_loyalty) {
        throw new Error('El programa de lealtad está desactivado');
    }

    if (points < config.min_points_to_redeem) {
        throw new Error(`Mínimo ${config.min_points_to_redeem} puntos para canjear`);
    }

    const maxPoints = Math.min(points, config.max_points_per_order);
    const discount = maxPoints * config.currency_per_point;

    const { error } = await supabase.rpc('process_loyalty_points', {
        p_user_id: customerId,
        p_amount: -maxPoints,
        p_type: 'spent',
        p_description: `Canje de ${maxPoints} puntos (-$${discount})`,
        p_order_id: orderId ?? null
    });

    if (error) throw error;
    return { discount };
}

// ─── Ajustar puntos (Admin) ──────────────────────
export async function adjustPoints(
    customerId: string,
    points: number,
    description: string
): Promise<void> {
    const { error } = await supabase.rpc('process_loyalty_points', {
        p_user_id: customerId,
        p_amount: points,
        p_type: points >= 0 ? 'earned' : 'spent',
        p_description: description,
        p_order_id: null
    });

    if (error) throw error;
}

// ─── Admin Stats (RPC) ──────────────────────────
export interface LoyaltyStatsData {
    puntos_hoy: number;
    ultimo_canje: {
        created_at?: string;
        full_name?: string;
        points?: number;
    } | null;
    top_usuarios: Array<{
        id: string;
        full_name: string;
        balance: number;
    }>;
}

export async function getAdminLoyaltyStats(): Promise<LoyaltyStatsData> {
    const { data, error } = await supabase.rpc('get_admin_loyalty_stats');

    if (error) {
        console.error('Error fetching loyalty stats (RPC may be missing):', error);
        return { puntos_hoy: 0, ultimo_canje: null, top_usuarios: [] };
    }

    return data as LoyaltyStatsData;
}

// ─── Referidos ───────────────────────────────────

/**
 * Vincula al cliente actual con un referente mediante su código.
 */
export async function applyReferralCode(code: string, customerId: string): Promise<void> {
    // 1. Buscar al referente por su código
    const { data: referrer, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code.toUpperCase())
        .single();

    if (searchError || !referrer) throw new Error('Código de referido no válido');
    if (referrer.id === customerId) throw new Error('No puedes referirte a ti mismo');

    // 2. Crear el registro de referido
    const { error: insertError } = await supabase
        .from('referrals')
        .insert({
            referrer_id: referrer.id,
            referred_id: customerId,
        });

    if (insertError) {
        if (insertError.code === '23505') throw new Error('Ya has sido referido anteriormente');
        throw insertError;
    }
}

/**
 * Obtiene estadísticas de referidos para un cliente.
 */
export async function getReferralStats(customerId: string): Promise<ReferralStats> {
    const { data, error } = await supabase
        .from('referrals')
        .select('status, reward_points_referrer')
        .eq('referrer_id', customerId);

    if (error) throw error;
 
    const stats: ReferralStats = {
        count: data.length,
        completed: data.filter(r => r.status === 'completed').length,
        pending: data.filter(r => r.status === 'pending').length,
        pointsEarned: data.reduce((sum, r) => sum + (r.reward_points_referrer || 0), 0)
    };

    return stats;
}

// ─── AI DRIVE LOYALTY (Consolidated from loyaltyIA.service) ────────

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
 * Solicita una nueva recompensa inteligente al motor de IA (Edge Function)
 */
export async function generateSmartReward(customerId: string): Promise<SmartLoyaltyProposition | null> {
    try {
        const { data, error } = await supabase.functions.invoke('loyalty-intelligence', {
            body: { customerId }
        });

        if (error) {
            if (import.meta.env.DEV) console.warn('[loyalty.service] Edge Function failed:', error);
            return null;
        }
        return data;
    } catch (err) {
        if (import.meta.env.DEV) console.warn('[loyalty.service] generateSmartReward unexpected error:', err);
        return null;
    }
}

/**
 * Obtiene la propuesta de IA vigente para un cliente.
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
        if (import.meta.env.DEV) console.error('[loyalty.service] Error fetching IA proposition:', error);
        return null;
    }

    return data;
}

/**
 * Consulta la vista de inteligencia 360 del cliente.
 */
export async function getCustomerIntelligence360(customerId: string) {
    const { data, error } = await supabase
        .from('customer_intelligence_360')
        .select('segment, health_status')
        .eq('customer_id', customerId)
        .single();

    if (error) return null;
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

        if (error && import.meta.env.DEV) {
            console.warn('[loyalty.service] Failed to claim IA proposition:', error);
        }
    } catch (err) {
        if (import.meta.env.DEV) console.warn('[loyalty.service] claimIAProposition unexpected error:', err);
    }
}
