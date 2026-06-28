import { resolveStorefrontPromotionSignal } from '@/services/storefront-promotions.service';
import { resolveStorefrontReplenishmentSignal } from '@/services/storefront-replenishment.service';
import { supabase } from '@/lib/supabase';

import { productSearchToolSchema } from '@/lib/ai-capsule-schemas';

import {
    evaluateProductSearchFallbackTree,
    ProductSearchContext
} from '@/lib/domain/product-search';

import { InternalCapsuleContract } from '@/types/ai-capsule';
























import { PRODUCT_SEARCH_SELECT } from "./constants";
import { mapDbToInternal, mapStorefrontProductToInternal } from "./mapper";
import { hydrateSemanticSpecs, runCatalogGuidedRecoveryQuery, runCatalogTokenRecoveryQuery } from "./recovery";
import { ProductSearchRow } from "./types";










export async function executeProductSearchCapsule(
  rawArgs: unknown,
  options?: { customerId?: string | null },
): Promise<InternalCapsuleContract> {
  const startMs = Date.now();

  // 1. INPUT NORMALIZATION & SCHEMA VALIDATION
  const validation = productSearchToolSchema.safeParse(rawArgs);
  if (!validation.success) {
    return {
      capsule_name: 'product_search_integrity',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_MATCH',
      customer_response_draft: 'Tuve un inconveniente procesando esta solicitud. ¿Podrías brindarme más detalles?',
      search_confidence: 0,
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      capsule_reasoning: `Zod Validation Failed: ${validation.error.message}`
    };
  }

  const toolArgs = validation.data;
  
  // Initialize standard context for the fallback tree
  const context: ProductSearchContext = {
    tool_args: toolArgs,
    exact_matches: [],
    semantic_matches: [],
    semantic_match_source: 'NONE',
  };

  try {
    const replenishmentResolution = options?.customerId
      ? await resolveStorefrontReplenishmentSignal({
          customerId: options.customerId,
          query: toolArgs.query,
        }).catch(() => null)
      : null;

    if (replenishmentResolution) {
      context.replenishment_signal = replenishmentResolution.signal;
      context.exact_matches = replenishmentResolution.resolvedProduct
        ? [mapStorefrontProductToInternal(replenishmentResolution.resolvedProduct, toolArgs.query)]
        : [];
      context.promotion_signal = replenishmentResolution.resolvedProduct
        ? await resolveStorefrontPromotionSignal({
            exactMatches: context.exact_matches,
            semanticMatches: [],
            customerId: options?.customerId ?? null,
          }).catch(() => null) ?? undefined
        : undefined;
    } else {
    // 2. PRODUCT QUERY RESOLUTION
    // Querying existing DB schema using standard RLS clients. 
    // No new tables or migrations added.

    // A. Exact Name Match Query
    const exactQuery = supabase
      .from('products')
      .select(PRODUCT_SEARCH_SELECT)
      .eq('status', 'active')
      .ilike('name', `%${toolArgs.query}%`)
      .limit(5);

    // B. Semantic Vector Match (via Edge Processor & RPC)
    const semanticQuery = (async () => {
      // DISCIPLINE: respect requires_semantic_expansion: false.
      // When the Analyst signals this is a specific brand/model lookup (not a concept),
      // semantic approximation produces misleading suggestions — skip entirely.
      // If exact match fails for a specific product, Branch F (no-match) is the correct outcome.
      if (toolArgs.requires_semantic_expansion === false) return [];

      const { data: embedData, error: embedError } = await supabase.functions.invoke('embeddings-processor', {
        body: { text: toolArgs.query }
      });
      
      if (embedError || !embedData?.embedding) return [];

      const { data: matches, error: matchError } = await supabase.rpc('match_products', {
        query_embedding: embedData.embedding,
        match_threshold: 0.55,
        match_count: 5
      });
      
      if (matchError) return [];
      return await hydrateSemanticSpecs(matches || []);
    })();

    // Execute IO in parallel for lowest latency
    const [exactRes, semanticRes] = await Promise.all([exactQuery, semanticQuery]);

    if (exactRes.error) {
      context.infrastructure_error = 'DB_LATENCY';
    } else {
      // 3. MAP RAW DB RESULTS TO SAFE CAPSULE INTERNALS
      context.exact_matches = mapDbToInternal((exactRes.data as ProductSearchRow[] | null) || [], toolArgs.query);
      
      // Deduplicate semantics to prevent identical products across exact and semantic arrays
      const exactIds = new Set(context.exact_matches.map(p => p.id));
      const filteredSemantic = ((semanticRes as ProductSearchRow[] | null) ?? []).filter((product) => !exactIds.has(product.id));
      let fallbackAlternatives = filteredSemantic;
      let semanticMatchSource: ProductSearchContext['semantic_match_source'] = filteredSemantic.length > 0 ? 'EMBEDDING_SEMANTIC' : 'NONE';

      const exactHasAvailableMatch = context.exact_matches.some((product) => product.status_signal !== 'OUT_OF_STOCK');
      if (fallbackAlternatives.length === 0 && !exactHasAvailableMatch) {
        const tokenRecoveryMatches = await runCatalogTokenRecoveryQuery(toolArgs.query);
        fallbackAlternatives = tokenRecoveryMatches.filter((product) => !exactIds.has(product.id));
        if (fallbackAlternatives.length > 0) {
          semanticMatchSource = 'TOKEN_RECOVERY';
        }
      }

      if (fallbackAlternatives.length === 0 && !exactHasAvailableMatch) {
        const guidedRecoveryMatches = await runCatalogGuidedRecoveryQuery(toolArgs.query, toolArgs.is_ambiguous);
        fallbackAlternatives = guidedRecoveryMatches.filter((product) => !exactIds.has(product.id));
        if (fallbackAlternatives.length > 0) {
          semanticMatchSource = 'TOKEN_RECOVERY';
        }
      }

      context.semantic_matches = mapDbToInternal(fallbackAlternatives, toolArgs.query);
      context.semantic_match_source = fallbackAlternatives.length > 0 ? semanticMatchSource : 'NONE';
      context.promotion_signal = await resolveStorefrontPromotionSignal({
        exactMatches: context.exact_matches,
        semanticMatches: context.semantic_matches,
        customerId: options?.customerId ?? null,
      }).catch(() => null) ?? undefined;
    }
    }
  } catch (error) {
    console.error('[ai-capsule-orchestrator] DB Latency Error in executeProductSearchCapsule:', error);
    context.infrastructure_error = 'DB_LATENCY';
  }

  // 4. FALLBACK EVALUATION (Pure Function via Approved Canon)
  const contract = evaluateProductSearchFallbackTree(context);

  // 5. STRUCTURED RESULT RETURN
  contract.latency_ms = Date.now() - startMs;
  return contract;
}
