import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckout } from '../useCheckout';
import type { CartItem, CheckoutFormData } from '@/types/cart';

const navigateMock = vi.fn();
const submitCheckoutMock = vi.fn();
const validateCouponMock = vi.fn();
const markWhatsAppSentMock = vi.fn();
const successMock = vi.fn();
const warningMock = vi.fn();
const errorMock = vi.fn();
const hapticMock = vi.fn();
const runValidationMock = vi.fn();
const clearCartMock = vi.fn();
const closeCartMock = vi.fn();
const openMock = vi.fn();

const cartStoreState = {
    items: [] as CartItem[],
    clearCart: clearCartMock,
    closeCart: closeCartMock,
};
let authStateMock: { user: { id: string } | null; isAuthenticated: boolean } = {
    user: { id: 'user-1' },
    isAuthenticated: true,
};

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateMock,
}));

vi.mock('@/stores/cart.store', () => ({
    selectSubtotal: (state: { items: CartItem[] }) =>
        state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    useCartStore: Object.assign(
        (
            selector: (state: {
                items: CartItem[];
                clearCart: typeof clearCartMock;
                closeCart: typeof closeCartMock;
            }) => unknown,
        ) => selector(cartStoreState),
        {
            getState: () => cartStoreState,
        },
    ),
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => authStateMock,
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: successMock,
        warning: warningMock,
        error: errorMock,
        info: vi.fn(),
    }),
}));

vi.mock('@/hooks/useHaptic', () => ({
    useHaptic: () => ({
        trigger: hapticMock,
    }),
}));

vi.mock('@/hooks/useCartValidator', () => ({
    useCartValidator: () => ({
        runValidation: runValidationMock,
    }),
}));

vi.mock('@/hooks/useStoreSettings', () => ({
    useStoreSettings: () => ({
        data: {
            whatsapp_number: '5217440000000',
            loyalty_config: null,
        },
    }),
}));

vi.mock('@/actions/checkout', () => ({
    submitCheckout: (...args: unknown[]) => submitCheckoutMock(...args),
}));

vi.mock('@/hooks/useAddresses', () => ({
    formatAddress: () => 'Direccion guardada',
}));

vi.mock('@/config/site', () => ({
    SITE_CONFIG: {
        whatsapp: { number: '5217440000000' },
        orderWhatsApp: {
            generateMessage: () => 'pedido',
        },
    },
}));

vi.mock('@/lib/domain/loyalty', () => ({
    calculateLoyaltyPoints: () => 0,
}));

vi.mock('@/lib/domain/pricing', () => ({
    calculateOrderTotal: (subtotal: number, discount: number) => Math.max(subtotal - discount, 0),
}));

vi.mock('@/services', () => ({
    validateCoupon: (...args: unknown[]) => validateCouponMock(...args),
    markWhatsAppSent: (...args: unknown[]) => markWhatsAppSentMock(...args),
}));

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
    return {
        product: {
            id: 'prod-1',
            name: 'Producto vigente',
            slug: 'producto-vigente',
            description: null,
            short_description: null,
            price: 320,
            compare_at_price: null,
            stock: 5,
            sku: null,
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
            created_at: '2026-03-25T00:00:00.000Z',
            updated_at: '2026-03-25T00:00:00.000Z',
            specs: {},
            badges: [],
            ai_is_featured: false,
            ai_sales_note: null,
            ai_exclude: false,
            variants: [],
        },
        quantity: 1,
        variant_id: null,
        variant_name: null,
        ...overrides,
    };
}

