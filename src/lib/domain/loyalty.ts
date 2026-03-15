/**
 * // ─── MÓDULO: lib/domain/loyalty ───
 * // Arquitectura: Lógica de dominio pura (sin side effects, sin react, sin supabase)
 * // Proposito principal: Reglas de negocio para V-Coins y Tiers de Lealtad. 
 *    Define umbrales, beneficios, multiplicadores y cálculos de progreso.
 * // Regla / Notas: Sin `any`. Sin imports de infraestructura (§1.1). Debe tener tests.
 */

/**
 * Puntos otorgados por cada unidad de moneda.
 * Cada $100 MXN gastados = 10 puntos (pointsPerCurrency = 0.1).
 */
export const POINTS_PER_UNIT = 10;
export const CURRENCY_PER_POINT_UNIT = 100;

/**
 * Recompensas por referido
 */
export const REWARD_POINTS_REFERRER = 50;
export const REWARD_POINTS_REFERRED = 25;

export type TierId = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierDefinition {
    id: TierId;
    label: string;
    minSpent: number;
    discount: number;
    freeShipping: boolean;
    freeShippingMin: number;
    benefits: string[];
    color: string;
}

/**
 * Configuración maestra de Tiers (Fuente de Verdad)
 */
export const LOYALTY_TIERS: Record<TierId, TierDefinition> = {
    bronze: {
        id: 'bronze',
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
        color: '#CD7F32'
    },
    silver: {
        id: 'silver',
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
        color: '#C0C0C0'
    },
    gold: {
        id: 'gold',
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
        color: '#FFD700'
    },
    platinum: {
        id: 'platinum',
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
        color: '#E5E4E2'
    },
};

export const TIER_ORDER: TierId[] = ['bronze', 'silver', 'gold', 'platinum'];

/**
 * Calcula los puntos de lealtad ganados por una compra.
 */
export function calculateLoyaltyPoints(total: number, pointsPerCurrency: number = 0.1): number {
    if (typeof total !== 'number' || isNaN(total) || total <= 0) return 0;
    return Math.floor(total * pointsPerCurrency);
}

/**
 * Convierte puntos de lealtad a valor monetario.
 */
export function pointsToPesos(points: number, currencyPerPoint: number = 0.1): number {
    if (typeof points !== 'number' || isNaN(points) || points <= 0) return 0;
    return Math.floor(points * currencyPerPoint);
}

/**
 * Determina el tier de lealtad basado en el total gastado.
 */
export function getLoyaltyTier(totalSpent: number): TierId {
    if (totalSpent >= LOYALTY_TIERS.platinum.minSpent) return 'platinum';
    if (totalSpent >= LOYALTY_TIERS.gold.minSpent) return 'gold';
    if (totalSpent >= LOYALTY_TIERS.silver.minSpent) return 'silver';
    return 'bronze';
}

/**
 * Estructura de progreso al siguiente nivel.
 */
export interface TierProgress {
    currentTier: TierId;
    nextTier: TierId | null;
    amountToNext: number;
    progress: number; // 0-100
}

/**
 * Calcula el progreso detallado al siguiente tier.
 */
export function getNextTierProgress(totalSpent: number): TierProgress {
    const currentTier = getLoyaltyTier(totalSpent);
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const nextTier = currentIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentIndex + 1]! : null;

    if (!nextTier) {
        return { currentTier, nextTier: null, amountToNext: 0, progress: 100 };
    }

    const currentMin = LOYALTY_TIERS[currentTier].minSpent;
    const nextMin = LOYALTY_TIERS[nextTier].minSpent;
    
    const range = nextMin - currentMin;
    const spentSinceTierStart = totalSpent - currentMin;
    const progress = range > 0 ? Math.min(100, Math.max(0, Math.round((spentSinceTierStart / range) * 100))) : 100;

    return { 
        currentTier, 
        nextTier, 
        amountToNext: Math.max(0, nextMin - totalSpent), 
        progress 
    };
}
