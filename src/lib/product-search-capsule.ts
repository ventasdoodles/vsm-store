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
  semantic_match_source?: 'EMBEDDING_SEMANTIC' | 'TOKEN_RECOVERY' | 'NONE';
  infrastructure_error?: 'VECTOR_TIMEOUT' | 'ORACLE_TIMEOUT' | 'DB_LATENCY' | 'QUOTA_LIMIT';
}

const FLAVOR_HINTS = ['menta', 'mango', 'uva', 'frutal', 'fruta', 'dulce', 'ice', 'hielo', 'sandia', 'fresa', 'melon', 'mora', 'cereza', 'tabaco', 'caramelo'];
const DEVICE_HINTS = ['desechable', 'pod', 'pods', 'cartucho', 'cartuchos', 'kit', 'mod', 'vape', 'pipa', 'bateria', 'baterias', 'extracto', 'extractos', 'wax', 'pluma', '510'];
const BUDGET_HINTS = ['barato', 'economico', 'economico', 'precio', 'presupuesto', 'menos', 'maximo', 'maximo', '$'];
const EFFECT_HINTS = ['suave', 'fuerte', 'relajar', 'relaje', 'rico', 'dia', 'dia', 'noche', 'pegar', 'tranqui', 'intenso'];
const BEGINNER_HINTS = ['empezar', 'empiezo', 'inicio', 'primera', 'nuevo', 'nueva', 'principiante', 'novato'];
const CONVENIENCE_HINTS = ['facil', 'simple', 'sencillo', 'sencilla', 'practico', 'practica', 'comodidad', 'rapido'];
const EXPLORATION_HINTS = ['algo', 'recomiendame', 'quiero', 'quiero probar', 'que me conviene', 'busco', 'buscame'];

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

function buildHandoffLine(
  mode: 'single' | 'options',
  products: InternalResolvedProduct[] = [],
  hasSupportedComparison = false,
): string {
  if (mode === 'single') {
    return 'Si ya te cuadra, abre la ficha para revisar detalles o usa la bolsa para agregarlo al carrito.';
  }

  const first = products[0];
  const second = products[1];

  if (first && second) {
    return hasSupportedComparison
      ? `Abre la opcion que mejor te encaje; compara la otra solo si te queda una duda real. Si ya lo tienes claro, usa la bolsa para agregarla al carrito.`
      : `Si una ya te hace sentido, abre esa ficha; compara la otra solo si todavia te queda una duda puntual. Si ya una te convence, usa la bolsa para agregarla al carrito.`;
  }

  if (first) {
    return `Si ${first.name} ya te hace sentido, abre esa ficha; si lo tienes claro, usa la bolsa para agregarlo al carrito.`;
  }

  return 'Abre primero la que mas te haga sentido; si ya una te convence, usa la bolsa para agregarla al carrito.';
}

function normalizeDecisionText(value: string): string {
  return value.trim().replace(/[.]+$/g, '').toLowerCase();
}

function extractSpecValue(product: InternalResolvedProduct, key: string): string | null {
  const specs = product.specs as Record<string, string> | null | undefined;
  const value = specs?.[key]?.trim();
  return value && value.length > 0 ? value : null;
}

type DecisionCue = {
  axis: string;
  dedupeKey: string;
  text: string;
};

type DecisionGuideResult = {
  hasSupportedComparison: boolean;
  text: string;
};

function buildSingleOptionConfidenceLine(mode: 'exact' | 'narrowed'): string {
  return mode === 'exact'
    ? 'Si ese era el que traias en mente, ya vas sobre una opcion clara para seguir.'
    : 'Si ese ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas.';
}

const DECISION_SPEC_CANDIDATES: Array<{
  key: string;
  toCue: (value: string) => string;
}> = [
  { key: 'Sabor', toCue: (value) => `perfil ${normalizeDecisionText(value)}` },
  { key: 'Tipo', toCue: (value) => `formato ${normalizeDecisionText(value)}` },
  { key: 'Modelo', toCue: (value) => `linea ${normalizeDecisionText(value)}` },
  { key: 'Cepa', toCue: (value) => `cepa ${normalizeDecisionText(value)}` },
  { key: 'Nicotina', toCue: (value) => `${normalizeDecisionText(value)} de nicotina` },
  { key: 'THC', toCue: (value) => `${normalizeDecisionText(value)} de thc` },
  { key: 'Puffs', toCue: (value) => `${normalizeDecisionText(value)} puffs` },
  { key: 'Marca', toCue: (value) => `marca ${normalizeDecisionText(value)}` },
];

