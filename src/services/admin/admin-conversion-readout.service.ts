import { supabase } from '@/lib/supabase';

export type ConversionFunnelEventType =
    | 'ai_cta_rendered'
    | 'ai_cta_clicked'
    | 'cart_mutation_result'
    | 'cart_opened'
    | 'checkout_started'
    | 'order_created'
    | 'payment_completed';

export type ConversionPathSource = 'cesarin' | 'manual' | 'unknown';

export interface ConversionEventRow {
    id: string;
    session_id: string | null;
    event_type: string;
    timestamp: string;
    metadata: Record<string, unknown> | null;
}

export interface ConversionOrderRow {
    id: string;
    cesarin_session_id: string | null;
    conversion_source: string | null;
    total: number | null;
    status: string | null;
    payment_status: string | null;
    created_at: string;
}

export interface ConversionProductRow {
    id: string;
    name: string;
}

export interface ConversionFunnelStage {
    key: 'ai_cta_rendered' | 'ai_cta_clicked' | 'cart_progress' | 'checkout_started' | 'order_created' | 'payment_completed';
    label: string;
    count: number;
    rateFromSessions: number;
}

export interface ConversionProductSummary {
    productId: string;
    productName: string | null;
    renderedCount: number;
    clickedCount: number;
    cartMutationCount: number;
    orderCount: number;
}

export interface ConversionSessionReadout {
    sessionKey: string;
    sessionId: string | null;
    source: ConversionPathSource;
    firstEventAt: string | null;
    lastEventAt: string | null;
    eventCount: number;
    ctaKinds: string[];
    productIds: string[];
    productNames: string[];
    cartMutationResults: string[];
    orderIds: string[];
    hasAiCtaRendered: boolean;
    hasAiCtaClicked: boolean;
    hasCartProgress: boolean;
    hasCheckoutStarted: boolean;
    hasOrderCreated: boolean;
    hasPaymentCompleted: boolean;
    dropOffKey:
        | 'payment_completed'
        | 'order_pending_payment'
        | 'checkout_no_order'
        | 'cart_progress_no_checkout'
        | 'cta_clicked_no_cart_progress'
        | 'cta_rendered_not_clicked'
        | 'missing_ai_cta_render'
        | 'manual_path_no_ai_cta'
        | 'no_events';
    dropOffLabel: string;
    dataQuality: string[];
}

export interface ConversionFunnelReadout {
    generatedAt: string;
    totalEvents: number;
    totalSessions: number;
    probeTraffic: {
        excludedProbeEvents: number;
        excludedProbeSessions: number;
        excludedProbeOrders: number;
    };
    sourceCounts: Record<ConversionPathSource, number>;
    eventTypeCounts: Record<ConversionFunnelEventType, number>;
    ctaKindCounts: Record<string, number>;
    cartMutationResultCounts: Record<string, number>;
    dropOffCounts: Record<ConversionSessionReadout['dropOffKey'], number>;
    funnelStages: ConversionFunnelStage[];
    productSummaries: ConversionProductSummary[];
    sessions: ConversionSessionReadout[];
}

interface BuildReadoutInput {
    events: ConversionEventRow[];
    orders?: ConversionOrderRow[];
    products?: ConversionProductRow[];
    generatedAt?: string;
    includeProbeTraffic?: boolean;
}

interface MutableSession {
    sessionKey: string;
    sessionId: string | null;
    sourceSignals: ConversionPathSource[];
    firstEventAt: string | null;
    lastEventAt: string | null;
    eventCount: number;
    ctaKinds: Set<string>;
    productIds: Set<string>;
    productNames: Set<string>;
    cartMutationResults: Set<string>;
    orderIds: Set<string>;
    hasAiCtaRendered: boolean;
    hasAiCtaClicked: boolean;
    hasCartProgress: boolean;
    hasCheckoutStarted: boolean;
    hasOrderCreated: boolean;
    hasPaymentCompleted: boolean;
    dataQuality: Set<string>;
}

