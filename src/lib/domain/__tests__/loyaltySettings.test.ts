import { describe, expect, it } from 'vitest';
import type { StoreSettings } from '@/services';
import {
    applyLoyaltyRuleChange,
    buildAdminLoyaltyConfig,
    buildAdminLoyaltyState,
    buildLoyaltyConfigUpdatePayload,
    buildLoyaltyTiersUpdatePayload,
    DEFAULT_LOYALTY_SETTINGS,
    INITIAL_LOYALTY_TIERS,
    toggleLoyaltyEnabled,
} from '../loyaltySettings';

describe('loyaltySettings', () => {
    it('builds the default loyalty state when settings are empty', () => {
        const state = buildAdminLoyaltyState(null);

        expect(state.config).toEqual(DEFAULT_LOYALTY_SETTINGS);
        expect(state.config).not.toBe(DEFAULT_LOYALTY_SETTINGS);
        expect(state.tiersConfig).toEqual(INITIAL_LOYALTY_TIERS);
        expect(state.tiersConfig).not.toBe(INITIAL_LOYALTY_TIERS);
        expect(state.tiersConfig[0]).not.toBe(INITIAL_LOYALTY_TIERS[0]);
    });

    it('normalizes partial loyalty settings without losing explicit values', () => {
        const settings: Partial<StoreSettings> = {
            loyalty_config: {
                enable_loyalty: true,
                points_per_currency: 3,
                currency_per_point: 0.5,
            } as StoreSettings['loyalty_config'],
        };

        const config = buildAdminLoyaltyConfig(settings.loyalty_config);

        expect(config).toEqual({
            ...DEFAULT_LOYALTY_SETTINGS,
            enable_loyalty: true,
            points_per_currency: 3,
            currency_per_point: 0.5,
        });
    });

    it('applies loyalty changes immutably and preserves toggle semantics', () => {
        const base = buildAdminLoyaltyConfig(null);
        const ruleUpdated = applyLoyaltyRuleChange(base, 'points_per_currency', 4);
        const toggled = toggleLoyaltyEnabled(ruleUpdated, true);
        const noOpToggle = toggleLoyaltyEnabled(toggled, true);

        expect(ruleUpdated).not.toBe(base);
        expect(ruleUpdated.points_per_currency).toBe(4);
        expect(base.points_per_currency).toBe(0.1);
        expect(toggled.enable_loyalty).toBe(true);
        expect(noOpToggle).toBe(toggled);
    });

    it('builds update payloads with the page-owned id', () => {
        const configPayload = buildLoyaltyConfigUpdatePayload(buildAdminLoyaltyConfig(null), 1);
        const tiersPayload = buildLoyaltyTiersUpdatePayload(INITIAL_LOYALTY_TIERS, 1);

        expect(configPayload).toEqual({
            id: 1,
            loyalty_config: DEFAULT_LOYALTY_SETTINGS,
        });
        expect(tiersPayload).toMatchObject({
            id: 1,
            loyalty_tiers_config: INITIAL_LOYALTY_TIERS,
        });
    });

    it('keeps the static tiers reference data local and behaviorally identical', () => {
        const state = buildAdminLoyaltyState({
            loyalty_tiers_config: INITIAL_LOYALTY_TIERS,
        } as Partial<StoreSettings>);

        expect(state.tiersConfig).toEqual(INITIAL_LOYALTY_TIERS);
        expect(state.tiersConfig).not.toBe(INITIAL_LOYALTY_TIERS);
        expect(state.tiersConfig[1]).toMatchObject({
            id: 'silver',
            name: 'Silver',
            threshold: 5000,
        });
    });
});
