import { createElement, forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Wishlist } from '../Wishlist';
import type { Product } from '@/types/product';

const wishlistMocks = vi.hoisted(() => ({
    items: [] as Product[],
    clearWishlist: vi.fn(),
    addItem: vi.fn(),
    notifySuccess: vi.fn(),
    notifyWarning: vi.fn(),
}));

vi.mock('framer-motion', () => {
    const MotionElement =
        (Tag: keyof JSX.IntrinsicElements) =>
            forwardRef<HTMLElement, PropsWithChildren<Record<string, unknown>>>(({
                children,
                initial: _initial,
                animate: _animate,
                exit: _exit,
                transition: _transition,
                ...props
            }, ref) => createElement(Tag, { ...props, ref }, children as ReactNode));

    return {
        AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
        motion: new Proxy({}, {
            get: (_target, tag: any) => MotionElement(tag as any),
        }),
    };
});

vi.mock('@/stores/wishlist.store', () => ({
    useWishlistStore: (selector: (state: { items: Product[]; clearWishlist: typeof wishlistMocks.clearWishlist }) => unknown) =>
        selector({ items: wishlistMocks.items, clearWishlist: wishlistMocks.clearWishlist }),
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (selector: (state: { addItem: typeof wishlistMocks.addItem }) => unknown) =>
        selector({ addItem: wishlistMocks.addItem }),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: wishlistMocks.notifySuccess,
        warning: wishlistMocks.notifyWarning,
    }),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('@/components/products/ProductGrid', () => ({
    ProductGrid: ({ products, isLoading }: { products: Product[]; isLoading?: boolean }) => (
        <div data-testid="product-grid" data-loading={String(!!isLoading)}>
            {products.map((product) => (
                <span key={product.id}>{product.name}</span>
            ))}
        </div>
    ),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: overrides.id ?? 'product-1',
        name: overrides.name ?? 'Wishlist Product',
        slug: overrides.slug ?? 'wishlist-product',
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

function renderWishlist() {
    return render(
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Wishlist />
        </MemoryRouter>,
    );
}

describe('Wishlist visible states', () => {
    beforeEach(() => {
        wishlistMocks.items = [];
        wishlistMocks.clearWishlist.mockReset();
        wishlistMocks.addItem.mockReset();
        wishlistMocks.notifySuccess.mockReset();
        wishlistMocks.notifyWarning.mockReset();
    });

    it('renders the empty wishlist state with count and discovery link', () => {
        renderWishlist();

        expect(screen.getByRole('heading', { name: 'Mis Favoritos' })).toBeInTheDocument();
        expect(screen.getByText('0 objetos de deseo guardados')).toBeInTheDocument();
        expect(screen.getByText(/Bit.cora de Deseos/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Descubrir Vanguardia/i })).toHaveAttribute('href', '/');
        expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument();
    });

    it('renders populated wishlist items and bulk action controls', () => {
        wishlistMocks.items = [
            makeProduct({ id: 'in-stock', name: 'Alpha Pod', stock: 4 }),
            makeProduct({ id: 'out-stock', name: 'Beta Pod', stock: 0 }),
        ];

        renderWishlist();

        expect(screen.getByText('2 objetos de deseo guardados')).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText('Alpha Pod')).toBeInTheDocument();
        expect(screen.getByText('Beta Pod')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Llevar Todo al Carrito/i })).toBeInTheDocument();
        expect(screen.getByTitle('Limpiar Favoritos')).toBeInTheDocument();
    });

    it('adds only in-stock wishlist items to the cart and reports success', () => {
        const inStock = makeProduct({ id: 'in-stock', name: 'Alpha Pod', stock: 2 });
        wishlistMocks.items = [
            inStock,
            makeProduct({ id: 'out-stock', name: 'Beta Pod', stock: 0 }),
        ];

        renderWishlist();
        fireEvent.click(screen.getByRole('button', { name: /Llevar Todo al Carrito/i }));

        expect(wishlistMocks.addItem).toHaveBeenCalledTimes(1);
        expect(wishlistMocks.addItem).toHaveBeenCalledWith(inStock);
        expect(wishlistMocks.notifySuccess).toHaveBeenCalledWith(
            expect.stringMatching(/Agregados al carrito/),
            '1 producto agregado.',
        );
        expect(wishlistMocks.notifyWarning).not.toHaveBeenCalled();
    });

    it('reports a warning when every wishlist item is out of stock', () => {
        wishlistMocks.items = [
            makeProduct({ id: 'out-stock-a', name: 'Alpha Pod', stock: 0 }),
            makeProduct({ id: 'out-stock-b', name: 'Beta Pod', stock: 0 }),
        ];

        renderWishlist();
        fireEvent.click(screen.getByRole('button', { name: /Llevar Todo al Carrito/i }));

        expect(wishlistMocks.addItem).not.toHaveBeenCalled();
        expect(wishlistMocks.notifyWarning).toHaveBeenCalledWith(
            'Sin stock',
            expect.stringMatching(/favoritos.*disponible/),
        );
        expect(wishlistMocks.notifySuccess).not.toHaveBeenCalled();
    });

    it('calls clearWishlist from the clear button', () => {
        wishlistMocks.items = [makeProduct({ id: 'product-a', name: 'Alpha Pod' })];

        renderWishlist();
        fireEvent.click(screen.getByTitle('Limpiar Favoritos'));

        expect(wishlistMocks.clearWishlist).toHaveBeenCalledTimes(1);
    });
});
