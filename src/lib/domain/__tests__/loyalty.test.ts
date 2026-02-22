import { describe, it, expect } from 'vitest';
import {
    calculateLoyaltyPoints,
    getLoyaltyTier,
    getNextTierProgress,
    POINTS_PER_UNIT,
    CURRENCY_PER_POINT_UNIT,
} from '../loyalty';

describe('calculateLoyaltyPoints', () => {
    it('returns 0 for zero total', () => {
        expect(calculateLoyaltyPoints(0)).toBe(0);
    });

    it('returns 0 for negative total', () => {
        expect(calculateLoyaltyPoints(-500)).toBe(0);
    });

    it('returns 0 for amounts below threshold', () => {
        expect(calculateLoyaltyPoints(99)).toBe(0);
        expect(calculateLoyaltyPoints(50)).toBe(0);
        expect(calculateLoyaltyPoints(1)).toBe(0);
    });

    it('returns correct points at exact threshold', () => {
        expect(calculateLoyaltyPoints(100)).toBe(10);
    });

    it('floors partial units (no rounding up)', () => {
        expect(calculateLoyaltyPoints(199)).toBe(10);
        expect(calculateLoyaltyPoints(250)).toBe(20);
        expect(calculateLoyaltyPoints(999)).toBe(90);
    });

    it('scales correctly for large amounts', () => {
        expect(calculateLoyaltyPoints(1000)).toBe(100);
        expect(calculateLoyaltyPoints(5000)).toBe(500);
        expect(calculateLoyaltyPoints(10000)).toBe(1000);
    });

    it('uses correct constants', () => {
        expect(POINTS_PER_UNIT).toBe(10);
        expect(CURRENCY_PER_POINT_UNIT).toBe(100);
    });
});

describe('getLoyaltyTier', () => {
    it('returns bronze for 0 spent', () => {
        expect(getLoyaltyTier(0)).toBe('bronze');
    });

    it('returns bronze for amounts below silver threshold', () => {
        expect(getLoyaltyTier(4999)).toBe('bronze');
    });

    it('returns silver at threshold', () => {
        expect(getLoyaltyTier(5000)).toBe('silver');
    });

    it('returns gold at threshold', () => {
        expect(getLoyaltyTier(15000)).toBe('gold');
    });

    it('returns platinum at threshold', () => {
        expect(getLoyaltyTier(50000)).toBe('platinum');
    });

    it('returns platinum for very large amounts', () => {
        expect(getLoyaltyTier(1000000)).toBe('platinum');
    });
});

describe('getNextTierProgress', () => {
    it('shows progress toward silver for bronze tier', () => {
        const result = getNextTierProgress(2500);
        expect(result.currentTier).toBe('bronze');
        expect(result.nextTier).toBe('silver');
        expect(result.amountToNext).toBe(2500);
        expect(result.progress).toBe(0.5);
    });

    it('shows no next tier for platinum', () => {
        const result = getNextTierProgress(50000);
        expect(result.currentTier).toBe('platinum');
        expect(result.nextTier).toBeNull();
        expect(result.amountToNext).toBe(0);
        expect(result.progress).toBe(1);
    });

    it('clamps progress to max 1', () => {
        const result = getNextTierProgress(4999);
        expect(result.progress).toBeLessThanOrEqual(1);
    });
});
