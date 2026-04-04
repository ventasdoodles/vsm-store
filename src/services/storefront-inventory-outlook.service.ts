import { SITE_CONFIG } from '@/config/site';
import { getStorefrontProductPurchaseability, getVariantDisplayName } from '@/lib/domain/products';
import { supabase } from '@/lib/supabase';
import { inventoryService } from '@/services/inventory.service';
import { mapProductVariations } from '@/services/products.service';
import type { InventoryOutlookToolArgs, InternalInventoryOutlookContractType } from '@/types/ai-capsule';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

type InventoryOutlookKind =
  | 'IN_STOCK_ONLINE'
  | 'IN_STOCK_OMNICHANNEL'
  | 'RESTOCK_EXPECTED'
  | 'OUT_OF_STOCK_NO_ETA'
  | 'PRODUCT_NOT_FOUND';

type InventoryOutlookMatchStrategy =
  | 'CATALOG_IN_STOCK_ONLINE'
  | 'CATALOG_IN_STOCK_OMNICHANNEL'
  | 'CATALOG_RESTOCK_EXPECTED'
  | 'CATALOG_OUT_OF_STOCK'
  | 'PRODUCT_NOT_FOUND';

type RetrievalSource =
  | 'CATALOG_ONLINE_STOCK'
  | 'CATALOG_OMNICHANNEL_STOCK'
  | 'CATALOG_RESTOCK_TRUTH'
  | 'NONE';

type ProductRef = NonNullable<InternalInventoryOutlookContractType['resolved_products']>[number];

interface StorefrontInventoryOutlookResolution {
  kind: InventoryOutlookKind;
  message: string;
  matchStrategy: InventoryOutlookMatchStrategy;
  retrievalSource: RetrievalSource;
  resolvedProducts: ProductRef[];
  signal: InternalInventoryOutlookContractType['inventory_outlook_signal'];
}

const PRODUCT_SELECT = `
  id, name, slug, description, short_description, price, compare_at_price,
  stock, sku, section, category_id, tags, status, images, cover_image,
  is_featured, is_featured_until, is_new, is_new_until, is_bestseller,
  is_bestseller_until, is_active, created_at, updated_at,
  specs, badges, ai_is_featured, ai_sales_note, ai_exclude,
  variants:product_variants(
    id, product_id, sku, price, stock, images, is_active,
    options:product_variant_options(
      variant_id, attribute_value_id,
      attribute_value:product_attribute_values(
        id, attribute_id, value,
        attribute:product_attributes(name)
      )
    )
  )
`;

const PRODUCT_QUERY_STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas',
  'para', 'por', 'con', 'sin', 'hay', 'queda', 'todavia', 'todaviahay',
  'stock', 'inventario', 'disponible', 'disponibilidad', 'agotado', 'agotada',
  'restock', 'regresa', 'regreso', 'vuelve', 'vendra', 'viene', 'cuando',
  'me', 'puedes', 'decir', 'del', 'anda', 'trae', 'tienen', 'tienes',
]);

const OMNICHANNEL_SPEC_KEYS = [
  'pickup_available',
  'pickup',
  'store_availability',
  'available_in_store',
  'in_store',
  'omnichannel',
  'sucursal',
  'sucursal_disponible',
];

const RESTOCK_SPEC_KEYS = [
  'restock_eta',
  'restock_date',
  'restock_expected',
  'eta_restock',
  'expected_restock',
  'available_on',
  'fecha_restock',
];

function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s%.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTokens(query: string): string[] {
  return Array.from(new Set(
    normalizeText(query)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 || /\d/.test(token))
      .filter((token) => !PRODUCT_QUERY_STOPWORDS.has(token))
  )).slice(0, 4);
}

function toProductRef(product: Product): ProductRef {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    section: product.section,
  };
}

function buildProductText(product: Product): string {
  const specsText = Object.entries(product.specs ?? {})
    .flatMap(([key, value]) => [key, String(value ?? '')])
    .join(' ');
  const tagsText = Array.isArray(product.tags) ? product.tags.join(' ') : '';
  const variantText = (product.variants ?? [])
    .flatMap((variant) => [
      variant.sku ?? '',
      ...variant.options.map((option) => option.attribute_value?.value ?? ''),
      ...variant.options.map((option) => option.attribute_name ?? ''),
    ])
    .join(' ');

  return normalizeText([
    product.name,
    product.slug,
    product.sku ?? '',
    product.description ?? '',
    product.short_description ?? '',
    product.ai_sales_note ?? '',
    tagsText,
    specsText,
    variantText,
  ].join(' '));
}