function getDifferentiatingSpecKeys(products: InternalResolvedProduct[]): Set<string> {
  const differentiatingKeys = new Set<string>();

  for (const candidate of DECISION_SPEC_CANDIDATES) {
    const values = products
      .map((product) => extractSpecValue(product, candidate.key))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => normalizeDecisionText(value));

    if (new Set(values).size > 1) {
      differentiatingKeys.add(candidate.key);
    }
  }

  return differentiatingKeys;
}

function buildProductDecisionCues(
  product: InternalResolvedProduct,
  differentiatingKeys: Set<string>,
): DecisionCue[] {
  const cues: DecisionCue[] = [];

  for (const candidate of DECISION_SPEC_CANDIDATES) {
    if (!differentiatingKeys.has(candidate.key)) continue;

    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    const normalizedValue = normalizeDecisionText(value);
    if (!normalizedValue) continue;

    cues.push({
      axis: candidate.key,
      dedupeKey: `spec:${candidate.key}:${normalizedValue}`,
      text: candidate.toCue(value),
    });
  }

  return cues;
}

function pickDecisionCue(cues: DecisionCue[], usedKeys: Set<string>): DecisionCue | null {
  return cues.find((cue) => !usedKeys.has(cue.dedupeKey)) ?? null;
}

function buildDecisionGuide(products: InternalResolvedProduct[]): DecisionGuideResult | null {
  const comparableProducts = products.slice(0, 3);
  const first = comparableProducts[0];
  const second = comparableProducts[1];

  if (!first || !second) return null;

  const differentiatingKeys = getDifferentiatingSpecKeys(comparableProducts);
  const firstCues = buildProductDecisionCues(first, differentiatingKeys);
  const secondCues = buildProductDecisionCues(second, differentiatingKeys);
  const third = comparableProducts[2];
  const thirdCues = third ? buildProductDecisionCues(third, differentiatingKeys) : [];

  const usedKeys = new Set<string>();
  const firstCue = pickDecisionCue(firstCues, usedKeys);
  if (firstCue) usedKeys.add(firstCue.dedupeKey);

  const secondCue = pickDecisionCue(secondCues, usedKeys);
  if (secondCue) usedKeys.add(secondCue.dedupeKey);

  const usedAxes = new Set<string>();
  if (firstCue) usedAxes.add(firstCue.axis);
  if (secondCue) usedAxes.add(secondCue.axis);

  const thirdCue = third
    ? thirdCues.find((cue) => !usedKeys.has(cue.dedupeKey) && !usedAxes.has(cue.axis)) ?? null
    : null;

  if (firstCue && secondCue) {
    const thirdLine = third && thirdCue
      ? ` Deja ${third.name} solo si quieres ${thirdCue.text}.`
      : '';

    return {
      hasSupportedComparison: true,
      text: `Para elegir sin darle demasiadas vueltas: si te late ${firstCue.text}, ${first.name} ya es la salida mas clara para avanzar; compara ${second.name} solo si prefieres ${secondCue.text}.${thirdLine}`,
    };
  }

  return {
    hasSupportedComparison: false,
    text: `Para elegir sin darle demasiadas vueltas: mira ${first.name} y ${second.name} como opciones cercanas antes de abrir mas fichas. Si una ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas.`,
  };
}

