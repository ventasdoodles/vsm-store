import {
  InternalCapsuleContract,
  InternalResolvedProduct,
  ProductSearchToolArgs,
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

const FLAVOR_HINTS = ['menta', 'mango', 'uva', 'frutal', 'fruta', 'dulce', 'ice', 'hielo', 'sandia', 'fresa', 'melon', 'mora', 'cereza', 'tabaco', 'caramelo'];
const DEVICE_HINTS = ['desechable', 'pod', 'pods', 'cartucho', 'cartuchos', 'kit', 'mod', 'vape', 'pipa', 'bateria', 'baterias', 'extracto', 'extractos', 'wax', 'pluma', '510'];
const BUDGET_HINTS = ['barato', 'economico', 'económico', 'precio', 'presupuesto', 'menos', 'maximo', 'máximo', '$'];
const EFFECT_HINTS = ['suave', 'fuerte', 'relajar', 'relaje', 'rico', 'dia', 'día', 'noche', 'pegar', 'tranqui', 'intenso'];

/**
 * Extract 1-2 interesting specs for semantic response justification.
 * Tries common vape keys first, then 420 keys. Keeps response focused.
 */
function extractSpecsFact(product: InternalResolvedProduct): string | null {
  const specs = product.specs as Record<string, string> | null | undefined;
  if (!specs || Object.keys(specs).length === 0) return null;

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

  if (found.length === 1) {
    return `con ${found[0]?.toLowerCase()}`;
  }
  if (found[1]) {
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

  const firstSentenceMatch = desc.match(/^([^.!?]+[.!?]?)/);
  if (!firstSentenceMatch || !firstSentenceMatch[1]) return null;

  const sentence = firstSentenceMatch[1].trim();
  if (sentence.length < 15 || sentence.length > 80) return null;

  const lowerSentence = sentence.toLowerCase();
  const boilerplatePatterns = [
    /^(premium|best|high[- ]quality|amazing|incredible|excellent|perfect|top[- ]rated)/i,
    /\b(guaranteed|exclusive|special|limited|rare|unique|one of a kind)\b/i,
    /^(the )?(\w+)( vape| device| product| juice)?$/i,
    /^product (?:description|info|details?|overview)$/i,
  ];

  for (const pattern of boilerplatePatterns) {
    if (pattern.test(sentence)) return null;
  }

  const productName = product.name?.toLowerCase() || '';
  if (productName && sentence.toLowerCase() === productName) return null;

  return lowerSentence;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function hasAnyHint(value: string, hints: string[]): boolean {
  return hints.some((hint) => value.includes(hint));
}

function hasModelCue(value: string): boolean {
  return /\b[a-z]*\d+[a-z\d-]*\b/i.test(value);
}

function joinSentences(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildHandoffLine(mode: 'single' | 'options'): string {
  return mode === 'single'
    ? 'Si es ese, abre la ficha para revisar detalles o usa la bolsa para agregarlo al carrito.'
    : 'Si alguna te late, abre la ficha para revisar detalles o usa la bolsa para agregarla al carrito.';
}

function buildAmbiguityQuestion(query: string): string {
  const normalized = normalizeSearchText(query);
  const prompts: string[] = [];

  if (!hasAnyHint(normalized, DEVICE_HINTS)) {
    prompts.push('¿Lo quieres desechable, pod, cartucho o algo 420?');
  }
  if (!hasAnyHint(normalized, FLAVOR_HINTS)) {
    prompts.push('¿Traes algún sabor o perfil, tipo menta, frutal, dulce o ice?');
  }
  if (!hasAnyHint(normalized, BUDGET_HINTS)) {
    prompts.push('¿Y en qué rango de precio te quieres mover?');
  }
  if (prompts.length === 0 && hasAnyHint(normalized, EFFECT_HINTS)) {
    prompts.push('¿Lo quieres más suave, más intenso o para alguna ocasión en particular?');
  }

  return prompts.slice(0, 2).join(' ');
}

function buildRecoveryQuestion(query: string): string {
  const normalized = normalizeSearchText(query);

  if (hasModelCue(normalized)) {
    return 'Si recuerdas la marca, la serie o aunque sea otra variante cercana, te aterrizo opciones reales de esa misma línea.';
  }

  if (hasAnyHint(normalized, FLAVOR_HINTS) && !hasAnyHint(normalized, DEVICE_HINTS)) {
    return 'Si me dices si lo quieres desechable, pod, cartucho o algo 420, te cierro la búsqueda mucho más rápido.';
  }

  if (hasAnyHint(normalized, DEVICE_HINTS) && !hasAnyHint(normalized, FLAVOR_HINTS)) {
    return 'Si me das sabor, intensidad o marca, te regreso opciones mucho más útiles.';
  }

  if (hasAnyHint(normalized, BUDGET_HINTS)) {
    return 'Si además me dices marca, sabor o tipo de dispositivo, te propongo opciones reales dentro de ese rango.';
  }

  return 'Si me das marca, sabor, tipo de dispositivo o modelo cercano, te regreso opciones reales sin dejarte en un callejón sin salida.';
}

function buildSemanticRefinementLine(query: string): string {
  const normalized = normalizeSearchText(query);

  if (hasModelCue(normalized)) {
    return 'Si buscabas otra variante o sabor de esa misma línea, dímelo y te la afino.';
  }

  if (!hasAnyHint(normalized, FLAVOR_HINTS) || !hasAnyHint(normalized, DEVICE_HINTS)) {
    return 'Si me confirmas marca, sabor o tipo de dispositivo, te afino la siguiente ronda.';
  }

  return 'Si querías otra variante puntual, dime el detalle y la aterrizamos.';
}

/**
 * FALLBACK TREE IMPLEMENTATION (PURE)
 * Evaluates the context and returns the strictly enforced capsule contract.
 * Zero side-effects, zero UI coupling.
 */
export function evaluateProductSearchFallbackTree(
  context: ProductSearchContext,
): InternalCapsuleContract {
  const { tool_args, exact_matches, semantic_matches, infrastructure_error } = context;

  if (infrastructure_error) {
    return buildContract(
      'DEGRADED',
      'NO_MATCH',
      'Estoy teniendo problemas intermitentes para sincronizar con el catálogo. Dame un momento y vuelve a intentar.',
      0.0,
      [],
      infrastructure_error,
      `Degraded by infrastructure: ${infrastructure_error}`,
    );
  }

  const exactInStock = exact_matches.filter((product) => product.status_signal !== 'OUT_OF_STOCK');
  const semanticInStock = semantic_matches.filter((product) => product.status_signal !== 'OUT_OF_STOCK');
  const exhaustedExact = exact_matches.filter((product) => product.status_signal === 'OUT_OF_STOCK');

  if (tool_args.is_ambiguous) {
    const featuredProducts = semanticInStock.slice(0, 4);
    if (featuredProducts.length === 0) {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        joinSentences(
          `Revisé el catálogo pero no logré encontrar una salida clara para "${tool_args.query}".`,
          buildRecoveryQuestion(tool_args.query),
        ),
        0.1,
        [],
        undefined,
        'Ambiguity flag active but no featured products available. Falling through to no-match guidance.',
        [],
      );
    }

    const topFeaturedProduct = featuredProducts[0];
    if (!topFeaturedProduct) {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        joinSentences(
          `Revisé el catálogo pero no logré encontrar una salida clara para "${tool_args.query}".`,
          buildRecoveryQuestion(tool_args.query),
        ),
        0.1,
        [],
        undefined,
        'Ambiguity fallback exhausted after guard.',
        [],
      );
    }

    const topFeaturedSpecs = extractSpecsFact(topFeaturedProduct);
    const ambiguityQuestion = buildAmbiguityQuestion(tool_args.query);

    let ambiguityDraft = joinSentences(
      'Veo varias opciones que podrían encajar.',
      ambiguityQuestion || 'Para afinar la recomendación, dime marca, sabor o tipo de dispositivo.',
      'Mientras me dices, te dejo estas opciones destacadas.',
      buildHandoffLine('options'),
    );

    if (topFeaturedSpecs) {
      ambiguityDraft = joinSentences(
        `Veo varias opciones que podrían encajar, incluyendo algunas ${topFeaturedSpecs}.`,
        ambiguityQuestion || 'Para afinar la recomendación, dime marca, sabor o tipo de dispositivo.',
        'Mientras me dices, te dejo estas opciones destacadas.',
        buildHandoffLine('options'),
      );
    }

    return buildContract(
      'SUCCESS',
      'FEATURED_FALLBACK',
      ambiguityDraft,
      0.4,
      featuredProducts,
      undefined,
      'Ambiguity flag active. Prompting user for clarification.',
      [],
    );
  }

  if (exactInStock.length > 0) {
    const topProduct = exactInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, []);
    }
    const topNote = topProduct.ai_sales_note;
    const topSpecs = extractSpecsFact(topProduct);

    let exactDraft = 'Aquí tienes exactamente lo que buscabas.';
    if (topNote) {
      exactDraft = `Aquí tienes exactamente lo que buscabas. ${topNote}`;
    } else if (topSpecs) {
      exactDraft = `Aquí tienes exactamente lo que buscabas. Viene ${topSpecs}.`;
    }

    return buildContract(
      'SUCCESS',
      'EXACT',
      joinSentences(exactDraft, buildHandoffLine('single')),
      0.95,
      exactInStock.slice(0, 4),
      undefined,
      'Exact match found and in stock.',
      [],
    );
  }

  if (exact_matches.length > 0 && exactInStock.length === 0) {
    if (semanticInStock.length > 0) {
      const exhaustedProduct = exhaustedExact[0];
      const alternativeProduct = semanticInStock[0];
      if (!alternativeProduct) {
        return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, []);
      }
      const exhaustedSpecs = exhaustedProduct ? extractSpecsFact(exhaustedProduct) : null;
      const alternativeSpecs = extractSpecsFact(alternativeProduct);
      const alternativeNote = alternativeProduct.ai_sales_note;

      let oosAlternativeDraft = 'El producto exacto que buscas está temporalmente agotado, pero te seleccioné alternativas reales que sí están en existencia.';
      if (exhaustedSpecs && alternativeSpecs) {
        oosAlternativeDraft = `El producto exacto que buscas ${exhaustedSpecs} está agotado, pero encontré alternativas ${alternativeSpecs} en existencia.`;
      } else if (alternativeSpecs) {
        oosAlternativeDraft = `El producto exacto que buscas está agotado, pero encontré alternativas ${alternativeSpecs} en existencia.`;
      } else if (alternativeNote) {
        oosAlternativeDraft = `El producto exacto que buscas está agotado, pero encontré una alternativa disponible: ${alternativeNote}.`;
      }

      return buildContract(
        'SUCCESS',
        'OUT_OF_STOCK_ALTERNATIVE',
        joinSentences(
          oosAlternativeDraft,
          'Te dejo opciones cercanas para que no se te cierre la compra.',
          buildHandoffLine('options'),
        ),
        0.75,
        semanticInStock.slice(0, 4),
        undefined,
        'Exact match was OOS. Safe fallback to semantic alternatives provided.',
        exhaustedExact,
      );
    }
  }

  if (semanticInStock.length > 0) {
    const topProduct = semanticInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, []);
    }
    const topSpecsFact = extractSpecsFact(topProduct);
    const topNote = topProduct.ai_sales_note;
    const topDescription = extractDescriptionContext(topProduct);

    let semanticDraft = `No encontré "${tool_args.query}" exacto, pero estas opciones del catálogo son las más cercanas.`;
    if (topSpecsFact) {
      semanticDraft = `No encontré "${tool_args.query}" exactamente, pero ${topProduct.name} ${topSpecsFact} podría ser de lo más cercano a lo que buscas.`;
    } else if (topNote) {
      semanticDraft = `No encontré un producto con ese nombre exacto, pero ${topProduct.name} (${topNote}) podría encajar con lo que buscas.`;
    } else if (topDescription) {
      semanticDraft = `No encontré un producto con ese nombre exacto, pero ${topProduct.name} (${topDescription}) podría encajar con lo que buscas.`;
    }

    return buildContract(
      'SUCCESS',
      'SEMANTIC',
      joinSentences(
        semanticDraft,
        buildSemanticRefinementLine(tool_args.query),
        buildHandoffLine('options'),
      ),
      0.6,
      semanticInStock.slice(0, 3),
      undefined,
      'Semantic approximation with sharper follow-up and storefront handoff.',
      [],
    );
  }

  return buildContract(
    'SUCCESS',
    'NO_MATCH',
    joinSentences(
      `No encontré "${tool_args.query}" tal cual en el catálogo.`,
      buildRecoveryQuestion(tool_args.query),
    ),
    0.1,
    [],
    undefined,
    'Exhausted all search vectors. Empty result set.',
    [],
  );
}

function buildContract(
  status: InternalCapsuleContract['execution_status'],
  strategy: InternalCapsuleContract['match_strategy'],
  draft: string,
  confidence: number,
  products: InternalResolvedProduct[],
  degradedReason?: InternalCapsuleContract['degraded_reason'],
  reasoning?: string,
  exhaustedExact?: InternalResolvedProduct[],
): InternalCapsuleContract {
  return {
    capsule_name: 'product_search_integrity',
    capsule_version: '1.0.0',
    execution_status: status,
    match_strategy: strategy,
    customer_response_draft: draft,
    search_confidence: confidence,
    latency_ms: 0,
    degraded_reason: degradedReason,
    resolved_products: products,
    capsule_reasoning: reasoning,
    exhausted_exact_matches: exhaustedExact,
  };
}
