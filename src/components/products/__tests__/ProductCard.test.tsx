import { createElement, forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from '../ProductCard';
import { makeProductSurfaceFixture } from '../productSurfaceFixture';

const productCardMocks = vi.hoisted(() => ({
    addItem: vi.fn(),
    toggleItem: vi.fn(),
    notifySuccess: vi.fn(),
    playClick: vi.fn(),
    playSuccess: vi.fn(),
    triggerHaptic: vi.fn(),
    prefetchQuery: vi.fn(),
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
                whileHover: _whileHover,
                whileTap: _whileTap,
                ...props
            }, ref) => createElement(Tag, { ...props, ref }, children as ReactNode));

    return {
        motion: new Proxy({}, {
            get: (_target, tag: string) => MotionElement(tag as keyof JSX.IntrinsicElements),
        }),
    };
});

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt = '', className = '' }: { alt?: string; className?: string }) => (
        <img alt={alt} className={className} src="/fixture-product.webp" />
    ),
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (selector: (state: { addItem: typeof productCardMocks.addItem }) => unknown) =>
        selector({ addItem: productCardMocks.addItem }),
}));

vi.mock('@/stores/wishlist.store', () => ({
    useWishlistStore: (selector: (state: { toggleItem: typeof productCardMocks.toggleItem; isInWishlist: () => boolean }) => unknown) =>
        selector({ toggleItem: productCardMocks.toggleItem, isInWishlist: () => false }),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: productCardMocks.notifySuccess,
    }),
}));

vi.mock('@/contexts/TacticalContext', () => ({
    useTacticalUI: () => ({
        playClick: productCardMocks.playClick,
        playSuccess: productCardMocks.playSuccess,
        triggerHaptic: productCardMocks.triggerHaptic,
    }),
}));

vi.mock('@/contexts/SafetyContext', () => ({
    useSafety: () => ({
        isEmergency: false,
    }),
}));

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        prefetchQuery: productCardMocks.prefetchQuery,
    }),
}));

vi.mock('@/services', () => ({
    getProductBySlug: vi.fn(),
}));

describe('ProductCard', () => {
    it('renders evidence-safe stock wording for very low stock', () => {
        const product = makeProductSurfaceFixture({
            stock: 3,
            variants: [],
        });

        render(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <ProductCard product={product} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Stock limitado: 3 unidades')).toBeInTheDocument();
        expect(screen.queryByText(/Ultimas/i)).not.toBeInTheDocument();
    });

    it('renders evidence-safe stock wording for limited availability above three units', () => {
        const product = makeProductSurfaceFixture({
            stock: 4,
            variants: [],
        });

        render(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <ProductCard product={product} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Disponibilidad limitada: 4 unidades')).toBeInTheDocument();
        expect(screen.queryByText(/Ultimas/i)).not.toBeInTheDocument();
    });

    it('applies section-specific product surface presentation classes', () => {
        const vapeProduct = makeProductSurfaceFixture({ section: 'vape' });
        const herbalProduct = makeProductSurfaceFixture({ section: '420' });

        const { rerender } = render(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <ProductCard product={vapeProduct} />
            </MemoryRouter>,
        );

        expect(screen.getAllByText('vape')[0]).toHaveClass('bg-vape-500/10', 'text-vape-400', 'border-vape-500/20');
        expect(screen.getByText(vapeProduct.name)).toHaveClass('group-hover:text-vape-400');

        rerender(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <ProductCard product={herbalProduct} />
            </MemoryRouter>,
        );

        expect(screen.getAllByText('420')[0]).toHaveClass('bg-herbal-500/10', 'text-herbal-400', 'border-herbal-500/20');
        expect(screen.getByText(herbalProduct.name)).toHaveClass('group-hover:text-herbal-400');
    });
});
