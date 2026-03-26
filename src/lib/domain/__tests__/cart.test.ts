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
});
