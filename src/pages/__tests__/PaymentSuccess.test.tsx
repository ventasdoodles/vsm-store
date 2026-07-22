import { TestRouter } from '@/lib/test-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentSuccess } from '../PaymentSuccess';

const clearCartMock = vi.fn();
const useOrderMock = vi.fn();
const refetchMock = vi.fn();
const boundedRefreshMock = vi.fn();
const continuePaymentMock = vi.fn();

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (selector: (state: { clearCart: typeof clearCartMock }) => unknown) =>
        selector({ clearCart: clearCartMock }),
}));

vi.mock('@/hooks/useOrders', () => ({
    useOrder: (...args: unknown[]) => useOrderMock(...args),
    useOrderWithCrossSurfaceReconciliation: (...args: unknown[]) => useOrderMock(...args),
    useBoundedOrderStatusRefresh: (...args: unknown[]) => boundedRefreshMock(...args),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        error: vi.fn(),
    }),
}));

vi.mock('@/hooks/useStorefrontPaymentReentry', () => ({
    useStorefrontPaymentReentry: () => ({
        continuePayment: continuePaymentMock,
        continuingOrderId: null,
    }),
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));


describe('PaymentSuccess cart clear guard', () => {
    beforeEach(() => {
        clearCartMock.mockReset();
        useOrderMock.mockReset();
        refetchMock.mockReset();
        boundedRefreshMock.mockReset();
        continuePaymentMock.mockReset();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('does not clear the cart when persisted payment truth is still pending', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-1',
                order_number: 'VSM-001',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 250,
                items: [{ product_id: 'p1', name: 'Item', price: 250, quantity: 1 }],
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <TestRouter initialEntries={['/payment/success?order_id=order-1']} path="/payment/success"><PaymentSuccess /></TestRouter>,
        );

        expect(clearCartMock).not.toHaveBeenCalled();
        expect(screen.getByText(/Pago iniciado, pendiente de confirmacion/i)).toBeInTheDocument();
        expect(screen.getByText(/Pedido existente, pago por retomar/i)).toBeInTheDocument();
        expect(screen.getByText(/Resumen persistido/i)).toBeInTheDocument();
        expect(screen.getByText(/Pedido registrado, cobro todavia por completar/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ver historial de pedidos/i })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /Ver pedido y revisar pago/i })).toHaveLength(2);
        expect(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i })).toBeInTheDocument();
    });

    it('allows a manual payment status recheck while payment is not yet paid', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-1',
                order_number: 'VSM-001',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 250,
                items: [{ product_id: 'p1', name: 'Item', price: 250, quantity: 1 }],
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <TestRouter initialEntries={['/payment/success?order_id=order-1']} path="/payment/success"><PaymentSuccess /></TestRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Revisar estado de pago/i }));

        expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it('can reopen mercadopago directly from a persisted pending success surface', async () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-1',
                order_number: 'VSM-001',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 250,
                items: [{ product_id: 'p1', name: 'Item', price: 250, quantity: 1 }],
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });
        render(
            <TestRouter initialEntries={['/payment/success?order_id=order-1']} path="/payment/success"><PaymentSuccess /></TestRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await Promise.resolve();

        expect(continuePaymentMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }));
    });

    it('clears the cart only when persisted payment truth is paid', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-2',
                order_number: 'VSM-002',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 320,
                items: [{ product_id: 'p2', name: 'Item', price: 320, quantity: 1 }],
                status: 'processing',
                payment_status: 'paid',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <TestRouter initialEntries={['/payment/success?order_id=order-2']} path="/payment/success"><PaymentSuccess /></TestRouter>,
        );

        expect(clearCartMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: /Revisar estado de pago/i })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Pago confirmado/i })).toBeInTheDocument();
        expect(screen.getByText(/Pedido existente y pago confirmado/i)).toBeInTheDocument();
        expect(screen.getByText(/Pedido y pago confirmados/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ver historial de pedidos/i })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /Ver pedido y seguimiento/i })).toHaveLength(2);
        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
    });
});
