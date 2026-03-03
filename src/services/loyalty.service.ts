// Servicio de programa de lealtad - VSM Store
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

const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'platinum'];

// ─── Get tier from total spent ───────────────────
export function getTierFromSpent(totalSpent: number): Tier {
    if (totalSpent >= TIERS.platinum.minSpent) return 'platinum';
    if (totalSpent >= TIERS.gold.minSpent) return 'gold';
    if (totalSpent >= TIERS.silver.minSpent) return 'silver';
    return 'bronze';
}

// ─── Tier info ───────────────────────────────────
export function getTierInfo(tier: Tier): TierInfo {
    return TIERS[tier];
}

// ─── Progreso al siguiente tier ──────────────────
export function getProgressToNextTier(totalSpent: number) {
    const currentTier = getTierFromSpent(totalSpent);
    const currentIndex = TIER_ORDER.indexOf(currentTier);

    if (currentIndex >= TIER_ORDER.length - 1) {
        return { currentTier, nextTier: null, progress: 100, remaining: 0 };
    }

    const nextTier = TIER_ORDER[currentIndex + 1];
    if (!nextTier) return { currentTier, nextTier: null, progress: 100, remaining: 0 };
    const nextMin = TIERS[nextTier].minSpent;
    const currentMin = TIERS[currentTier].minSpent;
    const range = nextMin - currentMin;
    const spent = totalSpent - currentMin;
    const progress = Math.min(100, Math.round((spent / range) * 100));

    return {
        currentTier,
        nextTier,
        progress,
        remaining: nextMin - totalSpent,
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
    const { error } = await supabase
        .from('loyalty_points')
        .insert({
            customer_id: customerId,
            points,
            transaction_type: 'earned',
            description,
            order_id: orderId,
        });

    if (error) {
        console.error('Error agregando puntos:', error);
        // No lanzar para no bloquear el flujo de compra
    }
}

// ─── Historial de puntos ─────────────────────────
export async function getPointsHistory(customerId: string): Promise<PointsTransaction[]> {
    const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
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

    const { error } = await supabase.from('loyalty_points').insert({
        customer_id: customerId,
        points: -maxPoints,
        transaction_type: 'redeemed',
        description: `Canje de ${maxPoints} puntos (-$${discount})`,
        order_id: orderId ?? null,
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
    const { error } = await supabase.from('loyalty_points').insert({
        customer_id: customerId,
        points,
        transaction_type: 'adjustment',
        description,
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
