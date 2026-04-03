import { supabase } from '@/lib/supabase';

export type StorefrontCartDependencyRelationType =
  | 'uses_coil'
  | 'uses_pod'
  | 'uses_battery'
  | 'uses_liquid';

export type StorefrontCompatibilityScope = 'specific_model' | 'class_generalization';

export interface StorefrontCartDependencyOffer {
  primary_product_id: string;
  relation_type: StorefrontCartDependencyRelationType;
  scope: StorefrontCompatibilityScope;
  rationale: string;
  missing_product: {
    id: string;
    name: string;
    slug: string;
    section: 'vape' | '420';
  };
}

interface CartDependencyLookupResponse {
  cart_dependency_offer?: StorefrontCartDependencyOffer | null;
}

export async function resolveStorefrontCartDependencyOffer(
  cartProductIds: string[],
): Promise<StorefrontCartDependencyOffer | null> {
  const normalizedIds = [...new Set(cartProductIds.filter((value) => typeof value === 'string' && value.length > 0))];
  if (normalizedIds.length === 0) return null;

  const { data, error } = await supabase.functions.invoke<CartDependencyLookupResponse>('customer-intelligence', {
    body: {
      action: 'resolve_storefront_cart_dependency_offer',
      cart_product_ids: normalizedIds,
    },
  });

  if (error) {
    throw error;
  }

  return data?.cart_dependency_offer ?? null;
}
