import {
  InternalCapsuleContract,
  InternalResolvedProduct,
  ProductSearchToolArgs
} from '../types/ai-capsule';

/**
 * DATALAYER CONTEXT INJECTION
 * The runtime will hydrate this context before evaluating the fallback tree.
 */
export interface ProductSearchContext {
  tool_args: ProductSearchToolArgs;
  exact_matches: InternalResolvedProduct[];
  semantic_matches: InternalResolvedProduct[];
  infrastructure_error?: 'VECTOR_TIMEOUT' | 'ORACLE_TIMEOUT' | 'DB_LATENCY' | 'QUOTA_LIMIT';
}

/**
 * Extract 1–2 interesting specs for semantic response justification.
 * Tries common vape keys first, then 420 keys. Keeps response focused.
 */
function extractSpecsFact(product: InternalResolvedProduct): string | null {
  const specs = product.specs as Record<string, string> | null | undefined;
  if (!specs || Object.keys(specs).length === 0) return null;

  // Prioritize vape + common keys, fallback to others
  const keysToTry = ['Sabor', 'Nicotina', 'Puffs', 'Modelo', 'Cepa', 'THC', 'Tipo', 'Marca'];
  const found: string[] = [];

  for (const key of keysToTry) {
    if (key in specs && specs[key]?.trim()) {
      found.push(`${specs[key]}`);
      if (found.length >= 2) break;
    }
  }

  if (found.length === 0) return null;
  if (!found[0]) return null;

  // Weave into natural phrasing
  if (found.length === 1) {
    return `con ${found[0]?.toLowerCase()}`;
  } else if (found[1]) {
    return `${found[0]?.toLowerCase()} y ${found[1]?.toLowerCase()}`;
  }
  return null;
}

/**
 * FALLBACK TREE IMPLEMENTATION (PURE)
 * Evaluates the context and returns the strictly enforced capsule contract.
 * Zero side-effects, zero UI coupling.
 */
export function evaluateProductSearchFallbackTree(
  context: ProductSearchContext
): InternalCapsuleContract {
  const { tool_args, exact_matches, semantic_matches, infrastructure_error } = context;

  // BRANCH A: DEGRADED SAFE RESPONSE (Infrastructure Failures)
  // Ensures isolated failure domains. Does not crash the UI.
  if (infrastructure_error) {
    return buildContract(
      'DEGRADED', 
      'NO_MATCH', 
      'Estoy teniendo problemas intermitentes para sincronizar con el catálogo. Dame un momento y vuelve a intentar.',
      0.0,
      [],
      infrastructure_error,
      `Degraded by infrastructure: ${infrastructure_error}`
    );
  }

  // Filter out exhausted stock for clean UI presentation (Invariant protection)
  const exactInStock = exact_matches.filter(p => p.status_signal !== 'OUT_OF_STOCK');
  const semanticInStock = semantic_matches.filter(p => p.status_signal !== 'OUT_OF_STOCK');
  const exhaustedExact = exact_matches.filter(p => p.status_signal === 'OUT_OF_STOCK');

  // BRANCH B: AMBIGUITY HOLD
  // Prevents hallucinating a specific product when the user intent is inherently vague.
  if (tool_args.is_ambiguous) {
    return buildContract(
      'SUCCESS',
      'FEATURED_FALLBACK',
      'Tengo varias opciones interesantísimas. Para darte la recomendación perfecta, ¿buscabas alguna marca o perfil de sabor en particular? Te dejo estas opciones destacadas:',
      0.4,
      semanticInStock.slice(0, 4),
      undefined,
      'Ambiguity flag active. Prompting user for clarification.',
      []
    );
  }

  // BRANCH C: DIRECT MATCH
  // High confidence exact resolution.
  if (exactInStock.length > 0) {
    const topNote = exactInStock[0]?.ai_sales_note;
    const exactDraft = topNote
      ? `¡Aquí tienes exactamente lo que buscabas! ${topNote}`
      : '¡Aquí tienes exactamente lo que buscabas!';
    return buildContract(
      'SUCCESS',
      'EXACT',
      exactDraft,
      0.95,
      exactInStock.slice(0, 4),
      undefined,
      'Exact match found and in stock.',
      []
    );
  }

  // BRANCH D: OUT OF STOCK SAFE ALTERNATIVE
  // User asked for exact, it exists, but it's out of stock.
  // We preserve commercial evidence by passing exhausted_exact_matches.
  if (exact_matches.length > 0 && exactInStock.length === 0) {
    if (semanticInStock.length > 0) {
      return buildContract(
        'SUCCESS',
        'OUT_OF_STOCK_ALTERNATIVE',
        'El producto exacto que buscas está temporalmente agotado, pero te seleccioné estas alternativas en existencia muy similares:',
        0.75,
        semanticInStock.slice(0, 4),
        undefined,
        'Exact match was OOS. Safe fallback to semantic alternatives provided.',
        exhaustedExact
      );
    }
  }

  // BRANCH E: PARTIAL MATCH (SEMANTIC)
  // No exact name match found anywhere, relying on vector similarity.
  if (semanticInStock.length > 0) {
    const topProduct = semanticInStock[0] as any;
    const topSpecsFact = extractSpecsFact(topProduct);
    const semanticDraft = topSpecsFact
      ? `No encontré un producto con ese nombre exacto, pero ${topProduct.name} ${topSpecsFact} encaja perfecto con lo que pides:`
      : 'No encontré un producto con ese nombre exacto, pero estas opciones de nuestro catálogo encajan perfecto con lo que pides:';
    return buildContract(
      'SUCCESS',
      'SEMANTIC',
      semanticDraft,
      0.7,
      semanticInStock.slice(0, 4),
      undefined,
      'Semantic approximation with curated specs context.',
      []
    );
  }

  // BRANCH F: NO SAFE RESULT
  // Emptiness condition explicitly addressed.
  return buildContract(
    'SUCCESS',
    'NO_MATCH',
    'Revisé el catálogo pero no logré encontrar disponibilidad que coincida con tu búsqueda. ¿Podrías intentar buscarlo con otras palabras?',
    0.1,
    [],
    undefined,
    'Exhausted all search vectors. Empty result set.',
    []
  );
}

/**
 * Internal Factory helper to quickly assemble standard contracts
 */
function buildContract(
  status: InternalCapsuleContract['execution_status'],
  strategy: InternalCapsuleContract['match_strategy'],
  draft: string,
  confidence: number,
  products: InternalResolvedProduct[],
  degradedReason?: InternalCapsuleContract['degraded_reason'],
  reasoning?: string,
  exhaustedExact?: InternalResolvedProduct[]
): InternalCapsuleContract {
  return {
    capsule_name: 'product_search_integrity',
    capsule_version: '1.0.0',
    execution_status: status,
    match_strategy: strategy,
    customer_response_draft: draft,
    search_confidence: confidence,
    latency_ms: 0, // This will be overriden by runtime telemetry
    degraded_reason: degradedReason,
    resolved_products: products,
    capsule_reasoning: reasoning,
    exhausted_exact_matches: exhaustedExact
  };
}
