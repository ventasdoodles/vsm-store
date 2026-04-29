import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getDiscountedProducts } from '@/services/products.service';
import type { Product } from '@/types/product';

const fromMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: fromMock,
    },
}));

function product(overrides: Partial<Product>): Product {
    return {
        id: overrides.id ?? 'product-id',
        name: overrides.name ?? 'Product',
        slug: overrides.slug ?? 'product',
        description: null,
        short_description: null,
        price: overrides.price ?? 100,
        compare_at_price: overrides.compare_at_price ?? null,
        stock: overrides.stock ?? 10,
        sku: null,
        section: overrides.section ?? 'vape',
        category_id: 'category-id',
        tags: [],
        status: overrides.status ?? 'active',
        images: [],
        cover_image: null,
        is_featured: false,
        is_featured_until: null,
        is_new: false,
        is_new_until: null,
        is_bestseller: false,
        is_bestseller_until: null,
        is_active: overrides.is_active ?? true,
        created_at: '2026-04-29T00:00:00.000Z',
        updated_at: '2026-04-29T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
        ...overrides,
    };
}

describe('getDiscountedProducts', () => {
    beforeEach(() => {
        fromMock.mockReset();
    });

    it('fetches active stocked comparison-price candidates and filters true discounts locally', async () => {
        const query = {
            select: vi.fn(),
            eq: vi.fn(),
            gt: vi.fn(),
            not: vi.fn(),
            order: vi.fn(),
            limit: vi.fn(),
        };
        query.select.mockReturnValue(query);
        query.eq.mockReturnValue(query);
        query.gt.mockReturnValue(query);
        query.not.mockReturnValue(query);
        query.order.mockReturnValue(query);
        query.limit.mockResolvedValue({
            data: [
                product({ id: 'discounted', price: 90, compare_at_price: 120 }),
                product({ id: 'same-price', price: 100, compare_at_price: 100 }),
                product({ id: 'lower-compare', price: 120, compare_at_price: 90 }),
            ],
            error: null,
        });
        fromMock.mockReturnValue(query);

        const result = await getDiscountedProducts(2);

        expect(fromMock).toHaveBeenCalledWith('products');
        expect(query.eq).toHaveBeenCalledWith('is_active', true);
        expect(query.eq).toHaveBeenCalledWith('status', 'active');
        expect(query.gt).toHaveBeenCalledWith('stock', 0);
        expect(query.not).toHaveBeenCalledWith('compare_at_price', 'is', null);
        expect(query.limit).toHaveBeenCalledWith(100);
        expect(result.map((p) => p.id)).toEqual(['discounted']);
    });
});
