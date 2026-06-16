import type { LoyaltyConfig, LoyaltyTier, StoreSettings } from '@/services';

export const DEFAULT_LOYALTY_SETTINGS: LoyaltyConfig = {
    enable_loyalty: false,
    points_per_currency: 0.1,
    currency_per_point: 0.1,
    min_points_to_redeem: 100,
    max_points_per_order: 1000,
    points_expiry_days: 365,
};

export const INITIAL_LOYALTY_TIERS: LoyaltyTier[] = [
    { id: 'bronze', name: 'Bronze', threshold: 0, multiplier: 1, color: '#cd7f32', benefits: ['Gana 10 puntos por cada $100', 'Acceso a cupones básicos'] },
    { id: 'silver', name: 'Silver', threshold: 5000, multiplier: 1.2, color: '#c0c0c0', benefits: ['Multiplicador 1.2x', 'Descuento del 5%', 'Envío gratis > $1,000'] },
    { id: 'gold', name: 'Gold', threshold: 20000, multiplier: 1.5, color: '#ffd700', benefits: ['Multiplicador 1.5x', 'Descuento del 10%', 'Envío gratis siempre'] },
    { id: 'platinum', name: 'Platinum', threshold: 50000, multiplier: 2, color: '#e5e4e2', benefits: ['Multiplicador 2.0x', 'Descuento del 15%', 'Atención prioritaria 24/7'] },
];

export interface AdminLoyaltyState {
    config: LoyaltyConfig;
    tiersConfig: LoyaltyTier[];
}

function cloneInitialLoyaltyTiers(): LoyaltyTier[] {
    return INITIAL_LOYALTY_TIERS.map((tier) => ({ ...tier, benefits: [...tier.benefits] }));
}

export function buildAdminLoyaltyState(
    settings: Partial<StoreSettings> | null | undefined,
): AdminLoyaltyState {
    return {
        config: buildAdminLoyaltyConfig(settings?.loyalty_config),
        tiersConfig: buildAdminLoyaltyTiers(settings?.loyalty_tiers_config),
    };
}

export function buildAdminLoyaltyConfig(
    loyaltyConfig: Partial<LoyaltyConfig> | null | undefined,
): LoyaltyConfig {
    if (!loyaltyConfig) {
        return {
            ...DEFAULT_LOYALTY_SETTINGS,
        };
    }

    return {
        ...DEFAULT_LOYALTY_SETTINGS,
        ...loyaltyConfig,
        enable_loyalty: loyaltyConfig.enable_loyalty ?? DEFAULT_LOYALTY_SETTINGS.enable_loyalty,
        points_per_currency: loyaltyConfig.points_per_currency ?? DEFAULT_LOYALTY_SETTINGS.points_per_currency,
        currency_per_point: loyaltyConfig.currency_per_point ?? DEFAULT_LOYALTY_SETTINGS.currency_per_point,
        min_points_to_redeem: loyaltyConfig.min_points_to_redeem ?? DEFAULT_LOYALTY_SETTINGS.min_points_to_redeem,
        max_points_per_order: loyaltyConfig.max_points_per_order ?? DEFAULT_LOYALTY_SETTINGS.max_points_per_order,
        points_expiry_days: loyaltyConfig.points_expiry_days ?? DEFAULT_LOYALTY_SETTINGS.points_expiry_days,
    };
}

export function buildAdminLoyaltyTiers(
    loyaltyTiers: LoyaltyTier[] | null | undefined,
): LoyaltyTier[] {
    if (loyaltyTiers && loyaltyTiers.length > 0) {
        return loyaltyTiers.map((tier) => ({ ...tier, benefits: [...tier.benefits] }));
    }

    return cloneInitialLoyaltyTiers();
}

export function applyLoyaltyRuleChange(
    config: LoyaltyConfig,
    key: keyof LoyaltyConfig,
    value: number,
): LoyaltyConfig {
    return { ...config, [key]: value };
}

export function toggleLoyaltyEnabled(config: LoyaltyConfig, nextValue: boolean): LoyaltyConfig {
    if (config.enable_loyalty === nextValue) return config;
    return { ...config, enable_loyalty: nextValue };
}

export function buildLoyaltyConfigUpdatePayload(config: LoyaltyConfig, settingsId: number) {
    return {
        id: settingsId,
        loyalty_config: config,
    };
}

export function buildLoyaltyTiersUpdatePayload(loyaltyTiers: LoyaltyTier[], settingsId: number) {
    return {
        id: settingsId,
        loyalty_tiers_config: loyaltyTiers,
    };
}
