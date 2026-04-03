import {
  getStorefrontOrderFreshnessView,
  getStorefrontOrderLifecycleView,
  STOREFRONT_ORDER_STATUS,
} from '@/lib/domain/orders';
import { getCustomerOrders } from '@/services/orders.service';
import type { OrderRecord } from '@/types/order';

type OrderTrackingFocus =
  | 'payment_status'
  | 'tracking'
  | 'shipping_status'
  | 'order_status'
  | 'overview';

type OrderTrackingResolutionKind =
  | 'FOUND'
  | 'NO_RELEVANT_ORDER'
  | 'ORDER_NOT_FOUND'
  | 'AUTH_REQUIRED';

type OrderTrackingMatchStrategy =
  | 'AUTHENTICATED_ACTIVE_ORDER'
  | 'AUTHENTICATED_RECENT_ORDER'
  | 'EXPLICIT_ORDER_MATCH'
  | 'NO_RELEVANT_ORDER'
  | 'ORDER_NOT_FOUND'
  | 'AUTH_REQUIRED';

type OrderTrackingScope =
  | 'RECENT_ACTIVE_ORDERS'
  | 'EXPLICIT_ORDER_LOOKUP'
  | 'AUTH_REQUIRED'
  | 'NONE';

type RetrievalSource =
  | 'AUTHENTICATED_ACTIVE_ORDER'
  | 'AUTHENTICATED_RECENT_ORDER'
  | 'EXPLICIT_ORDER_LOOKUP'
  | 'NONE';

export interface StorefrontOrderTrackingResolution {
  kind: OrderTrackingResolutionKind;
  message: string;
  retrievalSource: RetrievalSource;
  matchStrategy: OrderTrackingMatchStrategy;
  signal: {
    kind: OrderTrackingResolutionKind;
    focus: OrderTrackingFocus;
    scope: OrderTrackingScope;
    order_id?: string | null;
    order_number?: string | null;
    order_status?: string | null;
    payment_status?: string | null;
    payment_method?: string | null;
    tracking_number?: string | null;
    tracking_link?: string | null;
    matched_by?: 'explicit_order_number' | 'recent_active_order' | 'recent_order' | 'none';
  };
}

const RECENT_ORDER_LOOKBACK_LIMIT = 12;
const RECENT_ORDER_MAX_AGE_DAYS = 90;
const ACTIVE_ORDER_STATUSES = new Set(['pending', 'confirmed', 'processing', 'shipped']);

function normalizeText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectFocus(query: string): OrderTrackingFocus {
  const normalized = normalizeText(query);

  if (/\b(pago|pagado|pagaron|paso mi pago|mercado pago|transferencia|deposito|deposito|cobro)\b/.test(normalized)) {
    return 'payment_status';
  }

  if (/\b(guia|tracking|rastreo|seguimiento|numero de guia|tengo guia|liga de rastreo|link de rastreo)\b/.test(normalized)) {
    return 'tracking';
  }

  if (/\b(donde va|ya lo enviaron|enviaron|envio|paqueteria|camino|sale mi pedido|salio mi pedido)\b/.test(normalized)) {
    return 'shipping_status';
  }

  if (/\b(estatus|status|estado|pedido|orden)\b/.test(normalized)) {
    return 'order_status';
  }

  return 'overview';
}

