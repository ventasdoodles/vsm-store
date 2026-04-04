import { resolveStorefrontPromotionSignal } from '@/services/storefront-promotions.service';
import { getProducts, getProductsByIds, getProductsBySearch } from '@/services/products.service';
import { useCartStore } from '@/stores/cart.store';
import type { BudgetRescueToolArgs, InternalBudgetRescueContractType, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';

type BudgetRescueKind =
  | 'CHEAPER_ALTERNATIVE_FOUND'
  | 'PROMO_ALREADY_BEST_VALUE'
  | 'NO_GOOD_TRADE_DOWN'
  | 'REVIEW_CURRENT_OPTION';

type ProductRef = NonNullable<InternalBudgetRescueContractType['resolved_products']>[number];

export interface StorefrontBudgetRescueResolution {
  kind: BudgetRescueKind;
  message: string;
  matchStrategy: BudgetRescueKind;
  retrievalSource: InternalBudgetRescueContractType['retrieval_source'];
  resolvedProducts: ProductRef[];
  signal: InternalBudgetRescueContractType['budget_rescue_signal'];
}

const BUDGET_STRIP_PATTERNS = [
  /\balgo mas barato\b/g,
  /\balgo mas economico\b/g,
  /\botra opcion mas barata\b/g,
  /\botra opcion mas economica\b/g,
  /\botra alternativa mas barata\b/g,
  /\botra alternativa mas economica\b/g,
  /\balgo parecido pero mas barato\b/g,
  /\balgo parecido pero mas economico\b/g,
  /\bque me conviene si quiero gastar menos\b/g,
  /\bquiero gastar menos\b/g,
  /\bse me va muy arriba\b/g,
  /\bse me fue muy arriba\b/g,
  /\bbajale de precio\b/g,
  /\bmas barato\b/g,
  /\bmas economico\b/g,
];

const STOPWORDS = new Set([
  'algo', 'otra', 'opcion', 'opciones', 'alternativa', 'alternativas', 'parecido', 'parecida',
  'pero', 'mas', 'menos', 'economico', 'economica', 'barato', 'barata', 'conviene', 'quiero',
  'gastar', 'se', 'me', 'va', 'muy', 'arriba', 'bajale', 'de', 'del', 'al', 'que', 'la', 'el', 'los', 'las',
  'esa', 'ese', 'eso', 'precio', 'porfa',
]);

const COMPATIBILITY_HINTS = ['coil', 'coils', 'pod', 'pods', 'cartucho', 'cartuchos', 'resistencia', 'resistencias', 'liquido', 'liquidos', 'bateria', 'baterias', 'compatible', 'compatibilidad', 'repuesto'];

function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function overlapScore(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((score, token) => score + (rightSet.has(token) ? 1 : 0), 0);
}

function formatCurrency(value: number): string {
  return `$${Number.isInteger(value) ? value : Number(value.toFixed(2))}`;
}

function toProductRef(product: Product): ProductRef {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    section: product.section,
  };
}

function toInternalResolvedProduct(product: Product): InternalResolvedProduct {
  return {
    id: product.id,
    slug: product.slug,
    section: product.section,
    name: product.name,
    display_price: formatCurrency(product.price),
    raw_stock: product.stock,
    status_signal: product.stock > 5 ? 'IN_STOCK' : product.stock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
    commercial_flag: product.ai_is_featured ? 'FEATURED' : product.compare_at_price && product.compare_at_price > product.price ? 'CLEARANCE' : 'STANDARD',
    ai_sales_note: product.ai_sales_note ?? null,
    description: product.description ?? product.short_description ?? null,
    specs: product.specs ?? null,
  };
}

function textForProduct(product: Product): string {
  const tags = Array.isArray(product.tags) ? product.tags.join(' ') : '';
  const specs = product.specs && typeof product.specs === 'object'
    ? Object.entries(product.specs).flatMap(([key, value]) => [key, String(value ?? '')]).join(' ')
    : '';
  return normalizeText([
    product.name,
    product.slug,
    product.description ?? '',
    product.short_description ?? '',
    product.ai_sales_note ?? '',
    tags,
    specs,
  ].join(' '));
}

