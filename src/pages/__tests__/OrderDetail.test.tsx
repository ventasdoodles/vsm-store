import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderDetail } from '../OrderDetail';

const useOrderMock = vi.fn();
const reorderOrderMock = vi.fn();
const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();
const continuePaymentMock = vi.fn();

vi.mock('@/hooks/useOrders', () => ({
    useOrder: (...args: unknown[]) => useOrderMock(...args),
    useOrderWithCrossSurfaceReconciliation: (...args: unknown[]) => useOrderMock(...args),
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

vi.mock('@/hooks/useStorefrontPaymentReentry', () => ({
    useStorefrontPaymentReentry: () => ({
        continuePayment: continuePaymentMock,
        continuingOrderId: null,
    }),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: notifySuccessMock,
        error: notifyErrorMock,
    }),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: () => null,
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

describe('OrderDetail payment continuation', () => {
    beforeEach(() => {
        useOrderMock.mockReset();
        reorderOrderMock.mockReset();
        notifySuccessMock.mockReset();
        notifyErrorMock.mockReset();
        continuePaymentMock.mockReset();
    });

    it('shows continue payment only for persisted mercadopago pending orders and redirects with the new init point', async () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-1',
                order_number: 'VSM-001',
                customer_id: 'user-1',
                items: [{ product_id: 'p1', name: 'Item', price: 250, quantity: 1 }],
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
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });
        render(
            <MemoryRouter initialEntries={['/orders/order-1']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(continuePaymentMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }));
        });
    });

    it('does not show continue payment for orders that are already paid', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-2',
                order_number: 'VSM-002',
                customer_id: 'user-1',
                items: [{ product_id: 'p2', name: 'Item', price: 320, quantity: 1 }],
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
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });

        render(
            <MemoryRouter initialEntries={['/orders/order-2']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
        expect(screen.getByText(/Pedido liquidado y en curso/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ver historial de pedidos/i })).toBeInTheDocument();
    });

    it('does not show continue payment for cancelled mercadopago orders', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-3',
                order_number: 'VSM-003',
                customer_id: 'user-1',
                items: [{ product_id: 'p3', name: 'Item', price: 180, quantity: 1 }],
                subtotal: 180,
                shipping_cost: 0,
                discount: 0,
                total: 180,
                status: 'cancelled',
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
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });

        render(
            <MemoryRouter initialEntries={['/orders/order-3']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.queryByRole('button', { name: /Continuar pago en Mercado Pago/i })).not.toBeInTheDocument();
    });

    it('suppresses reorder while the persisted order still needs payment continuation', () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-3b',
                order_number: 'VSM-003B',
                customer_id: 'user-1',
                items: [{ product_id: 'p3', name: 'Item', price: 180, quantity: 1 }],
                subtotal: 180,
                shipping_cost: 0,
                discount: 0,
                total: 180,
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
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });

        render(
            <MemoryRouter initialEntries={['/orders/order-3b']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Reordenar con catalogo actual/i })).not.toBeInTheDocument();
    });

    it('delegates continuation through the shared storefront re-entry path', async () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-4',
                order_number: 'VSM-004',
                customer_id: 'user-1',
                items: [{ product_id: 'p4', name: 'Item', price: 250, quantity: 1 }],
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
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });

        render(
            <MemoryRouter initialEntries={['/orders/order-4']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));

        await waitFor(() => {
            expect(continuePaymentMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-4' }));
        });
    });

    it('reorders against the shared authenticated reorder path instead of fabricating products locally', async () => {
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-5',
                order_number: 'VSM-005',
                customer_id: 'user-1',
                items: [{ product_id: 'p5', name: 'Item', price: 250, quantity: 2 }],
                subtotal: 500,
                shipping_cost: 0,
                discount: 0,
                total: 500,
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
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });
        reorderOrderMock.mockResolvedValue(null);

        render(
            <MemoryRouter initialEntries={['/orders/order-5']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Reordenar con catalogo actual/i }));

        await waitFor(() => {
            expect(reorderOrderMock).toHaveBeenCalledWith({
                id: 'order-5',
                items: [{ product_id: 'p5', name: 'Item', price: 250, quantity: 2 }],
            });
        });
    });

    it('renders tracking_number as primary "Número de Guía" and tracking_notes as supplemental "Notas de Envío", and copies the correct value', async () => {
        const tracking_number = 'VSM-GUIDE-123';
        const tracking_notes = 'Carrier note: leave at front desk';
        useOrderMock.mockReturnValue({
            data: {
                id: 'order-6',
                order_number: 'VSM-006',
                customer_id: 'user-1',
                items: [{ product_id: 'p6', name: 'Item', price: 100, quantity: 1 }],
                subtotal: 100,
                shipping_cost: 0,
                discount: 0,
                total: 100,
                status: 'processing',
                payment_method: 'cash',
                payment_status: 'paid',
                shipping_address_id: null,
                billing_address_id: null,
                tracking_number,
                tracking_notes,
                whatsapp_sent: false,
                whatsapp_sent_at: null,
                created_at: '2026-03-25T00:00:00.000Z',
                updated_at: '2026-03-25T00:00:00.000Z',
            },
            isLoading: false,
            refetch: vi.fn(),
            isFetching: false,
        });

        // Mock clipboard
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        render(
            <MemoryRouter initialEntries={['/orders/order-6']}>
                <Routes>
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Routes>
            </MemoryRouter>,
        );

        // 1. Assert Section Headers
        expect(screen.getByText(/Seguimiento/i)).toBeInTheDocument();
        expect(screen.getByText(/Número de Guía/i)).toBeInTheDocument();
        expect(screen.getByText(/Notas de Envío/i)).toBeInTheDocument();

        // 2. Assert Values
        expect(screen.getByText(tracking_number)).toBeInTheDocument();
        expect(screen.getByText(tracking_notes)).toBeInTheDocument();

        // 3. Test Copy Behavior
        const copyButtons = screen.getAllByRole('button').filter(btn => {
            // Looking for the copy button which is co-located with tracking number
            // It uses a Copy icon (size 16), which we can't easily query by role name
            // but it's the one that calls clipboard.writeText
            return btn.querySelector('svg');
        });

        // In OrderDetail, the first such button in tracking section is the copy guide button
        fireEvent.click(copyButtons[0]);

        expect(writeTextMock).toHaveBeenCalledWith(tracking_number);
        expect(writeTextMock).not.toHaveBeenCalledWith(tracking_notes);
        expect(notifySuccessMock).toHaveBeenCalledWith('Copiado', 'Número de guía listo.');
    });
});
