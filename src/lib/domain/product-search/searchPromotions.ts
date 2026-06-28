
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import { CapsulePromotionSignal } from "./searchEvaluator";
import { normalizeSearchText, hasAnyHint, PROMOTION_HINTS, BUDGET_HINTS, WORTH_HINTS, HESITATION_HINTS, READY_CLOSE_HINTS } from "./searchIntents";

export function isPromotionQuestion(query: string): boolean {
    const normalized = normalizeSearchText(query);
    return hasAnyHint(normalized, PROMOTION_HINTS);
}

export function isIncentiveYieldContext(query: string): boolean {
    const normalized = normalizeSearchText(query);
    return isPromotionQuestion(query)
    || hasAnyHint(normalized, BUDGET_HINTS)
    || hasAnyHint(normalized, WORTH_HINTS)
    || hasAnyHint(normalized, HESITATION_HINTS)
    || hasAnyHint(normalized, READY_CLOSE_HINTS);
}

export function formatCurrency(value: number): string {
    const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
    return `$${rounded}`;
}

export function buildPromotionYieldLine(input: {
      query: string;
      signal?: CapsulePromotionSignal | null;
      primaryProduct?: InternalResolvedProduct | null;
      variantReady?: boolean;
      allowCouponSignal?: boolean;
    }): string | null {
    if (!input.signal) return null;
    if (!isIncentiveYieldContext(input.query)) return null;
    if (input.variantReady === false && input.signal.kind === 'FLASH_DEAL') return null;
    if (input.signal.kind === 'FLASH_DEAL') {
    if (!input.primaryProduct || input.signal.product_id !== input.primaryProduct.id) return null;
    return `Si te ayuda en precio, ${input.signal.product_name} trae flash deal real ahorita: baja de ${formatCurrency(input.signal.original_price)} a ${formatCurrency(input.signal.flash_price)} mientras siga activo.`;
    }

    if (!input.allowCouponSignal) return null;
    const discountLabel = input.signal.discount_type === 'percentage'
            ? `${input.signal.discount_value}%`
            : formatCurrency(input.signal.discount_value);
    const minPurchaseLabel = input.signal.min_purchase > 0
            ? ` desde ${formatCurrency(input.signal.min_purchase)} de compra`
            : '';
    return `Si te ayuda en precio, tambien veo el cupon publico ${input.signal.code}: ${discountLabel} de descuento${minPurchaseLabel}. Yo solo te marco la promo activa; la elegibilidad final depende del checkout.`;
}

export function buildPromotionOnlyResponse(signal?: CapsulePromotionSignal | null): string | null {
    if (!signal) {
    return 'Ahorita no veo una promo activa validada que te pueda prometer desde aqui. Si traes un producto concreto, te digo directo si tiene ahorro real o no.';
    }

    if (signal.kind === 'FLASH_DEAL') {
    return `Si buscas precio real, ahora mismo ${signal.product_name} trae flash deal activo: baja de ${formatCurrency(signal.original_price)} a ${formatCurrency(signal.flash_price)} mientras siga vigente.`;
    }

    const discountLabel = signal.discount_type === 'percentage'
            ? `${signal.discount_value}%`
            : formatCurrency(signal.discount_value);
    const minPurchaseLabel = signal.min_purchase > 0
            ? ` desde ${formatCurrency(signal.min_purchase)} de compra`
            : '';
    return `Si buscas promo real, ahora mismo veo el cupon publico ${signal.code}: ${discountLabel} de descuento${minPurchaseLabel}. Yo no te lo aplico desde aqui; solo te marco la promo activa y su elegibilidad final depende del checkout.`;
}
