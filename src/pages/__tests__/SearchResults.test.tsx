import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResults } from '../SearchResults';
import type { Product } from '@/types/product';

const getProductsMock = vi.hoisted(() => vi.fn());
const useSearchMock = vi.hoisted(() => vi.fn());

vi.mock('@/services/products.service', () => ({
    getProducts: (...args: unknown[]) => getProductsMock(...args),
}));

vi.mock('@/hooks/useSearch', () => ({
    useSearch: (...args: unknown[]) => useSearchMock(...args),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('@/components/products/ProductGrid', () => ({
    ProductGrid: ({
        products,
        isLoading,
        emptyStateTitle,
        emptyStateSubtext,
    }: {
        products: Product[];
        isLoading?: boolean;
        emptyStateTitle?: string;
        emptyStateSubtext?: string;
    }) => (
        <div data-testid="product-grid" data-loading={String(!!isLoading)}>
            {products.length === 0 && !isLoading && (
                <div>
                    <p>{emptyStateTitle}</p>
                    <p>{emptyStateSubtext}</p>
                </div>
            )}
            {products.map((product) => (
                <span key={product.id}>{product.name}</span>
            ))}
        </div>
    ),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: overrides.id ?? 'product-1',
        name: overrides.name ?? 'Product',
        slug: overrides.slug ?? 'product',
        description: null,
        short_description: null,
        price: overrides.price ?? 100,
        compare_at_price: null,
        stock: overrides.stock ?? 5,
        sku: null,
        section: overrides.section ?? 'vape',
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

function renderSearch(path: string) {
    const client = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[path]}>
                <SearchResults />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('SearchResults broad section terms', () => {
    beforeEach(() => {
        getProductsMock.mockReset();
        useSearchMock.mockReset();
        useSearchMock.mockReturnValue({ data: [], isLoading: false });
    });

    it('routes exact vape searches into Vape Collection discovery', async () => {
        getProductsMock.mockResolvedValue([
            makeProduct({ id: 'vape-product', name: 'Pod System Starter Kit', section: 'vape' }),
        ]);

        renderSearch('/buscar?q=vape');

        expect(screen.getByText('Vape Collection')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver colección' })).toHaveAttribute('href', '/vape');
        expect(useSearchMock).toHaveBeenCalledWith('');
        await waitFor(() => {
            expect(screen.getByText('Pod System Starter Kit')).toBeInTheDocument();
        });
        expect(getProductsMock).toHaveBeenCalledWith({ section: 'vape', limit: 20 });
    });

    it('routes exact 420 searches into 420 Zone discovery', async () => {
        getProductsMock.mockResolvedValue([
            makeProduct({ id: 'herbal-product', name: 'Vaporizer Micro Pod 420', section: '420' }),
        ]);

        renderSearch('/buscar?q=420');

        expect(screen.getByText('420 Zone')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver colección' })).toHaveAttribute('href', '/420');
        await waitFor(() => {
            expect(screen.getByText('Vaporizer Micro Pod 420')).toBeInTheDocument();
        });
        expect(getProductsMock).toHaveBeenCalledWith({ section: '420', limit: 20 });
    });

    it('preserves normal product-like search behavior', () => {
        useSearchMock.mockReturnValue({
            data: [makeProduct({ id: 'pod-product', name: 'Pod System Starter Kit' })],
            isLoading: false,
        });

        renderSearch('/buscar?q=pod');

        expect(screen.queryByText('Vape Collection')).not.toBeInTheDocument();
        expect(screen.getByText('Pod System Starter Kit')).toBeInTheDocument();
        expect(useSearchMock).toHaveBeenCalledWith('pod');
        expect(getProductsMock).not.toHaveBeenCalled();
    });

    it('renders the short-query visible guard instead of the product grid', () => {
        renderSearch('/buscar?q=po');

        expect(screen.getByText('Escribe al menos 3 caracteres para buscar')).toBeInTheDocument();
        expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument();
        expect(getProductsMock).not.toHaveBeenCalled();
    });

    it('wires normal search loading state into ProductGrid', () => {
        useSearchMock.mockReturnValue({
            data: [],
            isLoading: true,
        });

        renderSearch('/buscar?q=pod');

        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'true');
        expect(useSearchMock).toHaveBeenCalledWith('pod');
        expect(getProductsMock).not.toHaveBeenCalled();
    });

    it('wires normal search empty state copy into ProductGrid', () => {
        useSearchMock.mockReturnValue({
            data: [],
            isLoading: false,
        });

        renderSearch('/buscar?q=pod');

        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText('Sin resultados')).toBeInTheDocument();
        expect(screen.getByText('Intenta con otros términos de búsqueda')).toBeInTheDocument();
        expect(useSearchMock).toHaveBeenCalledWith('pod');
        expect(getProductsMock).not.toHaveBeenCalled();
    });
});
