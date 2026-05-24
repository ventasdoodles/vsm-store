import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BestsellersPage } from '../BestsellersPage';
import { NewArrivals } from '../NewArrivals';
import { OffersPage } from '../OffersPage';
import type { Product } from '@/types/product';

const useBestsellerProductsMock = vi.hoisted(() => vi.fn());
const useDiscountedProductsMock = vi.hoisted(() => vi.fn());
const useRecentProductsMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useProducts', () => ({
    useBestsellerProducts: (...args: unknown[]) => useBestsellerProductsMock(...args),
    useDiscountedProducts: (...args: unknown[]) => useDiscountedProductsMock(...args),
    useRecentProducts: (...args: unknown[]) => useRecentProductsMock(...args),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('@/components/ui/BottomSheet', () => ({
    BottomSheet: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) => (
        isOpen ? <div data-testid="bottom-sheet">{children}</div> : null
    ),
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

const pageCases = [
    {
        name: 'OffersPage',
        Component: OffersPage,
        hook: useDiscountedProductsMock,
        expectedHookArgs: [50],
        emptyTitle: /No hay ofertas activas/,
        emptySubtext: /newsletter.*drop de descuentos/,
    },
    {
        name: 'NewArrivals',
        Component: NewArrivals,
        hook: useRecentProductsMock,
        expectedHookArgs: [40],
        emptyTitle: /Pr.ximamente m.s drops/,
        emptySubtext: /nuevos lanzamientos/,
    },
    {
        name: 'BestsellersPage',
        Component: BestsellersPage,
        hook: useBestsellerProductsMock,
        expectedHookArgs: [{ limit: 50 }],
        emptyTitle: /Cat.logo en rotaci.n/,
        emptySubtext: /resto de categor/,
    },
];

describe('Merchandising listing visible states', () => {
    beforeEach(() => {
        useBestsellerProductsMock.mockReset();
        useDiscountedProductsMock.mockReset();
        useRecentProductsMock.mockReset();
    });

    it.each(pageCases)('wires $name loading state into ProductGrid', ({ Component, hook, expectedHookArgs }) => {
        hook.mockReturnValue({ data: [], isLoading: true });

        render(<Component />);

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'true');
        expect(hook).toHaveBeenCalledWith(...expectedHookArgs);
    });

    it.each(pageCases)('wires $name empty state copy into ProductGrid', ({ Component, hook, emptyTitle, emptySubtext }) => {
        hook.mockReturnValue({ data: [], isLoading: false });

        render(<Component />);

        expect(screen.getByText('0 productos')).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText(emptyTitle)).toBeInTheDocument();
        expect(screen.getByText(emptySubtext)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /ordenar/i })).not.toBeInTheDocument();
    });

    it.each(pageCases)('renders $name populated count and grid products', ({ Component, hook }) => {
        hook.mockReturnValue({
            data: [
                makeProduct({ id: 'product-a', name: 'Alpha Pod' }),
                makeProduct({ id: 'product-b', name: 'Beta Pod' }),
            ],
            isLoading: false,
        });

        render(<Component />);

        expect(screen.getByText('2 productos')).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText('Alpha Pod')).toBeInTheDocument();
        expect(screen.getByText('Beta Pod')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ordenar/i })).toBeInTheDocument();
    });
});
