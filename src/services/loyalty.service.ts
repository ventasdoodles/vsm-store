// Servicio de programa de lealtad - VSM Store
import { supabase } from '@/lib/supabase';

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
    // 1000 puntos = $100
    const discount = Math.floor(points / 1000) * 100;
    const actualPoints = Math.floor(points / 1000) * 1000;

    if (actualPoints < 1000) {
        throw new Error('Mínimo 1,000 puntos para canjear');
    }

    const { error } = await supabase.from('loyalty_points').insert({
        customer_id: customerId,
        points: -actualPoints,
        transaction_type: 'redeemed',
        description: `Canje de ${actualPoints} puntos (-$${discount})`,
        order_id: orderId ?? null,
    });

    if (error) throw error;
    return { discount };
}

// ─── Puntos equivalentes en pesos ────────────────
export function pointsToPesos(points: number): number {
    return Math.floor(points / 1000) * 100;
}
