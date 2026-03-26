import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';
import { getStorefrontProductPurchaseability, getVariantDisplayName } from '../products';

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
    return {
        id: 'variant-1',
        product_id: 'product-1',
        sku: 'SKU-V1',
        price: null,
        stock: 4,
        images: [],
        is_active: true,
        options: [
            {
                variant_id: 'variant-1',
                attribute_value_id: 'attr-1',
                attribute_value: { id: 'attr-1', attribute_id: 'attribute-1', value: 'Rojo' },
            },
        ],
        ...overrides,
    };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'product-1',
        name: 'Producto test',
        slug: 'producto-test',
        description: '',
        short_description: '',
        price: 250,
        compare_at_price: null,
        stock: 8,
        sku: 'SKU-1',
        section: 'vape',
        category_id: 'cat-1',
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
        ...overrides,
    };
}

describe('storefront product purchaseability', () => {
    it('requires variant selection before quick-add when the product has variants', () => {
        const product = makeProduct({
            variants: [makeVariant()],
        });

        const result = getStorefrontProductPurchaseability(product);

        expect(result.canAddToCart).toBe(false);
        expect(result.requiresVariantSelection).toBe(true);
        expect(result.reason).toBe('requires_variant_selection');
    });

    it('uses selected variant stock as the real purchaseability limit', () => {
        const selectedVariant = makeVariant({ stock: 2 });
        const product = makeProduct({
            stock: 20,
            variants: [selectedVariant],
        });

        const result = getStorefrontProductPurchaseability(product, { selectedVariant });

        expect(result.canAddToCart).toBe(true);
        expect(result.maxQuantity).toBe(2);
        expect(result.selectedVariant?.id).toBe('variant-1');
    });

    it('blocks unavailable selected variants without guessing a fallback', () => {
        const selectedVariant = makeVariant({ stock: 0 });
        const product = makeProduct({
            variants: [
                selectedVariant,
                makeVariant({ id: 'variant-2', stock: 3 }),
            ],
        });

        const result = getStorefrontProductPurchaseability(product, { selectedVariant });

        expect(result.canAddToCart).toBe(false);
        expect(result.reason).toBe('variant_unavailable');
    });

    it('marks products with no active purchasable variants as unavailable', () => {
        const product = makeProduct({
            variants: [
                makeVariant({ stock: 0 }),
                makeVariant({ id: 'variant-2', is_active: false, stock: 5 }),
            ],
        });

        const result = getStorefrontProductPurchaseability(product);

        expect(result.canAddToCart).toBe(false);
        expect(result.reason).toBe('variant_unavailable');
    });

    it('builds a human-readable variant label from option values', () => {
        expect(getVariantDisplayName(makeVariant())).toBe('Rojo');
    });
});