function extractExplicitOrderNumber(query: string): string | null {
  const directVsmMatch = query.match(/\bVSM[-\s]?\d{2,}\b/i);
  if (directVsmMatch?.[0]) {
    return directVsmMatch[0].replace(/\s+/g, '-').toUpperCase();
  }

  const contextualMatch = query.match(/\b(?:pedido|orden|order)(?:\s*(?:#|no\.?|numero|número))?\s*([A-Z0-9-]{3,})\b/i);
  if (contextualMatch?.[1]) {
    return contextualMatch[1].trim().toUpperCase();
  }

  return null;
}

function normalizeOrderNumber(value: string | null | undefined): string {
  return (value || '').trim().toUpperCase();
}

function extractTrackingLink(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const match = notes.match(/https?:\/\/[^\s<>"')\]]+/i);
  return match?.[0] ?? null;
}

function isActiveOrder(order: OrderRecord): boolean {
  return ACTIVE_ORDER_STATUSES.has((order.status || '').toLowerCase());
}

function isRecentOrder(order: OrderRecord): boolean {
  const createdAt = Date.parse(order.created_at);
  if (Number.isNaN(createdAt)) return false;
  const ageMs = Date.now() - createdAt;
  return ageMs <= RECENT_ORDER_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function scoreOrder(order: OrderRecord, focus: OrderTrackingFocus): number {
  let score = 0;
  const normalizedStatus = (order.status || '').toLowerCase();
  const normalizedPaymentStatus = (order.payment_status || '').toLowerCase();

  if (isActiveOrder(order)) score += 50;
  if (isRecentOrder(order)) score += 20;
  if (normalizedStatus === 'shipped') score += 15;
  if (normalizedStatus === 'processing') score += 10;
  if (normalizedStatus === 'confirmed') score += 8;
  if (normalizedPaymentStatus === 'paid') score += 6;
  if (normalizedPaymentStatus === 'pending') score += 4;
  if (order.tracking_number) score += 5;

  if (focus === 'tracking' || focus === 'shipping_status') {
    if (normalizedStatus === 'shipped' || normalizedStatus === 'delivered') score += 12;
    if (order.tracking_number) score += 10;
  }

  if (focus === 'payment_status') {
    if (normalizedPaymentStatus === 'paid' || normalizedPaymentStatus === 'pending') score += 10;
  }

  return score;
}

function buildFoundMessage(order: OrderRecord, focus: OrderTrackingFocus): string {
  const lifecycle = getStorefrontOrderLifecycleView(order);
  const freshness = getStorefrontOrderFreshnessView(order);
  const statusLabel = STOREFRONT_ORDER_STATUS[(order.status as keyof typeof STOREFRONT_ORDER_STATUS)]?.label ?? order.status;
  const trackingNumber = order.tracking_number?.trim() || null;
  const trackingLink = extractTrackingLink(order.tracking_notes);

  if (focus === 'payment_status') {
    return `Tu pedido ${order.order_number} sigue registrado. ${lifecycle.paymentView.headline}. ${lifecycle.paymentView.detail}${freshness.isFreshnessSensitive ? ` ${freshness.freshnessNote}` : ''}`;
  }

  if (focus === 'tracking') {
    if (trackingNumber) {
      return `Tu pedido ${order.order_number} va como ${statusLabel}. La guia persistida es ${trackingNumber}.${trackingLink ? ` Tambien tengo este enlace guardado: ${trackingLink}.` : ' Ahorita no veo otro enlace de rastreo persistido.'}`;
    }

    return `Tu pedido ${order.order_number} va como ${statusLabel}. Todavia no veo numero de guia persistido para esa orden. ${lifecycle.visibilityView.detail}`;
  }

  if (focus === 'shipping_status') {
    if (trackingNumber) {
      return `Tu pedido ${order.order_number} va como ${statusLabel}. La guia persistida es ${trackingNumber}.${trackingLink ? ` El enlace guardado es ${trackingLink}.` : ''}`;
    }

    return `Tu pedido ${order.order_number} va como ${statusLabel}. ${lifecycle.visibilityView.detail} No veo guia persistida todavia.`;
  }

  if (focus === 'order_status') {
    return `Tu pedido ${order.order_number} aparece como ${statusLabel}. ${lifecycle.visibilityView.detail}`;
  }

  return `Tu pedido ${order.order_number} aparece como ${statusLabel}. ${lifecycle.paymentView.headline}. ${lifecycle.visibilityView.detail}`;
}

function buildResolution(input: {
  kind: OrderTrackingResolutionKind;
  focus: OrderTrackingFocus;
  scope: OrderTrackingScope;
  message: string;
  retrievalSource: RetrievalSource;
  matchStrategy: OrderTrackingMatchStrategy;
  order?: OrderRecord | null;
  matchedBy?: 'explicit_order_number' | 'recent_active_order' | 'recent_order' | 'none';
}): StorefrontOrderTrackingResolution {
  const trackingLink = extractTrackingLink(input.order?.tracking_notes);

  return {
    kind: input.kind,
    message: input.message,
    retrievalSource: input.retrievalSource,
    matchStrategy: input.matchStrategy,
    signal: {
      kind: input.kind,
      focus: input.focus,
      scope: input.scope,
      order_id: input.order?.id ?? null,
      order_number: input.order?.order_number ?? null,
      order_status: input.order?.status ?? null,
      payment_status: input.order?.payment_status ?? null,
      payment_method: input.order?.payment_method ?? null,
      tracking_number: input.order?.tracking_number?.trim() || null,
      tracking_link: trackingLink,
      matched_by: input.matchedBy ?? 'none',
    },
  };
}

export async function resolveStorefrontAuthenticatedOrderTracking(input: {
  customerId?: string | null;
  query: string;
}): Promise<StorefrontOrderTrackingResolution> {
  const focus = detectFocus(input.query);

  if (!input.customerId) {
    return buildResolution({
      kind: 'AUTH_REQUIRED',
      focus,
      scope: 'AUTH_REQUIRED',
      message: 'Para decirte el estado real de un pedido necesito que entres a tu cuenta. Sin sesion autenticada no tengo acceso a pedidos.',
      retrievalSource: 'NONE',
      matchStrategy: 'AUTH_REQUIRED',
    });
  }

  const orders = await getCustomerOrders(input.customerId);
  const boundedOrders = orders.slice(0, RECENT_ORDER_LOOKBACK_LIMIT);
  const explicitOrderNumber = extractExplicitOrderNumber(input.query);

  if (explicitOrderNumber) {
    const explicitMatch = boundedOrders.find((order) => normalizeOrderNumber(order.order_number) === explicitOrderNumber) ?? null;

    if (!explicitMatch) {
      return buildResolution({
        kind: 'ORDER_NOT_FOUND',
        focus,
        scope: 'EXPLICIT_ORDER_LOOKUP',
        message: `No encontre un pedido reciente de esta cuenta con el numero ${explicitOrderNumber}. Si quieres, dime otro numero de pedido o revisa tu historial autenticado.`,
        retrievalSource: 'NONE',
        matchStrategy: 'ORDER_NOT_FOUND',
      });
    }

    return buildResolution({
      kind: 'FOUND',
      focus,
      scope: 'EXPLICIT_ORDER_LOOKUP',
      message: buildFoundMessage(explicitMatch, focus),
      retrievalSource: 'EXPLICIT_ORDER_LOOKUP',
      matchStrategy: 'EXPLICIT_ORDER_MATCH',
      order: explicitMatch,
      matchedBy: 'explicit_order_number',
    });
  }

  const activeOrders = boundedOrders.filter(isActiveOrder);
  const recentOrders = boundedOrders.filter((order) => isRecentOrder(order) || isActiveOrder(order));

  if (recentOrders.length === 0) {
    return buildResolution({
      kind: 'NO_RELEVANT_ORDER',
      focus,
      scope: 'RECENT_ACTIVE_ORDERS',
      message: 'No veo pedidos recientes o activos en esta cuenta para responder esa duda con verdad persistida. Si hiciste una compra desde otra cuenta o ya paso bastante tiempo, revisa tu historial autenticado.',
      retrievalSource: 'NONE',
      matchStrategy: 'NO_RELEVANT_ORDER',
    });
  }

  const candidatePool = activeOrders.length > 0 ? activeOrders : recentOrders;
  const bestOrder = [...candidatePool].sort((left, right) => scoreOrder(right, focus) - scoreOrder(left, focus))[0] ?? null;

  if (!bestOrder) {
    return buildResolution({
      kind: 'NO_RELEVANT_ORDER',
      focus,
      scope: 'RECENT_ACTIVE_ORDERS',
      message: 'No encontre un pedido reciente lo bastante claro para responder eso sin inventar contexto. Revisa tu historial autenticado o dime el numero de pedido.',
      retrievalSource: 'NONE',
      matchStrategy: 'NO_RELEVANT_ORDER',
    });
  }

  const matchedBy = activeOrders.length > 0 ? 'recent_active_order' : 'recent_order';

  return buildResolution({
    kind: 'FOUND',
    focus,
    scope: 'RECENT_ACTIVE_ORDERS',
    message: buildFoundMessage(bestOrder, focus),
    retrievalSource: activeOrders.length > 0 ? 'AUTHENTICATED_ACTIVE_ORDER' : 'AUTHENTICATED_RECENT_ORDER',
    matchStrategy: activeOrders.length > 0 ? 'AUTHENTICATED_ACTIVE_ORDER' : 'AUTHENTICATED_RECENT_ORDER',
    order: bestOrder,
    matchedBy,
  });
}
