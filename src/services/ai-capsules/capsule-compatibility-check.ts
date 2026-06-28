import { resolveStorefrontCompatibilityCheck } from '@/services/storefront-compatibility-check.service';



















import { storefrontCompatibilityCheckToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalCompatibilityCheckContractType } from '@/types/ai-capsule';

















export async function executeStorefrontCompatibilityCheckCapsule(
  rawArgs: unknown,
): Promise<InternalCompatibilityCheckContractType> {
  const startMs = Date.now();
  const validation = storefrontCompatibilityCheckToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'storefront_compatibility_check',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NEEDS_MORE_CONTEXT',
      customer_response_draft: 'No pude interpretar bien la compatibilidad que quieres revisar. Dime el modelo exacto del dispositivo o la pieza para confirmarlo.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      compatibility_check_signal: {
        kind: 'NEEDS_MORE_CONTEXT',
        scope: 'NONE',
        anchor_product: null,
        candidate_product: null,
        relation_type: null,
        relation_scope: null,
        resolved_relation_count: 0,
        suggestion_count: 0,
        cart_context_used: false,
        fit_confidence: null,
      },
      retrieval_source: 'NONE',
      capsule_reasoning: 'Compatibility tool args failed schema validation.',
    };
  }

  try {
    const resolution = await resolveStorefrontCompatibilityCheck({
      query: validation.data.query,
      cart_product_ids: validation.data.cart_product_ids ?? [],
    });

    return {
      capsule_name: 'storefront_compatibility_check',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'COMPATIBLE'
        || resolution.kind === 'INCOMPATIBLE'
        || resolution.kind === 'REVIEW_PRODUCT'
        ? 'SUCCESS'
        : 'DEGRADED',
      match_strategy: resolution.matchStrategy,
      customer_response_draft: resolution.message,
      latency_ms: Date.now() - startMs,
      degraded_reason: resolution.kind === 'NEEDS_MORE_CONTEXT'
        ? 'NEEDS_MORE_CONTEXT'
        : resolution.kind === 'NO_GROUNDED_MATCH'
          ? 'NO_GROUNDED_MATCH'
          : undefined,
      compatibility_check_signal: resolution.signal,
      resolved_products: resolution.resolvedProducts,
      retrieval_source: resolution.retrievalSource,
      capsule_reasoning: resolution.kind === 'REVIEW_PRODUCT'
        ? 'Encontré una relacion grounding que amerita revisar producto o sugerencias sin afirmar ajuste mas fuerte del que tengo.'
        : resolution.kind === 'COMPATIBLE'
          ? 'La relacion especifica esta confirmada en la verdad del catalogo.'
          : resolution.kind === 'INCOMPATIBLE'
            ? 'La relacion especifica esta confirmada como incompatible.'
            : 'No hay suficiente verdad de compatibilidad para cerrarlo como si.',
    };
  } catch (error) {
    return {
      capsule_name: 'storefront_compatibility_check',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'NO_GROUNDED_MATCH',
      customer_response_draft: 'No pude consultar la verdad de compatibilidad en este momento. Intenta de nuevo en un momento.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      compatibility_check_signal: {
        kind: 'NO_GROUNDED_MATCH',
        scope: 'NONE',
        anchor_product: null,
        candidate_product: null,
        relation_type: null,
        relation_scope: null,
        resolved_relation_count: 0,
        suggestion_count: 0,
        cart_context_used: false,
        fit_confidence: null,
      },
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : 'Compatibility resolver failed.',
    };
  }
}
