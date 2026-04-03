import { getCustomerOrders } from '@/services/orders.service';
import type { OrderItem, OrderRecord } from '@/types/order';

type WarrantyDefectType =
  | 'burnt_taste'
  | 'broken_on_arrival'
  | 'leaking'
  | 'not_powering_on'
  | 'not_working'
  | 'warranty_request'
  | 'return_request'
  | 'general_defect';

type WarrantyResolutionKind =
  | 'LIKELY_ELIGIBLE'
  | 'OUT_OF_POLICY'
  | 'CANNOT_IDENTIFY_PRODUCT'
  | 'NO_RELEVANT_ORDER'
  | 'AUTH_REQUIRED';

type WarrantyMatchStrategy =
  | 'AUTHENTICATED_ITEM_MATCH'
  | 'AUTHENTICATED_SINGLE_ITEM_ORDER'
  | 'EXPLICIT_ORDER_MATCH'
  | 'OUT_OF_POLICY'
  | 'CANNOT_IDENTIFY_PRODUCT'
  | 'NO_RELEVANT_ORDER'
  | 'AUTH_REQUIRED';

type WarrantyScope =
  | 'RECENT_FULFILLED_ORDERS'
  | 'EXPLICIT_ORDER_LOOKUP'
  | 'AUTH_REQUIRED'
  | 'NONE';

type WarrantyRetrievalSource =
  | 'AUTHENTICATED_RECENT_ORDER'
  | 'EXPLICIT_ORDER_LOOKUP'
  | 'NONE';

type WarrantyMatchedBy =
  | 'explicit_order_number'
  | 'single_item_order'
  | 'item_name_match'
  | 'variant_name_match'
  | 'recent_order'
  | 'none';

interface WarrantyItemCandidate {
  order: OrderRecord;
  item: OrderItem;
  score: number;
  matchedBy: WarrantyMatchedBy;
}

export interface StorefrontWarrantyTriageResolution {
  kind: WarrantyResolutionKind;
  message: string;
  retrievalSource: WarrantyRetrievalSource;
  matchStrategy: WarrantyMatchStrategy;
  signal: {
    kind: WarrantyResolutionKind;
    defect_type: WarrantyDefectType;
    scope: WarrantyScope;
    order_id?: string | null;
    order_number?: string | null;
    order_status?: string | null;
    matched_item_name?: string | null;
    matched_product_id?: string | null;
    matched_variant_id?: string | null;
    days_since_order?: number | null;
    policy_window_days?: number | null;
    matched_by?: WarrantyMatchedBy;
  };
}

const RECENT_ORDER_LOOKBACK_LIMIT = 12;
const WARRANTY_POLICY_WINDOW_DAYS = 90;
const FULFILLED_ORDER_STATUSES = new Set(['delivered', 'shipped']);
const SUPPORT_HANDOFF_LINE = 'El siguiente paso es seguirlo por soporte directo o WhatsApp con tu numero de pedido y una foto o video corto del problema.';
const ITEM_MATCH_STOPWORDS = new Set([
  'mi', 'me', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'que', 'ya', 'vino', 'llego', 'pedido', 'orden', 'compra',
  'garantia', 'devolucion', 'devolver', 'producto', 'equipo', 'vape',
  'pod', 'pods', 'cartucho', 'cartuchos', 'dispositivo', 'sabe', 'huele',
  'quemado', 'roto', 'rota', 'chorreado', 'chorreada', 'chorrea', 'fuga',
  'fugando', 'prende', 'enciende', 'sirve', 'funciona', 'falla', 'fallado',
  'fallada', 'no', 'esta', 'este', 'esto', 'por', 'para', 'con', 'sin',
]);

function normalizeText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectDefectType(query: string): WarrantyDefectType {
  const normalized = normalizeText(query);

  if (/\b(sabe a quemado|huele a quemado|olor a quemado|quemado)\b/.test(normalized)) {
    return 'burnt_taste';
  }

  if (/\b(llego roto|llego quebrado|llego danado|roto|rota)\b/.test(normalized)) {
    return 'broken_on_arrival';
  }

  if (/\b(chorreado|chorreada|chorrea|fuga|fugando|derram)\b/.test(normalized)) {
    return 'leaking';
  }

  if (/\b(no prende|no enciende)\b/.test(normalized)) {
    return 'not_powering_on';
  }

  if (/\b(no sirve|no funciona|falla|fallado|fallada)\b/.test(normalized)) {
    return 'not_working';
  }

  if (/\b(devolucion|devolver)\b/.test(normalized)) {
    return 'return_request';
  }

  if (/\b(garantia|warranty|rma)\b/.test(normalized)) {
    return 'warranty_request';
  }

  return 'general_defect';
}

