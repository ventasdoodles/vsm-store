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

/**
 * Resultado JSONB devuelto por la función PL/pgSQL `fulfill_order_payment`.
 * - 'fulfilled': transacción aplicada (update + fulfillment si correspondía).
 * - 'skip': duplicado idempotente o bloqueado por guarda de no-regresión.
 * - 'reject': orden inexistente (p_order_id no matcheó ninguna fila).
 */
export interface FulfillOrderPaymentResult {
    action: 'fulfilled' | 'skip' | 'reject';
    reason?: string;
    order_id?: string;
    stock_decremented?: boolean;
    conversion_inserted?: boolean;
    cesarin_session_id?: string | null;
    conversion_source?: string | null;
    total?: number | null;
}

export interface WebhookContractDeps {
    getPayment(paymentId: string): Promise<MercadoPagoPaymentPayload>;
    getOrderAttribution(orderId: string): Promise<OrderAttribution | null>;
    updateOrderPayment(orderId: string, update: OrderPaymentUpdate): Promise<void>;
    /**
     * UPDATE con guarda de no-regresión para estados no-paid: evita que un webhook
     * tardío 'pending'/'failed' sobrescriba un estado terminal 'paid' o 'refunded'.
     * Sí permite la transición legítima de 'paid' a 'refunded'.
     */
    updateOrderPaymentGuarded(orderId: string, update: OrderPaymentUpdate): Promise<void>;
    /**
     * Fulfillment atómico e idempotente (RPC PL/pgSQL `fulfill_order_payment`).
     * Bloquea la fila de la orden (FOR UPDATE), aplica guardas de idempotencia
     * y no-regresión, actualiza el pago y — solo en la transición hacia 'paid'
     * — decrementa stock e inserta el evento de conversión, todo en una única
     * transacción. Elimina el TOCTOU de doble decremento y la falla parcial
     * irrecuperable de la secuencia previa.
     */
    fulfillOrderPayment(
        orderId: string,
        paymentId: string,
        paymentStatus: string,
        orderStatus: string,
        mpPaymentData: MercadoPagoPaymentPayload,
    ): Promise<FulfillOrderPaymentResult>;
    insertConversionEvent(event: ConversionEventInsert): Promise<void>;
    getOrderItems(orderId: string): Promise<Array<{ product_id: string; variant_id: string | null; quantity: number }>>;
    decrementStock(items: Array<{ product_id: string; variant_id: string | null; quantity: number }>): Promise<void>;
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
    stockDecremented?: boolean;
}

export interface MercadoPagoWebhookRequestHandlerDeps {
    processWebhook(notification: MercadoPagoWebhookNotification): Promise<WebhookContractResult>;
    log?: Pick<Console, 'log' | 'error'>;
}

/**
 * Type guard para el resultado JSONB de `fulfill_order_payment`. Contiene el
 * valor `unknown` devuelto por el cliente de Supabase en el boundary, sin
 * introducir `any` en el contrato.
 */
export function isFulfillOrderPaymentResult(value: unknown): value is FulfillOrderPaymentResult {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return candidate.action === 'fulfilled'
        || candidate.action === 'skip'
        || candidate.action === 'reject';
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
        try { body = await req.json(); } catch { }
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
        ? payment.external_reference.trim() : '';
    if (!orderId) {
        return { handled: true, ignored: true, reason: 'missing_external_reference', paymentId: notification.paymentId };
    }
    const { paymentStatus, orderStatus } = resolvePaymentState(payment.status);

    // Pagos aprobados: fulfillment atómico e idempotente en una sola
    // transacción (lock de fila + guardas + update + stock + conversión).
    // Corrige el TOCTOU de doble decremento y la falla parcial irrecuperable.
    if (paymentStatus === 'paid') {
        const fulfillment = await deps.fulfillOrderPayment(
            orderId,
            notification.paymentId,
            paymentStatus,
            orderStatus,
            payment,
        );
        if (fulfillment.action === 'reject') {
            // Orden inexistente: no es reintentable, se responde 200 para
            // evitar tormentas de reintentos de MP.
            return {
                handled: true,
                ignored: true,
                reason: fulfillment.reason ?? 'order_not_found',
                orderId,
                paymentId: notification.paymentId,
                paymentStatus,
                orderStatus,
                conversionInserted: false,
                stockDecremented: false,
            };
        }
        return {
            handled: true,
            ignored: false,
            orderId,
            paymentId: notification.paymentId,
            paymentStatus,
            orderStatus,
            conversionInserted: fulfillment.conversion_inserted === true,
            stockDecremented: fulfillment.stock_decremented === true,
        };
    }

    // Estados no-paid ('pending' | 'failed' | 'refunded'): update con guarda
    // de no-regresión (nunca sobrescribe 'paid'/'refunded', excepto cuando
    // la nueva transición es legítimamente un 'refunded'). Sin decremento
    // de stock ni evento de conversión.
    await deps.updateOrderPaymentGuarded(orderId, {
        payment_status: paymentStatus, status: orderStatus,
        mp_payment_id: notification.paymentId, mp_payment_data: payment, updated_at: deps.now(),
    });
    return { handled: true, ignored: false, orderId, paymentId: notification.paymentId,
        paymentStatus, orderStatus, conversionInserted: false, stockDecremented: false };
}
