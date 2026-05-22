import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchProducts } from '@/services/search.service';

const fromMock = vi.hoisted(() => vi.fn());
const mapProductVariationsMock = vi.hoisted(() => vi.fn((products) => products));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: fromMock,
    },
}));

vi.mock('@/services/products.service', () => ({
    mapProductVariations: (products: unknown[]) => mapProductVariationsMock(products),
}));

function createProductsQuery(data: unknown[] = []) {
    const query = {
        select: vi.fn(),
        eq: vi.fn(),
        or: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        then: vi.fn((resolve: (value: unknown) => unknown) => Promise.resolve(resolve({ data, error: null }))),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.or.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.limit.mockReturnValue(query);

    return query;
}

describe('searchProducts', () => {
    beforeEach(() => {
        fromMock.mockReset();
        mapProductVariationsMock.mockClear();
    });

    it('builds the existing multi-field search for a normal product query', async () => {
        const query = createProductsQuery([{ id: 'product-1', name: 'Mango Pod' }]);
        fromMock.mockReturnValue(query);

        const result = await searchProducts('mango', { section: 'vape', limit: 8 });

        expect(fromMock).toHaveBeenCalledWith('products');
        expect(query.eq).toHaveBeenCalledWith('is_active', true);
        expect(query.eq).toHaveBeenCalledWith('status', 'active');
        expect(query.eq).toHaveBeenCalledWith('section', 'vape');
        expect(query.or).toHaveBeenCalledWith(
            'name.ilike.%mango%,short_description.ilike.%mango%,description.ilike.%mango%,sku.ilike.%mango%,tags.cs.{mango}',
        );
        expect(query.order).toHaveBeenCalledWith('is_featured', { ascending: false });
        expect(query.order).toHaveBeenCalledWith('name', { ascending: true });
        expect(query.limit).toHaveBeenCalledWith(8);
        expect(mapProductVariationsMock).toHaveBeenCalledWith([{ id: 'product-1', name: 'Mango Pod' }]);
        expect(result).toEqual([{ id: 'product-1', name: 'Mango Pod' }]);
    });

    it('escapes percent and underscore for ilike filters', async () => {
        const query = createProductsQuery();
        fromMock.mockReturnValue(query);

        await searchProducts('pod_50%');

        expect(query.or).toHaveBeenCalledWith(
            'name.ilike.%pod\\_50\\%%,short_description.ilike.%pod\\_50\\%%,description.ilike.%pod\\_50\\%%,sku.ilike.%pod\\_50\\%%',
        );
    });

    it('does not interpolate comma, brace, or punctuation input into the tags contains filter', async () => {
        const query = createProductsQuery();
        fromMock.mockReturnValue(query);

        await searchProducts('mango},{bad');

        const orFilter = query.or.mock.calls[0]?.[0] as string;
        expect(orFilter).toContain('name.ilike.%mango},{bad%');
        expect(orFilter).toContain('short_description.ilike.%mango},{bad%');
        expect(orFilter).not.toContain('tags.cs.{mango},{bad}');
        expect(orFilter).not.toContain('tags.cs.');
    });
});
