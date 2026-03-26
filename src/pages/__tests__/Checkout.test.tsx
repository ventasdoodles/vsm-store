import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Checkout } from '../Checkout';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/product';

const navigateMock = vi.fn();
const warningMock = vi.fn();
const authStateMock = {
    user: { id: 'user-1' },
    isAuthenticated: true,
};
const useOpenRecoverableOrderMock = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/components/cart/CheckoutForm', () => ({
    CheckoutForm: () => <div>checkout-form</div>,
}));

vi.mock('@/components/cart/OpenRecoverableOrderNotice', () => ({
    OpenRecoverableOrderNotice: () => <div>open-order-recovery-notice</div>,
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => authStateMock,
}));

vi.mock('@/hooks/useOrders', () => ({
    useOpenRecoverableOrder: (...args: unknown[]) => useOpenRecoverableOrderMock(...args),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        warning: warningMock,
    }),
}));

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
    AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'product-1',
        name: 'Producto checkout',
        slug: 'producto-checkout',
        description: '',
        short_description: '',
        price: 199,
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

describe('Checkout page cart integrity display', () => {
    beforeEach(() => {
        navigateMock.mockReset();
        warningMock.mockReset();
        useOpenRecoverableOrderMock.mockReset();
        useOpenRecoverableOrderMock.mockReturnValue({ data: null });
        useCartStore.setState({ items: [], isOpen: false, lastValidationResult: null });
    });

    it('stops showing stale checkout summary after the live cart becomes empty', () => {
        useCartStore.setState({
            items: [{ product: makeProduct(), quantity: 2, variant_id: null, variant_name: null }],
        });

        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>,
        );

        expect(screen.getAllByText(/Producto checkout/i).length).toBeGreaterThan(0);

        act(() => {
            useCartStore.setState({ items: [] });
        });

        expect(screen.getAllByText(/Tu carrito ya no tiene articulos comprables vigentes/i).length).toBeGreaterThan(0);
        expect(screen.queryByText('Producto checkout')).not.toBeInTheDocument();
    });

    it('shows the shared review state when cart corrections were already applied', () => {
        useCartStore.setState({
            items: [{ product: makeProduct(), quantity: 1, variant_id: null, variant_name: null }],
            lastValidationResult: {
                hasIssues: true,
                issues: [{ productId: 'product-1', productName: 'Producto checkout', type: 'stock_adjusted', oldValue: 2, newValue: 1 }],
            },
        });

        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>,
        );

        expect(screen.getAllByText(/Revisa tu carrito actualizado/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/1 ajuste aplicado/i).length).toBeGreaterThan(0);
    });

    it('surfaces open-order recovery guidance when an authenticated payable order already exists', () => {
        useCartStore.setState({
            items: [{ product: makeProduct(), quantity: 1, variant_id: null, variant_name: null }],
        });
        useOpenRecoverableOrderMock.mockReturnValue({
            data: {
                id: 'order-open-1',
                order_number: 'VSM-OPEN-1',
                items: [{ product_id: 'product-1', name: 'Producto checkout', price: 199, quantity: 1 }],
                status: 'pending',
                payment_method: 'mercadopago',
                payment_status: 'pending',
                total: 199,
            },
        });

        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>,
        );

        expect(screen.getAllByText('open-order-recovery-notice').length).toBeGreaterThan(0);
    });
});
