/**
 * // ─── SERVICIO: loyalty.service ───
 * // Arquitectura: Service Layer (Database → Services → Hooks → Components)
 * // Proposito principal: CRUD del programa de lealtad V-Coins: tiers, puntos,
 *    historial, canje, referidos y stats admin.
 * // Regla / Notas: Sin `any`. Selectores explícitos. Named exports.
 */
import { supabase } from '@/lib/supabase';
import { getStoreSettings } from './settings.service';

// ─── Tipos ───────────────────────────────────────
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierInfo {
    name: string;
    label: string;
    minSpent: number;
    discount: number;
    freeShipping: boolean;
    freeShippingMin: number;
    benefits: string[];
}

export interface PointsTransaction {
    id: string;
    points: number;
    transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjustment';
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

// ─── Tier config ─────────────────────────────────
export const TIERS: Record<Tier, TierInfo> = {
    bronze: {
        name: 'bronze',
        label: 'Bronze',
        minSpent: 0,
        discount: 0,
        freeShipping: false,
        freeShippingMin: 0,
        benefits: [
            'Acumula 10 puntos por cada $100',
            'Acceso a cupones básicos',
            'Historial de pedidos',
        ],
    },
    silver: {
        name: 'silver',
        label: 'Silver',
        minSpent: 5000,
        discount: 5,
        freeShipping: true,
        freeShippingMin: 1000,
        benefits: [
            '5% de descuento en todas las compras',
            'Envío gratis en compras mayores a $1,000',
            'Cupones exclusivos Silver',
            'Soporte prioritario',
        ],
    },
    gold: {
        name: 'gold',
        label: 'Gold',
        minSpent: 20000,
        discount: 10,
        freeShipping: true,
        freeShippingMin: 0,
        benefits: [
            '10% de descuento en todas las compras',
            'Envío gratis siempre',
            'Acceso anticipado a nuevos productos',
            'Cupones exclusivos Gold',
            'Atención personalizada',
        ],
    },
    platinum: {
        name: 'platinum',
        label: 'Platinum',
        minSpent: 50000,
        discount: 15,
        freeShipping: true,
        freeShippingMin: 0,
        benefits: [
            '15% de descuento en todas las compras',
            'Envío express gratis',
            'Acceso VIP a lanzamientos',
            'Atención prioritaria 24/7',
            'Regalos exclusivos',
            'Invitación a eventos',
        ],
    },
};

/** Tier dinámico configurable desde el panel de admin */
export interface DynamicTier {
    id: string;
    name?: string;
    threshold?: number;
    multiplier: number;
    benefits?: string[];
}

const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'platinum'];

// ─── Get tier from total spent ───────────────────
export function getTierFromSpent(totalSpent: number): Tier {
    if (totalSpent >= TIERS.platinum.minSpent) return 'platinum';
    if (totalSpent >= TIERS.gold.minSpent) return 'gold';
    if (totalSpent >= TIERS.silver.minSpent) return 'silver';
    return 'bronze';
}

// ─── Tier info ───────────────────────────────────
export function getTierInfo(tier: Tier, dynamicTiers?: DynamicTier[] | null): TierInfo {
    if (dynamicTiers && Array.isArray(dynamicTiers)) {
        const found = dynamicTiers.find(t => t.id === tier);
        if (found) {
            return {
                name: found.id,
                label: found.name || found.id,
                minSpent: found.threshold ?? 0,
                discount: found.multiplier > 1 ? (found.multiplier - 1) * 10 : 0,
                freeShipping: found.id !== 'bronze',
                freeShippingMin: found.id === 'silver' ? 1000 : 0,
                benefits: found.benefits || []
            };
        }
    }
    return TIERS[tier] || TIERS.bronze;
}

// ─── Progreso al siguiente tier ──────────────────
/** Tipo normalizado internamente — abstrae diferencias entre TierInfo y DynamicTier */
interface NormalizedTierEntry { id: string; minSpent: number }

export function getProgressToNextTier(totalSpent: number, dynamicTiers?: DynamicTier[] | null) {
    const normalize = (t: DynamicTier | TierInfo): NormalizedTierEntry => {
        if ('multiplier' in t) {
            const dt = t as DynamicTier;
            return { id: dt.id, minSpent: dt.threshold ?? 0 };
        }
        const ti = t as TierInfo;
        return { id: ti.name, minSpent: ti.minSpent };
    };

    const rawTiers: Array<DynamicTier | TierInfo> =
        dynamicTiers && dynamicTiers.length > 0 ? dynamicTiers : Object.values(TIERS);

    const sorted: NormalizedTierEntry[] = rawTiers.map(normalize).sort((a, b) => a.minSpent - b.minSpent);

    let currentTierId: Tier = 'bronze';
    for (const t of sorted) {
        if (totalSpent >= t.minSpent) currentTierId = t.id.toLowerCase() as Tier;
    }

    const currentIndex = TIER_ORDER.indexOf(currentTierId);
    if (currentIndex === -1 || currentIndex >= TIER_ORDER.length - 1) {
        return { currentTier: currentTierId, nextTier: null, progress: 100, remaining: 0 };
    }

    const nextTierId = TIER_ORDER[currentIndex + 1];
    if (!nextTierId) return { currentTier: currentTierId, nextTier: null, progress: 100, remaining: 0 };

    const nextMin  = sorted.find(t => t.id.toLowerCase() === nextTierId)?.minSpent ?? TIERS[nextTierId]?.minSpent ?? 0;
    const prevMin  = sorted.find(t => t.id.toLowerCase() === currentTierId)?.minSpent ?? 0;
    const range    = nextMin - prevMin;
    const spent    = totalSpent - prevMin;
    const progress = range > 0 ? Math.min(100, Math.max(0, Math.round((spent / range) * 100))) : 100;

    return { currentTier: currentTierId, nextTier: nextTierId, progress, remaining: Math.max(0, nextMin - totalSpent) };
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
        p_type: 'redeemed',
        p_description: `Canje de ${maxPoints} puntos (-$${discount})`,
        p_order_id: orderId ?? null
    });

    if (error) throw error;
    return { discount };
}

// ─── Puntos equivalentes en pesos ────────────────
export function pointsToPesos(points: number, currencyPerPoint: number = 0.1): number {
    return points * currencyPerPoint;
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
        p_type: 'adjustment',
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
