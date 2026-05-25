import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductPriceSection } from '../ProductPriceSection';
import { QuickViewModal } from '../QuickViewModal';
import { makeProductSurfaceFixture } from '../productSurfaceFixture';
import { ProductSurfaceFixture } from '@/pages/ProductSurfaceFixture';

const quickViewMocks = vi.hoisted(() => ({
    addItem: vi.fn(),
    toggleItem: vi.fn(),
    haptic: vi.fn(),
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
                whileHover: _whileHover,
                whileTap: _whileTap,
                ...props
            }, ref) => (
                createElement(Tag, { ...props, ref }, children as ReactNode)
            ));

    return {
        motion: new Proxy(
            {},
            {
                get: (_target, tag: string) => MotionElement(tag as keyof JSX.IntrinsicElements),
            },
        ),
        AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
    };
});

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt = '', className = '' }: { alt?: string; className?: string }) => (
        <img alt={alt} className={className} src="/fixture-product.webp" />
    ),
}));

vi.mock('@/hooks/useInventoryOracle', () => ({
    useInventoryOracle: () => ({
        prediction: null,
        isLoading: false,
    }),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: quickViewMocks.notifySuccess,
        warning: quickViewMocks.notifyWarning,
    }),
}));

vi.mock('@/hooks/useHaptic', () => ({
    useHaptic: () => ({
        trigger: quickViewMocks.haptic,
    }),
}));

vi.mock('@/hooks/useFocusTrap', () => ({
    useFocusTrap: vi.fn(),
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: () => ({
        addItem: quickViewMocks.addItem,
    }),
}));

vi.mock('@/stores/wishlist.store', () => ({
    useWishlistStore: () => ({
        toggleItem: quickViewMocks.toggleItem,
        isInWishlist: () => false,
    }),
}));

function renderQuickView(product = makeProductSurfaceFixture()) {
    return render(
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <QuickViewModal product={product} isOpen onClose={vi.fn()} />
        </MemoryRouter>,
    );
}

describe('product surface local fixture harness', () => {
    it('renders ProductPriceSection with deterministic discounted DHL coverage state', () => {
        render(<ProductPriceSection price={850} compareAtPrice={1000} section="vape" />);

        expect(screen.getByText('$850.00')).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
        expect(screen.getByText('-15%')).toBeInTheDocument();
        expect(screen.getByText('Cobertura por confirmar')).toBeInTheDocument();
        expect(screen.getByText('$850.00')).toHaveClass('text-vape-400');
    });

    it('renders ProductPriceSection using herbal presentation classes for 420', () => {
        render(<ProductPriceSection price={850} compareAtPrice={1000} section="420" />);

        expect(screen.getByText('$850.00')).toHaveClass('text-herbal-400');
    });

    it('renders QuickViewModal with representative local product data without runtime products', () => {
        const product = makeProductSurfaceFixture();

        renderQuickView(product);

        expect(screen.getByRole('dialog', { name: product.name })).toBeInTheDocument();
        expect(screen.getByText(product.name)).toBeInTheDocument();
        expect(screen.getByText('$850.00')).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
        expect(screen.getByText('Cobertura por confirmar')).toBeInTheDocument();
        expect(screen.getByText('Copy local representativo para quick view.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Menta/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Agotado/i })).toBeDisabled();
        expect(screen.getByRole('link', { name: /Ver detalles completos/i })).toHaveAttribute(
            'href',
            '/vape/producto-fixture-vape',
        );
        expect(screen.getByRole('button', { name: /Menta/i })).toHaveClass(
            'border-vape-500',
            'bg-vape-500/10',
            'text-vape-400',
        );
    });

    it('renders QuickViewModal with herbal presentation classes for section 420', () => {
        const product = makeProductSurfaceFixture({ section: '420', slug: 'producto-fixture-420' });

        renderQuickView(product);

        expect(screen.getByRole('button', { name: /Menta/i })).toHaveClass(
            'border-herbal-500',
            'bg-herbal-500/10',
            'text-herbal-400',
        );
    });

    it('exposes a local browser-renderable fixture surface for visual QA', () => {
        render(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <ProductSurfaceFixture />
            </MemoryRouter>,
        );

        expect(screen.getByTestId('product-price-fixture')).toHaveTextContent('$850.00');
        expect(screen.getByTestId('product-price-fixture')).toHaveTextContent('$1,000.00');
        expect(screen.getByTestId('product-price-fixture')).toHaveTextContent('-15%');
        expect(screen.getByTestId('product-price-fixture')).toHaveTextContent('Cobertura por confirmar');

        fireEvent.click(screen.getByRole('button', { name: /Open quick view/i }));

        expect(screen.getByRole('dialog', { name: 'Producto fixture vape' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Menta/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Agotado/i })).toBeDisabled();
    });
});
