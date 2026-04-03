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
import { resolveStorefrontPromotionSignal } from './storefront-promotions.service';
import { resolveStorefrontReplenishmentSignal } from './storefront-replenishment.service';
import type { Product } from '@/types/product';

type ProductSearchRow = {
  id: string;
  slug: string | null;
  section: 'vape' | '420' | null;
  name: string;
  price: number;
  stock: number;
  ai_is_featured: boolean | null;
  ai_sales_note: string | null;
  description: string | null;
  specs: unknown | null;
  variants?: Array<{
    id: string;
    product_id: string;
    sku: string | null;
    price: number | null;
    stock: number;
    is_active: boolean;
    options?: Array<{
      variant_id: string;
      attribute_value_id: string;
      attribute_value?: {
        value: string | null;
        attribute?: {
          name: string | null;
        } | null;
      } | null;
    }> | null;
  }> | null;
};

const PRODUCT_SEARCH_SELECT = `
  id, slug, section, name, price, stock, ai_is_featured, ai_sales_note, description, specs,
  variants:product_variants(
    id, product_id, sku, price, stock, is_active,
    options:product_variant_options(
      variant_id, attribute_value_id,
      attribute_value:product_attribute_values(
        id, attribute_id, value,
        attribute:product_attributes(name)
      )
    )
  )
`;
const PRODUCT_RECOVERY_STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas',
  'para', 'por', 'con', 'sin', 'quiero', 'necesito', 'busco', 'buscame',
  'tengo', 'tienes', 'tienen', 'hay', 'algo', 'que', 'me', 'recomiendas',
  'recomiendame', 'favor', 'porfa', 'modelo', 'serie', 'ademas', 'tambien',
  'todavia', 'anda', 'ando', 'este', 'ese', 'esa', 'cual', 'como', 'va',
  'pero', 'muy', 'mas', 'entre', 'esos', 'esas', 'llevo', 'trae', 'viene',
  'hoy', 'hora', 'horario', 'abren', 'cierran', 'cuando',
]);
const RECOVERY_FRUIT_HINTS = ['frutal', 'fruta', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'kiwi', 'lychee', 'sandia', 'tropical', 'limon', 'apple'];
const RECOVERY_MINT_HINTS = ['menta', 'mint', 'mentol', 'menthol', 'ice', 'helado', 'fresco'];
const RECOVERY_BUDGET_HINTS = ['barato', 'barata', 'economico', 'economica', 'precio', 'presupuesto', 'menos', 'accesible', 'caro', 'cara', 'no muy caro', 'no tan caro'];
const RECOVERY_VAPE_HINTS = ['vape', 'vapear', 'pod', 'pods', 'mod', 'mods', 'kit', 'kits', 'pen', 'device', 'starter', 'nic', 'nicsalt', 'salt', 'liquido', 'liquidos', 'juice', 'eliquid'];
const RECOVERY_420_HINTS = ['thc', 'cbd', 'gomitas', 'brownies', 'paletas', 'herb', 'dry herb', 'convection', 'balloon', 'desktop vape', 'vaporizador', 'vaporizer', 'hemp'];
const RECOVERY_LIQUID_HINTS = ['liquido', 'liquidos', 'juice', 'juicee', 'eliquid', 'e-liquid', 'salt', 'nicsalt', 'nic salt', 'ml', 'nicotina'];
const RECOVERY_DEVICE_HINTS = ['vape', 'pod', 'kit', 'mod', 'pen', 'device', 'starter', 'equipo', 'aparato', 'chico', 'compacto', 'compacta'];
const RECOVERY_SMALL_HINTS = ['chico', 'chica', 'compacto', 'compacta', 'mini', 'micro', 'slim', 'stealth', 'bolsillo', 'portatil', 'portatil'];
const RECOVERY_MIXED_HINTS = ['ademas', 'tambien', ' y ', ' junto con ', ' aparte '];
const RECOVERY_EXPLORATION_HINTS = ['busco', 'quiero', 'algo', 'no se cual', 'recomiendame', 'conviene', 'entre esos dos', 'cual conviene', 'me llevo', 'me lo llevo', 'ese'];
const RECOVERY_NOT_FOUND_HINTS = ['no encuentro', 'no encontre', 'no sale', 'no aparece', 'no lo veo'];
const RECOVERY_FACT_NICOTINE_HINTS = ['nicotina', 'mg'];
const RECOVERY_FACT_FLAVOR_HINTS = ['sabor', 'frutal', 'fruta', 'menta', 'mint', 'ice', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'sandia', 'tropical', 'apple'];
const VARIANT_COLOR_HINTS = ['rojo', 'azul', 'verde', 'negro', 'blanco', 'gris', 'rosa', 'morado', 'amarillo', 'naranja', 'cafe', 'marron', 'silver', 'gold'];
const VARIANT_ATTRIBUTE_HINTS = {
  color: ['color', 'colores', 'tono', 'shade'],
  resistance: ['ohm', 'ohms', 'resistencia', 'coil'],
  nicotine: ['nicotina', 'nicotine', 'mg', '%'],
  flavor: ['sabor', 'flavor', 'perfil'],
  model: ['modelo', 'version', 'variante', 'serie', 'linea', 'línea'],
  size: ['tamano', 'tamaño', 'size', 'ml', 'contenido'],
  presentation: ['presentacion', 'presentación', 'formato', 'tipo'],
} as const;

