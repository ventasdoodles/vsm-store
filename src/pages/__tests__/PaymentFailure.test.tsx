import { TestRouter } from '@/lib/test-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentFailure } from '../PaymentFailure';

const useOrderMock = vi.fn();
const refetchMock = vi.fn();
const boundedRefreshMock = vi.fn();
const continuePaymentMock = vi.fn();

vi.mock('@/hooks/useOrders', () => ({
    useOrder: (...args: unknown[]) => useOrderMock(...args),
    useOrderWithCrossSurfaceReconciliation: (...args: unknown[]) => useOrderMock(...args),
    useBoundedOrderStatusRefresh: (...args: unknown[]) => boundedRefreshMock(...args),
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

describe('PaymentFailure continuity', () => {
    beforeEach(() => {
        useOrderMock.mockReset();
        refetchMock.mockReset();
        boundedRefreshMock.mockReset();
        continuePaymentMock.mockReset();
    });

    it('still offers direct mercadopago continuation when persisted truth says the order is payable', async () => {
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
            <TestRouter initialEntries={['/payment/failure?order_id=order-1']} path="/payment/failure"><PaymentFailure /></TestRouter>,
        );

        expect(screen.getByText(/Resumen persistido/i)).toBeInTheDocument();
        expect(screen.getByText(/Pedido registrado, cobro todavia por completar/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ver historial de pedidos/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(continuePaymentMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }));
        });
    });

    it('does not show direct continuation for non-payable failed orders', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-2',
                order_number: 'VSM-002',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 180,
                items: [{ product_id: 'p2', name: 'Item', price: 180, quantity: 1 }],
                status: 'cancelled',
                payment_status: 'failed',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <TestRouter initialEntries={['/payment/failure?order_id=order-2']} path="/payment/failure"><PaymentFailure /></TestRouter>,
        );

        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /Ver pedido y revisar pago/i })).toHaveLength(2);
    });

    it('does not show confirmed success or payment continuation for rejected persisted payment truth', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-4',
                order_number: 'VSM-004',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 180,
                items: [{ product_id: 'p4', name: 'Item', price: 180, quantity: 1 }],
                status: 'pending',
                payment_status: 'rejected',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <TestRouter initialEntries={['/payment/failure?order_id=order-4']} path="/payment/failure"><PaymentFailure /></TestRouter>,
        );

        expect(screen.getByRole('heading', { name: /Pago no confirmado/i })).toBeInTheDocument();
        expect(screen.queryByText(/Pedido y pago confirmados/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /Ver pedido y revisar pago/i })).toHaveLength(2);
    });

    it('drops failure-route chrome when persisted truth is already paid', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-3',
                order_number: 'VSM-003',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 180,
                items: [{ product_id: 'p3', name: 'Item', price: 180, quantity: 1 }],
                status: 'processing',
                payment_status: 'paid',
                payment_method: 'mercadopago',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <TestRouter initialEntries={['/payment/failure?order_id=order-3']} path="/payment/failure"><PaymentFailure /></TestRouter>,
        );

        expect(screen.getByRole('heading', { name: /Pago confirmado/i })).toBeInTheDocument();
        expect(screen.getByText(/Pedido existente y pago confirmado/i)).toBeInTheDocument();
        expect(screen.getByText(/Pedido y pago confirmados/i)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /Ver pedido y seguimiento/i })).toHaveLength(2);
        expect(screen.getByRole('link', { name: /Ver historial de pedidos/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Revisar estado de pago/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
    });
});
