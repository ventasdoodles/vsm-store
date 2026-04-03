import { pointsToPesos } from '@/lib/domain/loyalty';
import { getCustomerProfile } from '@/services/auth.service';
import { getPointsBalance, getProgressToNextTier, getTierInfo } from '@/services/loyalty.service';
import { getStoreSettings } from '@/services/settings.service';
import { getCustomerStats } from '@/services/stats.service';

type LoyaltyResolutionKind =
  | 'POINTS_BALANCE'
  | 'TIER_INFO'
  | 'AUTH_REQUIRED'
  | 'NO_LOYALTY_DATA';

type LoyaltyMatchStrategy =
  | 'AUTHENTICATED_POINTS_BALANCE'
  | 'AUTHENTICATED_TIER_INFO'
  | 'AUTH_REQUIRED'
  | 'NO_LOYALTY_DATA';

type LoyaltyFocus = 'points' | 'tier' | 'value' | 'overview';
type LoyaltyScope = 'AUTHENTICATED_LOYALTY_PROFILE' | 'AUTH_REQUIRED' | 'NONE';
type LoyaltyRetrievalSource = 'AUTHENTICATED_CUSTOMER_PROFILE' | 'NONE';

export interface StorefrontLoyaltyStatusResolution {
  kind: LoyaltyResolutionKind;
  message: string;
  retrievalSource: LoyaltyRetrievalSource;
  matchStrategy: LoyaltyMatchStrategy;
  signal: {
    kind: LoyaltyResolutionKind;
    focus: LoyaltyFocus;
    scope: LoyaltyScope;
    customer_id?: string | null;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
    tier_label?: string | null;
    points_balance?: number | null;
    monetary_value?: number | null;
    currency_per_point?: number | null;
    total_spent?: number | null;
    next_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
    next_tier_label?: string | null;
    amount_to_next_tier?: number | null;
    tier_progress?: number | null;
    loyalty_enabled?: boolean | null;
  };
}

const DEFAULT_LOYALTY_CONFIG = {
  points_per_currency: 0.1,
  currency_per_point: 0.1,
  min_points_to_redeem: 100,
  max_points_per_order: 1000,
  points_expiry_days: 365,
  enable_loyalty: true,
};