type RecoveryQuerySignals = {
  normalizedQuery: string;
  tokens: string[];
  prefersSection: 'vape' | '420' | null;
  wantsLiquid: boolean;
  wantsDevice: boolean;
  wantsSmall: boolean;
  wantsBudget: boolean;
  wantsFruit: boolean;
  wantsMint: boolean;
  wantsNicotineFact: boolean;
  wantsFlavorFact: boolean;
  isMixedNeed: boolean;
  isExploratory: boolean;
  isNotFoundRecovery: boolean;
};

type VariantTruth = NonNullable<InternalResolvedProduct['variant_truth']>;

type ProductVariantOptionRow = {
  variant_id: string;
  attribute_value_id: string;
  attribute_value?: {
    value: string | null;
    attribute?: {
      name: string | null;
    } | null;
  } | null;
};

type ProductVariantRow = {
  id: string;
  product_id: string;
  sku: string | null;
  price: number | null;
  stock: number;
  is_active: boolean;
  options?: ProductVariantOptionRow[] | null;
};

function normalizeRecoveryToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function extractRecoveryTokens(query: string): string[] {
  const normalized = query
    .split(/\s+/)
    .map(normalizeRecoveryToken)
    .filter((token) => {
      if (!token) return false;
      if (PRODUCT_RECOVERY_STOPWORDS.has(token)) return false;
      return token.length >= 3 || /\d/.test(token);
    });

  return [...new Set(normalized)].slice(0, 5);
}

function normalizeRecoveryText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeVariantKey(value: string): string {
  return normalizeRecoveryText(value).replace(/\s+/g, ' ');
}

function matchesVariantAttributeName(attributeName: string, requestedAttribute: VariantTruth['requested_attribute']): boolean {
  const normalizedAttributeName = normalizeVariantKey(attributeName);
  if (!requestedAttribute) return false;

  switch (requestedAttribute) {
    case 'color':
      return normalizedAttributeName.includes('color');
    case 'resistance':
      return normalizedAttributeName.includes('ohm') || normalizedAttributeName.includes('resistencia');
    case 'nicotine':
      return normalizedAttributeName.includes('nicotine') || normalizedAttributeName.includes('nicotina');
    case 'flavor':
      return normalizedAttributeName.includes('sabor') || normalizedAttributeName.includes('flavor');
    case 'model':
      return normalizedAttributeName.includes('modelo') || normalizedAttributeName.includes('version') || normalizedAttributeName.includes('variante');
    case 'size':
      return normalizedAttributeName.includes('tamano') || normalizedAttributeName.includes('size') || normalizedAttributeName.includes('contenido') || normalizedAttributeName.includes('ml');
    case 'presentation':
      return normalizedAttributeName.includes('presentacion') || normalizedAttributeName.includes('formato') || normalizedAttributeName.includes('tipo');
  }
}

function hasRecoveryHint(normalizedText: string, hints: readonly string[]): boolean {
  return hints.some((hint) => normalizedText.includes(hint));
}

