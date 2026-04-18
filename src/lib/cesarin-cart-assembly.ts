import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';
import {
  getStorefrontProductPurchaseability,
  type StorefrontPurchaseabilityReason,
} from '@/lib/domain/products';

export type CesarinCartAssemblyBlockedReason =
  | 'missing_product'
  | 'invalid_quantity'
  | StorefrontPurchaseabilityReason;

export interface CesarinCartAssemblyVariantToken {
  id: string;
  name: string;
}

export interface CesarinCartAssemblyEligibility {
  canAdd: boolean;
  requiresVariantSelection: boolean;
  blockedReason?: CesarinCartAssemblyBlockedReason;
  safeQuantity: number;
  requestedQuantity: number;
  maxQuantity: number;
  selectedVariant: ProductVariant | null;
}

export interface ResolveCesarinCartAssemblyEligibilityInput {
  product: Product | null | undefined;
  variantToken?: CesarinCartAssemblyVariantToken | null;
  quantityIntent?: number | null;
}

function normalizeQuantityIntent(quantityIntent: number | null | undefined): number {
  if (quantityIntent == null) return 1;
  if (!Number.isFinite(quantityIntent)) return 0;
  return Math.floor(quantityIntent);
}

export function resolveCesarinCartAssemblyEligibility(
  input: ResolveCesarinCartAssemblyEligibilityInput,
): CesarinCartAssemblyEligibility {
  const requestedQuantity = normalizeQuantityIntent(input.quantityIntent);

  if (!input.product) {
    return {
      canAdd: false,
      requiresVariantSelection: false,
      blockedReason: 'missing_product',
      safeQuantity: 0,
      requestedQuantity,
      maxQuantity: 0,
      selectedVariant: null,
    };
  }

  if (requestedQuantity <= 0) {
    return {
      canAdd: false,
      requiresVariantSelection: false,
      blockedReason: 'invalid_quantity',
      safeQuantity: 0,
      requestedQuantity,
      maxQuantity: 0,
      selectedVariant: null,
    };
  }

  const purchaseability = getStorefrontProductPurchaseability(input.product, {
    selectedVariantId: input.variantToken?.id ?? null,
  });

  if (!purchaseability.canAddToCart) {
    return {
      canAdd: false,
      requiresVariantSelection: purchaseability.requiresVariantSelection,
      blockedReason: purchaseability.reason,
      safeQuantity: 0,
      requestedQuantity,
      maxQuantity: purchaseability.maxQuantity,
      selectedVariant: purchaseability.selectedVariant,
    };
  }

  return {
    canAdd: true,
    requiresVariantSelection: false,
    safeQuantity: Math.min(requestedQuantity, purchaseability.maxQuantity),
    requestedQuantity,
    maxQuantity: purchaseability.maxQuantity,
    selectedVariant: purchaseability.selectedVariant,
  };
}