describe('useCheckout', () => {
    const checkoutForm: CheckoutFormData = {
        customerName: 'Juan Perez',
        customerPhone: '7441234567',
        deliveryType: 'pickup',
        address: '',
        paymentMethod: 'transfer',
    };

    beforeEach(() => {
        vi.useFakeTimers();
        sessionStorage.clear();
        navigateMock.mockReset();
        submitCheckoutMock.mockReset();
        validateCouponMock.mockReset();
        markWhatsAppSentMock.mockReset();
        successMock.mockReset();
        warningMock.mockReset();
        errorMock.mockReset();
        hapticMock.mockReset();
        runValidationMock.mockReset();
        clearCartMock.mockReset();
        closeCartMock.mockReset();
        openMock.mockReset();

        authStateMock = {
            user: { id: 'user-1' },
            isAuthenticated: true,
        };
        cartStoreState.items = [createCartItem()];
        runValidationMock.mockResolvedValue({ hasIssues: false, issues: [] });
        validateCouponMock.mockResolvedValue({ valid: false });
        markWhatsAppSentMock.mockResolvedValue(undefined);

        Object.defineProperty(window, 'open', {
            writable: true,
            value: openMock,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('builds the checkout payload from the corrected cart state after validation', async () => {
        cartStoreState.items = [createCartItem({ quantity: 3 })];
        runValidationMock.mockImplementation(async () => {
            cartStoreState.items = [createCartItem({ quantity: 1 })];
            return {
                hasIssues: true,
                issues: [{ productId: 'prod-1', productName: 'Producto vigente', type: 'stock_adjusted', oldValue: 3, newValue: 1 }],
            };
        });
        submitCheckoutMock.mockResolvedValue({
            ok: true,
            orderId: 'order-123',
            paymentContinuation: 'not_requested',
        });

        const onSuccess = vi.fn();
        const { result } = renderHook(() => useCheckout({ onSuccess }));

        await act(async () => {
            await result.current.handleSubmit(checkoutForm, '', true, []);
        });

        expect(submitCheckoutMock).toHaveBeenCalledWith(expect.objectContaining({
            items: [
                expect.objectContaining({
                    product_id: 'prod-1',
                    quantity: 1,
                }),
            ],
        }));
    });

    it('blocks final submit when validation removes a variant line from the corrected cart', async () => {
        cartStoreState.items = [createCartItem({ variant_id: 'variant-legacy', variant_name: 'Azul / M' })];
        runValidationMock.mockImplementation(async () => {
            cartStoreState.items = [];
            return {
                hasIssues: true,
                issues: [{ productId: 'prod-1', productName: 'Producto vigente (Azul / M)', type: 'variant_removed' }],
            };
        });

        const onSuccess = vi.fn();
        const { result } = renderHook(() => useCheckout({ onSuccess }));

        await act(async () => {
            await result.current.handleSubmit(checkoutForm, '', true, []);
        });

        expect(submitCheckoutMock).not.toHaveBeenCalled();
        expect(errorMock).toHaveBeenCalledWith(
            'Inventario actualizado',
            'Algunos productos ya no estan disponibles. Revisa tu carrito.',
        );
        expect(openMock).not.toHaveBeenCalled();
    });

    it('blocks final submit when the corrected cart leaves zero purchasable items', async () => {
        cartStoreState.items = [createCartItem()];
        runValidationMock.mockImplementation(async () => {
            cartStoreState.items = [];
            return { hasIssues: false, issues: [] };
        });

        const onSuccess = vi.fn();
        const { result } = renderHook(() => useCheckout({ onSuccess }));

        await act(async () => {
            await result.current.handleSubmit(checkoutForm, '', true, []);
        });

        expect(submitCheckoutMock).not.toHaveBeenCalled();
        expect(errorMock).toHaveBeenCalledWith(
            'Carrito sin articulos vigentes',
            'Tu carrito ya no tiene articulos comprables vigentes. Revisa tu carrito antes de continuar.',
        );
        expect(openMock).not.toHaveBeenCalled();
    });

    it('redirects authenticated duplicate non-Mercado Pago submits toward the existing pending order', async () => {
        submitCheckoutMock.mockResolvedValue({
            ok: true,
            orderId: 'order-123',
            reusedPendingOrder: true,
            paymentContinuation: 'not_requested',
            message: 'Ya existe una orden pendiente para este checkout. Continua con esa orden y revisa su estado antes de enviar otro pedido.',
        });

        const onSuccess = vi.fn();
        const { result } = renderHook(() => useCheckout({ onSuccess }));

        await act(async () => {
            await result.current.handleSubmit(checkoutForm, '', true, []);
        });

        expect(submitCheckoutMock).toHaveBeenCalledTimes(1);
        expect(warningMock).toHaveBeenCalledWith(
            'Ya existe una orden pendiente',
            'Ya existe una orden pendiente para este checkout. Continua con esa orden y revisa su estado antes de enviar otro pedido.',
        );
        expect(navigateMock).toHaveBeenCalledWith('/orders/order-123');
        expect(openMock).not.toHaveBeenCalled();
        expect(markWhatsAppSentMock).not.toHaveBeenCalled();
        expect(clearCartMock).not.toHaveBeenCalled();
        expect(closeCartMock).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.sent).toBe(false);
        expect(result.current.sending).toBe(false);
    });

    it('keeps guest checkout outside the persisted-order path', async () => {
        authStateMock = {
            user: null,
            isAuthenticated: false,
        };

        const onSuccess = vi.fn();
        const { result } = renderHook(() => useCheckout({ onSuccess }));

        await act(async () => {
            await result.current.handleSubmit(checkoutForm, '', true, []);
        });

        expect(submitCheckoutMock).not.toHaveBeenCalled();
        expect(openMock).toHaveBeenCalledTimes(1);
        expect(markWhatsAppSentMock).not.toHaveBeenCalled();

        await act(async () => {
            vi.runAllTimers();
        });

        expect(clearCartMock).toHaveBeenCalledTimes(1);
        expect(closeCartMock).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });
});
