import type { 
  CartOperatorToolArgs, 
  InternalCartOperatorContractType 
} from '../types/ai-capsule';

/**
 * Knowledge & RAG Foundation Capsule — Pure Mapper Shell
 * 
 * Boundary Status: PURE (No DB calls, no execution logic, no UI)
 * Responsibility: Maps AI tool arguments into a safe, client-executable Cart Mutation Proposal.
 * 
 * Rules:
 * - Does not perform the mutation.
 * - Filters out mathematically illogical values (negative quantities).
 * - Generates clear rendering machine-signals for the UI.
 */

export function evaluateCartOperatorCapsule(
  args: CartOperatorToolArgs,
  latencyMs: number = 0
): InternalCartOperatorContractType {
  try {
    // 1. Validate Base Safety
    if (args.quantity <= 0) {
      return buildBlockedMutationContract('Cantidad ilógica detectada.', latencyMs, 'UNSAFE_MUTATION');
    }

    // 2. Ambiguity Check
    // If there is no specific product_ref, we can't propose a mutation.
    if (!args.product_ref || args.product_ref.trim() === '') {
      return buildAmbiguousMutationContract('No especificaste el producto.', latencyMs);
    }

    // 3. EXACT_MUTATION_PROPOSED (Optimistic path, pending resolution by execution layer)
    // Note: resolved_product_id is kept null. The execution layer will reconcile product_ref with its cache.
    return {
      capsule_name: 'cart_operator',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT_MUTATION_PROPOSED',
      latency_ms: latencyMs,
      
      mutation_proposal: {
        type: args.action, // 'ADD', 'REMOVE', 'UPDATE_QTY'
        product_ref: args.product_ref,
        resolved_product_id: null,
        resolved_variant_id: null,
        quantity: args.quantity
      },
      
      ui_render_mode: 'ACTION_READY'
    };

  } catch (error) {
    return buildDegradedCartContract(latencyMs, 'SCHEMA_ERROR');
  }
}

// ==========================================
// FALLBACK & DEGRADATION HANDLERS
// ==========================================

export function buildBlockedMutationContract(
  reason: string,
  latencyMs: number,
  strategy: 'UNSAFE_MUTATION' | 'NO_OP' = 'UNSAFE_MUTATION'
): InternalCartOperatorContractType {
  return {
    capsule_name: 'cart_operator',
    capsule_version: '1.0.0',
    execution_status: 'SUCCESS',
    match_strategy: strategy,
    latency_ms: latencyMs,
    ui_render_mode: 'ACTION_BLOCKED'
  };
}

export function buildAmbiguousMutationContract(
  reason: string, 
  latencyMs: number
): InternalCartOperatorContractType {
  return {
    capsule_name: 'cart_operator',
    capsule_version: '1.0.0',
    execution_status: 'SUCCESS',
    match_strategy: 'AMBIGUOUS_MUTATION',
    latency_ms: latencyMs,
    ui_render_mode: 'CLARIFICATION_REQUIRED'
  };
}

export function buildDegradedCartContract(
  latencyMs: number,
  reason: 'SCHEMA_ERROR' | 'QUOTA_LIMIT' | 'CATALOG_LATENCY' | undefined = undefined
): InternalCartOperatorContractType {
  return {
    capsule_name: 'cart_operator',
    capsule_version: '1.0.0',
    execution_status: 'DEGRADED',
    match_strategy: 'NO_OP',
    latency_ms: latencyMs,
    degraded_reason: reason,
    ui_render_mode: 'SILENT'
  };
}
