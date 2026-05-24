import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductGrid } from '../ProductGrid';
import type { Product } from '@/types/product';

vi.mock('@/components/products/ProductCard', () => ({
    ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'product-1',
        name: 'Producto grid',
        slug: 'producto-grid',
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

describe('ProductGrid render states', () => {
    it('shows a loading skeleton while products are fetching', () => {
        const { container } = render(
            <MemoryRouter>
                <ProductGrid products={[]} isLoading />
            </MemoryRouter>,
        );

        expect(container.querySelectorAll('.skeleton-shimmer')).toHaveLength(32);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('shows a visible empty state with a search fallback when no products are available', () => {
        render(
            <MemoryRouter>
                <ProductGrid
                    products={[]}
                    emptyStateTitle="Catálogo en rotación"
                    emptyStateSubtext="Estamos actualizando esta selección."
                />
            </MemoryRouter>,
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Catálogo en rotación')).toBeInTheDocument();
        expect(screen.getByText('Estamos actualizando esta selección.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/buscar');
    });

    it('renders product cards when products exist', () => {
        render(
            <MemoryRouter>
                <ProductGrid products={[makeProduct()]} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Producto grid')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