function flattenSpecText(specs: unknown): string {
  if (!specs || typeof specs !== 'object') return '';

  return Object.entries(specs as Record<string, unknown>)
    .flatMap(([key, value]) => [key, String(value ?? '')])
    .join(' ');
}

function flattenVariantText(variants?: ProductVariantRow[] | null): string {
  if (!variants || variants.length === 0) return '';

  return variants
    .flatMap((variant) => [
      variant.sku ?? '',
      String(variant.stock ?? ''),
      ...(variant.options ?? []).flatMap((option) => [
        option.attribute_value?.attribute?.name ?? '',
        option.attribute_value?.value ?? '',
      ]),
    ])
    .join(' ');
}

function detectVariantAttribute(query: string): VariantTruth['requested_attribute'] {
  const normalizedQuery = normalizeRecoveryText(query);

  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.color)) return 'color';
  if (VARIANT_COLOR_HINTS.some((hint) => normalizedQuery.includes(hint))) return 'color';
  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.resistance)) return 'resistance';
  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.nicotine)) return 'nicotine';
  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.flavor)) return 'flavor';
  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.model)) return 'model';
  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.size)) return 'size';
  if (hasRecoveryHint(normalizedQuery, VARIANT_ATTRIBUTE_HINTS.presentation)) return 'presentation';

  if (RECOVERY_FRUIT_HINTS.some((hint) => normalizedQuery.includes(hint) || normalizedQuery.includes(hint.replace('frutal', 'frutal')))) {
    return 'flavor';
  }
  if (RECOVERY_MINT_HINTS.some((hint) => normalizedQuery.includes(hint))) {
    return 'flavor';
  }

  return null;
}

