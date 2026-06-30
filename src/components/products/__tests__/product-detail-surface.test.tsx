import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TestRouter } from "@/lib/test-router";
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductBreadcrumbs } from '../ProductBreadcrumbs';
import { ProductActions } from '../ProductActions';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';
import { QuickViewModal } from '../QuickViewModal';
import { ProductInfo } from '../ProductInfo';
import { makeProductSurfaceFixture } from '../productSurfaceFixture';
import type { Product } from '@/types/product';

const useCategoryByIdMock = vi.hoisted(() => vi.fn());
const addItemMock = vi.hoisted(() => vi.fn());
const openCartMock = vi.hoisted(() => vi.fn());
const toggleItemMock = vi.hoisted(() => vi.fn());
const successMock = vi.hoisted(() => vi.fn());
const warningMock = vi.hoisted(() => vi.fn());
const hapticMock = vi.hoisted(() => vi.fn());
const getSmartRecommendationsMock = vi.hoisted(() => vi.fn());
const useInventoryOracleMock = vi.hoisted(() => vi.fn());
const useFocusTrapMock = vi.hoisted(() => vi.fn());
const useWishlistStoreMock = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', () => {
    const MotionButton = ({ children, ...props }: { children?: ReactNode }) => <button {...props}>{children}</button>;
    const MotionDiv = ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>;

    return {
        motion: new Proxy(
            {},
            {
                get: (_target, tag: string) => {
                    if (tag === 'button') return MotionButton;
                    return MotionDiv;
                },
            },
        ),
        AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
    };
});

vi.mock('@/hooks/useCategories', () => ({
    useCategoryById: (...args: unknown[]) => useCategoryByIdMock(...args),
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (selector?: (state: { addItem: typeof addItemMock; openCart: typeof openCartMock }) => unknown) => {
        const state = { addItem: addItemMock, openCart: openCartMock };
        return selector ? selector(state) : state;
    },
}));

vi.mock('@/stores/wishlist.store', () => ({
    useWishlistStore: () => useWishlistStoreMock(),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: successMock,
        warning: warningMock,
    }),
}));

vi.mock('@/hooks/useHaptic', () => ({
    useHaptic: () => ({
        trigger: hapticMock,
    }),
}));

vi.mock('@/hooks/useInventoryOracle', () => ({
    useInventoryOracle: (...args: unknown[]) => useInventoryOracleMock(...args),
}));

vi.mock('@/hooks/useFocusTrap', () => ({
    useFocusTrap: (...args: unknown[]) => useFocusTrapMock(...args),
}));

vi.mock('@/services/products.service', () => ({
    getSmartRecommendations: (...args: unknown[]) => getSmartRecommendationsMock(...args),
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt = '', className = '', src = '/fixture-product.webp' }: { alt?: string; className?: string; src?: string }) => (
        <img alt={alt} className={className} src={src} />
    ),
}));

vi.mock('@/components/seo/BreadcrumbJsonLd', () => ({
    BreadcrumbJsonLd: () => <div data-testid="breadcrumb-json-ld" />,
}));

vi.mock('@/components/products/ProductBadgeGroup', () => ({
    ProductBadgeGroup: ({ product }: { product: Product }) => (
        <div data-testid="product-badge-group">{product.name}</div>
    ),
}));

vi.mock('@/components/products/ProductPriceSection', () => ({
    ProductPriceSection: ({ price }: { price: number }) => <div data-testid="product-price-section">{price}</div>,
}));

vi.mock('@/components/products/StockOracleBadge', () => ({
    StockOracleBadge: () => <div data-testid="stock-oracle-badge" />,
}));

vi.mock('@/components/products/UrgencyIndicators', () => ({
    UrgencyIndicators: () => <div data-testid="urgency-indicators" />,
}));

vi.mock('@/components/products/ShareButton', () => ({
    ShareButton: ({ className }: { className?: string }) => <button data-testid="share-button" className={className} />,
}));

vi.mock('@/components/products/StickyAddToCart', () => ({
    StickyAddToCart: ({ isVisible }: { isVisible: boolean }) => <div data-testid="sticky-add-to-cart" data-visible={String(isVisible)} />,
}));