function buildAmbiguityQuestion(query: string): string {
  const normalized = normalizeSearchText(query);
  const hasDevice = hasAnyHint(normalized, DEVICE_HINTS);
  const hasFlavor = hasAnyHint(normalized, FLAVOR_HINTS);
  const hasBudget = hasAnyHint(normalized, BUDGET_HINTS);
  const hasEffect = hasAnyHint(normalized, EFFECT_HINTS);
  const isBeginner = hasAnyHint(normalized, BEGINNER_HINTS);
  const wantsConvenience = hasAnyHint(normalized, CONVENIENCE_HINTS);
  const isExploratory = hasAnyHint(normalized, EXPLORATION_HINTS);

  if (!hasDevice) {
    if (isBeginner || wantsConvenience) {
      return 'Para cerrartelo bien, quieres algo simple para empezar, tipo desechable, o prefieres pod/cartucho?';
    }

    if (hasFlavor || hasEffect || isExploratory) {
      return 'Para aterrizarlo rapido, te mueves mas por desechable, pod, cartucho o algo 420?';
    }

    return 'Que formato te queda mejor ahorita: desechable, pod, cartucho o algo 420?';
  }

  if (!hasFlavor) {
    return hasEffect
      ? 'Para afinarlo, te late mas algo fresco, frutal, dulce o mas serio tipo tabaco?'
      : 'Que perfil te llama mas ahorita: fresco, frutal, dulce o algo mas serio tipo tabaco?';
  }

  if (!hasEffect) {
    return 'Para no abrirte de mas, lo quieres mas suave y facil de llevar o con una pegada mas marcada?';
  }

  if (!hasBudget) {
    return 'Para cerrarte la siguiente ronda, te lo busco en algo accesible o te enseño opciones un poco mas arriba?';
  }

  return 'Que te pesa mas para cerrarlo: sabor, intensidad o facilidad de uso?';
}

function buildRecoveryQuestion(query: string): string {
  const normalized = normalizeSearchText(query);

  if (hasModelCue(normalized)) {
    return 'Si recuerdas la marca, la serie o aunque sea otra variante cercana, te aterrizo opciones reales de esa misma linea.';
  }

  if (hasAnyHint(normalized, FLAVOR_HINTS) && !hasAnyHint(normalized, DEVICE_HINTS)) {
    return 'Si me dices si lo quieres desechable, pod, cartucho o algo 420, te cierro la busqueda mucho mas rapido.';
  }

  if (hasAnyHint(normalized, DEVICE_HINTS) && !hasAnyHint(normalized, FLAVOR_HINTS)) {
    return 'Si me das sabor, intensidad o marca, te regreso opciones mucho mas utiles.';
  }

  if (hasAnyHint(normalized, BUDGET_HINTS)) {
    return 'Si ademas me dices marca, sabor o tipo de dispositivo, te propongo opciones reales dentro de ese rango.';
  }

  return 'Si me das marca, sabor, tipo de dispositivo o modelo cercano, te regreso opciones reales sin dejarte en un callejon sin salida.';
}

function buildSemanticRefinementLine(query: string, source: ProductSearchContext['semantic_match_source']): string {
  const normalized = normalizeSearchText(query);

  if (source === 'TOKEN_RECOVERY') {
    if (hasModelCue(normalized)) {
      return 'Estas opciones salieron por coincidencias de nombre o serie, no por proximidad semantica. Si buscabas otra variante puntual, dímela y la aterrizamos.';
    }

    return 'Estas opciones salieron por coincidencias de nombre o termino, no por proximidad semantica. Si me das una marca, sabor o modelo mas cerrado, te afino la siguiente ronda.';
  }

  if (hasModelCue(normalized)) {
    return 'Si buscabas otra variante o sabor de esa misma linea, dimelo y te la afino.';
  }

  if (!hasAnyHint(normalized, FLAVOR_HINTS) || !hasAnyHint(normalized, DEVICE_HINTS)) {
    return 'Si me confirmas marca, sabor o tipo de dispositivo, te afino la siguiente ronda.';
  }

  return 'Si querias otra variante puntual, dime el detalle y la aterrizamos.';
}

/**
 * FALLBACK TREE IMPLEMENTATION (PURE)
 * Evaluates the context and returns the strictly enforced capsule contract.
 * Zero side-effects, zero UI coupling.
 */
