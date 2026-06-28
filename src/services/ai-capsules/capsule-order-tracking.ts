import { resolveStorefrontAuthenticatedOrderTracking } from '@/services/storefront-order-tracking.service';









import { orderTrackingToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalOrderTrackingContractType } from '@/types/ai-capsule';



























export async function executeAuthenticatedOrderTrackingCapsule(
  rawArgs: unknown,
  options?: { customerId?: string | null },
): Promise<InternalOrderTrackingContractType> {
  const startMs = Date.now();
  const validation = orderTrackingToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'authenticated_order_tracking',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_RELEVANT_ORDER',
      customer_response_draft: 'No pude interpretar bien tu pregunta sobre el pedido. Intenta decirme si quieres revisar pago, estado o guia.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      order_tracking_signal: {
        kind: 'NO_RELEVANT_ORDER',
        focus: 'overview',
        scope: 'NONE',
        matched_by: 'none',
      },
      retrieval_source: 'NONE',
      capsule_reasoning: `Zod Validation Failed: ${validation.error.message}`,
    };
  }

  try {
    const resolution = await resolveStorefrontAuthenticatedOrderTracking({
      customerId: options?.customerId ?? null,
      query: validation.data.query,
    });

    return {
      capsule_name: 'authenticated_order_tracking',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'FOUND' ? 'SUCCESS' : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'AUTH_REQUIRED'
        ? 'AUTH_REQUIRED'
        : resolution.kind === 'ORDER_NOT_FOUND'
          ? 'ORDER_NOT_FOUND'
          : resolution.kind === 'NO_RELEVANT_ORDER'
            ? 'NO_RELEVANT_ORDER'
            : undefined,
      order_tracking_signal: resolution.signal,
      retrieval_source: resolution.retrievalSource,
    };
  } catch (error) {
    return {
      capsule_name: 'authenticated_order_tracking',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'NO_RELEVANT_ORDER',
      customer_response_draft: 'No pude consultar la verdad persistida del pedido en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'DB_LATENCY',
      order_tracking_signal: {
        kind: 'NO_RELEVANT_ORDER',
        focus: 'overview',
        scope: 'NONE',
        matched_by: 'none',
      },
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