function extractVariantValueFromQuery(query: string, attribute: VariantTruth['requested_attribute']): string | null {
  const normalizedQuery = normalizeRecoveryText(query);
  const rawQuery = query.trim();

  if (!attribute) return null;

  if (attribute === 'nicotine') {
    const match = rawQuery.match(/\b(\d+(?:[.,]\d+)?\s?(?:mg|%))\b/i);
    return match?.[1]?.trim() ?? null;
  }

  if (attribute === 'resistance') {
    const match = rawQuery.match(/\b(\d+(?:[.,]\d+)?\s?ohm)\b/i);
    return match?.[1]?.trim() ?? null;
  }

  if (attribute === 'size') {
    const match = rawQuery.match(/\b(\d+(?:[.,]\d+)?\s?ml)\b/i);
    return match?.[1]?.trim() ?? null;
  }

  if (attribute === 'color') {
    const match = VARIANT_COLOR_HINTS.find((hint) => normalizedQuery.includes(hint));
    return match ?? null;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  if (attribute === 'flavor') {
    const flavorHints = [...RECOVERY_FRUIT_HINTS, ...RECOVERY_MINT_HINTS, 'dulce', 'tabaco', 'limon', 'citrus', 'coco', 'sandia'];
    const match = flavorHints.find((hint) => tokens.includes(hint) || normalizedQuery.includes(hint));
    if (match) return match;
  }

  if (attribute === 'presentation' && tokens.length > 0) {
    const value = tokens.find((token) => ['desechable', 'pod', 'cartucho', 'mod', 'kit', 'pen', 'bateria', 'battery'].includes(token));
    return value ?? null;
  }

  if (attribute === 'model') {
    const modelMatch = rawQuery.match(/\b([a-z]{1,6}\s?\d+[a-z\d-]*)\b/i);
    if (modelMatch?.[1]) {
      return modelMatch[1].trim();
    }
  }

  return null;
}

function buildVariantTruth(query: string, product: ProductSearchRow): VariantTruth | undefined {
  const activeVariants = (product.variants ?? []).filter((variant) => variant.is_active);
  const availableVariants = activeVariants.filter((variant) => variant.stock > 0);
  const requestedAttribute = detectVariantAttribute(query);
  const requestedValue = extractVariantValueFromQuery(query, requestedAttribute);

  const variantValueIndex = activeVariants.flatMap((variant) => (
    (variant.options ?? []).flatMap((option) => {
      const attributeName = normalizeVariantKey(option.attribute_value?.attribute?.name ?? '');
      const value = normalizeVariantKey(option.attribute_value?.value ?? '');

      if (!attributeName || !value) return [];

      return [{
        variantId: variant.id,
        attributeName,
        value,
        label: option.attribute_value?.value ?? null,
        stock: variant.stock,
      }];
    })
  ));

  const specText = normalizeRecoveryText(flattenSpecText(product.specs));
  const variantText = normalizeRecoveryText(flattenVariantText(activeVariants));
  const hasVariantSignal = Boolean(requestedAttribute || requestedValue);

  if (!hasVariantSignal) return undefined;

  const matchesRequestedValue = requestedValue
    ? variantValueIndex.find((entry) => entry.value.includes(normalizeVariantKey(requestedValue)) || normalizeVariantKey(requestedValue).includes(entry.value))
    : null;
  const matchesRequestedSpecValue = requestedValue
    ? specText.includes(normalizeVariantKey(requestedValue))
    : false;

  if (requestedAttribute && !requestedValue) {
    const supportedValues = variantValueIndex.filter((entry) => matchesVariantAttributeName(entry.attributeName, requestedAttribute)).length;
    const specSupportsAttribute = matchesVariantAttributeName(specText, requestedAttribute) || matchesVariantAttributeName(variantText, requestedAttribute);
    if (supportedValues > 1) {
      return {
        requested_variant_intent: true,
        requested_attribute: requestedAttribute,
        requested_value: null,
        availability: 'ambiguous',
        matched_variant_id: null,
        matched_variant_label: null,
        active_variant_count: activeVariants.length,
        available_variant_count: availableVariants.length,
      };
    }

    return {
      requested_variant_intent: true,
      requested_attribute: requestedAttribute,
      requested_value: null,
      availability: supportedValues > 0 || specSupportsAttribute ? 'ambiguous' : 'unsupported',
      matched_variant_id: null,
      matched_variant_label: null,
      active_variant_count: activeVariants.length,
      available_variant_count: availableVariants.length,
    };
  }

  if (matchesRequestedValue || matchesRequestedSpecValue) {
    return {
      requested_variant_intent: true,
      requested_attribute: requestedAttribute ?? 'flavor',
      requested_value: requestedValue ?? matchesRequestedValue?.label ?? null,
      availability: (matchesRequestedValue?.stock ?? product.stock) > 0 ? 'available' : 'missing',
      matched_variant_id: matchesRequestedValue?.variantId ?? null,
      matched_variant_label: matchesRequestedValue?.label ?? requestedValue ?? null,
      active_variant_count: activeVariants.length,
      available_variant_count: availableVariants.length,
    };
  }

  if (requestedAttribute || requestedValue) {
    return {
      requested_variant_intent: true,
      requested_attribute: requestedAttribute,
      requested_value: requestedValue,
      availability: requestedAttribute && (variantValueIndex.some((entry) => matchesVariantAttributeName(entry.attributeName, requestedAttribute)) || matchesVariantAttributeName(specText, requestedAttribute) || matchesVariantAttributeName(variantText, requestedAttribute))
        ? 'missing'
        : 'unsupported',
      matched_variant_id: null,
      matched_variant_label: null,
      active_variant_count: activeVariants.length,
      available_variant_count: availableVariants.length,
    };
  }

  return undefined;
}

function buildRecoverySignals(query: string): RecoveryQuerySignals {
  const normalizedQuery = normalizeRecoveryText(query);
  const tokens = extractRecoveryTokens(query);
  const prefers420 = hasRecoveryHint(normalizedQuery, RECOVERY_420_HINTS);
  const prefersVape = hasRecoveryHint(normalizedQuery, RECOVERY_VAPE_HINTS);
  const wantsLiquid = hasRecoveryHint(normalizedQuery, RECOVERY_LIQUID_HINTS);
  const wantsDevice = hasRecoveryHint(normalizedQuery, RECOVERY_DEVICE_HINTS);
  const wantsSmall = hasRecoveryHint(normalizedQuery, RECOVERY_SMALL_HINTS);
  const wantsBudget = hasRecoveryHint(normalizedQuery, RECOVERY_BUDGET_HINTS);
  const wantsFruit = hasRecoveryHint(normalizedQuery, RECOVERY_FRUIT_HINTS);
  const wantsMint = hasRecoveryHint(normalizedQuery, RECOVERY_MINT_HINTS);
  const wantsNicotineFact = hasRecoveryHint(normalizedQuery, RECOVERY_FACT_NICOTINE_HINTS);
  const wantsFlavorFact = hasRecoveryHint(normalizedQuery, RECOVERY_FACT_FLAVOR_HINTS);
  const prefersSection = prefers420
    ? '420'
    : (prefersVape || wantsLiquid || wantsDevice || wantsSmall || wantsBudget || wantsFruit || wantsMint || wantsNicotineFact || wantsFlavorFact)
      ? 'vape'
      : null;

  return {
    normalizedQuery,
    tokens,
    prefersSection,
    wantsLiquid,
    wantsDevice,
    wantsSmall,
    wantsBudget,
    wantsFruit,
    wantsMint,
    wantsNicotineFact,
    wantsFlavorFact,
    isMixedNeed: hasRecoveryHint(` ${normalizedQuery} `, RECOVERY_MIXED_HINTS),
    isExploratory: hasRecoveryHint(normalizedQuery, RECOVERY_EXPLORATION_HINTS),
    isNotFoundRecovery: hasRecoveryHint(normalizedQuery, RECOVERY_NOT_FOUND_HINTS),
  };
}

function buildProductRecoveryHaystack(product: ProductSearchRow): string {
  return normalizeRecoveryText([
    product.name,
    product.slug ?? '',
    product.ai_sales_note ?? '',
    product.description ?? '',
    flattenSpecText(product.specs),
    flattenVariantText(product.variants),
  ].join(' '));
}

function isLikelyLiquidProduct(product: ProductSearchRow, haystack: string): boolean {
  return haystack.includes('eliquid')
    || haystack.includes('e liquid')
    || haystack.includes('juicee')
    || haystack.includes('nic salt')
    || haystack.includes('nicsalt')
    || (product.section === 'vape' && /\b\d+ml\b/i.test(product.name));
}

function isLikelyDeviceProduct(haystack: string): boolean {
  return haystack.includes('pod')
    || haystack.includes('mod')
    || haystack.includes('starter')
    || haystack.includes('kit')
    || haystack.includes('pen')
    || haystack.includes('vaporizer')
    || haystack.includes('vape pen')
    || haystack.includes('device');
}

function hasSpecLikeValue(haystack: string, key: string): boolean {
  return haystack.includes(normalizeRecoveryText(key));
}

function isLikelySmallProduct(haystack: string): boolean {
  return ['mini', 'micro', 'slim', 'stealth', 'compact', 'compacto', 'compacta', 'portatil', '22mm', 'pocket']
    .some((hint) => haystack.includes(hint));
}

function scoreRecoveryCandidate(product: ProductSearchRow, signals: RecoveryQuerySignals): number {
  const normalizedName = normalizeRecoveryText(product.name);
  const normalizedSlug = normalizeRecoveryText(product.slug ?? '');
  const normalizedNote = normalizeRecoveryText(product.ai_sales_note ?? '');
  const normalizedDescription = normalizeRecoveryText(product.description ?? '');
  const haystack = buildProductRecoveryHaystack(product);
  const normalizedVariantText = normalizeRecoveryText(flattenVariantText(product.variants));
  const isLiquid = isLikelyLiquidProduct(product, haystack);
  const isDevice = isLikelyDeviceProduct(haystack);

  let score = product.ai_is_featured ? 1 : 0;
  if (product.stock > 0) score += 1;

  for (const token of signals.tokens) {
    if (normalizedName.includes(token)) score += 7;
    else if (normalizedSlug.includes(token)) score += 6;
    else if (normalizedNote.includes(token)) score += 4;
    else if (normalizedDescription.includes(token)) score += 3;
    else if (haystack.includes(token)) score += 2;

    if (/\d/.test(token) && (normalizedName.includes(token) || haystack.includes(token))) {
      score += 4;
    }
  }

  if (signals.prefersSection) {
    score += product.section === signals.prefersSection ? 3 : -2;
  }

  if (signals.wantsLiquid) {
    score += isLiquid ? 5 : -1;
  } else if (signals.wantsDevice) {
    score += isDevice ? 5 : -1;
  } else if (signals.isExploratory || signals.isNotFoundRecovery) {
    score += isDevice ? 3 : 0;
  }

  if (signals.wantsSmall) {
    score += isLikelySmallProduct(haystack) ? 4 : (isDevice ? 1 : 0);
  }

  if (signals.wantsBudget) {
    if (product.price <= 250) score += 4;
    else if (product.price <= 350) score += 3;
    else if (product.price <= 500) score += 1;
    else score -= 1;
  }

  if (signals.wantsFruit && RECOVERY_FRUIT_HINTS.some((hint) => haystack.includes(hint))) {
    score += 5;
  }

  if (signals.wantsMint && RECOVERY_MINT_HINTS.some((hint) => haystack.includes(hint))) {
    score += 5;
  }

  if (signals.wantsNicotineFact) {
    if (hasSpecLikeValue(haystack, 'nicotina') || /\b\d+mg\b/.test(product.name.toLowerCase())) {
      score += 6;
    } else if (isLiquid) {
      score += 2;
    } else {
      score -= 2;
    }
  }

  if (signals.wantsFlavorFact) {
    if (
      RECOVERY_FRUIT_HINTS.some((hint) => haystack.includes(hint) || normalizedVariantText.includes(hint))
      || RECOVERY_MINT_HINTS.some((hint) => haystack.includes(hint) || normalizedVariantText.includes(hint))
    ) {
      score += 4;
    } else if (isLiquid) {
      score += 2;
    }
  }

  if (signals.isNotFoundRecovery && product.section === 'vape' && isDevice) {
    score += 2;
  }

  if (signals.isMixedNeed && ((signals.wantsLiquid && isLiquid) || (signals.wantsDevice && isDevice))) {
    score += 3;
  }

  return score;
}

function selectRecoveryCandidates(
  products: ProductSearchRow[],
  signals: RecoveryQuerySignals,
  minimumScore: number,
): ProductSearchRow[] {
  const scored = products
    .map((product) => ({ product, score: scoreRecoveryCandidate(product, signals) }))
    .filter(({ score }) => score >= minimumScore)
    .sort((a, b) => b.score - a.score || b.product.stock - a.product.stock || a.product.price - b.product.price);

  if (!signals.isMixedNeed) {
    return scored.map(({ product }) => product).slice(0, 5);
  }

  const picked: ProductSearchRow[] = [];
  const remaining = [...scored];

  const takeFirst = (predicate: (product: ProductSearchRow) => boolean) => {
    const index = remaining.findIndex(({ product }) => predicate(product));
    if (index < 0) return;
    picked.push(remaining[index]!.product);
    remaining.splice(index, 1);
  };

  takeFirst((product) => isLikelyDeviceProduct(buildProductRecoveryHaystack(product)));
  takeFirst((product) => isLikelyLiquidProduct(product, buildProductRecoveryHaystack(product)));

  for (const { product } of remaining) {
    if (picked.some((candidate) => candidate.id === product.id)) continue;
    picked.push(product);
    if (picked.length >= 5) break;
  }

  return picked.slice(0, 5);
}

async function runCatalogTokenRecoveryQuery(query: string): Promise<ProductSearchRow[]> {
  const signals = buildRecoverySignals(query);
  if (signals.tokens.length === 0) return [];

  const filters = signals.tokens.flatMap((token) => [
    `name.ilike.%${token}%`,
    `slug.ilike.%${token}%`,
    `description.ilike.%${token}%`,
    `ai_sales_note.ilike.%${token}%`,
  ]);
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SEARCH_SELECT)
    .eq('status', 'active')
    .or([...new Set(filters)].join(','))
    .limit(20);

  if (error || !data) return [];

  return selectRecoveryCandidates(data as ProductSearchRow[], signals, 5);
}