function normalizeText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectFocus(query: string): LoyaltyFocus {
  const normalized = normalizeText(query);

  if (/\b(cuanto valen mis puntos|cuanto vale mis puntos|valor de mis puntos|equivalen mis puntos|descuento por puntos|me alcanza con mis puntos|me alcanza para algo con mis puntos)\b/.test(normalized)) {
    return 'value';
  }

  if (/\b(que nivel soy|mi nivel|soy vip|estatus vip|status vip|que tier soy|mi tier|nivel vip)\b/.test(normalized)) {
    return 'tier';
  }

  if (/\b(cuantos puntos tengo|mis puntos|puntos|vcoins|v coins|v-coins)\b/.test(normalized)) {
    return 'points';
  }

  return 'overview';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildResolution(input: {
  kind: LoyaltyResolutionKind;
  focus: LoyaltyFocus;
  scope: LoyaltyScope;
  message: string;
  retrievalSource: LoyaltyRetrievalSource;
  matchStrategy: LoyaltyMatchStrategy;
  customerId?: string | null;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  tierLabel?: string | null;
  pointsBalance?: number | null;
  monetaryValue?: number | null;
  currencyPerPoint?: number | null;
  totalSpent?: number | null;
  nextTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  nextTierLabel?: string | null;
  amountToNextTier?: number | null;
  tierProgress?: number | null;
  loyaltyEnabled?: boolean | null;
}): StorefrontLoyaltyStatusResolution {
  return {
    kind: input.kind,
    message: input.message,
    retrievalSource: input.retrievalSource,
    matchStrategy: input.matchStrategy,
    signal: {
      kind: input.kind,
      focus: input.focus,
      scope: input.scope,
      customer_id: input.customerId ?? null,
      tier: input.tier ?? null,
      tier_label: input.tierLabel ?? null,
      points_balance: input.pointsBalance ?? null,
      monetary_value: input.monetaryValue ?? null,
      currency_per_point: input.currencyPerPoint ?? null,
      total_spent: input.totalSpent ?? null,
      next_tier: input.nextTier ?? null,
      next_tier_label: input.nextTierLabel ?? null,
      amount_to_next_tier: input.amountToNextTier ?? null,
      tier_progress: input.tierProgress ?? null,
      loyalty_enabled: input.loyaltyEnabled ?? null,
    },
  };
}

function buildGroundedMessage(input: {
  focus: LoyaltyFocus;
  tierLabel: string;
  pointsBalance: number;
  monetaryValue: number | null;
  totalSpent: number;
  nextTierLabel: string | null;
  amountToNextTier: number;
}): string {
  const tierLine = `Tu nivel actual es ${input.tierLabel}.`;
  const pointsLine = `Ahorita tienes ${input.pointsBalance} V-Coins.`;
  const valueLine = input.monetaryValue !== null
    ? `Con la configuracion vigente eso equivale a ${formatCurrency(input.monetaryValue)}.`
    : 'Ahorita no veo una equivalencia monetaria activa para convertir esos puntos sin inventarla.';
  const progressLine = input.nextTierLabel
    ? `Te faltan ${formatCurrency(input.amountToNextTier)} acumulados para llegar a ${input.nextTierLabel}.`
    : `Ya estas en el nivel mas alto registrado con ${formatCurrency(input.totalSpent)} acumulados para tier.`;

  if (input.focus === 'tier') {
    return `${tierLine} Llevas ${formatCurrency(input.totalSpent)} acumulados para tier. ${progressLine} ${pointsLine} ${valueLine}`;
  }

  if (input.focus === 'value') {
    return `${pointsLine} ${valueLine} ${tierLine} ${progressLine}`;
  }

  if (input.focus === 'points') {
    return `${pointsLine} ${tierLine} ${valueLine} ${progressLine}`;
  }

  return `${tierLine} ${pointsLine} ${valueLine} ${progressLine}`;
}

export async function resolveStorefrontAuthenticatedLoyaltyStatus(input: {
  customerId?: string | null;
  query: string;
}): Promise<StorefrontLoyaltyStatusResolution> {
  const focus = detectFocus(input.query);

  if (!input.customerId) {
    return buildResolution({
      kind: 'AUTH_REQUIRED',
      focus,
      scope: 'AUTH_REQUIRED',
      message: 'Para decirte tus puntos o nivel real necesito que entres a tu cuenta. Sin sesion autenticada no puedo leer tu lealtad real.',
      retrievalSource: 'NONE',
      matchStrategy: 'AUTH_REQUIRED',
      loyaltyEnabled: null,
    });
  }

  const [profile, pointsBalance, stats, settings] = await Promise.all([
    getCustomerProfile(input.customerId),
    getPointsBalance(input.customerId),
    getCustomerStats(input.customerId),
    getStoreSettings(),
  ]);

  if (!profile) {
    return buildResolution({
      kind: 'NO_LOYALTY_DATA',
      focus,
      scope: 'NONE',
      message: 'No veo un perfil de lealtad confirmado para esta cuenta en este momento, asi que no te voy a inventar puntos ni nivel.',
      retrievalSource: 'NONE',
      matchStrategy: 'NO_LOYALTY_DATA',
      loyaltyEnabled: null,
    });
  }

  const loyaltyConfig = settings?.loyalty_config || DEFAULT_LOYALTY_CONFIG;
  const loyaltyEnabled = loyaltyConfig.enable_loyalty !== false;

  if (!loyaltyEnabled) {
    return buildResolution({
      kind: 'NO_LOYALTY_DATA',
      focus,
      scope: 'AUTHENTICATED_LOYALTY_PROFILE',
      message: 'Ahorita no veo el programa de lealtad activo en la configuracion vigente de la tienda, asi que no te voy a prometer puntos ni equivalencias.',
      retrievalSource: 'AUTHENTICATED_CUSTOMER_PROFILE',
      matchStrategy: 'NO_LOYALTY_DATA',
      customerId: profile.id,
      loyaltyEnabled,
    });
  }

  const progress = getProgressToNextTier(stats.totalSpent, settings?.loyalty_tiers_config || null);
  const tier = progress.currentTier ?? profile.tier;
  const tierInfo = getTierInfo(tier, settings?.loyalty_tiers_config || null);
  const nextTierInfo = progress.nextTier
    ? getTierInfo(progress.nextTier, settings?.loyalty_tiers_config || null)
    : null;
  const safePointsBalance = Number.isFinite(pointsBalance) ? Math.max(0, Math.floor(pointsBalance)) : Math.max(0, profile.points ?? 0);
  const monetaryValue = typeof loyaltyConfig.currency_per_point === 'number'
    ? pointsToPesos(safePointsBalance, loyaltyConfig.currency_per_point)
    : null;
  const kind = focus === 'tier' ? 'TIER_INFO' : 'POINTS_BALANCE';

  return buildResolution({
    kind,
    focus,
    scope: 'AUTHENTICATED_LOYALTY_PROFILE',
    message: buildGroundedMessage({
      focus,
      tierLabel: tierInfo.label,
      pointsBalance: safePointsBalance,
      monetaryValue,
      totalSpent: stats.totalSpent,
      nextTierLabel: nextTierInfo?.label ?? null,
      amountToNextTier: progress.remaining ?? 0,
    }),
    retrievalSource: 'AUTHENTICATED_CUSTOMER_PROFILE',
    matchStrategy: kind === 'TIER_INFO' ? 'AUTHENTICATED_TIER_INFO' : 'AUTHENTICATED_POINTS_BALANCE',
    customerId: profile.id,
    tier,
    tierLabel: tierInfo.label,
    pointsBalance: safePointsBalance,
    monetaryValue,
    currencyPerPoint: loyaltyConfig.currency_per_point,
    totalSpent: stats.totalSpent,
    nextTier: progress.nextTier ?? null,
    nextTierLabel: nextTierInfo?.label ?? null,
    amountToNextTier: progress.remaining ?? 0,
    tierProgress: progress.progress ?? 0,
    loyaltyEnabled,
  });
}
