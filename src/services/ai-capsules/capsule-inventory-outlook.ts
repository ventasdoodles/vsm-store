import { resolveStorefrontInventoryOutlook } from '@/services/storefront-inventory-outlook.service';

















import { inventoryOutlookToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalInventoryOutlookContractType } from '@/types/ai-capsule';



















export async function executeStorefrontInventoryOutlookCapsule(
  rawArgs: unknown,
): Promise<InternalInventoryOutlookContractType> {
  const startMs = Date.now();
  const validation = inventoryOutlookToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'storefront_inventory_outlook',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'PRODUCT_NOT_FOUND',
      customer_response_draft: 'No pude interpretar bien que producto quieres revisar en inventario. Si me dices el nombre exacto, te digo la disponibilidad real.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      inventory_outlook_signal: {
        kind: 'PRODUCT_NOT_FOUND',
        scope: 'NONE',
        product: null,
        variant_id: null,
        variant_label: null,
        current_stock: null,
        stock_basis: 'none',
        omnichannel_label: null,
        restock_eta: null,
        days_until_out: null,
        depletion_date: null,
        urgency_level: null,
        signal_quality: 'none',
      },
      resolved_products: [],
      retrieval_source: 'NONE',
      capsule_reasoning: validation.error.message,
    };
  }

  try {
    const resolution = await resolveStorefrontInventoryOutlook(validation.data);

    return {
      capsule_name: 'storefront_inventory_outlook',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'IN_STOCK_ONLINE'
        || resolution.kind === 'IN_STOCK_OMNICHANNEL'
        || resolution.kind === 'RESTOCK_EXPECTED'
        ? 'SUCCESS'
        : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'PRODUCT_NOT_FOUND'
        ? 'PRODUCT_NOT_FOUND'
        : resolution.kind === 'OUT_OF_STOCK_NO_ETA'
          ? 'OUT_OF_STOCK_NO_ETA'
          : undefined,
      inventory_outlook_signal: resolution.signal,
      resolved_products: resolution.resolvedProducts,
      retrieval_source: resolution.retrievalSource,
    };
  } catch (error) {
    return {
      capsule_name: 'storefront_inventory_outlook',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'PRODUCT_NOT_FOUND',
      customer_response_draft: 'No pude consultar la disponibilidad real de ese producto en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'DB_LATENCY',
      inventory_outlook_signal: {
        kind: 'PRODUCT_NOT_FOUND',
        scope: 'NONE',
        product: null,
        variant_id: null,
        variant_label: null,
        current_stock: null,
        stock_basis: 'none',
        omnichannel_label: null,
        restock_eta: null,
        days_until_out: null,
        depletion_date: null,
        urgency_level: null,
        signal_quality: 'none',
      },
      resolved_products: [],
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
