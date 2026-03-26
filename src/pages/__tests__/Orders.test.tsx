import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Orders } from '../Orders';

const useAuthMock = vi.fn();
const useCustomerOrdersMock = vi.fn();
const notifyErrorMock = vi.fn();
const createPaymentMock = vi.fn();
const reorderOrderMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock('@/hooks/useOrders', () => ({
    useCustomerOrders: (...args: unknown[]) => useCustomerOrdersMock(...args),
    ORDER_STATUS: {
        pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
        confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
        processing: { label: 'Procesando', color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-theme/30' },
        shipped: { label: 'Enviado', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
        delivered: { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
        cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
    },
}));

vi.mock('@/hooks/useAuthenticatedOrderReorder', () => ({
    useAuthenticatedOrderReorder: () => ({
        reorderOrder: reorderOrderMock,
        reorderingOrderId: null,
    }),
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

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
}));

vi.mock('framer-motion', () => ({
    motion: new Proxy(
        {},
        {
            get: () =>
                ({ children, layout: _layout, ...props }: PropsWithChildren<Record<string, unknown> & { layout?: unknown }>) => (
                    <div {...props}>{children}</div>
                ),
        },
    ),
    AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
    useMotionValue: () => ({ set: vi.fn() }),
    useMotionTemplate: () => '',
}));

describe('Orders storefront visibility and self-service', () => {
    const assignMock = vi.fn();

    beforeEach(() => {
        useAuthMock.mockReset();
        useCustomerOrdersMock.mockReset();
        notifyErrorMock.mockReset();
        createPaymentMock.mockReset();
        reorderOrderMock.mockReset();
        assignMock.mockReset();

        useAuthMock.mockReturnValue({
            user: { id: 'user-1' },
        });

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { assign: assignMock },
        });
    });

    it('turns the orders index into a truthful decision surface per persisted order', () => {
        useCustomerOrdersMock.mockReturnValue({
            data: [
                {
                    id: 'order-1',
                    order_number: 'VSM-001',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p1', name: 'Item 1', price: 250, quantity: 1 }],
                    subtotal: 250,
                    shipping_cost: 0,
                    discount: 0,
                    total: 250,
                    status: 'pending',
                    payment_method: 'mercadopago',
                    payment_status: 'pending',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
                {
                    id: 'order-2',
                    order_number: 'VSM-002',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p2', name: 'Item 2', price: 320, quantity: 1 }],
                    subtotal: 320,
                    shipping_cost: 0,
                    discount: 0,
                    total: 320,
                    status: 'processing',
                    payment_method: 'mercadopago',
                    payment_status: 'paid',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
                {
                    id: 'order-3',
                    order_number: 'VSM-003',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p3', name: 'Item 3', price: 180, quantity: 1 }],
                    subtotal: 180,
                    shipping_cost: 0,
                    discount: 0,
                    total: 180,
                    status: 'cancelled',
                    payment_method: 'mercadopago',
                    payment_status: 'failed',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
                {
                    id: 'order-4',
                    order_number: 'VSM-004',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p4', name: 'Item 4', price: 190, quantity: 1 }],
                    subtotal: 190,
                    shipping_cost: 0,
                    discount: 0,
                    total: 190,
                    status: 'pending',
                    payment_method: 'transfer',
                    payment_status: 'pending',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>,
        );

        expect(screen.getAllByText(/Retomar pago pendiente/i)).toHaveLength(2);
        expect(screen.getAllByText(/Seguir pedido liquidado/i)).toHaveLength(2);
        expect(screen.getAllByText(/Revisar antes de actuar/i)).toHaveLength(2);
        expect(screen.getAllByText(/Esperar validacion/i)).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /Reordenar con catalogo actual/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /Continuar pago en Mercado Pago/i })).toHaveLength(1);
        expect(screen.getAllByRole('link', { name: /Ver pedido y revisar pago/i })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: /Ver pedido y seguimiento/i })).toHaveLength(1);
        expect(screen.getAllByRole('link', { name: /Ver pedido y estado real/i })).toHaveLength(1);
    });

    it('can continue mercadopago directly from a payable order card', async () => {
        useCustomerOrdersMock.mockReturnValue({
            data: [
                {
                    id: 'order-1',
                    order_number: 'VSM-001',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p1', name: 'Item 1', price: 250, quantity: 1 }],
                    subtotal: 250,
                    shipping_cost: 0,
                    discount: 0,
                    total: 250,
                    status: 'pending',
                    payment_method: 'mercadopago',
                    payment_status: 'pending',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        createPaymentMock.mockResolvedValue({
            init_point: 'https://mp.test/pay/order-1',
            preference_id: 'pref-1',
        });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(createPaymentMock).toHaveBeenCalledWith('order-1');
            expect(assignMock).toHaveBeenCalledWith('https://mp.test/pay/order-1');
        });
    });

    it('shows an honest error toast when mercadopago cannot be reopened from the orders list', async () => {
        useCustomerOrdersMock.mockReturnValue({
            data: [
                {
                    id: 'order-1',
                    order_number: 'VSM-001',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p1', name: 'Item 1', price: 250, quantity: 1 }],
                    subtotal: 250,
                    shipping_cost: 0,
                    discount: 0,
                    total: 250,
                    status: 'pending',
                    payment_method: 'mercadopago',
                    payment_status: 'pending',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        createPaymentMock.mockRejectedValue(new Error('mp unavailable'));

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(notifyErrorMock).toHaveBeenCalledWith(
                'No se pudo retomar el pago',
                'Tu pedido sigue registrado, pero Mercado Pago no pudo abrirse en este momento.',
            );
        });
    });

    it('routes reorder through the authenticated reorder path from the orders list', async () => {
        useCustomerOrdersMock.mockReturnValue({
            data: [
                {
                    id: 'order-5',
                    order_number: 'VSM-005',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p4', name: 'Item 4', price: 210, quantity: 2 }],
                    subtotal: 420,
                    shipping_cost: 0,
                    discount: 0,
                    total: 420,
                    status: 'processing',
                    payment_method: 'cash',
                    payment_status: 'paid',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        reorderOrderMock.mockResolvedValue(null);

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Reordenar con catalogo actual/i }));

        await waitFor(() => {
            expect(reorderOrderMock).toHaveBeenCalledWith({
                id: 'order-5',
                items: [{ product_id: 'p4', name: 'Item 4', price: 210, quantity: 2 }],
            });
        });
    });

    it('does not offer reorder from the index while a transfer order is still awaiting validation', () => {
        useCustomerOrdersMock.mockReturnValue({
            data: [
                {
                    id: 'order-6',
                    order_number: 'VSM-006',
                    customer_id: 'user-1',
                    items: [{ product_id: 'p6', name: 'Item 6', price: 250, quantity: 1 }],
                    subtotal: 250,
                    shipping_cost: 0,
                    discount: 0,
                    total: 250,
                    status: 'pending',
                    payment_method: 'transfer',
                    payment_status: 'pending',
                    shipping_address_id: null,
                    billing_address_id: null,
                    tracking_notes: null,
                    whatsapp_sent: false,
                    whatsapp_sent_at: null,
                    created_at: '2026-03-25T00:00:00.000Z',
                    updated_at: '2026-03-25T00:00:00.000Z',
                },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>,
        );

        expect(screen.queryByRole('button', { name: /Reordenar con catalogo actual/i })).not.toBeInTheDocument();
        expect(screen.getAllByText(/Esperar validacion/i)).toHaveLength(2);
        expect(screen.getByRole('link', { name: /Ver pedido y estado real/i })).toBeInTheDocument();
    });

    it('does not surface authenticated reorder actions for a guest session', () => {
        useAuthMock.mockReturnValue({
            user: null,
        });
        useCustomerOrdersMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>,
        );

        expect(screen.queryByRole('button', { name: /Reordenar con catalogo actual/i })).not.toBeInTheDocument();
    });
});
