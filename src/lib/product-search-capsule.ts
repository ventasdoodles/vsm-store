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
const HESITATION_HINTS = ['no se', 'no me convence', 'no me convence tanto', 'mmm', 'mm', 'duda', 'dudas'];
const WORTH_HINTS = ['vale la pena', 'realmente vale', 'si conviene', 'conviene'];
const ALTERNATIVE_HINTS = ['otra opcion', 'otra alternativa', 'alternativa', 'otra cercana', 'otra parecida'];

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
  actionStrength: ActionStrength = 'review_only',
): string {
  if (mode === 'single') {
    return actionStrength === 'review_then_cart'
      ? 'Abre la ficha para confirmarlo; si ya es el que quieres, agregalo al carrito.'
      : 'Abre la ficha para revisarlo bien antes de decidir.';
  }

  const first = products[0];
  const second = products[1];

  if (first && second) {
    return hasSupportedComparison
      ? actionStrength === 'review_then_cart'
        ? `Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real. Si la primera ya es la que quieres, agregala al carrito.`
        : `Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real.`
      : actionStrength === 'review_then_cart'
        ? `Abre primero la ficha que mas te haga sentido; si al verla ya es la que quieres, agregala al carrito.`
        : `Empieza por la ficha que mas te haga sentido; si todavia te queda una duda puntual, revisa la otra.`;
  }

  if (first) {
    return actionStrength === 'review_then_cart'
      ? `Abre primero la ficha de ${first.name}; si al verla ya es la que quieres, agregala al carrito.`
      : `Abre primero la ficha de ${first.name} para revisarla bien.`;
  }

  return actionStrength === 'review_then_cart'
    ? 'Abre primero la opcion que mejor te encaje; si al verla ya es la que quieres, agregala al carrito.'
    : 'Abre primero la opcion que mas te haga sentido y revisala con calma.';
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

type ActionStrength = 'review_only' | 'review_then_cart';
type ObjectionType = 'cheaper' | 'hesitation' | 'worth_it' | 'alternative';
type RecoveryCommitmentResult = {
  line: string;
  actionStrength: ActionStrength;
  preferredProduct: InternalResolvedProduct;
  compareAgainst: InternalResolvedProduct | null;
};
type CheckoutReadinessResult = {
  line: string;
  handoff: string;
};

function buildSingleOptionConfidenceLine(mode: 'exact' | 'narrowed'): string {
  return mode === 'exact'
    ? 'Si ese era el que traias en mente, ya vas sobre una opcion clara para seguir.'
    : 'Si ese ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas.';
}

function buildRecoveryHandoffLine(
  preferredProduct: InternalResolvedProduct,
  compareAgainst: InternalResolvedProduct | null,
  actionStrength: ActionStrength,
): string {
  if (compareAgainst) {
    return actionStrength === 'review_then_cart'
      ? `Abre primero la ficha de ${preferredProduct.name}; compara ${compareAgainst.name} solo si ese ultimo tradeoff todavia importa. Si al verla ya te cierra, agregalo al carrito.`
      : `Abre primero la ficha de ${preferredProduct.name}; compara ${compareAgainst.name} solo si ese ultimo tradeoff todavia importa.`;
  }

  return actionStrength === 'review_then_cart'
    ? `Abre primero la ficha de ${preferredProduct.name}; si al verla esa duda ya te queda resuelta, agregalo al carrito.`
    : `Abre primero la ficha de ${preferredProduct.name}; si al verla esa duda ya te queda resuelta, sigue con esa ruta.`;
}

const CHECKOUT_READINESS_SPEC_CANDIDATES: Array<{
  key: string;
  toCondition: (value: string) => string;
}> = [
  { key: 'Compatibilidad', toCondition: (value) => `esa compatibilidad ${normalizeDecisionText(value)} es la que necesitas` },
  { key: 'Compatible con', toCondition: (value) => `esa compatibilidad ${normalizeDecisionText(value)} es la que necesitas` },
  { key: 'Rosca', toCondition: (value) => `esa rosca ${normalizeDecisionText(value)} es la que necesitas` },
  { key: 'Sabor', toCondition: (value) => `el sabor ${normalizeDecisionText(value)} es el que quieres` },
  { key: 'Nicotina', toCondition: (value) => `la nicotina ${normalizeDecisionText(value)} es la que buscas` },
  { key: 'THC', toCondition: (value) => `la concentracion ${normalizeDecisionText(value)} es la que buscas` },
  { key: 'Presentacion', toCondition: (value) => `esa presentacion ${normalizeDecisionText(value)} te cuadra` },
  { key: 'Tamano', toCondition: (value) => `ese tamano ${normalizeDecisionText(value)} te cuadra` },
  { key: 'Contenido', toCondition: (value) => `ese contenido ${normalizeDecisionText(value)} te cuadra` },
  { key: 'Puffs', toCondition: (value) => `los ${normalizeDecisionText(value)} puffs te cuadran` },
  { key: 'Tipo', toCondition: (value) => `ese formato ${normalizeDecisionText(value)} es el que quieres` },
  { key: 'Modelo', toCondition: (value) => `ese modelo ${normalizeDecisionText(value)} es el que quieres` },
];

function parseDisplayPrice(product: InternalResolvedProduct): number | null {
  const numeric = Number(product.display_price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function findCheaperAlternative(
  products: InternalResolvedProduct[],
  anchor: InternalResolvedProduct,
): InternalResolvedProduct | null {
  const anchorPrice = parseDisplayPrice(anchor);
  if (anchorPrice === null) return null;

  return products.find((product) => {
    if (product.id === anchor.id) return false;
    const price = parseDisplayPrice(product);
    return price !== null && price < anchorPrice;
  }) ?? null;
}

function buildExplicitSupportReason(product: InternalResolvedProduct): string | null {
  const note = product.ai_sales_note?.trim().replace(/[.]+$/g, '');
  if (note) return note;

  const specsFact = extractSpecsFact(product);
  return specsFact ? `viene ${specsFact}` : null;
}

function detectObjectionType(query: string): ObjectionType | null {
  const normalized = normalizeSearchText(query);

  if (hasAnyHint(normalized, BUDGET_HINTS)) return 'cheaper';
  if (hasAnyHint(normalized, WORTH_HINTS)) return 'worth_it';
  if (hasAnyHint(normalized, HESITATION_HINTS)) return 'hesitation';
  if (hasAnyHint(normalized, ALTERNATIVE_HINTS)) return 'alternative';

  return null;
}

function buildObjectionRecovery(
  query: string,
  products: InternalResolvedProduct[],
  hasSupportedComparison: boolean,
  supportReason: string | null,
): { line: string; actionStrength: ActionStrength } | null {
  const objectionType = detectObjectionType(query);
  const current = products[0];
  if (!objectionType || !current) return null;

  const nearby = products.find((product) => product.id !== current.id) ?? null;
  const cheaperAlternative = findCheaperAlternative(products, current);

  switch (objectionType) {
    case 'cheaper':
      if (cheaperAlternative) {
        return {
          line: `Si lo que te frena es el precio, compara solo ${cheaperAlternative.name}; dentro de estas opciones es la salida mas accesible sin abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si lo que te frena es el precio, mejor revisa esta ficha primero y valida ese punto antes de cambiar de camino.',
        actionStrength: 'review_only',
      };

    case 'hesitation':
      if (supportReason) {
        return {
          line: `Si no te convence del todo, el punto mas claro aqui es este: ${supportReason}.`,
          actionStrength: 'review_only',
        };
      }

      if (hasSupportedComparison && nearby) {
        return {
          line: `Si la duda es fina, quedate solo entre esta opcion y ${nearby.name}; no hace falta abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si la duda sigue abierta, mejor quedate en esta ficha antes de moverte a otra cosa.',
        actionStrength: 'review_only',
      };

    case 'worth_it':
      if (supportReason) {
        return {
          line: `Si la duda es si vale la pena, el punto mas claro aqui es este: ${supportReason}.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si esa duda sigue viva, mejor revisa esta ficha con calma antes de decidir.',
        actionStrength: 'review_only',
      };

    case 'alternative':
      if (cheaperAlternative) {
        return {
          line: `Si quieres abrir otra via, compara solo ${cheaperAlternative.name}; es la alternativa cercana que cambia el precio sin abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      if (hasSupportedComparison && nearby) {
        return {
          line: `Si quieres abrir otra via, compara solo ${nearby.name}; no hace falta abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si quieres abrir otra via, mejor quedate en esta ficha y revisa solo una alternativa cercana si todavia te hace falta.',
        actionStrength: 'review_only',
      };
  }
}

function buildRecoveryCommitment(
  query: string,
  products: InternalResolvedProduct[],
  hasSupportedComparison: boolean,
  defaultActionStrength: ActionStrength,
): RecoveryCommitmentResult | null {
  const objectionType = detectObjectionType(query);
  const current = products[0];
  if (!objectionType || !current) return null;

  const nearby = products.find((product) => product.id !== current.id) ?? null;
  const currentSupport = buildExplicitSupportReason(current);
  const cheaperAlternative = findCheaperAlternative(products, current);
  const cheaperSupport = cheaperAlternative ? buildExplicitSupportReason(cheaperAlternative) : null;

  switch (objectionType) {
    case 'cheaper':
      if (cheaperAlternative && (cheaperSupport || hasSupportedComparison)) {
        return {
          line: `Si ese era el freno, ${cheaperAlternative.name} ya queda como una salida mas accesible y bien posicionada dentro de estas opciones.`,
          actionStrength: 'review_only',
          preferredProduct: cheaperAlternative,
          compareAgainst: current,
        };
      }

      if (currentSupport && defaultActionStrength === 'review_then_cart') {
        return {
          line: `Si ese era el freno y no necesitas bajar mas, ${current.name} sigue bien parado dentro de esta ruta.`,
          actionStrength: 'review_then_cart',
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      return null;

    case 'hesitation':
      if (hasSupportedComparison && nearby) {
        return {
          line: `Si esa era la ultima duda real, ${current.name} queda mejor parado para lo que pediste; compara ${nearby.name} solo si ese matiz todavia importa.`,
          actionStrength: 'review_only',
          preferredProduct: current,
          compareAgainst: nearby,
        };
      }

      if (currentSupport) {
        return {
          line: `Si esa era la ultima duda, ${current.name} ya queda bien posicionado para seguir con esta ficha.`,
          actionStrength: defaultActionStrength,
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      return null;

    case 'worth_it':
      if (currentSupport) {
        return {
          line: `Si esa era la duda, ${current.name} ya queda bien posicionado para seguir con esta ficha.`,
          actionStrength: defaultActionStrength,
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      if (hasSupportedComparison && nearby) {
        return {
          line: `Si esa era la duda de cierre, ${current.name} queda mejor parado para lo que pediste; compara ${nearby.name} solo si ese tradeoff sigue pesando.`,
          actionStrength: 'review_only',
          preferredProduct: current,
          compareAgainst: nearby,
        };
      }

      return null;

    case 'alternative':
      if (hasSupportedComparison && nearby) {
        return {
          line: `Si esa era la ultima comparacion que te faltaba, quedate solo entre ${current.name} y ${nearby.name}; ${current.name} queda mejor parado para lo que pediste.`,
          actionStrength: 'review_only',
          preferredProduct: current,
          compareAgainst: nearby,
        };
      }

      if (currentSupport) {
        return {
          line: `Si esa era la ultima alternativa que te faltaba revisar, ${current.name} ya queda bien posicionado para seguir con esta ficha.`,
          actionStrength: defaultActionStrength,
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      return null;
  }
}

function buildCheckoutReadiness(
  product: InternalResolvedProduct,
  actionStrength: ActionStrength,
  compareAgainst: InternalResolvedProduct | null,
): CheckoutReadinessResult | null {
  if (actionStrength !== 'review_then_cart' || compareAgainst) return null;

  for (const candidate of CHECKOUT_READINESS_SPEC_CANDIDATES) {
    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    return {
      line: `Si ${candidate.toCondition(value)}, este ya queda practicamente listo para compra.`,
      handoff: 'Abre la ficha y confirma solo ese detalle; si te cuadra, agregalo al carrito.',
    };
  }

  return {
    line: 'Si ya te cierra lo importante de esta ficha, este ya queda practicamente listo para compra.',
    handoff: 'Abre la ficha y confirma ese ultimo detalle; si te cuadra, agregalo al carrito.',
  };
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
      buildHandoffLine('options', featuredProducts, decisionGuide?.hasSupportedComparison ?? false, 'review_only'),
    );

    if (topFeaturedSpecs) {
      ambiguityDraft = joinSentences(
        `Veo varias opciones que podrian encajar, incluyendo algunas ${topFeaturedSpecs}.`,
        ambiguityQuestion || 'Para afinar la recomendacion, dime marca, sabor o tipo de dispositivo.',
        decisionGuide?.text || 'Te dejo solo las opciones mas utiles para que elijas un camino claro.',
        buildHandoffLine('options', featuredProducts, decisionGuide?.hasSupportedComparison ?? false, 'review_only'),
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

    if (exactInStock.length > 1) {
      return buildContract(
        'SUCCESS',
        'EXACT',
        joinSentences(
          `Encontre varias coincidencias exactas para "${tool_args.query}".`,
          'Te dejo esas opciones para que revises la que mejor te encaje sin abrir mas ramas.',
          buildHandoffLine('options', exactInStock.slice(0, 4), false, 'review_only'),
        ),
        0.95,
        exactInStock.slice(0, 4),
        undefined,
        'Multiple exact matches found and kept neutral to avoid single-option overstatement.',
        [],
        'DIRECT_EXACT',
      );
    }

    const topNote = topProduct.ai_sales_note;
    const topSpecs = extractSpecsFact(topProduct);
    const exactObjectionRecovery = buildObjectionRecovery(
      tool_args.query,
      exactInStock.slice(0, 2),
      false,
      buildExplicitSupportReason(topProduct),
    );
    const exactRecoveryCommitment = exactObjectionRecovery
      ? buildRecoveryCommitment(tool_args.query, exactInStock.slice(0, 2), false, 'review_then_cart')
      : null;
    const exactCheckoutReadiness = buildCheckoutReadiness(
      exactRecoveryCommitment?.preferredProduct ?? topProduct,
      exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
      exactRecoveryCommitment?.compareAgainst ?? null,
    );

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
        exactObjectionRecovery?.line ?? buildSingleOptionConfidenceLine('exact'),
        exactRecoveryCommitment?.line,
        exactCheckoutReadiness?.line,
        exactCheckoutReadiness?.handoff ?? (exactRecoveryCommitment
          ? buildRecoveryHandoffLine(
            exactRecoveryCommitment.preferredProduct,
            exactRecoveryCommitment.compareAgainst,
            exactRecoveryCommitment.actionStrength,
          )
          : buildHandoffLine(
            'single',
            exactInStock.slice(0, 1),
            false,
            exactObjectionRecovery?.actionStrength ?? 'review_then_cart',
          )),
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

      const oosHasExplicitSupport = Boolean(alternativeSpecs || alternativeNote);
      const oosObjectionRecovery = buildObjectionRecovery(
        tool_args.query,
        semanticInStock.slice(0, 4),
        alternativeDecisionGuide?.hasSupportedComparison ?? false,
        buildExplicitSupportReason(alternativeProduct),
      );
      const oosActionStrength = (semanticInStock.length === 1 && oosHasExplicitSupport) || alternativeDecisionGuide?.hasSupportedComparison
        ? 'review_then_cart'
        : 'review_only';
      const oosRecoveryCommitment = oosObjectionRecovery
        ? buildRecoveryCommitment(
          tool_args.query,
          semanticInStock.slice(0, 4),
          alternativeDecisionGuide?.hasSupportedComparison ?? false,
          oosActionStrength,
        )
        : null;
      const oosCheckoutReadiness = buildCheckoutReadiness(
        oosRecoveryCommitment?.preferredProduct ?? alternativeProduct,
        oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
        oosRecoveryCommitment?.compareAgainst ?? (semanticInStock.length > 1 ? semanticInStock[1] ?? null : null),
      );

      return buildContract(
        'SUCCESS',
        'OUT_OF_STOCK_ALTERNATIVE',
        joinSentences(
          oosAlternativeDraft,
          'Te dejo opciones cercanas para que no se te cierre la compra.',
          alternativeDecisionGuide?.text,
          semanticInStock.length === 1 && !oosObjectionRecovery ? buildSingleOptionConfidenceLine('narrowed') : null,
          oosObjectionRecovery?.line,
          oosRecoveryCommitment?.line,
          oosCheckoutReadiness?.line,
          oosCheckoutReadiness?.handoff ?? (oosRecoveryCommitment
            ? buildRecoveryHandoffLine(
              oosRecoveryCommitment.preferredProduct,
              oosRecoveryCommitment.compareAgainst,
              oosRecoveryCommitment.actionStrength,
            )
            : buildHandoffLine(
              'options',
              semanticInStock.slice(0, 4),
              alternativeDecisionGuide?.hasSupportedComparison ?? false,
              oosObjectionRecovery?.actionStrength ?? oosActionStrength,
            )),
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
    const semanticHasExplicitSupport = Boolean(topSpecsFact || topNote);
    const semanticObjectionRecovery = buildObjectionRecovery(
      tool_args.query,
      semanticInStock.slice(0, 3),
      semanticDecisionGuide?.hasSupportedComparison ?? false,
      buildExplicitSupportReason(topProduct),
    );
    const semanticActionStrength = (semanticInStock.length === 1 && semanticHasExplicitSupport) || semanticDecisionGuide?.hasSupportedComparison
      ? 'review_then_cart'
      : 'review_only';
    const semanticRecoveryCommitment = semanticObjectionRecovery
      ? buildRecoveryCommitment(
        tool_args.query,
        semanticInStock.slice(0, 3),
        semanticDecisionGuide?.hasSupportedComparison ?? false,
        semanticActionStrength,
      )
      : null;
    const semanticCheckoutReadiness = buildCheckoutReadiness(
      semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      semanticRecoveryCommitment?.compareAgainst ?? (semanticInStock.length > 1 ? semanticInStock[1] ?? null : null),
    );

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
        semanticInStock.length === 1 && !semanticObjectionRecovery ? buildSingleOptionConfidenceLine('narrowed') : null,
        semanticObjectionRecovery?.line,
        semanticRecoveryCommitment?.line,
        semanticCheckoutReadiness?.line,
        buildSemanticRefinementLine(tool_args.query, semantic_match_source),
        semanticCheckoutReadiness?.handoff ?? (semanticRecoveryCommitment
          ? buildRecoveryHandoffLine(
            semanticRecoveryCommitment.preferredProduct,
            semanticRecoveryCommitment.compareAgainst,
            semanticRecoveryCommitment.actionStrength,
          )
          : buildHandoffLine(
            'options',
            semanticInStock.slice(0, 3),
            semanticDecisionGuide?.hasSupportedComparison ?? false,
            semanticObjectionRecovery?.actionStrength ?? semanticActionStrength,
          )),
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
