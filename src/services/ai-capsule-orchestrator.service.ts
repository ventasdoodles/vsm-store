import { supabase } from '../lib/supabase';
import { productSearchToolSchema } from '../lib/ai-capsule-schemas';
import { 
  evaluateProductSearchFallbackTree, 
  ProductSearchContext 
} from '../lib/product-search-capsule';
import { InternalCapsuleContract, InternalResolvedProduct } from '../types/ai-capsule';
import { knowledgeToolSchema } from '../lib/ai-capsule-schemas';
import { 
  evaluateKnowledgeRAGTree, 
  buildDegradedKnowledgeContract 
} from '../lib/knowledge-rag-capsule';
import { InternalKnowledgeContractType } from '../types/ai-capsule';
import { cartOperatorToolSchema } from '../lib/ai-capsule-schemas';
import { InternalCartOperatorContractType } from '../types/ai-capsule';
import { 
  evaluateCartOperatorCapsule,
  buildDegradedCartContract 
} from '../lib/cart-operator-capsule';

/**
 * PURE RUNTIME EXECUTION BRIDGE (Product Search Integrity Capsule)
 * Placed in the modular service layer.
 * 
 * Flawless Unidirectional Flow:
 * 1. Input Normalization & Zod Schema Validation
 * 2. Parallel Product Query Resolution (Exact + Vector Semantic)
 * 3. Fallback Evaluation (Pure Decision Tree)
 * 4. Structured Result Return
 */
export async function executeProductSearchCapsule(
  rawArgs: unknown
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
      customer_response_draft: 'Tuve un inconveniente interpretando tu búsqueda. ¿Podrías ser un poco más específico?',
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
  };

  try {
    // 2. PRODUCT QUERY RESOLUTION
    // Querying existing DB schema using standard RLS clients. 
    // No new tables or migrations added.

    // A. Exact Name Match Query
    const exactQuery = supabase
      .from('products')
      .select('id, slug, name, price, stock, ai_is_featured, ai_sales_note, description, specs')
      .eq('status', 'active')
      .ilike('name', `%${toolArgs.query}%`)
      .limit(5);

    // B. Semantic Vector Match (via Edge Processor & RPC)
    const semanticQuery = (async () => {
      // Small optimization: skip vector search if LLM ensures it's an exact unique term with no expansion needed
      // but to be safe on the fallback tree, we generally want robust alternatives.
      const { data: embedData, error: embedError } = await supabase.functions.invoke('embeddings-processor', {
        body: { text: toolArgs.query }
      });
      
      if (embedError || !embedData?.embedding) return [];

      const { data: matches, error: matchError } = await supabase.rpc('match_products', {
        query_embedding: embedData.embedding,
        match_threshold: 0.4,
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
      context.exact_matches = mapDbToInternal(exactRes.data || []);
      
      // Deduplicate semantics to prevent identical products across exact and semantic arrays
      const exactIds = new Set(context.exact_matches.map(p => p.id));
      const filteredSemantic = (semanticRes || []).filter((p: any) => !exactIds.has(p.id));
      
      context.semantic_matches = mapDbToInternal(filteredSemantic);
    }
  } catch (err) {
    context.infrastructure_error = 'DB_LATENCY';
  }

  // 4. FALLBACK EVALUATION (Pure Function via Approved Canon)
  const contract = evaluateProductSearchFallbackTree(context);

  // 5. STRUCTURED RESULT RETURN
  contract.latency_ms = Date.now() - startMs;
  return contract;
}

/**
 * Isolated mapper: Safely translates dynamic raw DB models 
 * into the strict structural requirements of the Capability Capsule.
 */
function mapDbToInternal(dbProducts: any[]): InternalResolvedProduct[] {
  return dbProducts.map(p => {
    // Determine strict status signal
    let status: InternalResolvedProduct['status_signal'] = 'IN_STOCK';
    if (p.stock <= 0) status = 'OUT_OF_STOCK';
    else if (p.stock <= 5) status = 'LOW_STOCK';

    // Determine strict commercial flag
    let flag: InternalResolvedProduct['commercial_flag'] = 'STANDARD';
    if (p.ai_is_featured) flag = 'FEATURED';

    return {
      id: p.id,
      slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'), // safe fallback to prevent breakage
      name: p.name,
      display_price: `$${p.price}`,
      raw_stock: p.stock,
      status_signal: status,
      commercial_flag: flag,
      ai_sales_note: p.ai_sales_note ?? null,
      description: p.description ?? null,
      specs: p.specs ?? null
    };
  });
}

async function hydrateSemanticSpecs(matches: any[]): Promise<any[]> {
  if (matches.length === 0) return matches;

  const ids = matches
    .map((product) => product?.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (ids.length === 0) return matches;

  const { data, error } = await supabase
    .from('products')
    .select('id, specs')
    .in('id', ids);

  if (error || !data) return matches;

  const specsById = new Map(
    data.map((row) => [row.id as string, row.specs ?? null])
  );

  return matches.map((product) => ({
    ...product,
    specs: specsById.get(product.id) ?? null,
  }));
}

/**
 * PURE RUNTIME EXECUTION BRIDGE (Knowledge & RAG Foundation Capsule)
 * Placed in the modular service layer.
 * 
 * Flawless Unidirectional Flow:
 * 1. Input Normalization & Zod Schema Validation
 * 2. Knowledge Retrieval (Vector Semantic Match)
 * 3. Fallback Evaluation (Pure Decision Tree)
 * 4. Structured Result Return
 */
export async function executeKnowledgeCapsule(
  rawArgs: unknown
): Promise<InternalKnowledgeContractType> {
  const startMs = Date.now();

  // 1. INPUT NORMALIZATION & SCHEMA VALIDATION
  const validation = knowledgeToolSchema.safeParse(rawArgs);
  if (!validation.success) {
    return buildDegradedKnowledgeContract('SCHEMA_ERROR', Date.now() - startMs);
  }

  const toolArgs = validation.data;
  
  try {
    // 2. KNOWLEDGE RETRIEVAL HANDOFF
    // Generate embedding for query
    const { data: embedData, error: embedError } = await supabase.functions.invoke('embeddings-processor', {
      body: { text: toolArgs.query }
    });
    
    if (embedError || !embedData?.embedding) {
      return buildDegradedKnowledgeContract('VECTOR_TIMEOUT', Date.now() - startMs);
    }

    // Match against RAG store
    const { data: matches, error: matchError } = await supabase.rpc('match_knowledge', {
      query_embedding: embedData.embedding,
      match_threshold: 0.5,
      match_count: 3
    });
    
    if (matchError) {
      return buildDegradedKnowledgeContract('DB_LATENCY', Date.now() - startMs);
    }

    // 3. CAPSULE EVALUATION
    const contract = evaluateKnowledgeRAGTree(matches || [], toolArgs.is_ambiguous, Date.now() - startMs);
    
    // 4. STRUCTURED RESULT RETURN
    return contract;
  } catch (err) {
    return buildDegradedKnowledgeContract('DB_LATENCY', Date.now() - startMs);
  }
}

/**
 * PURE RUNTIME EXECUTION BRIDGE (Cart Operator Capsule)
 * Placed in the modular service layer.
 * 
 * Flawless Unidirectional Flow:
 * 1. Input Normalization & Zod Schema Validation
 * 2. Identity Resolution Handoff (Product matching)
 * 3. Capsule Evaluation (Pure Decision Mapper)
 * 4. Structured Result Return
 */
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
     } catch (e) {
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
