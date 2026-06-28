import { resolveStorefrontAuthenticatedLoyaltyStatus } from '@/services/storefront-loyalty-status.service';













import { loyaltyStatusToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalLoyaltyStatusContractType } from '@/types/ai-capsule';























export async function executeAuthenticatedLoyaltyStatusCapsule(
  rawArgs: unknown,
  options?: { customerId?: string | null },
): Promise<InternalLoyaltyStatusContractType> {
  const startMs = Date.now();
  const validation = loyaltyStatusToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'authenticated_loyalty_status',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_LOYALTY_DATA',
      customer_response_draft: 'No pude interpretar bien tu duda sobre puntos o nivel. Intenta decirme si quieres ver tus puntos, tu nivel o cuanto valen.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      loyalty_status_signal: {
        kind: 'NO_LOYALTY_DATA',
        focus: 'overview',
        scope: 'NONE',
        loyalty_enabled: null,
      },
      retrieval_source: 'NONE',
      capsule_reasoning: `Zod Validation Failed: ${validation.error.message}`,
    };
  }

  try {
    const resolution = await resolveStorefrontAuthenticatedLoyaltyStatus({
      customerId: options?.customerId ?? null,
      query: validation.data.query,
    });

    return {
      capsule_name: 'authenticated_loyalty_status',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'POINTS_BALANCE' || resolution.kind === 'TIER_INFO'
        ? 'SUCCESS'
        : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'AUTH_REQUIRED'
        ? 'AUTH_REQUIRED'
        : resolution.kind === 'NO_LOYALTY_DATA'
          ? 'NO_LOYALTY_DATA'
          : undefined,
      loyalty_status_signal: resolution.signal,
      retrieval_source: resolution.retrievalSource,
    };
  } catch (error) {
    return {
      capsule_name: 'authenticated_loyalty_status',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'NO_LOYALTY_DATA',
      customer_response_draft: 'No pude consultar tu lealtad real en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'DB_LATENCY',
      loyalty_status_signal: {
        kind: 'NO_LOYALTY_DATA',
        focus: 'overview',
        scope: 'NONE',
        loyalty_enabled: null,
      },
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
