


import { InternalResolvedProduct } from '@/types/ai-capsule';


































export type ProductSearchRow = {
  id: string;
  slug: string | null;
  section: string | null;
  name: string;
  price: number;
  stock: number;
  ai_is_featured: boolean | null;
  ai_sales_note: string | null;
  description: string | null;
  specs: unknown | null;
  variants?: Array<{
    id: string;
    product_id: string;
    sku: string | null;
    price: number | null;
    stock: number;
    is_active: boolean;
    options?: Array<{
      variant_id: string;
      attribute_value_id: string;
      attribute_value?: {
        value: string | null;
        attribute?: {
          name: string | null;
        } | null;
      } | null;
    }> | null;
  }> | null;
};

export type RecoveryQuerySignals = {
  normalizedQuery: string;
  tokens: string[];
  prefersSection: 'vape' | '420' | null;
  wantsLiquid: boolean;
  wantsDevice: boolean;
  wantsSmall: boolean;
  wantsBudget: boolean;
  wantsFruit: boolean;
  wantsMint: boolean;
  wantsNicotineFact: boolean;
  wantsFlavorFact: boolean;
  isMixedNeed: boolean;
  isExploratory: boolean;
  isNotFoundRecovery: boolean;
};

export type VariantTruth = NonNullable<InternalResolvedProduct['variant_truth']>;

export type ProductVariantOptionRow = {
  variant_id: string;
  attribute_value_id: string;
  attribute_value?: {
    value: string | null;
    attribute?: {
      name: string | null;
    } | null;
  } | null;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  sku: string | null;
  price: number | null;
  stock: number;
  is_active: boolean;
  options?: ProductVariantOptionRow[] | null;
};

export interface PilotFeedbackInput {
    prompt: string;
    response: string;
    capsule_slug: string | undefined;
    rating_accuracy: number;
    rating_tone: number;
    rating_utility: number;
}
