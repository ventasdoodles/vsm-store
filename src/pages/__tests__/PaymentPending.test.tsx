import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentPending } from '../PaymentPending';

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

describe('PaymentPending continuity', () => {
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

    it('shows direct mercadopago continuation when the persisted order is still payable', async () => {
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
            <MemoryRouter initialEntries={['/payment/pending?order_id=order-1']}>
                <Routes>
                    <Route path="/payment/pending" element={<PaymentPending />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i })).toBeInTheDocument();
        expect(screen.getByText(/sigue pagable en Mercado Pago/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(createPaymentMock).toHaveBeenCalledWith('order-1');
            expect(assignMock).toHaveBeenCalledWith('https://mp.test/pay/order-1');
        });
    });

    it('does not show mercadopago continuation for non-mercadopago pending orders', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-2',
                order_number: 'VSM-002',
                created_at: '2026-03-25T00:00:00.000Z',
                total: 180,
                items: [{ product_id: 'p2', name: 'Item', price: 180, quantity: 1 }],
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'transfer',
            },
            refetch: refetchMock,
            isFetching: false,
        });

        render(
            <MemoryRouter initialEntries={['/payment/pending?order_id=order-2']}>
                <Routes>
                    <Route path="/payment/pending" element={<PaymentPending />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
    });

    it('switches to paid truth instead of stale pending actions when the persisted order is already paid', () => {
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
            <MemoryRouter initialEntries={['/payment/pending?order_id=order-3']}>
                <Routes>
                    <Route path="/payment/pending" element={<PaymentPending />} />
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