export function evaluateProductSearchFallbackTree(
  context: ProductSearchContext,
): InternalCapsuleContract {
  const {
    tool_args,
    exact_matches,
    semantic_matches,
    infrastructure_error,
    semantic_match_source = 'NONE',
  } = context;

  if (infrastructure_error) {
    return buildContract(
      'DEGRADED',
      'NO_MATCH',
      'Estoy teniendo problemas intermitentes para sincronizar con el catalogo. Dame un momento y vuelve a intentar.',
      0.0,
      [],
      infrastructure_error,
      `Degraded by infrastructure: ${infrastructure_error}`,
      undefined,
      'NONE',
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
          `Revise el catalogo pero no logre encontrar una salida clara para "${tool_args.query}".`,
          buildRecoveryQuestion(tool_args.query),
        ),
        0.1,
        [],
        undefined,
        'Ambiguity flag active but no featured products available. Falling through to no-match guidance.',
        [],
        'NONE',
      );
    }

    const topFeaturedProduct = featuredProducts[0];
    if (!topFeaturedProduct) {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        joinSentences(
          `Revise el catalogo pero no logre encontrar una salida clara para "${tool_args.query}".`,
          buildRecoveryQuestion(tool_args.query),
        ),
        0.1,
        [],
        undefined,
        'Ambiguity fallback exhausted after guard.',
        [],
        'NONE',
      );
    }

    const topFeaturedSpecs = extractSpecsFact(topFeaturedProduct);
    const ambiguityQuestion = buildAmbiguityQuestion(tool_args.query);
    const decisionGuide = buildDecisionGuide(featuredProducts);

    let ambiguityDraft = joinSentences(
      'Veo varias opciones que podrian encajar.',
      ambiguityQuestion || 'Para afinar la recomendacion, dime marca, sabor o tipo de dispositivo.',
      decisionGuide?.text || 'Te dejo solo las opciones mas utiles para que elijas un camino claro.',
      buildHandoffLine('options', featuredProducts, decisionGuide?.hasSupportedComparison ?? false),
    );

    if (topFeaturedSpecs) {
      ambiguityDraft = joinSentences(
        `Veo varias opciones que podrian encajar, incluyendo algunas ${topFeaturedSpecs}.`,
        ambiguityQuestion || 'Para afinar la recomendacion, dime marca, sabor o tipo de dispositivo.',
        decisionGuide?.text || 'Te dejo solo las opciones mas utiles para que elijas un camino claro.',
        buildHandoffLine('options', featuredProducts, decisionGuide?.hasSupportedComparison ?? false),
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
      semantic_match_source,
    );
  }

  if (exactInStock.length > 0) {
    const topProduct = exactInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, [], undefined, undefined, undefined, 'NONE');
    }
    const topNote = topProduct.ai_sales_note;
    const topSpecs = extractSpecsFact(topProduct);

    let exactDraft = 'Aqui tienes exactamente lo que buscabas.';
    if (topNote) {
      exactDraft = `Aqui tienes exactamente lo que buscabas. ${topNote}`;
    } else if (topSpecs) {
      exactDraft = `Aqui tienes exactamente lo que buscabas. Viene ${topSpecs}.`;
    }

    return buildContract(
      'SUCCESS',
      'EXACT',
      joinSentences(
        exactDraft,
        buildSingleOptionConfidenceLine('exact'),
        buildHandoffLine('single', exactInStock.slice(0, 1)),
      ),
      0.95,
      exactInStock.slice(0, 4),
      undefined,
      'Exact match found and in stock.',
      [],
      'DIRECT_EXACT',
    );
  }

  if (exact_matches.length > 0 && exactInStock.length === 0) {
    if (semanticInStock.length > 0) {
      const exhaustedProduct = exhaustedExact[0];
      const alternativeProduct = semanticInStock[0];
      const alternativeDecisionGuide = buildDecisionGuide(semanticInStock.slice(0, 4));
      if (!alternativeProduct) {
        return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, [], undefined, undefined, undefined, 'NONE');
      }
      const exhaustedSpecs = exhaustedProduct ? extractSpecsFact(exhaustedProduct) : null;
      const alternativeSpecs = extractSpecsFact(alternativeProduct);
      const alternativeNote = alternativeProduct.ai_sales_note;

      let oosAlternativeDraft = 'El producto exacto que buscas esta temporalmente agotado, pero te seleccione alternativas reales que si estan en existencia.';
      if (exhaustedSpecs && alternativeSpecs) {
        oosAlternativeDraft = `El producto exacto que buscas ${exhaustedSpecs} esta agotado, pero encontre alternativas ${alternativeSpecs} en existencia.`;
      } else if (alternativeSpecs) {
        oosAlternativeDraft = `El producto exacto que buscas esta agotado, pero encontre alternativas ${alternativeSpecs} en existencia.`;
      } else if (alternativeNote) {
        oosAlternativeDraft = `El producto exacto que buscas esta agotado, pero encontre una alternativa disponible: ${alternativeNote}.`;
      }

      return buildContract(
        'SUCCESS',
        'OUT_OF_STOCK_ALTERNATIVE',
        joinSentences(
          oosAlternativeDraft,
          'Te dejo opciones cercanas para que no se te cierre la compra.',
          alternativeDecisionGuide?.text,
          semanticInStock.length === 1 ? buildSingleOptionConfidenceLine('narrowed') : null,
          buildHandoffLine(
            'options',
            semanticInStock.slice(0, 4),
            alternativeDecisionGuide?.hasSupportedComparison ?? false,
          ),
        ),
        0.75,
        semanticInStock.slice(0, 4),
        undefined,
        `Exact match was OOS. Safe fallback provided via ${semantic_match_source}.`,
        exhaustedExact,
        semantic_match_source,
      );
    }
  }

  if (semanticInStock.length > 0) {
    const topProduct = semanticInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, [], undefined, undefined, undefined, 'NONE');
    }
    const topSpecsFact = extractSpecsFact(topProduct);
    const topNote = topProduct.ai_sales_note;
    const topDescription = extractDescriptionContext(topProduct);
    const semanticDecisionGuide = buildDecisionGuide(semanticInStock.slice(0, 3));

    let semanticDraft = `No encontre "${tool_args.query}" exacto, pero estas opciones del catalogo son las mas cercanas.`;
    if (topSpecsFact) {
      semanticDraft = `No encontre "${tool_args.query}" exactamente, pero ${topProduct.name} ${topSpecsFact} podria ser de lo mas cercano a lo que buscas.`;
    } else if (topNote) {
      semanticDraft = `No encontre un producto con ese nombre exacto, pero ${topProduct.name} (${topNote}) podria encajar con lo que buscas.`;
    } else if (topDescription) {
      semanticDraft = `No encontre un producto con ese nombre exacto, pero ${topProduct.name} (${topDescription}) podria encajar con lo que buscas.`;
    }

    return buildContract(
      'SUCCESS',
      semantic_match_source === 'TOKEN_RECOVERY' ? 'TOKEN_RECOVERY' : 'SEMANTIC',
      joinSentences(
        semanticDraft,
        semanticDecisionGuide?.text,
        semanticInStock.length === 1 ? buildSingleOptionConfidenceLine('narrowed') : null,
        buildSemanticRefinementLine(tool_args.query, semantic_match_source),
        buildHandoffLine(
          'options',
          semanticInStock.slice(0, 3),
          semanticDecisionGuide?.hasSupportedComparison ?? false,
        ),
      ),
      0.6,
      semanticInStock.slice(0, 3),
      undefined,
      semantic_match_source === 'TOKEN_RECOVERY'
        ? 'Token recovery approximation with sharper follow-up and storefront handoff.'
        : 'Semantic approximation with sharper follow-up and storefront handoff.',
      [],
      semantic_match_source,
    );
  }

  return buildContract(
    'SUCCESS',
    'NO_MATCH',
    joinSentences(
      `No encontre "${tool_args.query}" tal cual en el catalogo.`,
      buildRecoveryQuestion(tool_args.query),
    ),
    0.1,
    [],
    undefined,
    'Exhausted all search vectors. Empty result set.',
    [],
    'NONE',
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
  retrievalSource: InternalCapsuleContract['retrieval_source'] = 'NONE',
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
    retrieval_source: retrievalSource,
  };
}
