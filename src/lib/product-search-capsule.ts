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
  promotion_signal?: InternalCapsuleContract['promotion_signal'];
  replenishment_signal?: InternalCapsuleContract['replenishment_signal'];
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
const SPEC_KEY_ALIASES: Record<string, string[]> = {
  Sabor: ['Sabor', 'Sabores', 'Flavor', 'Perfil'],
  Nicotina: ['Nicotina', 'Concentracion de nicotina', 'Concentración de nicotina', 'Concentracion', 'Concentración'],
  Puffs: ['Puffs', 'Puff', 'Caladas'],
  Modelo: ['Modelo', 'Version', 'Versión', 'Modelo / Version', 'Modelo/Version', 'Linea', 'Línea', 'Serie'],
  Compatibilidad: ['Compatibilidad', 'Compatible con'],
  'Compatible con': ['Compatible con', 'Compatibilidad'],
  Rosca: ['Rosca', 'Thread'],
  Tipo: ['Tipo', 'Formato'],
  Variante: ['Variante', 'Version', 'Versión'],
  Presentacion: ['Presentacion', 'Presentación'],
  Tamano: ['Tamano', 'Tamaño', 'Size'],
  Contenido: ['Contenido', 'Capacidad'],
  Marca: ['Marca', 'Brand'],
  THC: ['THC'],
  Cantidad: ['Cantidad', 'Piezas'],
};

type ConcreteFactRequest =
  | { family: 'Puffs' }
  | { family: 'Nicotina' }
  | { family: 'Sabor' }
  | { family: 'Modelo'; requestedAs: 'modelo' | 'version' }
  | { family: 'Compatibilidad' };

type CapsuleTruthSignals = NonNullable<InternalCapsuleContract['truth_signals']>;
type CapsuleHelpContract = NonNullable<InternalCapsuleContract['help_contract']>;
type CapsulePromotionSignal = NonNullable<InternalCapsuleContract['promotion_signal']>;
type CapsuleReplenishmentSignal = NonNullable<InternalCapsuleContract['replenishment_signal']>;
type ConcreteFactResolution = {
  request: ConcreteFactRequest;
  answer: string;
  directAnswerKind: NonNullable<CapsuleTruthSignals['direct_answer_kind']>;
};

/**
 * Extract 1-2 interesting specs for semantic response justification.
 * Tries common vape keys first, then 420 keys. Keeps response focused.
 */