async function runCatalogGuidedRecoveryQuery(query: string, isAmbiguous: boolean): Promise<ProductSearchRow[]> {
  const signals = buildRecoverySignals(query);
  const hasGroundingSignal = isAmbiguous
    || signals.isExploratory
    || signals.isNotFoundRecovery
    || signals.wantsLiquid
    || signals.wantsDevice
    || signals.wantsSmall
    || signals.wantsBudget
    || signals.wantsFruit
    || signals.wantsMint;

  if (!hasGroundingSignal) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SEARCH_SELECT)
    .eq('status', 'active')
    .limit(80);

  if (error || !data) return [];

  const guidedSignals: RecoveryQuerySignals = {
    ...signals,
    prefersSection: signals.prefersSection ?? 'vape',
  };

  return selectRecoveryCandidates(data as ProductSearchRow[], guidedSignals, 4);
}

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
  } catch {
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
function mapDbToInternal(dbProducts: ProductSearchRow[], query: string): InternalResolvedProduct[] {
  return dbProducts.map(p => {
    return mapSearchRowToInternal(p, query);
  });
}

function mapSearchRowToInternal(p: ProductSearchRow, query: string): InternalResolvedProduct {
  let status: InternalResolvedProduct['status_signal'] = 'IN_STOCK';
  if (p.stock <= 0) status = 'OUT_OF_STOCK';
  else if (p.stock <= 5) status = 'LOW_STOCK';

  let flag: InternalResolvedProduct['commercial_flag'] = 'STANDARD';
  if (p.ai_is_featured) flag = 'FEATURED';

  return {
    id: p.id,
    slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
    section: (p.section === 'vape' || p.section === '420') ? p.section : 'vape',
    name: p.name,
    display_price: `$${p.price}`,
    raw_stock: p.stock,
    status_signal: status,
    commercial_flag: flag,
    ai_sales_note: p.ai_sales_note ?? null,
    description: p.description ?? null,
    specs: p.specs ?? null,
    variant_truth: buildVariantTruth(query, p),
  };
}

function mapStorefrontProductToInternal(product: Product, query: string): InternalResolvedProduct {
  const searchRow: ProductSearchRow = {
    id: product.id,
    slug: product.slug,
    section: product.section,
    name: product.name,
    price: product.price,
    stock: product.stock,
    ai_is_featured: product.ai_is_featured,
    ai_sales_note: product.ai_sales_note,
    description: product.description,
    specs: product.specs ?? null,
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      product_id: variant.product_id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      is_active: variant.is_active,
      options: variant.options?.map((option) => ({
        variant_id: option.variant_id,
        attribute_value_id: option.attribute_value_id,
        attribute_value: {
          value: option.attribute_value?.value ?? null,
          attribute: {
            name: option.attribute_name ?? null,
          },
        },
      })) ?? null,
    })) ?? null,
  };

  return mapSearchRowToInternal(searchRow, query);
}

