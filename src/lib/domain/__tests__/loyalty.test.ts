import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    calculateLoyaltyPoints,
    calculateLoyaltyPointsWithMultiplier,
    isPointsExpired,
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
        expect(calculateLoyaltyPoints(9)).toBe(0);
        expect(calculateLoyaltyPoints(5)).toBe(0);
        expect(calculateLoyaltyPoints(1)).toBe(0);
    });

    it('returns correct points at exact threshold', () => {
        expect(calculateLoyaltyPoints(10)).toBe(1);
    });

    it('floors partial units (no rounding up)', () => {
        expect(calculateLoyaltyPoints(19)).toBe(1);
        expect(calculateLoyaltyPoints(25)).toBe(2);
        expect(calculateLoyaltyPoints(99)).toBe(9);
    });

    it('scales correctly for large amounts', () => {
        expect(calculateLoyaltyPoints(100)).toBe(10);
        expect(calculateLoyaltyPoints(500)).toBe(50);
        expect(calculateLoyaltyPoints(1000)).toBe(100);
    });

    it('uses correct constants', () => {
        expect(POINTS_PER_UNIT).toBe(10);
        expect(CURRENCY_PER_POINT_UNIT).toBe(100);
    });
});

describe('calculateLoyaltyPointsWithMultiplier', () => {
    it('returns base points when multiplier is 1', () => {
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, 1)).toBe(100);
    });

    it('applies tier multiplier correctly', () => {
        // Silver: 1.2x → 1000 * 0.1 = 100 base → 100 * 1.2 = 120
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, 1.2)).toBe(120);
        // Gold: 1.5x → 100 * 1.5 = 150
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, 1.5)).toBe(150);
        // Platinum: 2.0x → 100 * 2.0 = 200
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, 2.0)).toBe(200);
    });

    it('floors multiplied result', () => {
        // 550 * 0.1 = 55 base * 1.2 = 66.0 → 66
        expect(calculateLoyaltyPointsWithMultiplier(550, 0.1, 1.2)).toBe(66);
        // 333 * 0.1 = 33 base * 1.5 = 49.5 → 49
        expect(calculateLoyaltyPointsWithMultiplier(333, 0.1, 1.5)).toBe(49);
    });

    it('returns base points for invalid multiplier', () => {
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, 0)).toBe(100);
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, -1)).toBe(100);
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1, Infinity)).toBe(100);
    });

    it('returns 0 for invalid total', () => {
        expect(calculateLoyaltyPointsWithMultiplier(0, 0.1, 1.5)).toBe(0);
        expect(calculateLoyaltyPointsWithMultiplier(-100, 0.1, 2)).toBe(0);
    });

    it('defaults to multiplier 1 when omitted', () => {
        expect(calculateLoyaltyPointsWithMultiplier(1000, 0.1)).toBe(100);
    });
});

describe('isPointsExpired', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns false for recently created points', () => {
        const created = new Date();
        expect(isPointsExpired(created, 365)).toBe(false);
    });

    it('returns true for old points past expiry', () => {
        vi.useFakeTimers();
        const now = new Date('2026-06-01T00:00:00Z');
        vi.setSystemTime(now);

        // Created 400 days ago with 365-day expiry
        const created = new Date('2025-04-27T00:00:00Z');
        expect(isPointsExpired(created, 365)).toBe(true);
        vi.useRealTimers();
    });

    it('returns false for points within expiry window', () => {
        vi.useFakeTimers();
        const now = new Date('2026-06-01T00:00:00Z');
        vi.setSystemTime(now);

        // Created 300 days ago with 365-day expiry
        const created = new Date('2025-08-05T00:00:00Z');
        expect(isPointsExpired(created, 365)).toBe(false);
        vi.useRealTimers();
    });

    it('returns false when expiryDays is 0 (no expiration)', () => {
        const oldDate = new Date('2020-01-01');
        expect(isPointsExpired(oldDate, 0)).toBe(false);
    });

    it('returns false when expiryDays is negative', () => {
        const oldDate = new Date('2020-01-01');
        expect(isPointsExpired(oldDate, -30)).toBe(false);
    });

    it('handles string date input', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-01T00:00:00Z'));
        expect(isPointsExpired('2025-01-01T00:00:00Z', 365)).toBe(true);
        expect(isPointsExpired('2026-05-01T00:00:00Z', 365)).toBe(false);
        vi.useRealTimers();
    });

    it('returns false for invalid date string', () => {
        expect(isPointsExpired('not-a-date', 365)).toBe(false);
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
        expect(getLoyaltyTier(20000)).toBe('gold');
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
        expect(result.progress).toBe(50);
    });

    it('shows no next tier for platinum', () => {
        const result = getNextTierProgress(50000);
        expect(result.currentTier).toBe('platinum');
        expect(result.nextTier).toBeNull();
        expect(result.amountToNext).toBe(0);
        expect(result.progress).toBe(100);
    });

    it('clamps progress to max 100', () => {
        const result = getNextTierProgress(4999);
        expect(result.progress).toBeLessThanOrEqual(100);
    });
});
