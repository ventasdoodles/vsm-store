import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStorefrontPaymentReentry } from '../useStorefrontPaymentReentry';

const navigateMock = vi.fn();
const warningMock = vi.fn();
const errorMock = vi.fn();
const getOrderByIdMock = vi.fn();
const createPaymentMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        warning: warningMock,
        error: errorMock,
    }),
}));

vi.mock('@/services', () => ({
    getOrderById: (...args: unknown[]) => getOrderByIdMock(...args),
}));

vi.mock('@/services/payments/mercadopago.service', () => ({
    mercadopagoService: {
        createPayment: (...args: unknown[]) => createPaymentMock(...args),
    },
}));

describe('useStorefrontPaymentReentry', () => {
    const assignMock = vi.fn();

    const pendingOrder = {
        id: 'order-1',
        order_number: 'VSM-001',
        customer_id: 'user-1',
        items: [{ product_id: 'prod-1', name: 'Item', price: 150, quantity: 1 }],
        subtotal: 150,
        shipping_cost: 0,
        discount: 0,
        total: 150,
        status: 'pending',
        payment_method: 'mercadopago',
        payment_status: 'pending',
        shipping_address_id: null,
        billing_address_id: null,
        tracking_notes: null,
        whatsapp_sent: false,
        whatsapp_sent_at: null,
        created_at: '2026-03-26T00:00:00.000Z',
        updated_at: '2026-03-26T00:00:00.000Z',
    };

    beforeEach(() => {
        navigateMock.mockReset();
        warningMock.mockReset();
        errorMock.mockReset();
        getOrderByIdMock.mockReset();
        createPaymentMock.mockReset();
        assignMock.mockReset();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { assign: assignMock },
        });
    });

    it('revalidates persisted truth before reopening Mercado Pago', async () => {
        getOrderByIdMock.mockResolvedValue(pendingOrder);
        createPaymentMock.mockResolvedValue({
            init_point: 'https://mp.test/pay/order-1',
            preference_id: 'pref-1',
        });

        const { result } = renderHook(() => useStorefrontPaymentReentry());

        await act(async () => {
            await result.current.continuePayment(pendingOrder);
        });

        await waitFor(() => {
            expect(getOrderByIdMock).toHaveBeenCalledWith('order-1');
            expect(createPaymentMock).toHaveBeenCalledWith('order-1');
            expect(assignMock).toHaveBeenCalledWith('https://mp.test/pay/order-1');
        });
    });

    it('blocks re-entry when fresh persisted truth is no longer payable', async () => {
        getOrderByIdMock.mockResolvedValue({
            ...pendingOrder,
            payment_status: 'paid',
            status: 'processing',
        });

        const { result } = renderHook(() => useStorefrontPaymentReentry());

        await act(async () => {
            await result.current.continuePayment(pendingOrder);
        });

        await waitFor(() => {
            expect(createPaymentMock).not.toHaveBeenCalled();
            expect(warningMock).toHaveBeenCalledWith(
                'Pago no disponible',
                'El pago de esta orden ya figura confirmado. Revisa el detalle persistido en lugar de intentar abrir otro cobro.',
            );
            expect(navigateMock).toHaveBeenCalledWith('/orders/order-1');
        });
    });

    it('clears continuingOrderId when fresh persisted truth blocks re-entry', async () => {
        getOrderByIdMock.mockResolvedValue({
            ...pendingOrder,
            payment_status: 'paid',
            status: 'processing',
        });

        const { result } = renderHook(() => useStorefrontPaymentReentry());

        await act(async () => {
            await result.current.continuePayment(pendingOrder);
        });

        await waitFor(() => {
            expect(result.current.continuingOrderId).toBeNull();
            expect(createPaymentMock).not.toHaveBeenCalled();
        });
    });

    it('clears continuingOrderId when fresh order is not found', async () => {
        getOrderByIdMock.mockResolvedValue(null);

        const { result } = renderHook(() => useStorefrontPaymentReentry());

        await act(async () => {
            await result.current.continuePayment(pendingOrder);
        });

        await waitFor(() => {
            expect(result.current.continuingOrderId).toBeNull();
            expect(warningMock).toHaveBeenCalledWith(
                'Pedido no disponible',
                'No pudimos confirmar el estado actual del pedido. Revisa el detalle persistido antes de intentar otro pago.',
            );
            expect(navigateMock).toHaveBeenCalledWith('/orders');
        });
    });
});
