import type { Product } from '@/types/product';

export function makeProductSurfaceFixture(overrides: Partial<Product> = {}): Product {
    return {
        id: 'fixture-product-1',
        name: 'Producto fixture vape',
        slug: 'producto-fixture-vape',
        description: 'Producto local determinista para render tests.',
        short_description: 'Copy local representativo para quick view.',
        price: 850,
        compare_at_price: 1000,
        stock: 18,
        sku: 'FIXTURE-VAPE-1',
        section: 'vape',
        category_id: 'fixture-category',
        tags: ['fixture'],
        status: 'active',
        images: [],
        cover_image: null,
        is_featured: true,
        is_featured_until: null,
        is_new: true,
        is_new_until: null,
        is_bestseller: false,
        is_bestseller_until: null,
        is_active: true,
        created_at: '2026-05-23T00:00:00.000Z',
        updated_at: '2026-05-23T00:00:00.000Z',
        specs: {
            brand: 'VSM Fixture',
            capacity: '2 ml',
        },
        badges: ['fixture'],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [
            {
                id: 'fixture-variant-mint',
                product_id: 'fixture-product-1',
                sku: 'FIXTURE-VAPE-MINT',
                price: 850,
                stock: 8,
                images: [],
                is_active: true,
                options: [
                    {
                        variant_id: 'fixture-variant-mint',
                        attribute_value_id: 'fixture-flavor-mint',
                        attribute_name: 'Sabor',
                        attribute_value: {
                            id: 'fixture-flavor-mint',
                            attribute_id: 'fixture-flavor',
                            value: 'Menta',
                        },
                    },
                ],
            },
            {
                id: 'fixture-variant-sold-out',
                product_id: 'fixture-product-1',
                sku: 'FIXTURE-VAPE-SOLD',
                price: 850,
                stock: 0,
                images: [],
                is_active: true,
                options: [
                    {
                        variant_id: 'fixture-variant-sold-out',
                        attribute_value_id: 'fixture-flavor-sold',
                        attribute_name: 'Sabor',
                        attribute_value: {
                            id: 'fixture-flavor-sold',
                            attribute_id: 'fixture-flavor',
                            value: 'Agotado',
                        },
                    },
                ],
            },
        ],
        ...overrides,
    };
}
