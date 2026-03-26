import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentFailure } from '../PaymentFailure';

const useOrderMock = vi.fn();
const refetchMock = vi.fn();
const boundedRefreshMock = vi.fn();
const notifyErrorMock = vi.fn();
const createPaymentMock = vi.fn();

vi.mock('@/hooks/useOrders', () => ({
    useOrder: (...args: unknown[]) => useOrderMock(...args),
    useBoundedOrderStatusRefresh: (...args: unknown[]) => boundedRefreshMock(...args),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        error: notifyErrorMock,
    }),
}));

vi.mock('@/services/payments/mercadopago.service', () => ({
    mercadopagoService: {
        createPayment: (...args: unknown[]) => createPaymentMock(...args),
    },
}));

describe('PaymentFailure continuity', () => {
    const assignMock = vi.fn();

    beforeEach(() => {
        useOrderMock.mockReset();
        refetchMock.mockReset();
        boundedRefreshMock.mockReset();
        notifyErrorMock.mockReset();
        createPaymentMock.mockReset();
        assignMock.mockReset();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { assign: assignMock },
        });
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
        createPaymentMock.mockResolvedValue({
            init_point: 'https://mp.test/pay/order-1',
            preference_id: 'pref-1',
        });

        render(
            <MemoryRouter initialEntries={['/payment/failure?order_id=order-1']}>
                <Routes>
                    <Route path="/payment/failure" element={<PaymentFailure />} />
                </Routes>
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(createPaymentMock).toHaveBeenCalledWith('order-1');
            expect(assignMock).toHaveBeenCalledWith('https://mp.test/pay/order-1');
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
            <MemoryRouter initialEntries={['/payment/failure?order_id=order-2']}>
                <Routes>
                    <Route path="/payment/failure" element={<PaymentFailure />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ver pedido y revisar pago/i })).toBeInTheDocument();
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
            <MemoryRouter initialEntries={['/payment/failure?order_id=order-3']}>
                <Routes>
                    <Route path="/payment/failure" element={<PaymentFailure />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: /Pago confirmado/i })).toBeInTheDocument();
        expect(screen.getByText(/Pedido existente y pago confirmado/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ver pedido y seguimiento/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Revisar estado de pago/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
    });
});
