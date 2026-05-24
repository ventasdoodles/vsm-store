import type { Product } from '@/types/product';

export function makeProductGridStateFixture(overrides: Partial<Product> = {}): Product {
    return {
        id: 'grid-fixture-product-1',
        name: 'Producto grid fixture',
        slug: 'producto-grid-fixture',
        description: 'Producto local determinista para ProductGrid.',
        short_description: 'Producto representativo para la rejilla local.',
        price: 690,
        compare_at_price: 820,
        stock: 9,
        sku: 'GRID-FIXTURE-1',
        section: 'vape',
        category_id: 'grid-fixture-category',
        tags: ['fixture'],
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
        created_at: '2026-05-23T00:00:00.000Z',
        updated_at: '2026-05-23T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
        ...overrides,
    };
}

export function makeProductGridStateFixtures(): Product[] {
    return [
        makeProductGridStateFixture(),
        makeProductGridStateFixture({
            id: 'grid-fixture-product-2',
            name: 'Producto grid herbal',
            slug: 'producto-grid-herbal',
            price: 540,
            compare_at_price: null,
            stock: 4,
            sku: 'GRID-FIXTURE-2',
            section: '420',
            tags: ['fixture', 'herbal'],
        }),
        makeProductGridStateFixture({
            id: 'grid-fixture-product-3',
            name: 'Producto grid premium',
            slug: 'producto-grid-premium',
            price: 920,
            compare_at_price: 1100,
            stock: 2,
            sku: 'GRID-FIXTURE-3',
            is_featured: true,
            badges: ['premium'],
        }),
    ];
}
