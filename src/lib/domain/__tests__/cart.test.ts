import { describe, expect, it } from 'vitest';
import { getStorefrontCheckoutTransitionView } from '../cart';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'prod-1',
        name: 'Producto test',
        slug: 'producto-test',
        description: '',
        short_description: '',
        price: 100,
        compare_at_price: null,
        stock: 5,
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

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
    return {
        product: makeProduct(),
        quantity: 1,
        variant_id: null,
        variant_name: null,
        ...overrides,
    };
}

describe('getStorefrontCheckoutTransitionView', () => {
    it('returns ready when the corrected cart is purchasable and has no recent issues', () => {
        const view = getStorefrontCheckoutTransitionView([makeItem()], { hasIssues: false, issues: [] });

        expect(view.status).toBe('ready');
        expect(view.canProceedToCheckout).toBe(true);
        expect(view.canSubmitCheckout).toBe(true);
    });

    it('returns review when automatic corrections were applied but purchasable items remain', () => {
        const view = getStorefrontCheckoutTransitionView([makeItem()], {
            hasIssues: true,
            issues: [
                { productId: 'prod-1', productName: 'Producto test', type: 'removed' },
                { productId: 'prod-1', productName: 'Producto test', type: 'stock_adjusted', oldValue: 2, newValue: 1 },
            ],
        });

        expect(view.status).toBe('review');
        expect(view.blockingIssueCount).toBe(1);
        expect(view.warningIssueCount).toBe(1);
        expect(view.canSubmitCheckout).toBe(true);
    });

    it('returns blocked when no purchasable items remain after correction', () => {
        const view = getStorefrontCheckoutTransitionView([], {
            hasIssues: true,
            issues: [{ productId: 'prod-1', productName: 'Producto test', type: 'variant_removed' }],
        });

        expect(view.status).toBe('blocked');
        expect(view.canProceedToCheckout).toBe(false);
        expect(view.canSubmitCheckout).toBe(false);
    });

    it('returns review with one dependency guidance when the cart is otherwise ready', () => {
        const view = getStorefrontCheckoutTransitionView(
            [makeItem()],
            { hasIssues: false, issues: [] },
            {
                primary_product_id: 'prod-1',
                relation_type: 'uses_pod',
                scope: 'specific_model',
                rationale: 'Pod compatible aparece como compatibilidad confirmada para ese modelo.',
                missing_product: {
                    id: 'pod-1',
                    name: 'Pod compatible',
                    slug: 'pod-compatible',
                    section: 'vape',
                },
            },
        );

        expect(view.status).toBe('review');
        expect(view.canProceedToCheckout).toBe(true);
        expect(view.canSubmitCheckout).toBe(true);
        expect(view.dependencyGuidance?.missingProduct.slug).toBe('pod-compatible');
    });

    it('suppresses dependency guidance when catalog corrections already exist', () => {
        const view = getStorefrontCheckoutTransitionView(
            [makeItem()],
            {
                hasIssues: true,
                issues: [{ productId: 'prod-1', productName: 'Producto test', type: 'stock_adjusted', oldValue: 2, newValue: 1 }],
            },
            {
                primary_product_id: 'prod-1',
                relation_type: 'uses_pod',
                scope: 'specific_model',
                rationale: 'Pod compatible aparece como compatibilidad confirmada para ese modelo.',
                missing_product: {
                    id: 'pod-1',
                    name: 'Pod compatible',
                    slug: 'pod-compatible',
                    section: 'vape',
                },
            },
        );

        expect(view.status).toBe('review');
        expect(view.dependencyGuidance).toBeNull();
        expect(view.warningIssueCount).toBe(1);
    });
});
