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
 * Extract brief semantic context from product description.
 * SEMANTIC-ONLY: Used only in fallback scenarios (no specs available).
 * Rejects generic/promotional boilerplate and category repetition.
 */
function extractDescriptionContext(product: InternalResolvedProduct): string | null {
  const desc = product.description?.trim();
  if (!desc || desc.length === 0) return null;

  // Extract first sentence (up to period or 100 chars)
  const firstSentenceMatch = desc.match(/^([^.!?]+[.!?]?)/);
  if (!firstSentenceMatch || !firstSentenceMatch[1]) return null;

  const sentence = firstSentenceMatch[1].trim();

  // Filter: reject too-short output (noise) or too-long (avoid bloat)
  if (sentence.length < 15 || sentence.length > 80) return null;

  // Filter: reject common marketing boilerplate
  const lowerSentence = sentence.toLowerCase();
  const boilerplatePatterns = [
    /^(premium|best|high[- ]quality|amazing|incredible|excellent|perfect|top[- ]rated)/i,
    /\b(guaranteed|exclusive|special|limited|rare|unique|one of a kind)\b/i,
    /^(the )?(\w+)( vape| device| product| juice)?$/i, // pure category/title repetition
    /^product (?:description|info|details?|overview)$/i
  ];

  for (const pattern of boilerplatePatterns) {
    if (pattern.test(sentence)) return null;
  }

  // Filter: reject if looks like product name/title repetition
  // (if description is just the product name again, it adds no value)
  const productName = product.name?.toLowerCase() || '';
  if (productName && sentence.toLowerCase() === productName) return null;

  return lowerSentence;
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
    const featuredProducts = semanticInStock.slice(0, 4);
    const topFeaturedSpecs = extractSpecsFact(featuredProducts[0] as any);

    let ambiguityDraft = 'Veo varias opciones que podrían encajar. Para afinar la recomendación, ¿buscabas alguna marca o perfil de sabor en particular? Te dejo estas opciones destacadas:';
    if (topFeaturedSpecs) {
      ambiguityDraft = `Veo varias opciones que podrían encajar, incluyendo algunas ${topFeaturedSpecs}. Para afinar la recomendación, ¿buscabas alguna marca o perfil de sabor en particular? Te dejo estas opciones destacadas:`;
    }

    return buildContract(
      'SUCCESS',
      'FEATURED_FALLBACK',
      ambiguityDraft,
      0.4,
      featuredProducts,
      undefined,
      'Ambiguity flag active. Prompting user for clarification.',
      []
    );
  }

  // BRANCH C: DIRECT MATCH
  // High confidence exact resolution.
  if (exactInStock.length > 0) {
    const topProduct = exactInStock[0] as any;
    const topNote = topProduct?.ai_sales_note;
    const topSpecs = extractSpecsFact(topProduct);

    let exactDraft = '¡Aquí tienes exactamente lo que buscabas!';
    if (topNote) {
      exactDraft = `¡Aquí tienes exactamente lo que buscabas! ${topNote}`;
    } else if (topSpecs) {
      exactDraft = `¡Aquí tienes exactamente lo que buscabas! Viene ${topSpecs}.`;
    }

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
      // Build brief justification: why these alternatives fit
      const exhaustedProduct = exhaustedExact[0] as any;
      const alternativeProduct = semanticInStock[0] as any;
      const exhaustedSpecs = extractSpecsFact(exhaustedProduct);
      const alternativeSpecs = extractSpecsFact(alternativeProduct);

      const alternativeNote = alternativeProduct?.ai_sales_note;

      let oosAlternativeDraft = 'El producto exacto que buscas está temporalmente agotado, pero te seleccioné estas alternativas en existencia muy similares:';
      if (exhaustedSpecs && alternativeSpecs) {
        // Tier 1: Both have specs — emphasize similarity between original and alternative
        oosAlternativeDraft = `El producto exacto que buscas ${exhaustedSpecs} está agotado, pero encontré alternativas ${alternativeSpecs} en existencia:`;
      } else if (alternativeSpecs) {
        // Tier 2: Alternative has specs — highlight what was found
        oosAlternativeDraft = `El producto exacto que buscas está agotado, pero encontré alternativas ${alternativeSpecs} en existencia:`;
      } else if (alternativeNote) {
        // Tier 3: Curated note for top alternative when specs unavailable — concise, non-salesy
        oosAlternativeDraft = `El producto exacto que buscas está agotado, pero encontré una alternativa disponible — ${alternativeNote}:`;
      }

      return buildContract(
        'SUCCESS',
        'OUT_OF_STOCK_ALTERNATIVE',
        oosAlternativeDraft,
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
    const topNote = topProduct?.ai_sales_note;
    const topDescription = extractDescriptionContext(topProduct);

    // 4-tier hierarchy: specs (technical match) → note (curated context) → description (semantic) → generic
    let semanticDraft = 'No encontré un producto con ese nombre exacto, pero estas opciones de nuestro catálogo encajan perfecto con lo que pides:';
    if (topSpecsFact) {
      // Tier 1: Specs justify why semantic approximation matches user intent
      semanticDraft = `No encontré un producto con ese nombre exacto, pero ${topProduct.name} ${topSpecsFact} encaja perfecto con lo que pides:`;
    } else if (topNote) {
      // Tier 2: Curated note when specs unavailable — preserve original formatting, cautious tone
      semanticDraft = `No encontré un producto con ese nombre exacto, pero ${topProduct.name} (${topNote}) podría encajar con lo que buscas:`;
    } else if (topDescription) {
      // Tier 3: Semantic context when neither specs nor note apply — cautious tone matches tier 2
      semanticDraft = `No encontré un producto con ese nombre exacto, pero ${topProduct.name} (${topDescription}) podría encajar con lo que buscas:`;
    }

    return buildContract(
      'SUCCESS',
      'SEMANTIC',
      semanticDraft,
      0.7,
      semanticInStock.slice(0, 4),
      undefined,
      'Semantic approximation with specs/note/description hierarchy.',
      []
    );
  }

  // BRANCH F: NO SAFE RESULT
  // Emptiness condition explicitly addressed.
  // Recovery guidance: concrete reformulation cues without implying hidden availability.
  return buildContract(
    'SUCCESS',
    'NO_MATCH',
    'Revisé el catálogo pero no logré encontrar nada que coincida. Puedes intentar buscar por marca, sabor, tipo de dispositivo o modelo específico — una búsqueda más concreta suele dar mejores resultados.',
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
