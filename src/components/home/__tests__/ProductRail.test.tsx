import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { TestRouter } from "@/lib/test-router";
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProductRail } from '../ProductRail';

const useFeaturedProductsMock = vi.fn();
const useNewProductsMock = vi.fn();
const useBestsellerProductsMock = vi.fn();

vi.mock('framer-motion', () => ({
    motion: new Proxy(
        {},
        {
            get: () =>
                ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
                    <div {...props}>{children}</div>
                ),
        },
    ),
}));

vi.mock('@/components/products/ProductCard', () => ({
    ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}));

vi.mock('@/hooks/useProducts', () => ({
    useFeaturedProducts: (...args: unknown[]) => useFeaturedProductsMock(...args),
    useNewProducts: (...args: unknown[]) => useNewProductsMock(...args),
    useBestsellerProducts: (...args: unknown[]) => useBestsellerProductsMock(...args),
}));

describe('ProductRail render states', () => {
    beforeEach(() => {
        useFeaturedProductsMock.mockReset();
        useNewProductsMock.mockReset();
        useBestsellerProductsMock.mockReset();
    });

    it('shows a loading skeleton while products are fetching', () => {
        useFeaturedProductsMock.mockReturnValue({ data: [], isLoading: true });

        const { container } = render(
            <TestRouter>
                <ProductRail type="featured" title="Destacados" />
            </TestRouter>,
        );

        expect(container.querySelectorAll('.skeleton-shimmer')).toHaveLength(4);
        expect(screen.queryByText('Catálogo en rotación')).not.toBeInTheDocument();
    });

    it('shows a visible empty state when no products are available', () => {
        useFeaturedProductsMock.mockReturnValue({ data: [], isLoading: false });

        render(
            <TestRouter>
                <ProductRail type="featured" title="Destacados" section="vape" />
            </TestRouter>,
        );

        expect(screen.getByText('Catálogo en rotación')).toBeInTheDocument();
        expect(screen.getByText(/Estamos actualizando esta selección/i)).toBeInTheDocument();

        const exploreLinks = screen.getAllByRole('link', { name: 'Explorar catálogo' });
        expect(exploreLinks).toHaveLength(2);
        expect(exploreLinks.some((link) => link.getAttribute('href') === '/vape')).toBe(true);
    });

    it('renders product cards when products exist', () => {
        useFeaturedProductsMock.mockReturnValue({
            data: [
                {
                    id: 'product-1',
                    name: 'Producto rail',
                },
            ],
            isLoading: false,
        });

        render(
            <TestRouter>
                <ProductRail type="featured" title="Destacados" />
            </TestRouter>,
        );

        expect(screen.getByText('Producto rail')).toBeInTheDocument();
        expect(screen.queryByText('Catálogo en rotación')).not.toBeInTheDocument();
    });
});
