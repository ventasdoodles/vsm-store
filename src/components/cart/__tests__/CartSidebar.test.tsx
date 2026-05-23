import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartSidebar } from '../CartSidebar';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/product';

const navigateMock = vi.fn();
const warningMock = vi.fn();
const runValidationMock = vi.fn();
const useOpenRecoverableOrderMock = vi.fn();
const useStorefrontCartDependencyOfferMock = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateMock,
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
    useMotionValue: () => ({ set: vi.fn() }),
    useMotionTemplate: () => '',
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: vi.fn(),
        info: vi.fn(),
        warning: warningMock,
    }),
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
        isAuthenticated: true,
    }),
}));

vi.mock('@/hooks/useOrders', () => ({
    useOpenRecoverableOrder: (...args: unknown[]) => useOpenRecoverableOrderMock(...args),
}));

vi.mock('@/contexts/TacticalContext', () => ({
    useTacticalUI: () => ({
        playClick: vi.fn(),
        playSuccess: vi.fn(),
        playTick: vi.fn(),
        playError: vi.fn(),
        triggerHaptic: vi.fn(),
    }),
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: () => <div>image</div>,
}));

vi.mock('@/hooks/useSmartBundleOffer', () => ({
    useSmartBundleOffer: () => ({
        data: null,
    }),
}));

vi.mock('@/hooks/useCartValidator', () => ({
    useCartValidator: () => ({
        runValidation: runValidationMock,
        isValidating: false,
    }),
}));

vi.mock('@/hooks/useStorefrontCartDependencyOffer', () => ({
    useStorefrontCartDependencyOffer: (...args: unknown[]) => useStorefrontCartDependencyOfferMock(...args),
}));

vi.mock('../OpenRecoverableOrderNotice', () => ({
    OpenRecoverableOrderNotice: () => <div>open-order-recovery-notice</div>,
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'product-1',
        name: 'Producto sidebar',
        slug: 'producto-sidebar',
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

describe('CartSidebar transition clarity', () => {
    beforeEach(() => {
        navigateMock.mockReset();
        warningMock.mockReset();
        runValidationMock.mockReset();
        useOpenRecoverableOrderMock.mockReset();
        useStorefrontCartDependencyOfferMock.mockReset();
        useOpenRecoverableOrderMock.mockReturnValue({ data: null });
        useStorefrontCartDependencyOfferMock.mockReturnValue({ data: null });
        useCartStore.setState({
            items: [{ product: makeProduct(), quantity: 1, variant_id: null, variant_name: null }],
            isOpen: true,
            lastValidationResult: null,
        });
    });

    it('shows a review banner when automatic corrections were applied', () => {
        useCartStore.setState({
            lastValidationResult: {
                hasIssues: true,
                issues: [{ productId: 'product-1', productName: 'Producto sidebar', type: 'price_changed', oldValue: 90, newValue: 100 }],
            },
        });

        render(<CartSidebar />);

        expect(screen.getByText(/Revisa tu carrito actualizado/i)).toBeInTheDocument();
        expect(screen.getByText(/Revisar checkout/i)).toBeInTheDocument();
    });

    it('shows calculated-shipping expectations without a free-shipping threshold promise', () => {
        useCartStore.setState({
            items: [{ product: makeProduct({ price: 600 }), quantity: 1, variant_id: null, variant_name: null }],
        });

        render(<CartSidebar />);

        expect(screen.getByText(/Envío revisado en checkout/i)).toBeInTheDocument();
        expect(screen.getByText(/Costo final confirmado antes de cerrar/i)).toBeInTheDocument();
        expect(screen.getByText(/Calculado al confirmar/i)).toBeInTheDocument();
        expect(screen.queryByText(/Envío Gratis Desbloqueado/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Faltan para envío gratis/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Meta \$500/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/^Gratis$/i)).not.toBeInTheDocument();
    });

    it('blocks checkout navigation when validation leaves no purchasable items', async () => {
        runValidationMock.mockImplementation(async () => {
            useCartStore.setState({ items: [] });
            return {
                hasIssues: true,
                issues: [{ productId: 'product-1', productName: 'Producto sidebar', type: 'variant_removed' }],
            };
        });

        render(<CartSidebar />);

        fireEvent.click(screen.getByText(/Proceder al Pago/i));

        await waitFor(() => {
            expect(navigateMock).not.toHaveBeenCalled();
            expect(warningMock).toHaveBeenCalledWith(
                'Revisa tu carrito',
                'Ya no quedan articulos comprables vigentes. Vuelve al catalogo y confirma tu seleccion actual antes de continuar.',
            );
        });
    });

    it('prioritizes the existing payable order instead of starting another checkout path', async () => {
        useOpenRecoverableOrderMock.mockReturnValue({
            data: {
                id: 'order-open-1',
                order_number: 'VSM-OPEN-1',
                items: [{ product_id: 'product-1', name: 'Producto sidebar', price: 100, quantity: 1 }],
                status: 'pending',
                payment_method: 'mercadopago',
                payment_status: 'pending',
                total: 100,
            },
        });

        render(<CartSidebar />);

        expect(screen.getByText('open-order-recovery-notice')).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Retomar orden abierta/i));

        await waitFor(() => {
            expect(runValidationMock).not.toHaveBeenCalled();
            expect(warningMock).toHaveBeenCalledWith(
                'Ya existe una orden pendiente',
                'Esta cuenta ya tiene un pedido persistido y todavia pagable en Mercado Pago. Continua con esa orden o revisa su estado real antes de iniciar otro checkout.',
            );
            expect(navigateMock).toHaveBeenCalledWith('/orders/order-open-1');
        });
    });

    it('surfaces one cart dependency guidance and opens the missing product path', async () => {
        useStorefrontCartDependencyOfferMock.mockReturnValue({
            data: {
                primary_product_id: 'product-1',
                relation_type: 'uses_pod',
                scope: 'specific_model',
                rationale: 'Pod compatible aparece como pod compatible y sigue disponible. Compatibilidad confirmada para ese modelo.',
                missing_product: {
                    id: 'pod-1',
                    name: 'Pod compatible',
                    slug: 'pod-compatible',
                    section: 'vape',
                },
            },
        });

        render(<CartSidebar />);

        expect(screen.getByText(/Revisa una compatibilidad antes de pagar/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Ver un pod compatible/i));

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/vape/pod-compatible');
        });
    });
});
