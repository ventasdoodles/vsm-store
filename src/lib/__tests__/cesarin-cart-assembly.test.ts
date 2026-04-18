import { describe, expect, it } from 'vitest';
import { resolveCesarinCartAssemblyEligibility } from '../cesarin-cart-assembly';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'variant-1',
    product_id: 'product-1',
    sku: null,
    price: null,
    stock: 3,
    images: [],
    is_active: true,
    options: [],
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Mint Fresh',
    slug: 'mint-fresh',
    description: null,
    short_description: null,
    price: 299,
    compare_at_price: null,
    stock: 4,
    sku: null,
    section: 'vape',
    category_id: 'category-1',
    tags: [],
    status: 'active',
    images: [],
    cover_image: null,
    is_featured: false,
    is_featured_until: null,
    is_new: false,
    is_new_until: null,
    is_bestseller: false,
    is_bestseller_until: null,
    is_active: true,
    created_at: '2026-04-17T00:00:00.000Z',
    updated_at: '2026-04-17T00:00:00.000Z',
    specs: {},
    badges: [],
    ai_is_featured: false,
    ai_sales_note: null,
    ai_exclude: false,
    ...overrides,
  };
}

describe('resolveCesarinCartAssemblyEligibility', () => {
  it('allows a simple grounded product when purchaseability is clean', () => {
    const result = resolveCesarinCartAssemblyEligibility({
      product: makeProduct({ stock: 4 }),
      quantityIntent: 1,
    });

    expect(result).toMatchObject({
      canAdd: true,
      requiresVariantSelection: false,
      safeQuantity: 1,
      maxQuantity: 4,
    });
  });

  it('blocks a variant product without a grounded variant token', () => {
    const result = resolveCesarinCartAssemblyEligibility({
      product: makeProduct({ variants: [makeVariant()] }),
      quantityIntent: 1,
    });

    expect(result).toMatchObject({
      canAdd: false,
      requiresVariantSelection: true,
      blockedReason: 'requires_variant_selection',
      safeQuantity: 0,
    });
  });

  it('allows a variant product when the variant is explicitly grounded', () => {
    const result = resolveCesarinCartAssemblyEligibility({
      product: makeProduct({ variants: [makeVariant({ id: 'variant-available', stock: 2 })] }),
      variantToken: { id: 'variant-available', name: 'Menta' },
      quantityIntent: 1,
    });

    expect(result).toMatchObject({
      canAdd: true,
      requiresVariantSelection: false,
      safeQuantity: 1,
      maxQuantity: 2,
    });
    expect(result.selectedVariant?.id).toBe('variant-available');
  });

  it('blocks out-of-stock product truth instead of exposing a cart action', () => {
    const result = resolveCesarinCartAssemblyEligibility({
      product: makeProduct({ stock: 0 }),
      quantityIntent: 1,
    });

    expect(result).toMatchObject({
      canAdd: false,
      requiresVariantSelection: false,
      blockedReason: 'out_of_stock',
      safeQuantity: 0,
    });
  });

  it('clamps requested quantity to current purchaseability stock', () => {
    const result = resolveCesarinCartAssemblyEligibility({
      product: makeProduct({ stock: 2 }),
      quantityIntent: 5,
    });

    expect(result).toMatchObject({
      canAdd: true,
      requestedQuantity: 5,
      safeQuantity: 2,
      maxQuantity: 2,
    });
  });
});
