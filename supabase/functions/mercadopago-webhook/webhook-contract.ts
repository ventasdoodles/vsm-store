export interface MercadoPagoWebhookNotification {
    type: string | null;
    paymentId: string | null;
}

export interface MercadoPagoPaymentPayload {
    external_reference?: string | null;
    status?: string | null;
    [key: string]: unknown;
}

export interface OrderAttribution {
    id: string;
    cesarin_session_id?: string | null;
    conversion_source?: string | null;
    total?: number | null;
    payment_status?: string | null;
}

export interface OrderPaymentUpdate {
    payment_status: string;
    status: string;
    mp_payment_id: string;
    mp_payment_data: MercadoPagoPaymentPayload;
    updated_at: string;
}

export interface ConversionEventInsert {
    session_id: string | null;
    event_type: 'payment_completed';
    metadata: {
        source: string;
        order_id: string;
        status: string;
        total: number | null;
    };
}

export interface WebhookContractDeps {
    getPayment(paymentId: string): Promise<MercadoPagoPaymentPayload>;
    getOrderAttribution(orderId: string): Promise<OrderAttribution | null>;
    updateOrderPayment(orderId: string, update: OrderPaymentUpdate): Promise<void>;
    insertConversionEvent(event: ConversionEventInsert): Promise<void>;
    now(): string;
}

export interface WebhookContractResult {
    handled: boolean;
    ignored: boolean;
    reason?: string;
    orderId?: string;
    paymentId?: string;
    paymentStatus?: string;
    orderStatus?: string;
    conversionInserted?: boolean;
}

export interface MercadoPagoWebhookRequestHandlerDeps {
    processWebhook(notification: MercadoPagoWebhookNotification): Promise<WebhookContractResult>;
    log?: Pick<Console, 'log' | 'error'>;
}

export function extractMercadoPagoNotification(url: URL, body: unknown): MercadoPagoWebhookNotification {
    const queryType = url.searchParams.get('topic') || url.searchParams.get('type');
    const queryId = url.searchParams.get('id') || url.searchParams.get('data.id');
    const bodyRecord = body && typeof body === 'object' ? body as Record<string, unknown> : null;
    const bodyType = bodyRecord?.type === 'payment' ? 'payment' : null;
    const bodyData = bodyRecord?.data && typeof bodyRecord.data === 'object'
        ? bodyRecord.data as Record<string, unknown>
        : null;
    const bodyId = typeof bodyData?.id === 'string' || typeof bodyData?.id === 'number'
        ? String(bodyData.id)
        : null;

    return {
        type: queryType || bodyType,
        paymentId: queryId || bodyId,
    };
}

export function resolvePaymentState(status: string | null | undefined): {
    paymentStatus: string;
    orderStatus: string;
} {
    if (status === 'approved') {
        return { paymentStatus: 'paid', orderStatus: 'processing' };
    }

    if (status === 'rejected' || status === 'cancelled') {
        return { paymentStatus: 'failed', orderStatus: 'cancelled' };
    }

    if (status === 'refunded') {
        return { paymentStatus: 'refunded', orderStatus: 'cancelled' };
    }

    return { paymentStatus: 'pending', orderStatus: 'pending' };
}

export async function handleMercadoPagoWebhookRequest(
    req: Request,
    deps: MercadoPagoWebhookRequestHandlerDeps,
): Promise<Response> {
    const logger = deps.log ?? console;

    try {
        const url = new URL(req.url);

        let body = null;
        try {
            body = await req.json();
        } catch {
            // Body might be empty if query params are used.
        }

        const notification = extractMercadoPagoNotification(url, body);

        if (notification.type !== 'payment' || !notification.paymentId) {
            return new Response('OK', { status: 200 });
        }

        const result = await deps.processWebhook(notification);

        if (result.reason === 'missing_external_reference') {
            logger.error('No external_reference found in payment');
            return new Response('OK', { status: 200 });
        }

        logger.log(`Webhook processed for Order ${result.orderId}: Status ${result.paymentStatus}`);

        return new Response('OK', { status: 200 });
    } catch (error) {
        logger.error('Webhook error:', error);
        return new Response('Webhook processing failed', { status: 500 });
    }
}

export async function processMercadoPagoWebhook(
    notification: MercadoPagoWebhookNotification,
    deps: WebhookContractDeps,
): Promise<WebhookContractResult> {
    if (notification.type !== 'payment' || !notification.paymentId) {
        return { handled: false, ignored: true, reason: 'non_payment_event' };
    }

    const payment = await deps.getPayment(notification.paymentId);
    const orderId = typeof payment.external_reference === 'string'
        ? payment.external_reference.trim()
        : '';

    if (!orderId) {
        return {
            handled: true,
            ignored: true,
            reason: 'missing_external_reference',
            paymentId: notification.paymentId,
        };
    }

    const { paymentStatus, orderStatus } = resolvePaymentState(payment.status);
    const orderForAttribution = paymentStatus === 'paid'
        ? await deps.getOrderAttribution(orderId)
        : null;

    await deps.updateOrderPayment(orderId, {
        payment_status: paymentStatus,
        status: orderStatus,
        mp_payment_id: notification.paymentId,
        mp_payment_data: payment,
        updated_at: deps.now(),
    });

    let conversionInserted = false;
    if (paymentStatus === 'paid' && orderForAttribution?.payment_status !== 'paid') {
        await deps.insertConversionEvent({
            session_id: orderForAttribution?.cesarin_session_id ?? null,
            event_type: 'payment_completed',
            metadata: {
                source: orderForAttribution?.conversion_source ?? 'manual',
                order_id: orderId,
                status: paymentStatus,
                total: orderForAttribution?.total ?? null,
            },
        });
        conversionInserted = true;
    }

    return {
        handled: true,
        ignored: false,
        orderId,
        paymentId: notification.paymentId,
        paymentStatus,
        orderStatus,
        conversionInserted,
    };
}