const FUNNEL_LABELS: Record<ConversionFunnelStage['key'], string> = {
    ai_cta_rendered: 'CTA mostrado',
    ai_cta_clicked: 'CTA clickeado',
    cart_progress: 'Carrito tocado',
    checkout_started: 'Checkout iniciado',
    order_created: 'Orden creada',
    payment_completed: 'Pago completado',
};

const EVENT_TYPES: ConversionFunnelEventType[] = [
    'ai_cta_rendered',
    'ai_cta_clicked',
    'cart_mutation_result',
    'cart_opened',
    'checkout_started',
    'order_created',
    'payment_completed',
];

function createCountRecord<T extends string>(keys: readonly T[]): Record<T, number> {
    return keys.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {} as Record<T, number>);
}

function safeMetadata(row: ConversionEventRow): Record<string, unknown> {
    return row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
}

function safeString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function normalizeSource(value: unknown): ConversionPathSource | null {
    if (value === 'cesarin') return 'cesarin';
    if (value === 'manual') return 'manual';
    return null;
}

function normalizeEventType(value: string): ConversionFunnelEventType | null {
    return EVENT_TYPES.includes(value as ConversionFunnelEventType) ? value as ConversionFunnelEventType : null;
}

function getOrderId(metadata: Record<string, unknown>): string | null {
    return safeString(metadata.order_id) ?? safeString(metadata.orderId);
}

function getProductId(metadata: Record<string, unknown>): string | null {
    return safeString(metadata.product_id) ?? safeString(metadata.productId);
}

function getProductName(metadata: Record<string, unknown>): string | null {
    return safeString(metadata.product_name) ?? safeString(metadata.productName);
}

function isActivationProbe(metadata: Record<string, unknown>): boolean {
    const value = metadata.activation_probe;
    return value === true || value === 'true';
}

function getSessionKey(row: ConversionEventRow): string {
    const metadata = safeMetadata(row);
    const orderId = getOrderId(metadata);
    if (row.session_id) return `session:${row.session_id}`;
    if (orderId) return `order:${orderId}`;
    return `event:${row.id}`;
}

function createSession(sessionKey: string, sessionId: string | null): MutableSession {
    return {
        sessionKey,
        sessionId,
        sourceSignals: [],
        firstEventAt: null,
        lastEventAt: null,
        eventCount: 0,
        ctaKinds: new Set(),
        productIds: new Set(),
        productNames: new Set(),
        cartMutationResults: new Set(),
        orderIds: new Set(),
        hasAiCtaRendered: false,
        hasAiCtaClicked: false,
        hasCartProgress: false,
        hasCheckoutStarted: false,
        hasOrderCreated: false,
        hasPaymentCompleted: false,
        dataQuality: new Set(),
    };
}

function getOrCreateSession(sessions: Map<string, MutableSession>, sessionKey: string, sessionId: string | null): MutableSession {
    const existing = sessions.get(sessionKey);
    if (existing) {
        if (!existing.sessionId && sessionId) existing.sessionId = sessionId;
        return existing;
    }

    const created = createSession(sessionKey, sessionId);
    sessions.set(sessionKey, created);
    return created;
}

function resolveSessionSource(session: MutableSession): ConversionPathSource {
    if (session.sourceSignals.includes('cesarin') || session.hasAiCtaRendered || session.hasAiCtaClicked) return 'cesarin';
    if (session.sourceSignals.includes('manual')) return 'manual';
    return 'unknown';
}