beforeEach(() => {
    useCategoryByIdMock.mockReset();
    addItemMock.mockReset();
    openCartMock.mockReset();
    toggleItemMock.mockReset();
    successMock.mockReset();
    warningMock.mockReset();
    hapticMock.mockReset();
    getSmartRecommendationsMock.mockReset();
    useInventoryOracleMock.mockReturnValue({ prediction: null, isLoading: false });
    useFocusTrapMock.mockReturnValue(undefined);
    useWishlistStoreMock.mockReturnValue({
        toggleItem: toggleItemMock,
        isInWishlist: () => false,
    });
    useCategoryByIdMock.mockReturnValue({ data: { name: 'Pods', slug: 'pods' } });
    class MockIntersectionObserver {
        observe() {}
        disconnect() {}
        unobserve() {}
        takeRecords() { return []; }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('product detail presentation boundary', () => {
    it('centralizes breadcrumb hover classes from product detail config', () => {
        render(
            <TestRouter>
                <ProductBreadcrumbs section="420" productName="Producto" productSlug="producto" categoryId="category-1" />
            </TestRouter>,
        );

        const sectionLink = screen.getByRole('link', { name: '420' });
        const categoryLink = screen.getByRole('link', { name: 'Pods' });

        expect(sectionLink).toHaveClass('hover:text-herbal-400');
        expect(categoryLink).toHaveClass('hover:text-herbal-400');
    });

    it('centralizes product action classes from product detail config', async () => {
        const product = makeProductSurfaceFixture();

        render(
            <TestRouter>
                <ProductActions product={product} />
            </TestRouter>,
        );

        const variantButton = await screen.findByRole('button', { name: /Menta/i });
        expect(variantButton).toHaveClass('border-vape-500', 'bg-vape-500/10', 'text-vape-400');
        expect(screen.getByRole('button', { name: /Añadir al Carrito/i })).toHaveClass(
            'bg-gradient-to-r',
            'from-vape-600',
            'to-vape-500',
            'ring-1',
            'ring-vape-400/50',
        );
        expect(screen.getByTestId('sticky-add-to-cart')).toHaveAttribute('data-visible', 'false');
    });

    it('centralizes product info tag hover classes from product detail config', () => {
        const product = makeProductSurfaceFixture({ tags: ['fixture', 'alpha'] });

        render(
            <TestRouter>
                <ProductInfo product={product} />
            </TestRouter>,
        );

        expect(screen.getByText('fixture')).toHaveClass('hover:text-vape-400', 'hover:border-vape-400/50');
        expect(screen.getByText('alpha')).toHaveClass('hover:text-vape-400', 'hover:border-vape-400/50');
    });

    it('centralizes quick view variant and thumbnail classes from product detail config', () => {
        const product = makeProductSurfaceFixture({
            images: ['/fixture-product-1.webp', '/fixture-product-2.webp'],
        });

        render(
            <TestRouter>
                <QuickViewModal product={product} isOpen onClose={vi.fn()} />
            </TestRouter>,
        );

        expect(screen.getByRole('button', { name: /Menta/i })).toHaveClass(
            'border-vape-500',
            'bg-vape-500/10',
            'text-vape-400',
        );
        expect(screen.getAllByRole('button').some((button) => button.className.includes('ring-vape-500/20'))).toBe(true);
    });

    it('centralizes related bundle accent classes from product detail config', async () => {
        const recommendations = [
            makeProductSurfaceFixture({ id: 'related-1', slug: 'related-1', name: 'Related 1' }),
            makeProductSurfaceFixture({ id: 'related-2', slug: 'related-2', name: 'Related 2' }),
        ];
        getSmartRecommendationsMock.mockResolvedValue(recommendations);
        const product = makeProductSurfaceFixture();

        render(
            <TestRouter>
                <FrequentlyBoughtTogether currentProduct={product} />
            </TestRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('Comprados juntos habitualmente')).toBeInTheDocument();
        });

        expect(screen.getByText('Comprados juntos habitualmente').previousElementSibling).toHaveClass('bg-vape-500');
    });
});
