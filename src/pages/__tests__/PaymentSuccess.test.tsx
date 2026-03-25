import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentSuccess } from '../PaymentSuccess';

const clearCartMock = vi.fn();
const useOrderMock = vi.fn();
const refetchMock = vi.fn();
const boundedRefreshMock = vi.fn();

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (selector: (state: { clearCart: typeof clearCartMock }) => unknown) =>
        selector({ clearCart: clearCartMock }),
}));

vi.mock('@/hooks/useOrders', () => ({
    useOrder: (...args: unknown[]) => useOrderMock(...args),
    useBoundedOrderStatusRefresh: (...args: unknown[]) => boundedRefreshMock(...args),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
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
}));

describe('PaymentSuccess cart clear guard', () => {
    beforeEach(() => {
        clearCartMock.mockReset();
        useOrderMock.mockReset();
        refetchMock.mockReset();
        boundedRefreshMock.mockReset();
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
            <MemoryRouter initialEntries={['/payment/success?order_id=order-1']}>
                <Routes>
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(clearCartMock).not.toHaveBeenCalled();
        expect(screen.getByText(/Pago iniciado, pendiente de confirmacion/i)).toBeInTheDocument();
        expect(boundedRefreshMock).toHaveBeenCalledWith({
            enabled: true,
            refetch: refetchMock,
        });
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
            <MemoryRouter initialEntries={['/payment/success?order_id=order-1']}>
                <Routes>
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                </Routes>
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Revisar estado de pago/i }));

        expect(refetchMock).toHaveBeenCalledTimes(1);
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
            <MemoryRouter initialEntries={['/payment/success?order_id=order-2']}>
                <Routes>
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(clearCartMock).toHaveBeenCalledTimes(1);
        expect(boundedRefreshMock).toHaveBeenCalledWith({
            enabled: false,
            refetch: refetchMock,
        });
        expect(screen.queryByRole('button', { name: /Revisar estado de pago/i })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Pago confirmado/i })).toBeInTheDocument();
    });
});
