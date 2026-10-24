// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitCheckout } from '../checkout';

const {
    invokeCheckoutSubmitMock,
    createMercadoPagoPaymentMock,
    emitConversationConversionEventMock,
} = vi.hoisted(() => ({
    invokeCheckoutSubmitMock: vi.fn(),
    createMercadoPagoPaymentMock: vi.fn(),
    emitConversationConversionEventMock: vi.fn(),
}));

vi.mock('@/services/orders.service', () => ({
    invokeCheckoutSubmit: (...args: unknown[]) => invokeCheckoutSubmitMock(...args),
}));

vi.mock('@/services/payments/mercadopago.service', () => ({
    createMercadoPagoPayment: (...args: unknown[]) => createMercadoPagoPaymentMock(...args),
}));

vi.mock('@/lib/conversion-measurement', () => ({
    emitConversationConversionEvent: (...args: unknown[]) => emitConversationConversionEventMock(...args),
}));

describe('submitCheckout', () => {
    beforeEach(() => {
        invokeCheckoutSubmitMock.mockReset();
        createMercadoPagoPaymentMock.mockReset();
        emitConversationConversionEventMock.mockReset();
    });

    it('returns a ready payment continuation when Mercado Pago init_point is available', async () => {
        invokeCheckoutSubmitMock.mockResolvedValueOnce({
            data: { ok: true, orderId: 'order-123' },
            error: null,
        });
        createMercadoPagoPaymentMock.mockResolvedValueOnce({
            init_point: 'https://mp.test/pay/order-123',
            preference_id: 'pref-123',
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
            cesarinSessionId: 'session-checkout-1',
            conversionSource: 'cesarin',
        });

        expect(result).toEqual({
            ok: true,
            orderId: 'order-123',
            paymentContinuation: 'ready',
            paymentInitPoint: 'https://mp.test/pay/order-123',
        });
        expect(invokeCheckoutSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                cesarinSessionId: 'session-checkout-1',
                conversionSource: 'cesarin',
            })
        );
        expect(createMercadoPagoPaymentMock).toHaveBeenCalledWith('order-123');
        expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
            sessionId: 'session-checkout-1',
            eventType: 'order_created',
            metadata: {
                source: 'cesarin',
                order_id: 'order-123',
                payment_method: 'mercadopago',
            },
        });
    });

    it('returns an unavailable continuation when payment init cannot be created after persistence', async () => {
        invokeCheckoutSubmitMock.mockResolvedValueOnce({
            data: { ok: true, orderId: 'order-123' },
            error: null,
        });
        createMercadoPagoPaymentMock.mockRejectedValueOnce(new Error('boom'));

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
        invokeCheckoutSubmitMock.mockResolvedValueOnce({
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
        expect(invokeCheckoutSubmitMock).toHaveBeenCalledTimes(1);
        expect(createMercadoPagoPaymentMock).not.toHaveBeenCalled();
    });

    it('preserves reused pending order guidance for non-Mercado Pago checkout', async () => {
        invokeCheckoutSubmitMock.mockResolvedValueOnce({
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
        expect(invokeCheckoutSubmitMock).toHaveBeenCalledTimes(1);
        expect(createMercadoPagoPaymentMock).not.toHaveBeenCalled();
    });

    it('keeps reused pending Mercado Pago orders on the bounded continuation path', async () => {
        invokeCheckoutSubmitMock.mockResolvedValueOnce({
            data: {
                ok: true,
                orderId: 'order-123',
                reusedPendingOrder: true,
                message: 'Ya existe una orden pendiente para este checkout. Retomaremos esa orden y su estado real.',
            },
            error: null,
        });
        createMercadoPagoPaymentMock.mockResolvedValueOnce({
            init_point: 'https://mp.test/pay/order-123',
            preference_id: 'pref-123',
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
        expect(createMercadoPagoPaymentMock).toHaveBeenCalledWith('order-123');
    });
});