function scoreProduct(product: Product, query: string): number {
  const normalizedQuery = normalizeText(query);
  const tokens = extractTokens(query);
  const text = buildProductText(product);
  let score = 0;

  if (text.includes(normalizedQuery)) score += 60;
  if (normalizeText(product.name) === normalizedQuery) score += 80;
  if (normalizeText(product.slug).includes(normalizedQuery.replace(/\s+/g, '-'))) score += 30;
  if ((product.sku ?? '').toLowerCase() === query.trim().toLowerCase()) score += 90;

  for (const token of tokens) {
    if (text.includes(token)) score += 12;
  }

  if (product.stock > 0) score += 4;
  if (product.ai_is_featured) score += 1;

  return score;
}

function scoreVariant(variant: ProductVariant, query: string): number {
  const normalizedQuery = normalizeText(query);
  let score = 0;

  for (const option of variant.options ?? []) {
    const value = normalizeText(option.attribute_value?.value ?? '');
    if (!value) continue;
    if (normalizedQuery.includes(value)) score += 10;
  }

  if ((variant.sku ?? '').toLowerCase() && normalizedQuery.includes((variant.sku ?? '').toLowerCase())) {
    score += 15;
  }

  return score;
}

function findMatchedVariant(product: Product, query: string): ProductVariant | null {
  const variants = product.variants ?? [];
  const scored = variants
    .map((variant) => ({ variant, score: scoreVariant(variant, query) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) return null;
  if (scored.length > 1 && scored[0]?.score === scored[1]?.score) return null;
  return scored[0]?.variant ?? null;
}

function findTruthySpecValue(product: Product, keys: string[]): string | null {
  const specs = product.specs ?? {};

  for (const [rawKey, rawValue] of Object.entries(specs)) {
    const normalizedKey = normalizeText(rawKey).replace(/\s+/g, '_');
    if (!keys.includes(normalizedKey)) continue;

    const value = String(rawValue ?? '').trim();
    if (!value) continue;
    return value;
  }

  return null;
}

function parseBooleanLike(value: string | null): boolean {
  if (!value) return false;
  const normalized = normalizeText(value);
  return normalized === 'true'
    || normalized === 'si'
    || normalized === 'yes'
    || normalized === 'pickup'
    || normalized === 'available'
    || normalized === 'disponible'
    || normalized === 'en tienda';
}

function resolveOmnichannelTruth(product: Product): { available: boolean; label: string | null } {
  const rawValue = findTruthySpecValue(product, OMNICHANNEL_SPEC_KEYS);
  if (!rawValue) {
    return { available: false, label: null };
  }

  if (parseBooleanLike(rawValue)) {
    return {
      available: true,
      label: `pickup en tienda (${SITE_CONFIG.location.city})`,
    };
  }

  return {
    available: true,
    label: rawValue,
  };
}

function resolveRestockEta(product: Product): string | null {
  return findTruthySpecValue(product, RESTOCK_SPEC_KEYS);
}

function buildSubject(product: Product, variant: ProductVariant | null): string {
  if (!variant) return product.name;
  return `${product.name} (${getVariantDisplayName(variant)})`;
}

function buildInStockMessage(input: {
  product: Product;
  variant: ProductVariant | null;
  currentStock: number;
  omnichannelLabel: string | null;
  prediction: Awaited<ReturnType<typeof inventoryService.getStockPrediction>> | null;
}): string {
  const subject = buildSubject(input.product, input.variant);
  const stockLine = input.variant
    ? `Ahorita ${subject} si aparece disponible. Me marca ${input.currentStock} unidad${input.currentStock === 1 ? '' : 'es'} vigentes de esa variante.`
    : `Ahorita ${subject} si aparece disponible en linea. Me marca ${input.currentStock} unidad${input.currentStock === 1 ? '' : 'es'} vigentes.`;

  const omnichannelLine = input.omnichannelLabel
    ? ` Tambien lo veo con disponibilidad omnicanal para ${input.omnichannelLabel}.`
    : '';

  const outlookLine = input.prediction
    ? ` Como outlook secundario, la proyeccion actual estima ${input.prediction.daysUntilOut} dia${input.prediction.daysUntilOut === 1 ? '' : 's'} de salida y puede cambiar.`
    : '';

  return `${stockLine}${omnichannelLine}${outlookLine}`.trim();
}

function buildRestockMessage(product: Product, variant: ProductVariant | null, restockEta: string): string {
  const subject = buildSubject(product, variant);
  return `Ahorita ${subject} esta agotado. Si tengo una referencia persistida de restock: ${restockEta}. Lo tomo como outlook de tienda, no como promesa exacta.`;
}

function buildOutOfStockMessage(product: Product, variant: ProductVariant | null, omnichannelLabel: string | null): string {
  const subject = buildSubject(product, variant);
  if (omnichannelLabel) {
    return `No lo veo con stock online ahorita para ${subject}, pero si aparece con disponibilidad omnicanal para ${omnichannelLabel}.`;
  }

  return `Ahorita ${subject} esta agotado y no tengo una ETA confirmada en la verdad actual de tienda.`;
}

function buildNotFoundResolution(query: string): StorefrontInventoryOutlookResolution {
  return {
    kind: 'PRODUCT_NOT_FOUND',
    message: `No pude ubicar un producto actual del catalogo para revisar su disponibilidad real con "${query}". Si me das el nombre exacto del producto o variante, lo reviso mejor.`,
    matchStrategy: 'PRODUCT_NOT_FOUND',
    retrievalSource: 'NONE',
    resolvedProducts: [],
    signal: {
      kind: 'PRODUCT_NOT_FOUND',
      scope: 'NONE',
      product: null,
      variant_id: null,
      variant_label: null,
      current_stock: null,
      stock_basis: 'none',
      omnichannel_label: null,
      restock_eta: null,
      days_until_out: null,
      depletion_date: null,
      urgency_level: null,
      signal_quality: 'none',
    },
  };
}

async function queryProductsByPhrase(query: string): Promise<Product[]> {
  const phrase = query.trim().replace(/\s+/g, '%');
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .or(`name.ilike.%${phrase}%,slug.ilike.%${phrase}%,sku.ilike.%${phrase}%`)
    .limit(12);

  if (error || !data) return [];
  return mapProductVariations(data as Product[]) as Product[];
}

async function queryProductsByTokens(query: string): Promise<Product[]> {
  const tokens = extractTokens(query);
  if (tokens.length === 0) return [];

  const orFilter = tokens
    .flatMap((token) => [
      `name.ilike.%${token}%`,
      `slug.ilike.%${token}%`,
      `sku.ilike.%${token}%`,
    ])
    .join(',');

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .or(orFilter)
    .limit(24);

  if (error || !data) return [];
  return mapProductVariations(data as Product[]) as Product[];
}

async function resolveTargetProduct(query: string): Promise<Product | null> {
  const exactMatches = await queryProductsByPhrase(query);
  const tokenMatches = exactMatches.length > 0 ? [] : await queryProductsByTokens(query);
  const candidates = (exactMatches.length > 0 ? exactMatches : tokenMatches)
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  return candidates[0]?.product ?? null;
}

function buildSignal(input: {
  kind: InventoryOutlookKind;
  scope: InternalInventoryOutlookContractType['inventory_outlook_signal']['scope'];
  product: Product | null;
  variant: ProductVariant | null;
  currentStock: number | null;
  stockBasis: InternalInventoryOutlookContractType['inventory_outlook_signal']['stock_basis'];
  omnichannelLabel: string | null;
  restockEta: string | null;
  prediction: Awaited<ReturnType<typeof inventoryService.getStockPrediction>> | null;
}): InternalInventoryOutlookContractType['inventory_outlook_signal'] {
  return {
    kind: input.kind,
    scope: input.scope,
    product: input.product ? toProductRef(input.product) : null,
    variant_id: input.variant?.id ?? null,
    variant_label: input.variant ? getVariantDisplayName(input.variant) : null,
    current_stock: input.currentStock,
    stock_basis: input.stockBasis,
    omnichannel_label: input.omnichannelLabel,
    restock_eta: input.restockEta,
    days_until_out: input.prediction?.daysUntilOut ?? null,
    depletion_date: input.prediction?.depletionDate ?? null,
    urgency_level: input.prediction?.urgencyLevel ?? null,
    signal_quality: input.prediction ? 'high' : 'none',
  };
}

export async function resolveStorefrontInventoryOutlook(
  args: InventoryOutlookToolArgs,
): Promise<StorefrontInventoryOutlookResolution> {
  const product = await resolveTargetProduct(args.query);
  if (!product) {
    return buildNotFoundResolution(args.query);
  }

  const matchedVariant = findMatchedVariant(product, args.query);
  const purchaseability = getStorefrontProductPurchaseability(product, {
    selectedVariant: matchedVariant,
  });
  const omnichannelTruth = resolveOmnichannelTruth(product);
  const restockEta = resolveRestockEta(product);
  const currentStock = matchedVariant
    ? (matchedVariant.is_active ? matchedVariant.stock : 0)
    : purchaseability.reason === 'variant_unavailable'
      ? 0
      : product.stock;
  const stockBasis: InternalInventoryOutlookContractType['inventory_outlook_signal']['stock_basis'] = matchedVariant
    ? 'variant'
    : omnichannelTruth.available && currentStock <= 0
      ? 'store_only'
      : 'product';

  const prediction = currentStock > 0 && !matchedVariant
    ? await inventoryService.getStockPrediction(product.id, currentStock).catch(() => null)
    : null;
  const resolvedProducts = [toProductRef(product)];

  if (currentStock > 0 && omnichannelTruth.available) {
    return {
      kind: 'IN_STOCK_OMNICHANNEL',
      message: buildInStockMessage({
        product,
        variant: matchedVariant,
        currentStock,
        omnichannelLabel: omnichannelTruth.label,
        prediction,
      }),
      matchStrategy: 'CATALOG_IN_STOCK_OMNICHANNEL',
      retrievalSource: 'CATALOG_OMNICHANNEL_STOCK',
      resolvedProducts,
      signal: buildSignal({
        kind: 'IN_STOCK_OMNICHANNEL',
        scope: 'OMNICHANNEL',
        product,
        variant: matchedVariant,
        currentStock,
        stockBasis,
        omnichannelLabel: omnichannelTruth.label,
        restockEta: null,
        prediction,
      }),
    };
  }

  if (currentStock > 0) {
    return {
      kind: 'IN_STOCK_ONLINE',
      message: buildInStockMessage({
        product,
        variant: matchedVariant,
        currentStock,
        omnichannelLabel: null,
        prediction,
      }),
      matchStrategy: 'CATALOG_IN_STOCK_ONLINE',
      retrievalSource: 'CATALOG_ONLINE_STOCK',
      resolvedProducts,
      signal: buildSignal({
        kind: 'IN_STOCK_ONLINE',
        scope: 'ONLINE_ONLY',
        product,
        variant: matchedVariant,
        currentStock,
        stockBasis,
        omnichannelLabel: null,
        restockEta: null,
        prediction,
      }),
    };
  }

  if (omnichannelTruth.available) {
    return {
      kind: 'IN_STOCK_OMNICHANNEL',
      message: buildOutOfStockMessage(product, matchedVariant, omnichannelTruth.label),
      matchStrategy: 'CATALOG_IN_STOCK_OMNICHANNEL',
      retrievalSource: 'CATALOG_OMNICHANNEL_STOCK',
      resolvedProducts,
      signal: buildSignal({
        kind: 'IN_STOCK_OMNICHANNEL',
        scope: 'OMNICHANNEL',
        product,
        variant: matchedVariant,
        currentStock: null,
        stockBasis: 'store_only',
        omnichannelLabel: omnichannelTruth.label,
        restockEta: null,
        prediction: null,
      }),
    };
  }

  if (restockEta) {
    return {
      kind: 'RESTOCK_EXPECTED',
      message: buildRestockMessage(product, matchedVariant, restockEta),
      matchStrategy: 'CATALOG_RESTOCK_EXPECTED',
      retrievalSource: 'CATALOG_RESTOCK_TRUTH',
      resolvedProducts,
      signal: buildSignal({
        kind: 'RESTOCK_EXPECTED',
        scope: 'RESTOCK_TRUTH',
        product,
        variant: matchedVariant,
        currentStock: 0,
        stockBasis,
        omnichannelLabel: null,
        restockEta,
        prediction: null,
      }),
    };
  }

  return {
    kind: 'OUT_OF_STOCK_NO_ETA',
    message: buildOutOfStockMessage(product, matchedVariant, null),
    matchStrategy: 'CATALOG_OUT_OF_STOCK',
    retrievalSource: 'CATALOG_ONLINE_STOCK',
    resolvedProducts,
    signal: buildSignal({
      kind: 'OUT_OF_STOCK_NO_ETA',
      scope: 'ONLINE_ONLY',
      product,
      variant: matchedVariant,
      currentStock: 0,
      stockBasis,
      omnichannelLabel: null,
      restockEta: null,
      prediction: null,
    }),
  };
}
