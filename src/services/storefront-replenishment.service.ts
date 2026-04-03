import { buildStorefrontOrderReorderPlan, getStorefrontOrdersIndexActionView } from '@/lib/domain/orders';
import { getStorefrontProductPurchaseability } from '@/lib/domain/products';
import { getCustomerOrders } from '@/services/orders.service';
import { getProductsByIds } from '@/services/products.service';
import type { InternalCapsuleContract } from '@/types/ai-capsule';
import type { OrderRecord } from '@/types/order';
import type { Product } from '@/types/product';

type StorefrontReplenishmentSignal = NonNullable<InternalCapsuleContract['replenishment_signal']>;

const REPLENISHMENT_PATTERNS: Array<{
  source: StorefrontReplenishmentSignal['source_phrase'];
  pattern: RegExp;
}> = [
  { source: 'LO_DE_SIEMPRE', pattern: /\blo\s+de\s+siempre\b/ },
  { source: 'LO_MISMO', pattern: /\b(lo\s+mismo|quiero\s+lo\s+mismo)\b/ },
  { source: 'MIS_PODS', pattern: /\bmis\s+pods?\b/ },
  { source: 'QUIERO_REPETIR', pattern: /\b(quiero\s+repetir|repetir|repite?me|volver\s+a\s+pedir)\b/ },
];

const POD_LIKE_PATTERN = /\b(pod|pods|cartucho|cartuchos)\b/;
const CONSUMABLE_PATTERN = /\b(pod|pods|cartucho|cartuchos|coil|coils|resistencia|resistencias|liquido|liquidos|juice|nicsalt|nic salt|salts?|cart|carts|gomita|gomitas|brownie|brownies|pre roll|preroll|capsula|capsulas)\b/;
const MAX_RECENT_ORDERS = 6;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getOrderItemsText(order: OrderRecord): string {
  return (Array.isArray(order.items) ? order.items : [])
    .map((item) => [item.name, item.variant_name].filter(Boolean).join(' '))
    .join(' ');
}

function isConsumableLike(value: string): boolean {
  return CONSUMABLE_PATTERN.test(normalizeText(value));
}

function scoreOrder(order: OrderRecord, phrase: StorefrontReplenishmentSignal['source_phrase'], index: number): number {
  const normalizedItems = normalizeText(getOrderItemsText(order));
  let score = 120 - (index * 12);

  if (phrase === 'MIS_PODS' && POD_LIKE_PATTERN.test(normalizedItems)) {
    score += 80;
  }

  if (isConsumableLike(normalizedItems)) {
    score += 20;
  }

  return score;
}

function scoreReorderableItem(input: {
  product: Product;
  variantLabel?: string | null;
  phrase: StorefrontReplenishmentSignal['source_phrase'];
}): number {
  const normalizedText = normalizeText([input.product.name, input.variantLabel].filter(Boolean).join(' '));
  let score = isConsumableLike(normalizedText) ? 30 : 0;

  if (input.phrase === 'MIS_PODS' && POD_LIKE_PATTERN.test(normalizedText)) {
    score += 100;
  }

  return score;
}

export function detectStorefrontReplenishmentIntent(
  query: string,
): StorefrontReplenishmentSignal['source_phrase'] | null {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  for (const candidate of REPLENISHMENT_PATTERNS) {
    if (candidate.pattern.test(normalizedQuery)) {
      return candidate.source;
    }
  }

  return null;
}

export async function resolveStorefrontReplenishmentSignal(input: {
  customerId: string;
  query: string;
}): Promise<{ signal: StorefrontReplenishmentSignal; resolvedProduct: Product | null } | null> {
  const sourcePhrase = detectStorefrontReplenishmentIntent(input.query);
  if (!sourcePhrase) return null;

  const recentOrders = (await getCustomerOrders(input.customerId))
    .filter((order) => getStorefrontOrdersIndexActionView(order).showReorder)
    .slice(0, MAX_RECENT_ORDERS);

  if (recentOrders.length === 0) return null;

  if (sourcePhrase === 'MIS_PODS' && !recentOrders.some((order) => POD_LIKE_PATTERN.test(normalizeText(getOrderItemsText(order))))) {
    return null;
  }

  const productIds = Array.from(new Set(
    recentOrders.flatMap((order) => (Array.isArray(order.items) ? order.items : []))
      .map((item) => item.product_id)
      .filter((productId): productId is string => Boolean(productId)),
  ));

  if (productIds.length === 0) return null;

  const catalogProducts = await getProductsByIds(productIds);
  const rankedOrders = recentOrders
    .map((order, index) => ({
      order,
      score: scoreOrder(order, sourcePhrase, index),
      plan: buildStorefrontOrderReorderPlan(Array.isArray(order.items) ? order.items : [], catalogProducts, []),
    }))
    .sort((left, right) => right.score - left.score);

  const selectedOrder = rankedOrders[0];
  if (!selectedOrder) return null;

  const rankedAddableItems = [...selectedOrder.plan.addableItems]
    .sort((left, right) => (
      scoreReorderableItem({
        product: right.product,
        variantLabel: right.variantToken?.name ?? right.orderItem.variant_name ?? null,
        phrase: sourcePhrase,
      }) - scoreReorderableItem({
        product: left.product,
        variantLabel: left.variantToken?.name ?? left.orderItem.variant_name ?? null,
        phrase: sourcePhrase,
      })
    ));

  if (rankedAddableItems.length === 0) {
    return {
      signal: {
        kind: 'UNAVAILABLE',
        source_order_id: selectedOrder.order.id,
        source_order_created_at: selectedOrder.order.created_at,
        source_phrase: sourcePhrase,
        blocked_item_count: selectedOrder.plan.blockedLineCount,
        action_mode: 'NONE',
        blocked_reason_detail: selectedOrder.plan.blockedItems[0]?.detail ?? 'Lo mas reciente ya no se puede reconstruir con seguridad contra el catalogo actual.',
      },
      resolvedProduct: null,
    };
  }

  const selectedItem = rankedAddableItems[0];
  if (!selectedItem) return null;

  const purchaseability = getStorefrontProductPurchaseability(selectedItem.product, {
    selectedVariantId: selectedItem.variantToken?.id ?? null,
  });

  const actionMode: StorefrontReplenishmentSignal['action_mode'] = purchaseability.canAddToCart && !purchaseability.requiresVariantSelection
    ? 'ADD_TO_CART'
    : 'OPEN_PDP';

  return {
    signal: {
      kind: selectedOrder.plan.blockedLineCount > 0 || selectedOrder.plan.partialLineCount > 0 || selectedItem.skippedQuantity > 0
        ? 'PARTIAL'
        : 'READY',
      source_order_id: selectedOrder.order.id,
      source_order_created_at: selectedOrder.order.created_at,
      source_phrase: sourcePhrase,
      primary_product: {
        id: selectedItem.product.id,
        name: selectedItem.product.name,
        slug: selectedItem.product.slug,
        section: selectedItem.product.section,
      },
      variant_id: selectedItem.variantToken?.id ?? null,
      variant_label: selectedItem.variantToken?.name ?? null,
      quantity: selectedItem.quantityToAdd,
      requested_quantity: selectedItem.requestedQuantity,
      blocked_item_count: selectedOrder.plan.blockedLineCount,
      partial_quantity: selectedItem.skippedQuantity > 0,
      action_mode: actionMode,
      blocked_reason_detail: selectedOrder.plan.blockedItems[0]?.detail ?? null,
    },
    resolvedProduct: selectedItem.product,
  };
}