function extractExplicitOrderNumber(query: string): string | null {
  const directVsmMatch = query.match(/\bVSM[-\s]?\d{2,}\b/i);
  if (directVsmMatch?.[0]) {
    return directVsmMatch[0].replace(/\s+/g, '-').toUpperCase();
  }

  const contextualMatch = query.match(/\b(?:pedido|orden|order)(?:\s*(?:#|no\.?|numero))?\s*([A-Z0-9-]{3,})\b/i);
  if (contextualMatch?.[1]) {
    return contextualMatch[1].trim().toUpperCase();
  }

  return null;
}

function normalizeOrderNumber(value: string | null | undefined): string {
  return (value || '').trim().toUpperCase();
}

function getDaysSinceOrder(order: OrderRecord): number | null {
  const createdAt = Date.parse(order.created_at);
  if (Number.isNaN(createdAt)) return null;

  return Math.max(0, Math.floor((Date.now() - createdAt) / (24 * 60 * 60 * 1000)));
}

function isFulfilledOrder(order: OrderRecord): boolean {
  return FULFILLED_ORDER_STATUSES.has((order.status || '').toLowerCase());
}

function isWithinPolicyWindow(order: OrderRecord): boolean {
  const daysSinceOrder = getDaysSinceOrder(order);
  return daysSinceOrder !== null && daysSinceOrder <= WARRANTY_POLICY_WINDOW_DAYS;
}

function buildItemTokens(query: string): string[] {
  return normalizeText(query)
    .split(' ')
    .filter((token) => token.length >= 3 && !ITEM_MATCH_STOPWORDS.has(token));
}

function getItemHaystack(item: OrderItem): string {
  return normalizeText([
    item.name,
    item.variant_name ?? '',
    item.section ?? '',
  ].join(' '));
}

function scoreItemCandidate(order: OrderRecord, item: OrderItem, queryTokens: string[]): WarrantyItemCandidate | null {
  const haystack = getItemHaystack(item);
  const daysSinceOrder = getDaysSinceOrder(order);
  let score = 0;
  let matchedBy: WarrantyMatchedBy = 'recent_order';
  let matchedTokenCount = 0;

  for (const token of queryTokens) {
    if (!haystack.includes(token)) continue;
    matchedTokenCount += 1;
    score += 8;
    if (normalizeText(item.variant_name ?? '').includes(token)) {
      matchedBy = 'variant_name_match';
    } else {
      matchedBy = 'item_name_match';
    }
  }

  if ((order.items?.length ?? 0) === 1) {
    score += 4;
    if (queryTokens.length === 0) {
      matchedBy = 'single_item_order';
    }
  }

  if ((order.status || '').toLowerCase() === 'delivered') score += 4;
  if (daysSinceOrder !== null) {
    if (daysSinceOrder <= 7) score += 4;
    else if (daysSinceOrder <= 30) score += 3;
    else if (daysSinceOrder <= WARRANTY_POLICY_WINDOW_DAYS) score += 1;
  }

  if (queryTokens.length > 0 && matchedTokenCount === 0) {
    return null;
  }

  if (queryTokens.length === 0 && (order.items?.length ?? 0) !== 1) {
    return null;
  }

  return {
    order,
    item,
    score,
    matchedBy,
  };
}

function pickBestItemCandidate(orders: OrderRecord[], queryTokens: string[]): WarrantyItemCandidate | null {
  const candidates = orders.flatMap((order) =>
    (order.items ?? [])
      .map((item) => scoreItemCandidate(order, item, queryTokens))
      .filter((candidate): candidate is WarrantyItemCandidate => Boolean(candidate)),
  );

  if (candidates.length === 0) return null;

  const ranked = [...candidates].sort((left, right) => right.score - left.score);
  const best = ranked[0] ?? null;
  const second = ranked[1] ?? null;

  if (!best) return null;

  if (best.matchedBy === 'single_item_order') {
    return orders.length === 1 ? best : null;
  }

  if (best.score < 8) return null;
  if (second && best.score - second.score < 3) return null;

  return best;
}

function buildResolution(input: {
  kind: WarrantyResolutionKind;
  defectType: WarrantyDefectType;
  scope: WarrantyScope;
  message: string;
  retrievalSource: WarrantyRetrievalSource;
  matchStrategy: WarrantyMatchStrategy;
  order?: OrderRecord | null;
  item?: OrderItem | null;
  matchedBy?: WarrantyMatchedBy;
}): StorefrontWarrantyTriageResolution {
  return {
    kind: input.kind,
    message: input.message,
    retrievalSource: input.retrievalSource,
    matchStrategy: input.matchStrategy,
    signal: {
      kind: input.kind,
      defect_type: input.defectType,
      scope: input.scope,
      order_id: input.order?.id ?? null,
      order_number: input.order?.order_number ?? null,
      order_status: input.order?.status ?? null,
      matched_item_name: input.item?.name ?? null,
      matched_product_id: input.item?.product_id ?? null,
      matched_variant_id: input.item?.variant_id ?? null,
      days_since_order: input.order ? getDaysSinceOrder(input.order) : null,
      policy_window_days: input.kind === 'AUTH_REQUIRED' || input.kind === 'NO_RELEVANT_ORDER' ? null : WARRANTY_POLICY_WINDOW_DAYS,
      matched_by: input.matchedBy ?? 'none',
    },
  };
}

function buildEligibleMessage(order: OrderRecord, item: OrderItem, defectType: WarrantyDefectType): string {
  const issueLabel = defectType === 'burnt_taste'
    ? 'el problema de sabor u olor a quemado'
    : defectType === 'broken_on_arrival'
      ? 'que llego roto'
      : defectType === 'leaking'
        ? 'que llego chorreado o con fuga'
        : defectType === 'not_powering_on'
          ? 'que no prende'
          : defectType === 'not_working'
            ? 'que no funciona bien'
            : defectType === 'return_request'
              ? 'la devolucion por falla'
              : 'la revision por garantia o defecto';

  return `Si ubico ${item.name} en tu pedido ${order.order_number}, y por la fecha persistida se ve reciente para revisar ${issueLabel}. ${SUPPORT_HANDOFF_LINE}`;
}

function buildOutOfPolicyMessage(order: OrderRecord, item: OrderItem): string {
  return `Si ubico ${item.name} en tu pedido ${order.order_number}, pero por la fecha persistida ya queda fuera de la ventana reciente que usamos para este triage contextual. No te voy a prometer cobertura desde aqui. ${SUPPORT_HANDOFF_LINE}`;
}

export async function resolveStorefrontAuthenticatedWarrantyTriage(input: {
  customerId?: string | null;
  query: string;
}): Promise<StorefrontWarrantyTriageResolution> {
  const defectType = detectDefectType(input.query);

  if (!input.customerId) {
    return buildResolution({
      kind: 'AUTH_REQUIRED',
      defectType,
      scope: 'AUTH_REQUIRED',
      message: 'Si te ayudo con eso, pero para ligar la falla a una compra real necesito que entres a tu cuenta. Sin sesion autenticada no puedo revisar pedidos ni productos post-compra.',
      retrievalSource: 'NONE',
      matchStrategy: 'AUTH_REQUIRED',
    });
  }

  const orders = await getCustomerOrders(input.customerId);
  const boundedOrders = orders.slice(0, RECENT_ORDER_LOOKBACK_LIMIT);
  const explicitOrderNumber = extractExplicitOrderNumber(input.query);
  const queryTokens = buildItemTokens(input.query);

  const explicitOrder = explicitOrderNumber
    ? boundedOrders.find((order) => normalizeOrderNumber(order.order_number) === explicitOrderNumber) ?? null
    : null;

  const relevantOrders = explicitOrder
    ? (isFulfilledOrder(explicitOrder) ? [explicitOrder] : [])
    : boundedOrders.filter(isFulfilledOrder);

  if (relevantOrders.length === 0) {
    return buildResolution({
      kind: 'NO_RELEVANT_ORDER',
      defectType,
      scope: explicitOrderNumber ? 'EXPLICIT_ORDER_LOOKUP' : 'RECENT_FULFILLED_ORDERS',
      message: explicitOrderNumber
        ? `No veo el pedido ${explicitOrderNumber} como una compra reciente entregada o enviada dentro del contexto que usamos para triage post-compra. ${SUPPORT_HANDOFF_LINE}`
        : `No veo pedidos recientes entregados o enviados en esta cuenta para ligar esa falla a una compra real sin inventar contexto. ${SUPPORT_HANDOFF_LINE}`,
      retrievalSource: 'NONE',
      matchStrategy: 'NO_RELEVANT_ORDER',
    });
  }

  const inWindowOrders = relevantOrders.filter(isWithinPolicyWindow);
  const outOfWindowOrders = relevantOrders.filter((order) => !isWithinPolicyWindow(order));
  const candidatePool = inWindowOrders.length > 0 ? inWindowOrders : outOfWindowOrders;
  const bestCandidate = pickBestItemCandidate(candidatePool, queryTokens);

  if (!bestCandidate) {
    const primaryOrder = [...candidatePool].sort((left, right) => {
      const leftDays = getDaysSinceOrder(left) ?? Number.MAX_SAFE_INTEGER;
      const rightDays = getDaysSinceOrder(right) ?? Number.MAX_SAFE_INTEGER;
      return leftDays - rightDays;
    })[0] ?? null;

    return buildResolution({
      kind: 'CANNOT_IDENTIFY_PRODUCT',
      defectType,
      scope: explicitOrderNumber ? 'EXPLICIT_ORDER_LOOKUP' : 'RECENT_FULFILLED_ORDERS',
      message: primaryOrder
        ? `Si ubico un pedido reciente de esta cuenta${primaryOrder.order_number ? ` (${primaryOrder.order_number})` : ''}, pero no puedo asegurar cual articulo es por lo que me dices. Para no inventarlo, sigue el caso por soporte con tu numero de pedido y evidencia del problema.`
        : `No pude identificar con suficiente confianza cual producto reciente corresponde a esa falla. ${SUPPORT_HANDOFF_LINE}`,
      retrievalSource: explicitOrderNumber ? 'EXPLICIT_ORDER_LOOKUP' : 'AUTHENTICATED_RECENT_ORDER',
      matchStrategy: 'CANNOT_IDENTIFY_PRODUCT',
      order: primaryOrder,
    });
  }

  const retrievalSource: WarrantyRetrievalSource = explicitOrderNumber ? 'EXPLICIT_ORDER_LOOKUP' : 'AUTHENTICATED_RECENT_ORDER';
  const scope: WarrantyScope = explicitOrderNumber ? 'EXPLICIT_ORDER_LOOKUP' : 'RECENT_FULFILLED_ORDERS';

  if (!isWithinPolicyWindow(bestCandidate.order)) {
    return buildResolution({
      kind: 'OUT_OF_POLICY',
      defectType,
      scope,
      message: buildOutOfPolicyMessage(bestCandidate.order, bestCandidate.item),
      retrievalSource,
      matchStrategy: 'OUT_OF_POLICY',
      order: bestCandidate.order,
      item: bestCandidate.item,
      matchedBy: bestCandidate.matchedBy,
    });
  }

  return buildResolution({
    kind: 'LIKELY_ELIGIBLE',
    defectType,
    scope,
    message: buildEligibleMessage(bestCandidate.order, bestCandidate.item, defectType),
    retrievalSource,
    matchStrategy: bestCandidate.matchedBy === 'single_item_order'
      ? 'AUTHENTICATED_SINGLE_ITEM_ORDER'
      : explicitOrderNumber
        ? 'EXPLICIT_ORDER_MATCH'
        : 'AUTHENTICATED_ITEM_MATCH',
    order: bestCandidate.order,
    item: bestCandidate.item,
    matchedBy: explicitOrderNumber ? 'explicit_order_number' : bestCandidate.matchedBy,
  });
}
