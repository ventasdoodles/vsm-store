import { render, screen } from '@testing-library/react';
import { createElement, forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductPriceSection } from '../ProductPriceSection';
import { QuickViewModal } from '../QuickViewModal';
import type { Product } from '@/types/product';

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

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'fixture-product-1',
        name: 'Producto fixture vape',
        slug: 'producto-fixture-vape',
        description: 'Producto local determinista para render tests.',
        short_description: 'Copy local representativo para quick view.',
        price: 850,
        compare_at_price: 1000,
        stock: 12,
        sku: 'FIXTURE-VAPE-1',
        section: 'vape',
        category_id: 'fixture-category',
        tags: ['fixture'],
        status: 'active',
        images: ['/fixtures/product-front.webp', '/fixtures/product-side.webp'],
        cover_image: '/fixtures/product-cover.webp',
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

function renderQuickView(product: Product) {
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
    });

    it('renders QuickViewModal with representative local product data without runtime products', () => {
        const product = makeProduct();

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
    });
});
