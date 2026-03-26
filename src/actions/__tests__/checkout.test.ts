import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitCheckout } from '../checkout';

const { invokeMock } = vi.hoisted(() => ({
    invokeMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        functions: {
            invoke: invokeMock,
        },
    },
}));

describe('submitCheckout', () => {
    beforeEach(() => {
        invokeMock.mockReset();
    });

    it('returns a ready payment continuation when Mercado Pago init_point is available', async () => {
        invokeMock
            .mockResolvedValueOnce({
                data: { ok: true, orderId: 'order-123' },
                error: null,
            })
            .mockResolvedValueOnce({
                data: { init_point: 'https://mp.test/pay/order-123', preference_id: 'pref-123' },
                error: null,
            });

        const result = await submitCheckout({
            form: {
                customerName: 'Juan Perez',
                customerPhone: '7441234567',
                deliveryType: 'pickup',
                address: '',
                paymentMethod: 'mercadopago',
            },
            items: [{ product_id: 'prod-1', quantity: 1 }],
        });

        expect(result).toEqual({
            ok: true,
            orderId: 'order-123',
            paymentContinuation: 'ready',
            paymentInitPoint: 'https://mp.test/pay/order-123',
        });
        expect(invokeMock).toHaveBeenNthCalledWith(1, 'checkout-submit', expect.any(Object));
        expect(invokeMock).toHaveBeenNthCalledWith(2, 'create-payment', {
            body: { order_id: 'order-123' },
        });
    });

    it('returns an unavailable continuation when payment init cannot be created after persistence', async () => {
        invokeMock
            .mockResolvedValueOnce({
                data: { ok: true, orderId: 'order-123' },
                error: null,
            })
            .mockResolvedValueOnce({
                data: null,
                error: { message: 'boom' },
            });

        const result = await submitCheckout({
            form: {
                customerName: 'Juan Perez',
                customerPhone: '7441234567',
                deliveryType: 'pickup',
                address: '',
                paymentMethod: 'mercadopago',
            },
            items: [{ product_id: 'prod-1', quantity: 1 }],
        });

        expect(result).toEqual({
            ok: true,
            orderId: 'order-123',
            paymentContinuation: 'unavailable',
            message: 'Tu pedido fue creado, pero no se pudo iniciar Mercado Pago. Puedes retomarlo desde el detalle del pedido.',
        });
    });

    it('marks non-Mercado Pago checkout as not requesting payment continuation', async () => {
        invokeMock.mockResolvedValueOnce({
            data: { ok: true, orderId: 'order-123' },
            error: null,
        });

        const result = await submitCheckout({
            form: {
                customerName: 'Juan Perez',
                customerPhone: '7441234567',
                deliveryType: 'pickup',
                address: '',
                paymentMethod: 'transfer',
            },
            items: [{ product_id: 'prod-1', quantity: 1 }],
        });

        expect(result).toEqual({
            ok: true,
            orderId: 'order-123',
            paymentContinuation: 'not_requested',
        });
        expect(invokeMock).toHaveBeenCalledTimes(1);
    });

    it('preserves reused pending order guidance for non-Mercado Pago checkout', async () => {
        invokeMock.mockResolvedValueOnce({
            data: {
                ok: true,
                orderId: 'order-123',
                reusedPendingOrder: true,
                message: 'Ya existe una orden pendiente para este checkout. Continua con esa orden y revisa su estado antes de enviar otro pedido.',
            },
            error: null,
        });

        const result = await submitCheckout({
            form: {
                customerName: 'Juan Perez',
                customerPhone: '7441234567',
                deliveryType: 'pickup',
                address: '',
                paymentMethod: 'transfer',
            },
            items: [{ product_id: 'prod-1', quantity: 1 }],
        });

        expect(result).toEqual({
            ok: true,
            orderId: 'order-123',
            reusedPendingOrder: true,
            message: 'Ya existe una orden pendiente para este checkout. Continua con esa orden y revisa su estado antes de enviar otro pedido.',
            paymentContinuation: 'not_requested',
        });
        expect(invokeMock).toHaveBeenCalledTimes(1);
    });

    it('keeps reused pending Mercado Pago orders on the bounded continuation path', async () => {
        invokeMock
            .mockResolvedValueOnce({
                data: {
                    ok: true,
                    orderId: 'order-123',
                    reusedPendingOrder: true,
                    message: 'Ya existe una orden pendiente para este checkout. Retomaremos esa orden y su estado real.',
                },
                error: null,
            })
            .mockResolvedValueOnce({
                data: { init_point: 'https://mp.test/pay/order-123', preference_id: 'pref-123' },
                error: null,
            });

        const result = await submitCheckout({
            form: {
                customerName: 'Juan Perez',
                customerPhone: '7441234567',
                deliveryType: 'pickup',
                address: '',
                paymentMethod: 'mercadopago',
            },
            items: [{ product_id: 'prod-1', quantity: 1 }],
        });

        expect(result).toEqual({
            ok: true,
            orderId: 'order-123',
            reusedPendingOrder: true,
            paymentContinuation: 'ready',
            paymentInitPoint: 'https://mp.test/pay/order-123',
        });
        expect(invokeMock).toHaveBeenNthCalledWith(2, 'create-payment', {
            body: { order_id: 'order-123' },
        });
    });
});
