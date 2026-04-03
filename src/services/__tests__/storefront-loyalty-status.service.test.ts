import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCustomerProfileMock = vi.hoisted(() => vi.fn<any>());
const getPointsBalanceMock = vi.hoisted(() => vi.fn<any>());
const getCustomerStatsMock = vi.hoisted(() => vi.fn<any>());
const getStoreSettingsMock = vi.hoisted(() => vi.fn<any>());
const getProgressToNextTierMock = vi.hoisted(() => vi.fn<any>());
const getTierInfoMock = vi.hoisted(() => vi.fn<any>());

vi.mock('@/services/auth.service', () => ({
  getCustomerProfile: (...args: unknown[]) => (getCustomerProfileMock as any)(...args),
}));

vi.mock('@/services/loyalty.service', () => ({
  getPointsBalance: (...args: unknown[]) => (getPointsBalanceMock as any)(...args),
  getProgressToNextTier: (...args: unknown[]) => (getProgressToNextTierMock as any)(...args),
  getTierInfo: (...args: unknown[]) => (getTierInfoMock as any)(...args),
}));

vi.mock('@/services/stats.service', () => ({
  getCustomerStats: (...args: unknown[]) => (getCustomerStatsMock as any)(...args),
}));

vi.mock('@/services/settings.service', () => ({
  getStoreSettings: (...args: unknown[]) => (getStoreSettingsMock as any)(...args),
}));

import { resolveStorefrontAuthenticatedLoyaltyStatus } from '../storefront-loyalty-status.service';

describe('resolveStorefrontAuthenticatedLoyaltyStatus', () => {
  beforeEach(() => {
    getCustomerProfileMock.mockReset();
    getPointsBalanceMock.mockReset();
    getCustomerStatsMock.mockReset();
    getStoreSettingsMock.mockReset();
    getProgressToNextTierMock.mockReset();
    getTierInfoMock.mockReset();
  });

  it('requires authentication before exposing loyalty truth', async () => {
    const resolution = await resolveStorefrontAuthenticatedLoyaltyStatus({
      customerId: null,
      query: 'mis puntos',
    });

    expect(resolution.kind).toBe('AUTH_REQUIRED');
    expect(resolution.retrievalSource).toBe('NONE');
    expect(resolution.message).toContain('entres a tu cuenta');
  });

  it('returns grounded points balance and monetary value for an authenticated customer', async () => {
    getCustomerProfileMock.mockResolvedValue({
      id: 'customer-1',
      tier: 'silver',
      points: 320,
    });
    getPointsBalanceMock.mockResolvedValue(320);
    getCustomerStatsMock.mockResolvedValue({ totalSpent: 5500 });
    getStoreSettingsMock.mockResolvedValue({
      loyalty_config: {
        points_per_currency: 0.1,
        currency_per_point: 0.1,
        min_points_to_redeem: 100,
        max_points_per_order: 1000,
        points_expiry_days: 365,
        enable_loyalty: true,
      },
      loyalty_tiers_config: null,
    });
    getProgressToNextTierMock.mockReturnValue({
      currentTier: 'silver',
      nextTier: 'gold',
      progress: 10,
      remaining: 14500,
    });
    getTierInfoMock.mockImplementation((...args: unknown[]) => {
      const tier = String(args[0] ?? '');
      return {
      id: tier,
      label: tier === 'silver' ? 'Silver' : 'Gold',
      };
    });

    const resolution = await resolveStorefrontAuthenticatedLoyaltyStatus({
      customerId: 'customer-1',
      query: 'cuanto valen mis puntos?',
    });

    expect(resolution.kind).toBe('POINTS_BALANCE');
    expect(resolution.retrievalSource).toBe('AUTHENTICATED_CUSTOMER_PROFILE');
    expect(resolution.signal.points_balance).toBe(320);
    expect(resolution.signal.monetary_value).toBe(32);
    expect(resolution.signal.tier).toBe('silver');
    expect(resolution.signal.next_tier).toBe('gold');
    expect(resolution.message).toContain('320 V-Coins');
    expect(resolution.message).toContain('Silver');
  });

  it('returns grounded tier status even when the points balance is zero', async () => {
    getCustomerProfileMock.mockResolvedValue({
      id: 'customer-1',
      tier: 'bronze',
      points: 0,
    });
    getPointsBalanceMock.mockResolvedValue(0);
    getCustomerStatsMock.mockResolvedValue({ totalSpent: 1200 });
    getStoreSettingsMock.mockResolvedValue({
      loyalty_config: {
        points_per_currency: 0.1,
        currency_per_point: 0.1,
        min_points_to_redeem: 100,
        max_points_per_order: 1000,
        points_expiry_days: 365,
        enable_loyalty: true,
      },
      loyalty_tiers_config: null,
    });
    getProgressToNextTierMock.mockReturnValue({
      currentTier: 'bronze',
      nextTier: 'silver',
      progress: 24,
      remaining: 3800,
    });
    getTierInfoMock.mockImplementation((...args: unknown[]) => {
      const tier = String(args[0] ?? '');
      return {
      id: tier,
      label: tier === 'bronze' ? 'Bronze' : 'Silver',
      };
    });

    const resolution = await resolveStorefrontAuthenticatedLoyaltyStatus({
      customerId: 'customer-1',
      query: 'que nivel soy?',
    });

    expect(resolution.kind).toBe('TIER_INFO');
    expect(resolution.signal.points_balance).toBe(0);
    expect(resolution.signal.tier).toBe('bronze');
    expect(resolution.message).toContain('Tu nivel actual es Bronze');
    expect(resolution.message).toContain('0 V-Coins');
  });

  it('degrades honestly when there is no authenticated loyalty profile truth to read', async () => {
    getCustomerProfileMock.mockResolvedValue(null);
    getPointsBalanceMock.mockResolvedValue(0);
    getCustomerStatsMock.mockResolvedValue({ totalSpent: 0 });
    getStoreSettingsMock.mockResolvedValue(null);

    const resolution = await resolveStorefrontAuthenticatedLoyaltyStatus({
      customerId: 'customer-1',
      query: 'mis puntos',
    });

    expect(resolution.kind).toBe('NO_LOYALTY_DATA');
    expect(resolution.retrievalSource).toBe('NONE');
    expect(resolution.message).toContain('No veo un perfil de lealtad confirmado');
  });
});
