// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import {
    extractMercadoPagoNotification,
    handleMercadoPagoWebhookRequest,
    processMercadoPagoWebhook,
    resolvePaymentState,
    type MercadoPagoPaymentPayload,
    type WebhookContractDeps,
} from '../webhook-contract';

function createDeps(payment: MercadoPagoPaymentPayload, existingPaymentStatus: string | null = 'pending') {
    const isAlreadyPaid = existingPaymentStatus === 'paid';
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
        updateOrderPaymentGuarded: vi.fn(async () => undefined),
        fulfillOrderPayment: vi.fn(async () => ({
            action: isAlreadyPaid ? 'skip' : 'fulfilled',
            order_id: 'order-123',
            paymentId: '999',
            paymentStatus: 'paid',
            orderStatus: 'processing',
            stock_decremented: !isAlreadyPaid,
            conversion_inserted: !isAlreadyPaid,
        })),
        insertConversionEvent: vi.fn(async () => undefined),
        getOrderItems: vi.fn(async () => [
            { product_id: 'prod-1', variant_id: null, quantity: 2 },
        ]),
        decrementStock: vi.fn(async () => undefined),
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
        expect(deps.fulfillOrderPayment).not.toHaveBeenCalled();
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
            stockDecremented: true,
        });
        expect(deps.fulfillOrderPayment).toHaveBeenCalledWith('order-123', '999', 'paid', 'processing', payment);
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
        expect(deps.fulfillOrderPayment).not.toHaveBeenCalled();
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
            stockDecremented: false,
        });
        expect(deps.fulfillOrderPayment).toHaveBeenCalledTimes(1);
    });

    it('decrements stock atomically when payment transitions from pending to paid', async () => {
        const payment = {
            id: 999,
            external_reference: 'order-123',
            status: 'approved',
            transaction_amount: 250,
        };
        const deps = createDeps(payment);

        const result = await processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps);

        expect(result.stockDecremented).toBe(true);
        expect(deps.fulfillOrderPayment).toHaveBeenCalledWith('order-123', '999', 'paid', 'processing', payment);
    });

    it('does NOT decrement stock when order is already paid (idempotency)', async () => {
        const deps = createDeps({
            id: 999,
            external_reference: 'order-123',
            status: 'approved',
        }, 'paid');

        const result = await processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps);

        expect(result.stockDecremented).toBe(false);
        expect(deps.fulfillOrderPayment).toHaveBeenCalledTimes(1);
    });

    it('surfaces fulfillOrderPayment failures instead of accepting the webhook as successful', async () => {
        const deps = createDeps({
            id: 999,
            external_reference: 'order-123',
            status: 'approved',
        });
        vi.mocked(deps.fulfillOrderPayment).mockRejectedValueOnce(new Error('RPC fulfill_order_payment failed'));

        await expect(processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps))
            .rejects.toThrow('RPC fulfill_order_payment failed');

        expect(deps.fulfillOrderPayment).toHaveBeenCalledTimes(1);
    });

    it('surfaces guarded order update failures for non-paid payments', async () => {
        const deps = createDeps({
            id: 999,
            external_reference: 'order-123',
            status: 'rejected',
        });
        vi.mocked(deps.updateOrderPaymentGuarded).mockRejectedValueOnce(new Error('orders update failed'));

        await expect(processMercadoPagoWebhook({ type: 'payment', paymentId: '999' }, deps))
            .rejects.toThrow('orders update failed');

        expect(deps.updateOrderPaymentGuarded).toHaveBeenCalledTimes(1);
    });
});

describe('mercadopago webhook request handler', () => {
    function createHandlerDeps() {
        return {
            processWebhook: vi.fn(async () => ({
                handled: true,
                ignored: false,
                orderId: 'order-123',
                paymentId: '999',
                paymentStatus: 'paid',
                orderStatus: 'processing',
                conversionInserted: true,
            })),
            log: {
                log: vi.fn(),
                error: vi.fn(),
            },
        };
    }

    it('returns 500 when webhook processing throws', async () => {
        const deps = createHandlerDeps();
        deps.processWebhook.mockRejectedValueOnce(new Error('processing failed'));

        const response = await handleMercadoPagoWebhookRequest(
            new Request('https://example.test/webhook?topic=payment&id=999'),
            deps,
        );

        await expect(response.text()).resolves.toBe('Webhook processing failed');
        expect(response.status).toBe(500);
        expect(deps.log.error).toHaveBeenCalledWith('Webhook error:', expect.any(Error));
    });

    it('keeps non-payment or missing payment id requests acknowledged without processing', async () => {
        const deps = createHandlerDeps();

        const response = await handleMercadoPagoWebhookRequest(
            new Request('https://example.test/webhook?topic=merchant_order&id=999'),
            deps,
        );

        await expect(response.text()).resolves.toBe('OK');
        expect(response.status).toBe(200);
        expect(deps.processWebhook).not.toHaveBeenCalled();
    });

    it('keeps missing external_reference acknowledged without false failure', async () => {
        const deps = createHandlerDeps();
        deps.processWebhook.mockResolvedValueOnce({
            handled: true,
            ignored: true,
            reason: 'missing_external_reference',
            paymentId: '999',
        });

        const response = await handleMercadoPagoWebhookRequest(
            new Request('https://example.test/webhook?topic=payment&id=999'),
            deps,
        );

        await expect(response.text()).resolves.toBe('OK');
        expect(response.status).toBe(200);
        expect(deps.log.error).toHaveBeenCalledWith('No external_reference found in payment');
    });
});


