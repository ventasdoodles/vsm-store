import { resolveStorefrontBudgetRescue } from '@/services/storefront-budget-rescue.service';





















import { storefrontBudgetRescueToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalBudgetRescueContractType } from '@/types/ai-capsule';















export async function executeStorefrontBudgetRescueCapsule(
  rawArgs: unknown,
): Promise<InternalBudgetRescueContractType> {
  const startMs = Date.now();
  const validation = storefrontBudgetRescueToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'storefront_budget_rescue',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_GOOD_TRADE_DOWN',
      customer_response_draft: 'No pude aterrizar desde que producto quieres bajar el gasto. Dime cual vas viendo y te digo si hay una opcion realmente mas barata.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      budget_rescue_signal: {
        kind: 'NO_GOOD_TRADE_DOWN',
        scope: 'NONE',
        anchor_product: null,
        cheaper_product: null,
        anchor_price: null,
        cheaper_price: null,
        savings_amount: null,
        alternative_count: 0,
        compatibility_sensitive: false,
        used_cart_context: false,
        anchored_by: 'none',
      },
      resolved_products: [],
      retrieval_source: 'NONE',
      capsule_reasoning: validation.error.message,
    };
  }

  try {
    const resolution = await resolveStorefrontBudgetRescue(validation.data);

    return {
      capsule_name: 'storefront_budget_rescue',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'CHEAPER_ALTERNATIVE_FOUND'
        || resolution.kind === 'PROMO_ALREADY_BEST_VALUE'
        || resolution.kind === 'REVIEW_CURRENT_OPTION'
        ? 'SUCCESS'
        : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'NO_GOOD_TRADE_DOWN'
        ? 'NO_GOOD_TRADE_DOWN'
        : undefined,
      budget_rescue_signal: resolution.signal,
      resolved_products: resolution.resolvedProducts,
      retrieval_source: resolution.retrievalSource,
    };
  } catch (error) {
    return {
      capsule_name: 'storefront_budget_rescue',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'NO_GOOD_TRADE_DOWN',
      customer_response_draft: 'No pude revisar el trade-down real en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'DB_LATENCY',
      budget_rescue_signal: {
        kind: 'NO_GOOD_TRADE_DOWN',
        scope: 'NONE',
        anchor_product: null,
        cheaper_product: null,
        anchor_price: null,
        cheaper_price: null,
        savings_amount: null,
        alternative_count: 0,
        compatibility_sensitive: false,
        used_cart_context: false,
        anchored_by: 'none',
      },
      resolved_products: [],
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