function stripBudgetLanguage(query: string): string {
  let normalized = normalizeText(query);
  for (const pattern of BUDGET_STRIP_PATTERNS) {
    normalized = normalized.replace(pattern, ' ');
  }

  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .join(' ')
    .trim();
}

function isPurchasableProduct(product: Product): boolean {
  if (!product.is_active || product.status !== 'active') return false;
  const hasVariantInventory = (product.variants ?? []).some((variant) => variant.is_active && variant.stock > 0);
  return product.stock > 0 || hasVariantInventory;
}

function deriveCompatibilitySensitive(query: string, anchor?: Product | null): boolean {
  const text = `${normalizeText(query)} ${anchor ? textForProduct(anchor) : ''}`;
  return COMPATIBILITY_HINTS.some((hint) => text.includes(normalizeText(hint)));
}

function scoreAnchorCandidate(product: Product, queryAnchor: string): number {
  const text = textForProduct(product);
  const anchorText = normalizeText(queryAnchor);
  const anchorTokens = tokenize(queryAnchor);
  let score = 0;

  if (normalizeText(product.name) === anchorText || normalizeText(product.slug) === anchorText) score += 120;
  if (text.includes(anchorText)) score += 60;
  score += overlapScore(anchorTokens, tokenize(text)) * 14;
  if (product.ai_is_featured) score += 4;
  return score;
}

function scoreTradeDownCandidate(input: {
  anchor: Product;
  candidate: Product;
  query: string;
  compatibilitySensitive: boolean;
  fallbackLevel: 'category' | 'section';
}): number {
  if (input.candidate.price >= input.anchor.price) return -1000;
  if (input.candidate.section !== input.anchor.section) return -1000;
  if (input.compatibilitySensitive && input.candidate.category_id !== input.anchor.category_id) return -1000;

  const anchorTokens = tokenize(textForProduct(input.anchor));
  const candidateTokens = tokenize(textForProduct(input.candidate));
  const queryTokens = tokenize(input.query);
  const ratio = input.candidate.price / input.anchor.price;

  let score = 0;
  if (input.candidate.category_id === input.anchor.category_id) score += 55;
  score += overlapScore(anchorTokens, candidateTokens) * 5;
  score += overlapScore(queryTokens, candidateTokens) * 8;
  score += overlapScore(input.anchor.tags ?? [], input.candidate.tags ?? []) * 6;

  if (ratio >= 0.72 && ratio <= 0.98) {
    score += 18;
  } else if (ratio >= 0.55 && ratio < 0.72) {
    score += 12;
  } else if (ratio < 0.4) {
    score -= 14;
  }

  if (input.fallbackLevel === 'section') score -= 12;

  return score;
}

async function resolveAnchorProduct(query: string): Promise<{
  anchor: Product | null;
  usedCartContext: boolean;
  queryAnchor: string;
  multipleCartItems: boolean;
}> {
  const cartItems = useCartStore.getState().items ?? [];
  const queryAnchor = stripBudgetLanguage(query);

  if (queryAnchor) {
    const phraseMatches = await getProductsBySearch(queryAnchor).catch(() => []);
    const anchor = phraseMatches
      .map((product) => ({ product, score: scoreAnchorCandidate(product, queryAnchor) }))
      .sort((left, right) => right.score - left.score)
      .find((entry) => entry.score >= 40)?.product ?? null;

    if (anchor) {
      return {
        anchor,
        usedCartContext: false,
        queryAnchor,
        multipleCartItems: cartItems.length > 1,
      };
    }
  }

  if (cartItems.length === 1) {
    const cartProductId = cartItems[0]?.product.id;
    const refreshed = cartProductId ? await getProductsByIds([cartProductId]).catch(() => []) : [];
    const anchor = refreshed[0] ?? cartItems[0]?.product ?? null;

    return {
      anchor: anchor as Product | null,
      usedCartContext: true,
      queryAnchor,
      multipleCartItems: false,
    };
  }

  return {
    anchor: null,
    usedCartContext: false,
    queryAnchor,
    multipleCartItems: cartItems.length > 1,
  };
}

