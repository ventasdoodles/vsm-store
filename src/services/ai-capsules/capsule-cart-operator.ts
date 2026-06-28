import { supabase } from '@/lib/supabase';







import { cartOperatorToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalCartOperatorContractType } from '@/types/ai-capsule';

















import {
    buildDegradedCartContract,
    evaluateCartOperatorCapsule
} from '@/lib/cart-operator-capsule';












export async function executeCartOperatorCapsule(
  rawArgs: unknown
): Promise<InternalCartOperatorContractType> {
  const startMs = Date.now();

  // 1. INPUT NORMALIZATION & SCHEMA VALIDATION
  const validation = cartOperatorToolSchema.safeParse(rawArgs);
  if (!validation.success) {
    return buildDegradedCartContract(Date.now() - startMs, 'SCHEMA_ERROR');
  }

  const toolArgs = validation.data;
  
  // 2. PRODUCT RESOLUTION HANDOFF (Basic ilike for now)
  let resolvedProductId: string | null = null;

  if (toolArgs.product_ref && toolArgs.product_ref.trim() !== '') {
     try {
        const { data } = await supabase
          .from('products')
          .select('id')
          .ilike('name', `%${toolArgs.product_ref.trim()}%`)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();
        
        if (data) {
           resolvedProductId = data.id;
        }
     } catch (error) {
        console.error('[ai-capsule-orchestrator] Catalog Latency Error in executeCartOperatorCapsule:', error);
        return buildDegradedCartContract(Date.now() - startMs, 'CATALOG_LATENCY');
     }
  }

  // 3. CAPSULE EVALUATION (Pure Mapper)
  const contract = evaluateCartOperatorCapsule(toolArgs, Date.now() - startMs);

  // 4. INJECT RESOLUTION IF APPLICABLE
  if (contract.match_strategy === 'EXACT_MUTATION_PROPOSED' && contract.mutation_proposal) {
     if (resolvedProductId) {
         contract.mutation_proposal.resolved_product_id = resolvedProductId;
     } else {
         // If optimistic proposal failed to resolve a real DB ID, safely downgrade
         contract.match_strategy = 'AMBIGUOUS_MUTATION';
         contract.ui_render_mode = 'CLARIFICATION_REQUIRED';
     }
  }

  return contract;
}