function extractSpecsFact(product: InternalResolvedProduct): string | null {
  const keysToTry = ['Sabor', 'Nicotina', 'Puffs', 'Modelo', 'Cepa', 'THC', 'Tipo', 'Marca'];
  const found: string[] = [];

  for (const key of keysToTry) {
    const value = extractSpecValue(product, key);
    if (!value) continue;
    found.push(value);
    if (found.length >= 2) break;
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
  const specs = product.specs as Record<string, unknown> | null | undefined;
  if (!specs || Object.keys(specs).length === 0) return null;

  const aliases = SPEC_KEY_ALIASES[key] ?? [key];
  const normalizedAliases = aliases.map((alias) => normalizeSearchText(alias));

  for (const [specKey, rawValue] of Object.entries(specs)) {
    if (!normalizedAliases.includes(normalizeSearchText(specKey))) continue;
    const value = String(rawValue ?? '').trim();
    if (value.length > 0) {
      return value;
    }
  }

  return null;
}

function detectConcreteFactRequest(query: string): ConcreteFactRequest | null {
  const normalizedQuery = normalizeSearchText(query);

  if (
    /\b(cuant[oa]s?|de cuantas?)\s+(caladas|puffs?)\b/.test(normalizedQuery)
    || /\b(trae|tiene|viene|rinde)\s+(.*\s)?(caladas|puffs?)\b/.test(normalizedQuery)
  ) {
    return { family: 'Puffs' };
  }

  if (
    /\b(que|cual|cuanta|de cuanta)\s+nicotina\b/.test(normalizedQuery)
    || /\b(trae|tiene|viene)\s+(.*\s)?nicotina\b/.test(normalizedQuery)
  ) {
    return { family: 'Nicotina' };
  }

  if (
    /\b(que|cual)\s+(es\s+el\s+)?sabor\b/.test(normalizedQuery)
    || /\bde que sabor\b/.test(normalizedQuery)
    || /\bsabor de\b/.test(normalizedQuery)
  ) {
    return { family: 'Sabor' };
  }

  if (
    /\b(que|cual)\s+modelo\b/.test(normalizedQuery)
    || /\bmodelo de\b/.test(normalizedQuery)
  ) {
    return { family: 'Modelo', requestedAs: 'modelo' };
  }

  if (
    /\b(que|cual)\s+version\b/.test(normalizedQuery)
    || /\bversion de\b/.test(normalizedQuery)
  ) {
    return { family: 'Modelo', requestedAs: 'version' };
  }

  if (
    /\bcompatible con\b/.test(normalizedQuery)
    || /\bcompatibilidad\b/.test(normalizedQuery)
  ) {
    return { family: 'Compatibilidad' };
  }

  return null;
}

function resolveConcreteFactAnswer(
  query: string,
  product: InternalResolvedProduct,
): ConcreteFactResolution | null {
  const request = detectConcreteFactRequest(query);
  if (!request) return null;

  const productName = product.name.trim();

  switch (request.family) {
    case 'Puffs': {
      const value = extractSpecValue(product, 'Puffs');
      if (!value) {
        return {
          request,
          answer: `No veo las caladas exactas cargadas para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `${productName} trae ${value} caladas.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Nicotina': {
      const value = extractSpecValue(product, 'Nicotina');
      if (!value) {
        return {
          request,
          answer: `No veo la nicotina exacta cargada para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `${productName} viene con ${normalizeDecisionText(value)} de nicotina.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Sabor': {
      const value = extractSpecValue(product, 'Sabor');
      if (!value) {
        return {
          request,
          answer: `No veo un sabor exacto cargado para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `El sabor de ${productName} es ${normalizeDecisionText(value)}.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Modelo': {
      const value = extractSpecValue(product, 'Modelo');
      if (!value) {
        const requestedLabel = request.requestedAs === 'version' ? 'la version exacta' : 'el modelo exacto';
        return {
          request,
          answer: `No veo ${requestedLabel} cargado para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: request.requestedAs === 'version'
          ? `La version de ${productName} es ${value.trim()}.`
          : `El modelo de ${productName} es ${value.trim()}.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Compatibilidad': {
      const value = extractSpecValue(product, 'Compatibilidad') ?? extractSpecValue(product, 'Compatible con');
      if (!value) {
        return {
          request,
          answer: `No veo una compatibilidad exacta cargada para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `${productName} es compatible con ${value.trim()}.`,
        directAnswerKind: 'FACT',
      };
    }
  }
}

const PROMOTION_HINTS = ['promo', 'promocion', 'promociones', 'descuento', 'descuentos', 'oferta', 'ofertas', 'cupon', 'coupon', 'codigo', 'sale'];
const READY_CLOSE_HINTS = ['me lo llevo', 'me llevo', 'me conviene', 'cierro', 'cerramos', 'listo', 'comprar', 'lo compro'];
const REPLENISHMENT_HINTS = ['lo de siempre', 'lo mismo', 'mis pods', 'quiero repetir', 'repetir', 'volver a pedir'];

function isPromotionQuestion(query: string): boolean {
  const normalized = normalizeSearchText(query);
  return hasAnyHint(normalized, PROMOTION_HINTS);
}

function isIncentiveYieldContext(query: string): boolean {
  const normalized = normalizeSearchText(query);
  return isPromotionQuestion(query)
    || hasAnyHint(normalized, BUDGET_HINTS)
    || hasAnyHint(normalized, WORTH_HINTS)
    || hasAnyHint(normalized, HESITATION_HINTS)
    || hasAnyHint(normalized, READY_CLOSE_HINTS);
}

function formatCurrency(value: number): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
  return `$${rounded}`;
}

function buildPromotionYieldLine(input: {
  query: string;
  signal?: CapsulePromotionSignal | null;
  primaryProduct?: InternalResolvedProduct | null;
  variantReady?: boolean;
  allowCouponSignal?: boolean;
}): string | null {
  if (!input.signal) return null;
  if (!isIncentiveYieldContext(input.query)) return null;
  if (input.variantReady === false && input.signal.kind === 'FLASH_DEAL') return null;

  if (input.signal.kind === 'FLASH_DEAL') {
    if (!input.primaryProduct || input.signal.product_id !== input.primaryProduct.id) return null;
    return `Si te ayuda en precio, ${input.signal.product_name} trae flash deal real ahorita: baja de ${formatCurrency(input.signal.original_price)} a ${formatCurrency(input.signal.flash_price)} mientras siga activo.`;
  }

  if (!input.allowCouponSignal) return null;

  const discountLabel = input.signal.discount_type === 'percentage'
    ? `${input.signal.discount_value}%`
    : formatCurrency(input.signal.discount_value);
  const minPurchaseLabel = input.signal.min_purchase > 0
    ? ` desde ${formatCurrency(input.signal.min_purchase)} de compra`
    : '';

  return `Si te ayuda en precio, tambien veo el cupon publico ${input.signal.code}: ${discountLabel} de descuento${minPurchaseLabel}. Yo solo te marco la promo activa; la elegibilidad final depende del checkout.`;
}

function buildPromotionOnlyResponse(signal?: CapsulePromotionSignal | null): string | null {
  if (!signal) {
    return 'Ahorita no veo una promo activa validada que te pueda prometer desde aqui. Si traes un producto concreto, te digo directo si tiene ahorro real o no.';
  }

  if (signal.kind === 'FLASH_DEAL') {
    return `Si buscas precio real, ahora mismo ${signal.product_name} trae flash deal activo: baja de ${formatCurrency(signal.original_price)} a ${formatCurrency(signal.flash_price)} mientras siga vigente.`;
  }

  const discountLabel = signal.discount_type === 'percentage'
    ? `${signal.discount_value}%`
    : formatCurrency(signal.discount_value);
  const minPurchaseLabel = signal.min_purchase > 0
    ? ` desde ${formatCurrency(signal.min_purchase)} de compra`
    : '';

  return `Si buscas promo real, ahora mismo veo el cupon publico ${signal.code}: ${discountLabel} de descuento${minPurchaseLabel}. Yo no te lo aplico desde aqui; solo te marco la promo activa y su elegibilidad final depende del checkout.`;
}

function isReplenishmentIntent(query: string): boolean {
  const normalized = normalizeSearchText(query);
  return REPLENISHMENT_HINTS.some((hint) => normalized.includes(hint));
}

function buildReplenishmentTarget(signal: CapsuleReplenishmentSignal): string {
  const baseName = signal.primary_product?.name ?? 'ese articulo';
  const variantLabel = signal.variant_label?.trim();
  return variantLabel ? `${baseName} (${variantLabel})` : baseName;
}

function buildReplenishmentDraft(signal: CapsuleReplenishmentSignal): string {
  const target = buildReplenishmentTarget(signal);
  const quantityLabel = signal.quantity && signal.quantity > 1
    ? ` x${signal.quantity}`
    : '';

  if (signal.kind === 'PARTIAL') {
    return `Revise tu historial real y ${target} es lo que si sigue vigente en el catalogo actual para repetir${quantityLabel}. El resto de ese pedido ya requiere revision manual.`;
  }

  return `Revise tu historial real y ${target} sigue vigente en el catalogo actual para repetir${quantityLabel}.`;
}

function buildReplenishmentHandoff(signal: CapsuleReplenishmentSignal): string | null {
  const quantityLabel = signal.quantity && signal.quantity > 1
    ? `${signal.quantity} pieza(s)`
    : 'una vez mas';

  if (signal.action_mode === 'ADD_TO_CART') {
    return `Si eso era lo de siempre, ya lo puedes volver a meter al carrito ${quantityLabel === 'una vez mas' ? 'de una vez' : `con ${quantityLabel}`}.`;
  }

  if (signal.action_mode === 'OPEN_PDP') {
    return 'Te lo dejo en ficha para confirmar la seleccion vigente antes de volver a agregarlo.';
  }

  return null;
}

function buildUnavailableReplenishmentDraft(signal: CapsuleReplenishmentSignal): string {
  const base = 'Revise tu compra reciente, pero no puedo prometerte "lo mismo" tal cual con el catalogo actual.';
  return signal.blocked_reason_detail
    ? `${base} ${signal.blocked_reason_detail}`
    : base;
}

type OutOfStockPivotReason = 'STOCK_ZERO' | 'VARIANT_UNAVAILABLE';

function normalizeRecoveryText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function extractRecoveryTokens(value: string): string[] {
  return normalizeRecoveryText(value)
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function flattenSpecText(specs: unknown): string {
  if (!specs || typeof specs !== 'object') return '';

  return Object.entries(specs as Record<string, unknown>)
    .flatMap(([key, value]) => [key, String(value ?? '')])
    .join(' ');
}

function buildProductRecoveryText(product: InternalResolvedProduct): string {
  return normalizeRecoveryText([
    product.name,
    product.ai_sales_note ?? '',
    product.description ?? '',
    flattenSpecText(product.specs),
    product.section ?? '',
  ].join(' '));
}

function scoreOutOfStockAlternative(
  query: string,
  requestedProduct: InternalResolvedProduct,
  candidate: InternalResolvedProduct,
): number {
  let score = 0;

  if (candidate.section && requestedProduct.section && candidate.section === requestedProduct.section) {
    score += 4;
  }

  const requestedBrand = extractSpecValue(requestedProduct, 'Marca');
  const candidateBrand = extractSpecValue(candidate, 'Marca');
  if (requestedBrand && candidateBrand && normalizeRecoveryText(requestedBrand) === normalizeRecoveryText(candidateBrand)) {
    score += 6;
  }

  const requestedFlavor = extractSpecValue(requestedProduct, 'Sabor') ?? extractSpecValue(requestedProduct, 'Flavor');
  const candidateFlavor = extractSpecValue(candidate, 'Sabor') ?? extractSpecValue(candidate, 'Flavor');
  if (requestedFlavor && candidateFlavor && normalizeRecoveryText(requestedFlavor) === normalizeRecoveryText(candidateFlavor)) {
    score += 8;
  }

  const requestedModel = extractSpecValue(requestedProduct, 'Modelo');
  const candidateModel = extractSpecValue(candidate, 'Modelo');
  if (requestedModel && candidateModel && normalizeRecoveryText(requestedModel) === normalizeRecoveryText(candidateModel)) {
    score += 5;
  }

  const requestedType = extractSpecValue(requestedProduct, 'Tipo');
  const candidateType = extractSpecValue(candidate, 'Tipo');
  if (requestedType && candidateType && normalizeRecoveryText(requestedType) === normalizeRecoveryText(candidateType)) {
    score += 4;
  }

  const requestedText = buildProductRecoveryText(requestedProduct);
  const candidateText = buildProductRecoveryText(candidate);
  const requestedTokens = extractRecoveryTokens(requestedText);
  const candidateTokens = extractRecoveryTokens(candidateText);
  const tokenOverlap = requestedTokens.filter((token) => candidateTokens.includes(token)).length;
  score += tokenOverlap * 2;

  const queryTokens = extractRecoveryTokens(query);
  const queryOverlap = queryTokens.filter((token) => candidateText.includes(token)).length;
  score += queryOverlap * 2;

  const requestedVariantValue = requestedProduct.variant_truth?.requested_value?.trim();
  if (requestedVariantValue && candidateText.includes(normalizeRecoveryText(requestedVariantValue))) {
    score += 8;
  }

  return score;
}

function rankOutOfStockAlternatives(
  query: string,
  requestedProduct: InternalResolvedProduct,
  candidates: InternalResolvedProduct[],
): InternalResolvedProduct[] {
  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreOutOfStockAlternative(query, requestedProduct, candidate),
    }))
    .filter(({ candidate, score }) => candidate.status_signal !== 'OUT_OF_STOCK' && score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.candidate.raw_stock !== left.candidate.raw_stock) {
        return right.candidate.raw_stock - left.candidate.raw_stock;
      }
      return left.candidate.name.localeCompare(right.candidate.name);
    })
    .map(({ candidate }) => candidate);
}

function buildOutOfStockPivotDraft(input: {
  requestedProduct: InternalResolvedProduct;
  alternativeProduct: InternalResolvedProduct;
  reason: OutOfStockPivotReason;
  requestedVariantLabel?: string | null;
}): string {
  const requestedSpecs = extractSpecsFact(input.requestedProduct);
  const alternativeSpecs = extractSpecsFact(input.alternativeProduct);
  const alternativeNote = input.alternativeProduct.ai_sales_note;
  const variantLabel = input.requestedVariantLabel?.trim()
    || input.requestedProduct.variant_truth?.matched_variant_label?.trim()
    || input.requestedProduct.variant_truth?.requested_value?.trim()
    || null;

  let draft = input.reason === 'VARIANT_UNAVAILABLE'
    ? variantLabel
      ? `El producto existe, pero la variante pedida ${variantLabel} no esta disponible ahorita, pero te seleccione alternativas reales que si estan en existencia.`
      : 'El producto existe, pero la variante pedida no esta disponible ahorita, pero te seleccione alternativas reales que si estan en existencia.'
    : 'El producto exacto que buscas esta agotado en este momento, pero te seleccione alternativas reales que si estan en existencia.';

  if (requestedSpecs && alternativeSpecs) {
    draft = input.reason === 'VARIANT_UNAVAILABLE'
      ? `La variante pedida ${variantLabel ?? 'que buscabas'} esta agotada, pero encontre alternativas ${alternativeSpecs} en existencia.`
      : `El producto exacto que buscas ${requestedSpecs} esta agotado, pero encontre alternativas ${alternativeSpecs} en existencia.`;
  } else if (alternativeSpecs) {
    draft = input.reason === 'VARIANT_UNAVAILABLE'
      ? `La variante pedida ${variantLabel ?? 'que buscabas'} no esta disponible, pero encontre alternativas ${alternativeSpecs} en existencia.`
      : 'El producto exacto que buscas esta agotado, pero encontre alternativas en existencia.';
  } else if (alternativeNote) {
    draft = input.reason === 'VARIANT_UNAVAILABLE'
      ? `La variante pedida ${variantLabel ?? 'que buscabas'} no esta disponible, pero encontre una alternativa disponible: ${alternativeNote}.`
      : `El producto exacto que buscas esta agotado, pero encontre una alternativa disponible: ${alternativeNote}.`;
  }

  return draft;
}

function buildOutOfStockAlternativeContract(input: {
  query: string;
  requestedProduct: InternalResolvedProduct;
  alternatives: InternalResolvedProduct[];
  reason: OutOfStockPivotReason;
  semanticMatchSource: ProductSearchContext['semantic_match_source'];
  promotionSignal?: CapsulePromotionSignal | null;
  requestedVariantLabel?: string | null;
}): InternalCapsuleContract | null {
  const viableAlternatives = input.alternatives.filter((product) => product.status_signal !== 'OUT_OF_STOCK');
  if (viableAlternatives.length === 0) return null;

  const topAlternative = viableAlternatives[0];
  if (!topAlternative) return null;

  const decisionGuide = buildDecisionGuide(viableAlternatives.slice(0, 4));
  const alternativeSpecs = extractSpecsFact(topAlternative);
  const alternativeNote = topAlternative.ai_sales_note;
  const oosAlternativeDraft = buildOutOfStockPivotDraft({
    requestedProduct: input.requestedProduct,
    alternativeProduct: topAlternative,
    reason: input.reason,
    requestedVariantLabel: input.requestedVariantLabel,
  });
  const oosObjectionRecovery = buildObjectionRecovery(
    input.query,
    viableAlternatives.slice(0, 4),
    decisionGuide?.hasSupportedComparison ?? false,
    buildExplicitSupportReason(topAlternative),
  );
  const oosActionStrength: ActionStrength = (viableAlternatives.length === 1 && Boolean(alternativeSpecs || alternativeNote))
    || decisionGuide?.hasSupportedComparison
    ? 'review_then_cart'
    : 'review_only';
  const oosRecoveryCommitment = oosObjectionRecovery
    ? buildRecoveryCommitment(
      input.query,
      viableAlternatives.slice(0, 4),
      decisionGuide?.hasSupportedComparison ?? false,
      oosActionStrength,
    )
    : null;
  const oosHasSupportBackedRecovery = Boolean(
    oosRecoveryCommitment
    && oosRecoveryCommitment.compareAgainst === null
    && oosRecoveryCommitment.actionStrength === 'review_then_cart',
  );
  const oosPromotionLine = buildPromotionYieldLine({
    query: input.query,
    signal: input.promotionSignal ?? null,
    primaryProduct: oosRecoveryCommitment?.preferredProduct ?? topAlternative,
    variantReady: true,
    allowCouponSignal: true,
  });
  const oosCheckoutReadiness = buildCheckoutReadiness(
    oosRecoveryCommitment?.preferredProduct ?? topAlternative,
    oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
    oosRecoveryCommitment?.compareAgainst ?? (viableAlternatives.length > 1 ? viableAlternatives[1] ?? null : null),
    oosHasSupportBackedRecovery,
  );
  const oosCartPrecision = buildCartPrecision(
    oosRecoveryCommitment?.preferredProduct ?? topAlternative,
    oosCheckoutReadiness,
    oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
    oosRecoveryCommitment?.compareAgainst ?? (viableAlternatives.length > 1 ? viableAlternatives[1] ?? null : null),
  );

  return buildContract(
    'SUCCESS',
    'OUT_OF_STOCK_ALTERNATIVE',
    joinSentences(
      oosAlternativeDraft,
      'Te dejo opciones cercanas para que no se te cierre la compra.',
      decisionGuide?.text,
      viableAlternatives.length === 1 && !oosObjectionRecovery ? buildSingleOptionConfidenceLine('narrowed') : null,
      oosObjectionRecovery?.line,
      oosPromotionLine ?? null,
      oosRecoveryCommitment?.line,
      oosCartPrecision?.line ?? oosCheckoutReadiness?.line,
      oosCartPrecision?.handoff ?? oosCheckoutReadiness?.handoff ?? (oosRecoveryCommitment
        ? buildRecoveryHandoffLine(
          oosRecoveryCommitment.preferredProduct,
          oosRecoveryCommitment.compareAgainst,
          oosRecoveryCommitment.actionStrength,
        )
        : buildHandoffLine(
          'options',
          viableAlternatives.slice(0, 4),
          decisionGuide?.hasSupportedComparison ?? false,
          oosObjectionRecovery?.actionStrength ?? oosActionStrength,
        )),
    ),
    0.75,
    viableAlternatives.slice(0, 4),
    undefined,
    `Requested item/variant unavailable. Safe fallback provided via ${input.semanticMatchSource}.`,
    input.reason === 'STOCK_ZERO' ? [input.requestedProduct] : [],
    input.semanticMatchSource ?? 'NONE',
    undefined,
    buildHelpContract({
      compareSupported: decisionGuide?.hasSupportedComparison ?? false,
      preferredProduct: oosRecoveryCommitment?.preferredProduct ?? decisionGuide?.preferredProduct ?? topAlternative,
      secondaryProduct: oosRecoveryCommitment?.compareAgainst ?? decisionGuide?.secondaryProduct ?? null,
      actionStrength: oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
    }),
    input.promotionSignal ?? undefined,
  );
}

function buildMissingReplenishmentDraft(query: string): string {
  return `No veo una compra reciente reordenable lo bastante clara para resolver "${query}" como "lo mismo" con verdad. Si me dices el producto o variante, te lo aterrizo con el catalogo actual.`;
}

type DecisionCue = {
  axis: string;
  dedupeKey: string;
  text: string;
};

type DecisionGuideResult = {
  hasSupportedComparison: boolean;
  text: string;
  preferredProduct: InternalResolvedProduct;
  secondaryProduct: InternalResolvedProduct;
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
type CartPrecisionResult = {
  line: string;
  handoff: string;
};
type VariantReadinessResult = {
  line: string;
  handoff: string;
  confidence: number;
  suppressCartPrecision: boolean;
};

function buildTruthSignals(input: {
  factResolution?: ConcreteFactResolution | null;
}): CapsuleTruthSignals | undefined {
  if (!input.factResolution) return undefined;

  return {
    direct_answer_complete: true,
    direct_answer_kind: input.factResolution.directAnswerKind,
    fact_family: input.factResolution.request.family,
  };
}

function buildHelpContract(input: {
  compareSupported?: boolean;
  preferredProduct?: InternalResolvedProduct | null;
  secondaryProduct?: InternalResolvedProduct | null;
  actionStrength?: ActionStrength;
  directAnswerComplete?: boolean;
}): CapsuleHelpContract | undefined {
  const hasMeaningfulSignal = Boolean(
    input.compareSupported
    || input.preferredProduct
    || input.secondaryProduct
    || input.actionStrength
    || input.directAnswerComplete,
  );
  if (!hasMeaningfulSignal) return undefined;

  return {
    compare_supported: input.compareSupported ?? false,
    preferred_product_id: input.preferredProduct?.id ?? null,
    secondary_product_id: input.secondaryProduct?.id ?? null,
    action_strength: input.actionStrength,
  };
}

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

const CART_PRECISION_SPEC_CANDIDATES: Array<{
  key: string;
  toPrecisionTarget: (value: string) => string;
  confirmCue: string;
}> = [
  { key: 'Sabor', toPrecisionTarget: (value) => `el sabor ${normalizeDecisionText(value)}`, confirmCue: 'ese sabor' },
  { key: 'Variante', toPrecisionTarget: (value) => `la variante ${normalizeDecisionText(value)}`, confirmCue: 'esa variante' },
  { key: 'Nicotina', toPrecisionTarget: (value) => `${normalizeDecisionText(value)} de nicotina`, confirmCue: 'esa nicotina' },
  { key: 'Presentacion', toPrecisionTarget: (value) => `la presentacion ${normalizeDecisionText(value)}`, confirmCue: 'esa presentacion' },
  { key: 'Tamano', toPrecisionTarget: (value) => `el tamano ${normalizeDecisionText(value)}`, confirmCue: 'ese tamano' },
  { key: 'Contenido', toPrecisionTarget: (value) => `el contenido ${normalizeDecisionText(value)}`, confirmCue: 'ese contenido' },
  { key: 'Modelo', toPrecisionTarget: (value) => `el modelo ${normalizeDecisionText(value)}`, confirmCue: 'ese modelo' },
  { key: 'Cantidad', toPrecisionTarget: (value) => `la cantidad ${normalizeDecisionText(value)}`, confirmCue: 'esa cantidad' },
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
  hasSupportBackedRecovery = false,
): CheckoutReadinessResult | null {
  if (actionStrength !== 'review_then_cart' || compareAgainst) return null;

  const variantReadiness = buildVariantReadiness(product);
  if (variantReadiness) {
    return {
      line: variantReadiness.line,
      handoff: variantReadiness.handoff,
    };
  }

  for (const candidate of CHECKOUT_READINESS_SPEC_CANDIDATES) {
    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    return {
      line: `Si ${candidate.toCondition(value)}, este ya queda practicamente listo para compra.`,
      handoff: 'Abre la ficha y confirma solo ese detalle; si te cuadra, agregalo al carrito.',
    };
  }

  if (!hasSupportBackedRecovery) return null;

  return {
    line: 'Si ese ya era el ultimo punto que necesitabas resolver, este ya queda practicamente listo para compra.',
    handoff: 'Abre la ficha y si ese punto ya te cierra, agregalo al carrito.',
  };
}

function buildVariantReadiness(
  product: InternalResolvedProduct,
): VariantReadinessResult | null {
  const variantTruth = product.variant_truth;
  if (!variantTruth?.requested_variant_intent) return null;

  const label = variantTruth.matched_variant_label?.trim() || variantTruth.requested_value?.trim() || null;

  switch (variantTruth.availability) {
    case 'available':
      return {
        line: label
          ? `La variante pedida ${label} si esta disponible y con stock.`
          : 'La variante pedida si esta disponible y con stock.',
        handoff: label
          ? `Abre la ficha y confirma ${label}; si coincide, agrega esa version al carrito.`
          : 'Abre la ficha y confirma ese selector; si coincide, agrega esa version al carrito.',
        confidence: 0.95,
        suppressCartPrecision: false,
      };
    case 'missing':
      return {
        line: label
          ? `El producto existe, pero la variante pedida ${label} no esta disponible ahorita.`
          : 'El producto existe, pero la variante pedida no esta disponible ahorita.',
        handoff: 'Abre la ficha para revisar otra variante vigente antes de agregar.',
        confidence: 0.72,
        suppressCartPrecision: true,
      };
    case 'ambiguous':
      return {
        line: 'La linea existe, pero la variante exacta todavia no queda confirmada. Mejor abre la ficha para escoger la variante vigente.',
        handoff: 'Abre la ficha y revisa el selector antes de avanzar.',
        confidence: 0.76,
        suppressCartPrecision: true,
      };
    case 'unsupported':
    default:
      return {
        line: 'La linea existe, pero no veo confirmada esa variante exacta en el catalogo. Mejor revisa la ficha antes de tomarla como cierre.',
        handoff: 'Abre la ficha y confirma si hay una variante vigente que si encaje.',
        confidence: 0.68,
        suppressCartPrecision: true,
      };
  }
}

function buildCartPrecision(
  product: InternalResolvedProduct,
  checkoutReadiness: CheckoutReadinessResult | null,
  actionStrength: ActionStrength,
  compareAgainst: InternalResolvedProduct | null,
): CartPrecisionResult | null {
  // Precision is only allowed as a tighter follow-through of an already valid readiness state.
  if (!checkoutReadiness || actionStrength !== 'review_then_cart' || compareAgainst) return null;

  const variantTruth = buildVariantReadiness(product);
  if (variantTruth?.suppressCartPrecision) return null;
  if (variantTruth?.line && variantTruth.confidence >= 0.9) {
    const label = product.variant_truth?.matched_variant_label?.trim() || product.variant_truth?.requested_value?.trim() || null;
    return {
      line: label
        ? `Si lo que quieres llevar es ${label}, esta ya queda como la version mas precisa para carrito.`
        : 'Si lo que quieres llevar es esa variante exacta, esta ya queda como la version mas precisa para carrito.',
      handoff: label
        ? `Abre la ficha y confirma ${label}; si coincide, agrega esa version al carrito.`
        : 'Abre la ficha y confirma esa variante; si coincide, agrega esa version al carrito.',
    };
  }

  for (const candidate of CART_PRECISION_SPEC_CANDIDATES) {
    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    return {
      line: `Si lo que quieres llevar es ${candidate.toPrecisionTarget(value)}, esta ya queda como la version mas precisa para carrito.`,
      handoff: `Abre la ficha y confirma ${candidate.confirmCue}; si coincide, agrega esa version al carrito.`,
    };
  }

  return null;
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
      preferredProduct: first,
      secondaryProduct: second,
      text: `Para elegir sin darle demasiadas vueltas: si te late ${firstCue.text}, ${first.name} ya es la salida mas clara para avanzar; compara ${second.name} solo si prefieres ${secondCue.text}.${thirdLine}`,
    };
  }

  return {
    hasSupportedComparison: false,
    preferredProduct: first,
    secondaryProduct: second,
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
    promotion_signal,
    replenishment_signal,
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
  const explicitPromotionQuestion = isPromotionQuestion(tool_args.query);
  const explicitReplenishmentIntent = isReplenishmentIntent(tool_args.query);

  if (explicitReplenishmentIntent) {
    if (replenishment_signal?.kind === 'UNAVAILABLE') {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        buildUnavailableReplenishmentDraft(replenishment_signal),
        0.35,
        [],
        undefined,
        'Authenticated replenishment intent detected, but the recent item no longer revalidates against current catalog truth.',
        [],
        'AUTHENTICATED_REORDER',
        undefined,
        undefined,
        promotion_signal,
        replenishment_signal,
      );
    }

    const replenishmentPrimary = replenishment_signal?.primary_product
      ? exactInStock.find((product) => product.id === replenishment_signal.primary_product?.id) ?? exact_matches.find((product) => product.id === replenishment_signal.primary_product?.id) ?? null
      : null;

    if (replenishment_signal && replenishmentPrimary) {
      const replenishmentPromotionLine = buildPromotionYieldLine({
        query: tool_args.query,
        signal: promotion_signal ?? null,
        primaryProduct: replenishmentPrimary,
        variantReady: true,
        allowCouponSignal: true,
      });

      return buildContract(
        'SUCCESS',
        'EXACT',
        joinSentences(
          buildReplenishmentDraft(replenishment_signal),
          replenishmentPromotionLine,
          buildReplenishmentHandoff(replenishment_signal),
        ),
        replenishment_signal.kind === 'READY' ? 0.98 : 0.84,
        [replenishmentPrimary],
        undefined,
        'Authenticated replenishment signal grounded on recent order history and current catalog truth.',
        [],
        'AUTHENTICATED_REORDER',
        undefined,
        buildHelpContract({
          preferredProduct: replenishmentPrimary,
          actionStrength: replenishment_signal.action_mode === 'ADD_TO_CART' ? 'review_then_cart' : 'review_only',
        }),
        promotion_signal,
        replenishment_signal,
      );
    }

    return buildContract(
      'SUCCESS',
      'NO_MATCH',
      buildMissingReplenishmentDraft(tool_args.query),
      0.2,
      [],
      undefined,
      'Replenishment intent detected, but no authenticated reorderable history could be grounded.',
      [],
      'AUTHENTICATED_REORDER',
      undefined,
      undefined,
      promotion_signal,
      replenishment_signal,
    );
  }

  if (exactInStock.length > 0) {
    const topProduct = exactInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, [], undefined, undefined, undefined, 'NONE');
    }

    const exactFactResolution = exactInStock.length === 1
      ? resolveConcreteFactAnswer(tool_args.query, topProduct)
      : null;
    if (exactFactResolution) {
      return buildContract(
        'SUCCESS',
        'EXACT',
        exactFactResolution.answer,
        0.95,
        exactInStock.slice(0, 1),
        undefined,
        'Direct exact fact answer grounded on supported product specs.',
        [],
        'DIRECT_EXACT',
        buildTruthSignals({ factResolution: exactFactResolution }),
        buildHelpContract({
          preferredProduct: topProduct,
          actionStrength: 'review_only',
          directAnswerComplete: true,
        }),
        promotion_signal,
      );
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
        undefined,
        buildHelpContract({
          preferredProduct: exactInStock[0] ?? null,
          secondaryProduct: exactInStock[1] ?? null,
          actionStrength: 'review_only',
        }),
        promotion_signal,
      );
    }

    const requestedVariantLabel = topProduct.variant_truth?.matched_variant_label?.trim()
      || topProduct.variant_truth?.requested_value?.trim()
      || null;
    const requestedVariantUnavailable = Boolean(
      topProduct.variant_truth?.requested_variant_intent
      && topProduct.variant_truth?.availability !== 'available',
    );
    if (requestedVariantUnavailable) {
      const rankedAlternatives = rankOutOfStockAlternatives(
        tool_args.query,
        topProduct,
        [...exactInStock.slice(1), ...semanticInStock],
      );
      const variantPivotContract = buildOutOfStockAlternativeContract({
        query: tool_args.query,
        requestedProduct: topProduct,
        alternatives: rankedAlternatives,
        reason: 'VARIANT_UNAVAILABLE',
        semanticMatchSource: semantic_match_source,
        promotionSignal: promotion_signal ?? null,
      });

      if (variantPivotContract) {
        return variantPivotContract;
      }

      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        joinSentences(
          requestedVariantLabel
            ? `El producto existe, pero la variante pedida ${requestedVariantLabel} no esta disponible ahorita.`
            : 'El producto existe, pero la variante pedida no esta disponible ahorita.',
          buildRecoveryQuestion(tool_args.query),
        ),
        0.2,
        [],
        undefined,
        'Requested variant unavailable and no grounded substitutes passed the similarity floor.',
        [],
        semantic_match_source,
        undefined,
        undefined,
        promotion_signal,
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
      const exactHasSupportBackedRecovery = Boolean(
        exactRecoveryCommitment
        && exactRecoveryCommitment.compareAgainst === null
        && exactRecoveryCommitment.actionStrength === 'review_then_cart',
      );
      const exactVariantReadiness = buildVariantReadiness(exactRecoveryCommitment?.preferredProduct ?? topProduct);
      const exactPromotionLine = buildPromotionYieldLine({
        query: tool_args.query,
        signal: promotion_signal ?? null,
        primaryProduct: exactRecoveryCommitment?.preferredProduct ?? topProduct,
        variantReady: (exactVariantReadiness?.confidence ?? 1) >= 0.9,
        allowCouponSignal: true,
      });
      const exactCheckoutReadiness = buildCheckoutReadiness(
        exactRecoveryCommitment?.preferredProduct ?? topProduct,
        exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
        exactRecoveryCommitment?.compareAgainst ?? null,
        exactHasSupportBackedRecovery,
      );
      const exactCartPrecision = buildCartPrecision(
        exactRecoveryCommitment?.preferredProduct ?? topProduct,
        exactCheckoutReadiness,
        exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
        exactRecoveryCommitment?.compareAgainst ?? null,
      );

      let exactDraft = exactVariantReadiness?.line ?? 'Aqui tienes exactamente lo que buscabas.';
      if (!exactVariantReadiness || exactVariantReadiness.confidence >= 0.9) {
        if (topNote) {
          exactDraft = exactVariantReadiness
            ? `${exactVariantReadiness.line} ${topNote}`
            : `Aqui tienes exactamente lo que buscabas. ${topNote}`;
        } else if (topSpecs) {
          exactDraft = exactVariantReadiness
            ? `${exactVariantReadiness.line} Viene ${topSpecs}.`
            : `Aqui tienes exactamente lo que buscabas. Viene ${topSpecs}.`;
        }
      }

      const exactConfidenceLine = exactVariantReadiness && exactVariantReadiness.confidence < 0.9
        ? null
        : (exactObjectionRecovery?.line ?? buildSingleOptionConfidenceLine('exact'));

      return buildContract(
        'SUCCESS',
        'EXACT',
        joinSentences(
          exactDraft,
          exactConfidenceLine,
          explicitPromotionQuestion && !exactPromotionLine && !promotion_signal
            ? 'Ahorita no veo una promo activa validada para ese producto.'
            : exactPromotionLine,
          exactRecoveryCommitment?.line,
          exactCartPrecision?.line ?? exactCheckoutReadiness?.line,
          exactCartPrecision?.handoff ?? exactCheckoutReadiness?.handoff ?? (exactRecoveryCommitment
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
        exactVariantReadiness?.confidence ?? 0.95,
        exactInStock.slice(0, 4),
        undefined,
        'Exact match found and in stock.',
        [],
        'DIRECT_EXACT',
        undefined,
        buildHelpContract({
          compareSupported: Boolean(exactRecoveryCommitment?.compareAgainst),
          preferredProduct: exactRecoveryCommitment?.preferredProduct ?? topProduct,
          secondaryProduct: exactRecoveryCommitment?.compareAgainst ?? null,
          actionStrength: exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
        }),
        promotion_signal,
      );
  }

  if (exact_matches.length > 0 && exactInStock.length === 0) {
    const exhaustedProduct = exhaustedExact[0] ?? exact_matches[0] ?? null;
    const rankedAlternatives = exhaustedProduct
      ? rankOutOfStockAlternatives(tool_args.query, exhaustedProduct, semanticInStock)
      : [];
    const oosContract = exhaustedProduct
      ? buildOutOfStockAlternativeContract({
        query: tool_args.query,
        requestedProduct: exhaustedProduct,
        alternatives: rankedAlternatives,
        reason: 'STOCK_ZERO',
        semanticMatchSource: semantic_match_source,
        promotionSignal: promotion_signal ?? null,
      })
      : null;

    if (oosContract) {
      return oosContract;
    }

    return buildContract(
      'SUCCESS',
      'NO_MATCH',
      joinSentences(
        'El producto exacto que buscas ya no esta disponible con una alternativa cercana lo bastante clara para prometerte sustituto.',
        buildRecoveryQuestion(tool_args.query),
      ),
      0.15,
      [],
      undefined,
      'Requested item unavailable and no grounded substitutes passed the similarity floor.',
      exhaustedExact,
      semantic_match_source,
      undefined,
      undefined,
      promotion_signal,
    );
  }

  if (tool_args.is_ambiguous) {
    const featuredProducts = semanticInStock.slice(0, 4);
    if (featuredProducts.length === 0) {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        explicitPromotionQuestion
          ? (buildPromotionOnlyResponse(promotion_signal ?? null) ?? buildRecoveryQuestion(tool_args.query))
          : joinSentences(
              `Revise el catalogo pero no logre encontrar una salida clara para "${tool_args.query}".`,
              buildRecoveryQuestion(tool_args.query),
            ),
        explicitPromotionQuestion ? 0.45 : 0.1,
        [],
        undefined,
        'Ambiguity flag active but zero semantic matches found. Degraded honestly instead of showing fake confidence.',
        [],
        'NONE',
        undefined,
        undefined,
        promotion_signal,
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
      undefined,
      buildHelpContract({
        compareSupported: decisionGuide?.hasSupportedComparison ?? false,
        preferredProduct: decisionGuide?.preferredProduct ?? topFeaturedProduct,
        secondaryProduct: decisionGuide?.secondaryProduct ?? featuredProducts[1] ?? null,
        actionStrength: 'review_only',
      }),
    );
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
    const semanticHasSupportBackedRecovery = Boolean(
      semanticRecoveryCommitment
      && semanticRecoveryCommitment.compareAgainst === null
      && semanticRecoveryCommitment.actionStrength === 'review_then_cart',
    );
    const semanticVariantReadiness = buildVariantReadiness(semanticRecoveryCommitment?.preferredProduct ?? topProduct);
    const semanticPromotionLine = buildPromotionYieldLine({
      query: tool_args.query,
      signal: promotion_signal ?? null,
      primaryProduct: semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      variantReady: (semanticVariantReadiness?.confidence ?? 1) >= 0.9,
      allowCouponSignal: true,
    });
    const semanticCheckoutReadiness = buildCheckoutReadiness(
      semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      semanticRecoveryCommitment?.compareAgainst ?? (semanticInStock.length > 1 ? semanticInStock[1] ?? null : null),
      semanticHasSupportBackedRecovery,
    );
    const semanticCartPrecision = buildCartPrecision(
      semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      semanticCheckoutReadiness,
      semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      semanticRecoveryCommitment?.compareAgainst ?? (semanticInStock.length > 1 ? semanticInStock[1] ?? null : null),
    );

    let semanticDraft = semanticVariantReadiness?.line ?? `No encontre "${tool_args.query}" exacto, pero estas opciones del catalogo son las mas cercanas.`;
    if (!semanticVariantReadiness || semanticVariantReadiness.confidence >= 0.9) {
      if (topSpecsFact) {
        semanticDraft = semanticVariantReadiness
          ? `${semanticVariantReadiness.line} ${topProduct.name} ${topSpecsFact} podria ser de lo mas cercano a lo que buscas.`
          : `No encontre "${tool_args.query}" exactamente, pero ${topProduct.name} ${topSpecsFact} podria ser de lo mas cercano a lo que buscas.`;
      } else if (topNote) {
        semanticDraft = semanticVariantReadiness
          ? `${semanticVariantReadiness.line} ${topProduct.name} (${topNote}) podria encajar con lo que buscas.`
          : `No encontre un producto con ese nombre exacto, pero ${topProduct.name} (${topNote}) podria encajar con lo que buscas.`;
      } else if (topDescription) {
        semanticDraft = semanticVariantReadiness
          ? `${semanticVariantReadiness.line} ${topProduct.name} (${topDescription}) podria encajar con lo que buscas.`
          : `No encontre un producto con ese nombre exacto, pero ${topProduct.name} (${topDescription}) podria encajar con lo que buscas.`;
      }
    }

    const semanticConfidenceLine = semanticVariantReadiness && semanticVariantReadiness.confidence < 0.9
      ? null
      : (semanticInStock.length === 1 && !semanticObjectionRecovery ? buildSingleOptionConfidenceLine('narrowed') : null);

    return buildContract(
      'SUCCESS',
      semantic_match_source === 'TOKEN_RECOVERY' ? 'TOKEN_RECOVERY' : 'SEMANTIC',
      joinSentences(
        semanticDraft,
        semanticDecisionGuide?.text,
        semanticConfidenceLine,
        semanticObjectionRecovery?.line,
        explicitPromotionQuestion && !semanticPromotionLine && !promotion_signal
          ? 'Ahorita no veo una promo activa validada para estas opciones.'
          : semanticPromotionLine,
        semanticRecoveryCommitment?.line,
        semanticCartPrecision?.line ?? semanticCheckoutReadiness?.line,
        buildSemanticRefinementLine(tool_args.query, semantic_match_source),
        semanticCartPrecision?.handoff ?? semanticCheckoutReadiness?.handoff ?? (semanticRecoveryCommitment
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
      semanticVariantReadiness?.confidence ?? 0.6,
      semanticInStock.slice(0, 3),
      undefined,
      semantic_match_source === 'TOKEN_RECOVERY'
        ? 'Token recovery approximation with sharper follow-up and storefront handoff.'
        : 'Semantic approximation with sharper follow-up and storefront handoff.',
      [],
      semantic_match_source,
      undefined,
      buildHelpContract({
        compareSupported: semanticDecisionGuide?.hasSupportedComparison ?? false,
        preferredProduct: semanticRecoveryCommitment?.preferredProduct ?? semanticDecisionGuide?.preferredProduct ?? topProduct,
        secondaryProduct: semanticRecoveryCommitment?.compareAgainst ?? semanticDecisionGuide?.secondaryProduct ?? null,
        actionStrength: semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      }),
      promotion_signal,
    );
  }

  return buildContract(
    'SUCCESS',
    'NO_MATCH',
    explicitPromotionQuestion
      ? (buildPromotionOnlyResponse(promotion_signal ?? null) ?? buildRecoveryQuestion(tool_args.query))
      : joinSentences(
          `No encontre "${tool_args.query}" tal cual en el catalogo.`,
          buildRecoveryQuestion(tool_args.query),
        ),
    explicitPromotionQuestion ? 0.45 : 0.1,
    [],
    undefined,
    'Exhausted all search vectors. Empty result set.',
    [],
    'NONE',
    undefined,
    undefined,
    promotion_signal,
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
  truthSignals?: CapsuleTruthSignals,
  helpContract?: CapsuleHelpContract,
  promotionSignal?: CapsulePromotionSignal,
  replenishmentSignal?: CapsuleReplenishmentSignal,
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
    truth_signals: truthSignals,
    help_contract: helpContract,
    promotion_signal: promotionSignal,
    replenishment_signal: replenishmentSignal,
    resolved_products: products,
    capsule_reasoning: reasoning,
    exhausted_exact_matches: exhaustedExact,
    retrieval_source: retrievalSource,
  };
}
