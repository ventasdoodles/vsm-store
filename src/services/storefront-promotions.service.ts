import { supabase } from '@/lib/supabase';
import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';

import { flashDealsService } from './flash-deals.service';

type StorefrontPromotionSignal = NonNullable<InternalCapsuleContract['promotion_signal']>;

type CouponCandidate = {
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number | null;
  max_uses: number | null;
  used_count: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

function isStructurallyActiveCoupon(coupon: CouponCandidate, now: Date): boolean {
  if (!coupon.is_active) return false;
  if (coupon.discount_value <= 0) return false;
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return false;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return false;
  if (coupon.max_uses !== null && (coupon.used_count ?? 0) >= coupon.max_uses) return false;
  return true;
}

async function getAssistantEligibleCoupons(customerId?: string | null): Promise<CouponCandidate[]> {
  const now = new Date();
  const { data, error } = await supabase
    .from('coupons')
    .select('code, description, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, valid_from, valid_until')
    .eq('is_active', true)
    .returns<CouponCandidate[]>();

  if (error || !data) {
    return [];
  }

  let activeCoupons = data.filter((coupon) => isStructurallyActiveCoupon(coupon, now));
  if (activeCoupons.length === 0 || !customerId) {
    return activeCoupons;
  }

  const { data: usedCoupons } = await supabase
    .from('customer_coupons')
    .select('coupon_code')
    .eq('customer_id', customerId)
    .in('coupon_code', activeCoupons.map((coupon) => coupon.code));

  const usedCodes = new Set((usedCoupons ?? []).map((entry) => String(entry.coupon_code ?? '').trim()).filter(Boolean));
  activeCoupons = activeCoupons.filter((coupon) => !usedCodes.has(coupon.code));
  return activeCoupons;
}

function toFlashDealSignal(input: {
  productId: string;
  productName: string;
  flashPrice: number;
  originalPrice: number;
  endsAt: string;
}): StorefrontPromotionSignal | null {
  const savingsAmount = Math.max(0, Number((input.originalPrice - input.flashPrice).toFixed(2)));
  if (savingsAmount <= 0) return null;

  return {
    kind: 'FLASH_DEAL',
    product_id: input.productId,
    product_name: input.productName,
    flash_price: input.flashPrice,
    original_price: input.originalPrice,
    savings_amount: savingsAmount,
    ends_at: input.endsAt,
    informational_only: true,
  };
}

function toCouponSignal(coupon: CouponCandidate): StorefrontPromotionSignal {
  return {
    kind: 'COUPON',
    code: coupon.code,
    description: coupon.description ?? null,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_purchase: Math.max(0, coupon.min_purchase ?? 0),
    valid_until: coupon.valid_until ?? null,
    informational_only: true,
    eligibility_note: 'La elegibilidad final depende de que la compra cumpla el minimo y de que el cupon siga disponible al cerrar.',
  };
}

export async function resolveStorefrontPromotionSignal(input: {
  exactMatches?: InternalResolvedProduct[];
  semanticMatches?: InternalResolvedProduct[];
  customerId?: string | null;
}): Promise<StorefrontPromotionSignal | null> {
  const candidateIds = [
    ...(input.exactMatches ?? []).map((product) => product.id),
    ...(input.semanticMatches ?? []).map((product) => product.id),
  ];
  const dedupedCandidateIds = [...new Set(candidateIds)];

  const [flashDeals, coupons] = await Promise.all([
    flashDealsService.getActiveDeals().catch(() => []),
    getAssistantEligibleCoupons(input.customerId).catch(() => []),
  ]);

  if (dedupedCandidateIds.length > 0) {
    const flashDealByProductId = new Map(
      flashDeals
        .filter((deal) =>
          deal.is_active
          && deal.product
          && deal.product.is_active
          && deal.product.status === 'active'
          && deal.product.stock > 0
          && deal.sold_count < deal.max_qty
        )
        .map((deal) => [deal.product_id, deal]),
    );

    for (const productId of dedupedCandidateIds) {
      const deal = flashDealByProductId.get(productId);
      if (!deal?.product) continue;
      const signal = toFlashDealSignal({
        productId: deal.product_id,
        productName: deal.product.name,
        flashPrice: Number(deal.flash_price),
        originalPrice: Number(deal.product.price),
        endsAt: deal.ends_at,
      });
      if (signal) return signal;
    }
  }

  const topCoupon = coupons[0];
  return topCoupon ? toCouponSignal(topCoupon) : null;
}