function buildNoAnchorResolution(input: {
  multipleCartItems: boolean;
}): StorefrontBudgetRescueResolution {
  return {
    kind: 'REVIEW_CURRENT_OPTION',
    matchStrategy: 'REVIEW_CURRENT_OPTION',
    message: input.multipleCartItems
      ? 'Si quieres bajar gasto sin inventarte un cambio raro, dime cual producto de tu carrito quieres aterrizar y te digo si hay un trade-down real.'
      : 'Puedo ayudarte a bajar el gasto, pero necesito saber cual producto traes en mente para proponerte un trade-down real.',
    retrievalSource: input.multipleCartItems ? 'COMPARE_CONTEXT' : 'NONE',
    resolvedProducts: [],
    signal: {
      kind: 'REVIEW_CURRENT_OPTION',
      scope: input.multipleCartItems ? 'COMPARE_CONTEXT' : 'NONE',
      anchor_product: null,
      cheaper_product: null,
      anchor_price: null,
      cheaper_price: null,
      savings_amount: null,
      alternative_count: 0,
      compatibility_sensitive: false,
      used_cart_context: false,
      anchored_by: input.multipleCartItems ? 'compare_context' : 'none',
    },
  };
}

export async function resolveStorefrontBudgetRescue(
  args: BudgetRescueToolArgs,
): Promise<StorefrontBudgetRescueResolution> {
  const anchorResolution = await resolveAnchorProduct(args.query);
  if (!anchorResolution.anchor) {
    return buildNoAnchorResolution({
      multipleCartItems: anchorResolution.multipleCartItems,
    });
  }

  const anchor = anchorResolution.anchor;
  const anchorRef = toProductRef(anchor);
  const compatibilitySensitive = deriveCompatibilitySensitive(args.query, anchor);
  const categoryPool = await getProducts({
    section: anchor.section,
    categoryId: anchor.category_id,
    limit: 80,
  }).catch(() => []);
  const sectionPool = compatibilitySensitive
    ? []
    : await getProducts({
      section: anchor.section,
      limit: 120,
    }).catch(() => []);

  const rankPool = (pool: Product[], fallbackLevel: 'category' | 'section') =>
    pool
      .filter((product) => product.id !== anchor.id && isPurchasableProduct(product))
      .map((candidate) => ({
        product: candidate,
        score: scoreTradeDownCandidate({
          anchor,
          candidate,
          query: args.query,
          compatibilitySensitive,
          fallbackLevel,
        }),
      }))
      .filter((entry) => entry.score >= (fallbackLevel === 'category' ? 58 : 64))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.product.price - right.product.price;
      });

  const rankedCategory = rankPool(categoryPool, 'category');
  const rankedSection = rankedCategory.length === 0 ? rankPool(sectionPool, 'section') : [];
  const rankedCandidates = [...rankedCategory, ...rankedSection];

  if (rankedCandidates.length > 0) {
    const resolvedProducts = rankedCandidates.slice(0, 2).map((entry) => toProductRef(entry.product));
    const cheaper = rankedCandidates[0]?.product ?? null;

    return {
      kind: 'CHEAPER_ALTERNATIVE_FOUND',
      matchStrategy: 'CHEAPER_ALTERNATIVE_FOUND',
      message: cheaper
        ? `Si quieres bajar gasto sin salirte tanto de ${anchor.name}, te dejo ${resolvedProducts.length > 1 ? 'estas opciones' : 'esta opcion'} mas accesibles y en stock. La mas barata queda en ${formatCurrency(cheaper.price)}, o sea ${formatCurrency(anchor.price - cheaper.price)} abajo de ${anchor.name}.`
        : `Si quieres bajar gasto sin salirte tanto de ${anchor.name}, te deje opciones mas accesibles y en stock.`,
      retrievalSource: anchorResolution.usedCartContext ? 'CART_CONTEXT' : 'CATALOG_ANCHORED_PRODUCT',
      resolvedProducts,
      signal: {
        kind: 'CHEAPER_ALTERNATIVE_FOUND',
        scope: anchorResolution.usedCartContext ? 'CART_CONTEXT' : 'ANCHORED_PRODUCT',
        anchor_product: anchorRef,
        cheaper_product: cheaper ? toProductRef(cheaper) : null,
        anchor_price: anchor.price,
        cheaper_price: cheaper?.price ?? null,
        savings_amount: cheaper ? Math.max(0, anchor.price - cheaper.price) : null,
        alternative_count: resolvedProducts.length,
        compatibility_sensitive: compatibilitySensitive,
        used_cart_context: anchorResolution.usedCartContext,
        anchored_by: anchorResolution.usedCartContext ? 'single_cart_item' : 'query_product_match',
      },
    };
  }

  const promotionSignal = await resolveStorefrontPromotionSignal({
    exactMatches: [toInternalResolvedProduct(anchor)],
  }).catch(() => null);
  const hasCatalogValueSignal = Boolean(
    (anchor.compare_at_price && anchor.compare_at_price > anchor.price)
    || (promotionSignal?.kind === 'FLASH_DEAL' && promotionSignal.product_id === anchor.id),
  );

  if (hasCatalogValueSignal) {
    const promoMessage = promotionSignal?.kind === 'FLASH_DEAL' && promotionSignal.product_id === anchor.id
      ? `Ahorita ${anchor.name} ya trae ahorro real: baja de ${formatCurrency(promotionSignal.original_price)} a ${formatCurrency(promotionSignal.flash_price)}. No te voy a inventar un trade-down mejor si el valor real hoy esta aqui.`
      : `${anchor.name} ya trae valor real con el catalogo actual. No te voy a inventar una opcion mas barata si el cambio te haria perder demasiado por poca diferencia.`;

    return {
      kind: 'PROMO_ALREADY_BEST_VALUE',
      matchStrategy: 'PROMO_ALREADY_BEST_VALUE',
      message: promoMessage,
      retrievalSource: anchorResolution.usedCartContext ? 'CART_CONTEXT' : 'CATALOG_ANCHORED_PRODUCT',
      resolvedProducts: [anchorRef],
      signal: {
        kind: 'PROMO_ALREADY_BEST_VALUE',
        scope: anchorResolution.usedCartContext ? 'CART_CONTEXT' : 'ANCHORED_PRODUCT',
        anchor_product: anchorRef,
        cheaper_product: null,
        anchor_price: anchor.price,
        cheaper_price: null,
        savings_amount: null,
        alternative_count: 1,
        compatibility_sensitive: compatibilitySensitive,
        used_cart_context: anchorResolution.usedCartContext,
        anchored_by: anchorResolution.usedCartContext ? 'single_cart_item' : 'query_product_match',
      },
    };
  }

  return {
    kind: 'NO_GOOD_TRADE_DOWN',
    matchStrategy: 'NO_GOOD_TRADE_DOWN',
    message: `No veo un trade-down mas barato que siga siendo suficientemente cercano a ${anchor.name} sin forzar equivalencias. Prefiero decirtelo asi de directo antes que inventarte ahorro dudoso.`,
    retrievalSource: anchorResolution.usedCartContext ? 'CART_CONTEXT' : 'CATALOG_ANCHORED_PRODUCT',
    resolvedProducts: [],
    signal: {
      kind: 'NO_GOOD_TRADE_DOWN',
      scope: anchorResolution.usedCartContext ? 'CART_CONTEXT' : 'ANCHORED_PRODUCT',
      anchor_product: anchorRef,
      cheaper_product: null,
      anchor_price: anchor.price,
      cheaper_price: null,
      savings_amount: null,
      alternative_count: 0,
      compatibility_sensitive: compatibilitySensitive,
      used_cart_context: anchorResolution.usedCartContext,
      anchored_by: anchorResolution.usedCartContext ? 'single_cart_item' : 'query_product_match',
    },
  };
}