function resolveDropOff(session: MutableSession, source: ConversionPathSource): {
    key: ConversionSessionReadout['dropOffKey'];
    label: string;
} {
    if (session.hasPaymentCompleted) return { key: 'payment_completed', label: 'Pago completado' };
    if (session.hasOrderCreated) return { key: 'order_pending_payment', label: 'Orden creada, pago pendiente o no observado' };
    if (session.hasCheckoutStarted) return { key: 'checkout_no_order', label: 'Checkout iniciado sin orden observada' };
    if (session.hasCartProgress) return { key: 'cart_progress_no_checkout', label: 'Carrito tocado sin checkout observado' };
    if (session.hasAiCtaClicked) return { key: 'cta_clicked_no_cart_progress', label: 'CTA clickeado sin avance de carrito observado' };
    if (session.hasAiCtaRendered) return { key: 'cta_rendered_not_clicked', label: 'CTA mostrado sin click observado' };
    if (source === 'manual') return { key: 'manual_path_no_ai_cta', label: 'Ruta manual sin CTA de Cesarín' };
    if (session.eventCount === 0) return { key: 'no_events', label: 'Sin eventos de medición observados' };
    return { key: 'missing_ai_cta_render', label: 'Datos parciales: avance sin CTA mostrado observado' };
}

function addProductSummary(
    products: Map<string, ConversionProductSummary>,
    productId: string,
    productName: string | null,
    eventType: ConversionFunnelEventType,
): void {
    const existing = products.get(productId) ?? {
        productId,
        productName,
        renderedCount: 0,
        clickedCount: 0,
        cartMutationCount: 0,
        orderCount: 0,
    };

    if (!existing.productName && productName) existing.productName = productName;
    if (eventType === 'ai_cta_rendered') existing.renderedCount += 1;
    if (eventType === 'ai_cta_clicked') existing.clickedCount += 1;
    if (eventType === 'cart_mutation_result') existing.cartMutationCount += 1;
    if (eventType === 'order_created') existing.orderCount += 1;
    products.set(productId, existing);
}

