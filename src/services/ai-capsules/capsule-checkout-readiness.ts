import { resolveStorefrontCheckoutReadiness } from '@/services/storefront-checkout-readiness.service';















import { checkoutReadinessToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalCheckoutReadinessContractType } from '@/types/ai-capsule';





















export async function executeStorefrontCheckoutReadinessCapsule(
  rawArgs: unknown,
  options?: { customerId?: string | null },
): Promise<InternalCheckoutReadinessContractType> {
  const startMs = Date.now();
  const validation = checkoutReadinessToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'storefront_checkout_readiness',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'MISSING_REQUIRED_INFO',
      customer_response_draft: 'No pude interpretar bien si quieres revisar cierre de compra, pago o envio. Intenta decirme si quieres saber si ya puedes pagar o que te falta.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      checkout_readiness_signal: {
        kind: 'MISSING_REQUIRED_INFO',
        focus: 'checkout',
        scope: 'NONE',
        cart_item_count: 0,
        purchasable_item_count: 0,
        checkout_status: null,
        delivery_type: null,
        payment_method: null,
        enabled_payment_methods: [],
        missing_fields: [],
        blocker_reason: 'none',
        can_proceed_to_checkout: false,
        can_submit_checkout: false,
        open_order_id: null,
        open_order_number: null,
        coupon_code: null,
        coupon_valid: null,
        coupon_message: null,
        shipping_quote_available: null,
      },
      retrieval_source: 'NONE',
      capsule_reasoning: validation.error.message,
    };
  }

  try {
    const resolution = await resolveStorefrontCheckoutReadiness({
      customerId: options?.customerId ?? null,
      query: validation.data.query,
    });

    return {
      capsule_name: 'storefront_checkout_readiness',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'READY_TO_CHECKOUT'
        || resolution.kind === 'PAYMENT_METHOD_INFO'
        || resolution.kind === 'SHIPPING_INFO_AVAILABLE'
        ? 'SUCCESS'
        : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'AUTH_REQUIRED'
        ? 'AUTH_REQUIRED'
        : resolution.kind === 'CART_BLOCKER'
          ? 'CART_BLOCKER'
          : resolution.kind === 'MISSING_REQUIRED_INFO'
            ? 'MISSING_REQUIRED_INFO'
            : resolution.kind === 'SHIPPING_INFO_PARTIAL'
              ? 'SHIPPING_INFO_PARTIAL'
              : undefined,
      checkout_readiness_signal: resolution.signal,
      retrieval_source: resolution.retrievalSource,
    };
  } catch (error) {
    return {
      capsule_name: 'storefront_checkout_readiness',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'CART_BLOCKER',
      customer_response_draft: 'No pude revisar la verdad actual de checkout en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'DB_LATENCY',
      checkout_readiness_signal: {
        kind: 'CART_BLOCKER',
        focus: 'checkout',
        scope: 'NONE',
        cart_item_count: 0,
        purchasable_item_count: 0,
        checkout_status: null,
        delivery_type: null,
        payment_method: null,
        enabled_payment_methods: [],
        missing_fields: [],
        blocker_reason: 'none',
        can_proceed_to_checkout: false,
        can_submit_checkout: false,
        open_order_id: null,
        open_order_number: null,
        coupon_code: null,
        coupon_valid: null,
        coupon_message: null,
        shipping_quote_available: null,
      },
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
