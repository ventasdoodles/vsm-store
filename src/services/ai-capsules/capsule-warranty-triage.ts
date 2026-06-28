import { resolveStorefrontAuthenticatedWarrantyTriage } from '@/services/storefront-warranty-triage.service';











import { warrantyTriageToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalWarrantyTriageContractType } from '@/types/ai-capsule';

























export async function executeAuthenticatedWarrantyTriageCapsule(
  rawArgs: unknown,
  options?: { customerId?: string | null },
): Promise<InternalWarrantyTriageContractType> {
  const startMs = Date.now();
  const validation = warrantyTriageToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'authenticated_warranty_triage',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_RELEVANT_ORDER',
      customer_response_draft: 'No pude interpretar bien la falla o garantia que quieres revisar. Intenta decirme que problema trae y, si puedes, que producto fue.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      warranty_triage_signal: {
        kind: 'NO_RELEVANT_ORDER',
        defect_type: 'general_defect',
        scope: 'NONE',
        matched_by: 'none',
      },
      retrieval_source: 'NONE',
      capsule_reasoning: `Zod Validation Failed: ${validation.error.message}`,
    };
  }

  try {
    const resolution = await resolveStorefrontAuthenticatedWarrantyTriage({
      customerId: options?.customerId ?? null,
      query: validation.data.query,
    });

    return {
      capsule_name: 'authenticated_warranty_triage',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'LIKELY_ELIGIBLE' || resolution.kind === 'OUT_OF_POLICY'
        ? 'SUCCESS'
        : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'AUTH_REQUIRED'
        ? 'AUTH_REQUIRED'
        : resolution.kind === 'CANNOT_IDENTIFY_PRODUCT'
          ? 'CANNOT_IDENTIFY_PRODUCT'
          : resolution.kind === 'NO_RELEVANT_ORDER'
            ? 'NO_RELEVANT_ORDER'
            : undefined,
      warranty_triage_signal: resolution.signal,
      retrieval_source: resolution.retrievalSource,
    };
  } catch (error) {
    return {
      capsule_name: 'authenticated_warranty_triage',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'NO_RELEVANT_ORDER',
      customer_response_draft: 'No pude consultar el contexto post-compra para revisar esa falla en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'DB_LATENCY',
      warranty_triage_signal: {
        kind: 'NO_RELEVANT_ORDER',
        defect_type: 'general_defect',
        scope: 'NONE',
        matched_by: 'none',
      },
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
