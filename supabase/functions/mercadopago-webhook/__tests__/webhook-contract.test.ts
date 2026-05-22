import { describe, expect, it, vi } from 'vitest';
import {
    extractMercadoPagoNotification,
    processMercadoPagoWebhook,
    resolvePaymentState,
    type MercadoPagoPaymentPayload,
    type WebhookContractDeps,
} from '../webhook-contract';

function createDeps(payment: MercadoPagoPaymentPayload, existingPaymentStatus: string | null = 'pending') {
    const deps: WebhookContractDeps = {
        getPayment: vi.fn(async () => payment),
        getOrderAttribution: vi.fn(async () => ({
            id: 'order-123',
            cesarin_session_id: 'session-1',
            conversion_source: 'cesarin',
            total: 250,
            payment_status: existingPaymentStatus,
        })),
        updateOrderPayment: vi.fn(async () => undefined),
        insertConversionEvent: vi.fn(async () => undefined),
        now: vi.fn(() => '2026-05-22T19:00:00.000Z'),
    };

    return deps;
}

describe('mercadopago webhook contract', () => {
    it('extracts payment notifications from query params and body payloads', () => {
        expect(extractMercadoPagoNotification(
            new URL('https://example.test/webhook?topic=payment&id=123'),
            null,
        )).toEqual({ type: 'payment', paymentId: '123' });

        expect(extractMercadoPagoNotification(
            new URL('https://example.test/webhook'),
            { type: 'payment', data: { id: 456 } },
        )).toEqual({ type: 'payment', paymentId: '456' });
    });

    it('ignores non-payment events and missing payment ids safely', async () => {
        const deps = createDeps({ external_reference: 'order-123', status: 'approved' });

        await expect(processMercadoPagoWebhook(
            { type: 'merchant_order', paymentId: '123' },
            deps,
        )).resolves.toMatchObject({ handled: false, ignored: true, reason: 'non_payment_event' });

        await expect(processMercadoPagoWebhook(
            { type: 'payment', paymentId: null },
            deps,
        )).resolves.toMatchObject({ handled: false, ignored: true, reason: 'non_payment_event' });

        expect(deps.getPayment).not.toHaveBeenCalled();
        expect(deps.updateOrderPayment).not.toHaveBeenCalled();
        expect(deps.insertConversionEvent).not.toHaveBeenCalled();
    });

    it('updates approved payments to paid and processing with Mercado Pago payload data', async () => {
        const payment = {
            id: 999,
            external_reference: 'order-123',
            status: 'approved',
            transaction_amount: 250,
        };
        const deps = createDeps(payment);

        const result = await processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps);

        expect(result).toMatchObject({
            handled: true,
            ignored: false,
            orderId: 'order-123',
            paymentId: '999',
            paymentStatus: 'paid',
            orderStatus: 'processing',
            conversionInserted: true,
        });
        expect(deps.updateOrderPayment).toHaveBeenCalledWith('order-123', {
            payment_status: 'paid',
            status: 'processing',
            mp_payment_id: '999',
            mp_payment_data: payment,
            updated_at: '2026-05-22T19:00:00.000Z',
        });
        expect(deps.insertConversionEvent).toHaveBeenCalledWith({
            session_id: 'session-1',
            event_type: 'payment_completed',
            metadata: {
                source: 'cesarin',
                order_id: 'order-123',
                status: 'paid',
                total: 250,
            },
        });
    });

    it('keeps status mapping for rejected, cancelled, refunded, and pending payments', () => {
        expect(resolvePaymentState('rejected')).toEqual({ paymentStatus: 'failed', orderStatus: 'cancelled' });
        expect(resolvePaymentState('cancelled')).toEqual({ paymentStatus: 'failed', orderStatus: 'cancelled' });
        expect(resolvePaymentState('refunded')).toEqual({ paymentStatus: 'refunded', orderStatus: 'cancelled' });
        expect(resolvePaymentState('in_process')).toEqual({ paymentStatus: 'pending', orderStatus: 'pending' });
    });

    it('does not update an order when Mercado Pago payment has no external reference', async () => {
        const deps = createDeps({ id: 999, status: 'approved', external_reference: null });

        const result = await processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps);

        expect(result).toMatchObject({
            handled: true,
            ignored: true,
            reason: 'missing_external_reference',
            paymentId: '999',
        });
        expect(deps.updateOrderPayment).not.toHaveBeenCalled();
        expect(deps.insertConversionEvent).not.toHaveBeenCalled();
    });

    it('does not insert duplicate payment_completed conversion events for already-paid orders', async () => {
        const deps = createDeps({
            id: 999,
            external_reference: 'order-123',
            status: 'approved',
        }, 'paid');

        const result = await processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps);

        expect(result).toMatchObject({
            handled: true,
            ignored: false,
            paymentStatus: 'paid',
            conversionInserted: false,
        });
        expect(deps.updateOrderPayment).toHaveBeenCalledTimes(1);
        expect(deps.insertConversionEvent).not.toHaveBeenCalled();
    });
});