async function hydrateSemanticSpecs(matches: ProductSearchRow[]): Promise<ProductSearchRow[]> {
  if (matches.length === 0) return matches;

  const ids = matches
    .map((product) => product?.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (ids.length === 0) return matches;

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, specs,
      variants:product_variants(
        id, product_id, sku, price, stock, is_active,
        options:product_variant_options(
          variant_id, attribute_value_id,
          attribute_value:product_attribute_values(
            id, attribute_id, value,
            attribute:product_attributes(name)
          )
        )
      )
    `)
    .in('id', ids);

  if (error || !data) return matches;

  const detailsById = new Map(
    data.map((row) => [row.id as string, {
      specs: row.specs ?? null,
      variants: row.variants ?? null,
    }])
  );

  return matches.map((product) => ({
    ...product,
    specs: detailsById.get(product.id)?.specs ?? null,
    variants: detailsById.get(product.id)?.variants ?? null,
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
  } catch {
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
     } catch {
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


export interface PilotFeedbackInput {
    prompt: string;
    response: string;
    capsule_slug: string | undefined;
    rating_accuracy: number;
    rating_tone: number;
    rating_utility: number;
}

export async function savePilotFeedback(input: PilotFeedbackInput): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('pilot_feedback')
        .insert({
            prompt:           input.prompt,
            response:         input.response,
            capsule_slug:     input.capsule_slug ?? null,
            rating_accuracy:  input.rating_accuracy,
            rating_tone:      input.rating_tone,
            rating_utility:   input.rating_utility,
            submitted_by:     user?.id ?? null,
        });
    if (error) throw error;
}