export function buildConversionFunnelReadout(input: BuildReadoutInput): ConversionFunnelReadout {
    const eventTypeCounts = createCountRecord(EVENT_TYPES);
    const sourceCounts: Record<ConversionPathSource, number> = { cesarin: 0, manual: 0, unknown: 0 };
    const dropOffCounts = createCountRecord<ConversionSessionReadout['dropOffKey']>([
        'payment_completed',
        'order_pending_payment',
        'checkout_no_order',
        'cart_progress_no_checkout',
        'cta_clicked_no_cart_progress',
        'cta_rendered_not_clicked',
        'missing_ai_cta_render',
        'manual_path_no_ai_cta',
        'no_events',
    ]);
    const ctaKindCounts: Record<string, number> = {};
    const cartMutationResultCounts: Record<string, number> = {};
    const sessions = new Map<string, MutableSession>();
    const productsById = new Map((input.products ?? []).map((product) => [product.id, product.name]));
    const productSummaries = new Map<string, ConversionProductSummary>();
    const probeSessionKeys = new Set<string>();
    const probeOrderIds = new Set<string>();

    for (const event of input.events) {
        const metadata = safeMetadata(event);
        if (!isActivationProbe(metadata)) continue;
        probeSessionKeys.add(getSessionKey(event));
        const orderId = getOrderId(metadata);
        if (orderId) probeOrderIds.add(orderId);
    }

    const isProbeLinkedEvent = (event: ConversionEventRow): boolean => {
        const metadata = safeMetadata(event);
        const orderId = getOrderId(metadata);
        return isActivationProbe(metadata)
            || probeSessionKeys.has(getSessionKey(event))
            || (orderId ? probeOrderIds.has(orderId) : false);
    };

    const excludedProbeEvents = input.includeProbeTraffic
        ? 0
        : input.events.filter(isProbeLinkedEvent).length;
    const eventsForReadout = input.includeProbeTraffic
        ? input.events
        : input.events.filter((event) => !isProbeLinkedEvent(event));
    const excludedProbeOrders = input.includeProbeTraffic
        ? 0
        : (input.orders ?? []).filter((order) => {
            const key = order.cesarin_session_id ? `session:${order.cesarin_session_id}` : `order:${order.id}`;
            return probeSessionKeys.has(key) || probeOrderIds.has(order.id);
        }).length;
    const ordersForReadout = input.includeProbeTraffic
        ? input.orders ?? []
        : (input.orders ?? []).filter((order) => {
            const key = order.cesarin_session_id ? `session:${order.cesarin_session_id}` : `order:${order.id}`;
            return !probeSessionKeys.has(key) && !probeOrderIds.has(order.id);
        });

    const orderedEvents = [...eventsForReadout].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    for (const event of orderedEvents) {
        const eventType = normalizeEventType(event.event_type);
        const metadata = safeMetadata(event);
        const session = getOrCreateSession(sessions, getSessionKey(event), event.session_id);
        session.eventCount += 1;
        session.firstEventAt = session.firstEventAt && session.firstEventAt < event.timestamp ? session.firstEventAt : event.timestamp;
        session.lastEventAt = session.lastEventAt && session.lastEventAt > event.timestamp ? session.lastEventAt : event.timestamp;
        if (!event.session_id) session.dataQuality.add('sin session_id');

        const source = normalizeSource(metadata.source);
        if (source) session.sourceSignals.push(source);

        const productId = getProductId(metadata);
        const productName = getProductName(metadata) ?? (productId ? productsById.get(productId) ?? null : null);
        if (productId) {
            session.productIds.add(productId);
            if (productName) session.productNames.add(productName);
        }

        const orderId = getOrderId(metadata);
        if (orderId) session.orderIds.add(orderId);

        if (!eventType) {
            session.dataQuality.add(`evento no reconocido: ${event.event_type}`);
            continue;
        }

        eventTypeCounts[eventType] += 1;

        if (eventType === 'ai_cta_rendered') session.hasAiCtaRendered = true;
        if (eventType === 'ai_cta_clicked') session.hasAiCtaClicked = true;
        if (eventType === 'cart_opened') session.hasCartProgress = true;
        if (eventType === 'cart_mutation_result') {
            session.hasCartProgress = true;
            const result = safeString(metadata.result) ?? 'unknown';
            session.cartMutationResults.add(result);
            cartMutationResultCounts[result] = (cartMutationResultCounts[result] ?? 0) + 1;
        }
        if (eventType === 'checkout_started') session.hasCheckoutStarted = true;
        if (eventType === 'order_created') session.hasOrderCreated = true;
        if (eventType === 'payment_completed') session.hasPaymentCompleted = true;

        const ctaKind = safeString(metadata.cta_kind) ?? safeString(metadata.ctaKind);
        if ((eventType === 'ai_cta_rendered' || eventType === 'ai_cta_clicked') && ctaKind) {
            session.ctaKinds.add(ctaKind);
            ctaKindCounts[ctaKind] = (ctaKindCounts[ctaKind] ?? 0) + 1;
        }

        if (productId) addProductSummary(productSummaries, productId, productName, eventType);
    }

    for (const order of ordersForReadout) {
        const key = order.cesarin_session_id ? `session:${order.cesarin_session_id}` : `order:${order.id}`;
        const session = getOrCreateSession(sessions, key, order.cesarin_session_id);
        session.orderIds.add(order.id);
        const orderSource = normalizeSource(order.conversion_source);
        if (orderSource) session.sourceSignals.push(orderSource);
        if (!order.cesarin_session_id) session.dataQuality.add('orden sin cesarin_session_id');
        session.hasOrderCreated = true;
        if (order.payment_status === 'paid') session.hasPaymentCompleted = true;
        session.firstEventAt = session.firstEventAt ?? order.created_at;
        session.lastEventAt = session.lastEventAt && session.lastEventAt > order.created_at ? session.lastEventAt : order.created_at;
    }

    const sessionReadouts = Array.from(sessions.values())
        .map((session) => {
            const source = resolveSessionSource(session);
            const dropOff = resolveDropOff(session, source);
            sourceCounts[source] += 1;
            dropOffCounts[dropOff.key] += 1;

            return {
                sessionKey: session.sessionKey,
                sessionId: session.sessionId,
                source,
                firstEventAt: session.firstEventAt,
                lastEventAt: session.lastEventAt,
                eventCount: session.eventCount,
                ctaKinds: Array.from(session.ctaKinds).sort(),
                productIds: Array.from(session.productIds).sort(),
                productNames: Array.from(session.productNames).sort(),
                cartMutationResults: Array.from(session.cartMutationResults).sort(),
                orderIds: Array.from(session.orderIds).sort(),
                hasAiCtaRendered: session.hasAiCtaRendered,
                hasAiCtaClicked: session.hasAiCtaClicked,
                hasCartProgress: session.hasCartProgress,
                hasCheckoutStarted: session.hasCheckoutStarted,
                hasOrderCreated: session.hasOrderCreated,
                hasPaymentCompleted: session.hasPaymentCompleted,
                dropOffKey: dropOff.key,
                dropOffLabel: dropOff.label,
                dataQuality: Array.from(session.dataQuality).sort(),
            } satisfies ConversionSessionReadout;
        })
        .sort((a, b) => (b.lastEventAt ?? '').localeCompare(a.lastEventAt ?? ''));

    const totalSessions = sessionReadouts.length;
    const countStage = (predicate: (session: ConversionSessionReadout) => boolean) =>
        sessionReadouts.filter(predicate).length;
    const makeStage = (key: ConversionFunnelStage['key'], count: number): ConversionFunnelStage => ({
        key,
        label: FUNNEL_LABELS[key],
        count,
        rateFromSessions: totalSessions === 0 ? 0 : count / totalSessions,
    });

    return {
        generatedAt: input.generatedAt ?? new Date().toISOString(),
        totalEvents: eventsForReadout.length,
        totalSessions,
        probeTraffic: {
            excludedProbeEvents,
            excludedProbeSessions: input.includeProbeTraffic ? 0 : probeSessionKeys.size,
            excludedProbeOrders,
        },
        sourceCounts,
        eventTypeCounts,
        ctaKindCounts,
        cartMutationResultCounts,
        dropOffCounts,
        funnelStages: [
            makeStage('ai_cta_rendered', countStage(session => session.hasAiCtaRendered)),
            makeStage('ai_cta_clicked', countStage(session => session.hasAiCtaClicked)),
            makeStage('cart_progress', countStage(session => session.hasCartProgress)),
            makeStage('checkout_started', countStage(session => session.hasCheckoutStarted)),
            makeStage('order_created', countStage(session => session.hasOrderCreated)),
            makeStage('payment_completed', countStage(session => session.hasPaymentCompleted)),
        ],
        productSummaries: Array.from(productSummaries.values())
            .sort((a, b) => (b.renderedCount + b.clickedCount + b.cartMutationCount + b.orderCount)
                - (a.renderedCount + a.clickedCount + a.cartMutationCount + a.orderCount))
            .slice(0, 8),
        sessions: sessionReadouts.slice(0, 12),
    };
}

export async function getConversionFunnelReadout(from: string, to: string): Promise<ConversionFunnelReadout> {
    const { data: events, error: eventsError } = await supabase
        .from('conversation_conversion_events')
        .select('id, session_id, event_type, timestamp, metadata')
        .gte('timestamp', from)
        .lte('timestamp', to)
        .order('timestamp', { ascending: false })
        .limit(1000);

    if (eventsError) throw eventsError;

    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, cesarin_session_id, conversion_source, total, status, payment_status, created_at')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false })
        .limit(500);

    if (ordersError) throw ordersError;

    const productIds = Array.from(new Set(
        (events ?? [])
            .map((event) => getProductId(safeMetadata(event as ConversionEventRow)))
            .filter((id): id is string => Boolean(id)),
    ));

    let products: ConversionProductRow[] = [];
    if (productIds.length > 0) {
        const { data: productRows, error: productsError } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

        if (productsError) throw productsError;
        products = (productRows ?? []) as ConversionProductRow[];
    }

    return buildConversionFunnelReadout({
        events: (events ?? []) as ConversionEventRow[],
        orders: (orders ?? []) as ConversionOrderRow[],
        products,
    });
}
