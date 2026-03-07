// ─── Lógica de dominio: Lealtad ─────────────────
// Reglas de negocio puras (sin dependencias de infraestructura)

/**
 * Puntos otorgados por cada unidad de moneda.
 * Cada $100 MXN gastados = 10 puntos.
 */
export const POINTS_PER_UNIT = 10;
export const CURRENCY_PER_POINT_UNIT = 100;

/**
 * Recompensas por referido
 */
export const REWARD_POINTS_REFERRER = 50;
export const REWARD_POINTS_REFERRED = 25;

/**
 * Calcula los puntos de lealtad ganados por una compra.
 * @param total - Monto total de la compra en MXN
 * @param pointsPerCurrency - Puntos ganados por cada unidad de moneda (default: 0.1, es decir 10 puntos por cada $100)
 * @returns Puntos ganados (entero, nunca negativo)
 *
 * @example
 * calculateLoyaltyPoints(250)  // → 25
 * calculateLoyaltyPoints(99)   // → 9
 * calculateLoyaltyPoints(1000) // → 100
 */
export function calculateLoyaltyPoints(total: number, pointsPerCurrency: number = 0.1): number {
    if (total <= 0) return 0;
    return Math.floor(total * pointsPerCurrency);
}

/**
 * Umbrales de tier de lealtad.
 * El tier se determina por el total gastado acumulado.
 */
export const LOYALTY_TIERS = {
    bronze: { minSpent: 0, label: 'Bronce', color: '#CD7F32' },
    silver: { minSpent: 5_000, label: 'Plata', color: '#C0C0C0' },
    gold: { minSpent: 20_000, label: 'Oro', color: '#FFD700' },
    platinum: { minSpent: 50_000, label: 'Platino', color: '#E5E4E2' },
} as const;

export type LoyaltyTier = keyof typeof LOYALTY_TIERS;

/**
 * Determina el tier de lealtad basado en el total gastado.
 */
export function getLoyaltyTier(totalSpent: number): LoyaltyTier {
    if (totalSpent >= LOYALTY_TIERS.platinum.minSpent) return 'platinum';
    if (totalSpent >= LOYALTY_TIERS.gold.minSpent) return 'gold';
    if (totalSpent >= LOYALTY_TIERS.silver.minSpent) return 'silver';
    return 'bronze';
}

/**
 * Calcula cuánto falta para el siguiente tier.
 */
export function getNextTierProgress(totalSpent: number): {
    currentTier: LoyaltyTier;
    nextTier: LoyaltyTier | null;
    amountToNext: number;
    progress: number; // 0-1
} {
    const currentTier = getLoyaltyTier(totalSpent);

    const tierOrder: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1]! : null;

    if (!nextTier) {
        return { currentTier, nextTier: null, amountToNext: 0, progress: 1 };
    }

    const currentMin = LOYALTY_TIERS[currentTier].minSpent;
    const nextMin = LOYALTY_TIERS[nextTier].minSpent;
    const amountToNext = nextMin - totalSpent;
    const progress = (totalSpent - currentMin) / (nextMin - currentMin);

    return { currentTier, nextTier, amountToNext, progress: Math.min(progress, 1) };
}
