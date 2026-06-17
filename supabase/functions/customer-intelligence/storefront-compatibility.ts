type CompatibilityRelationType =
  | 'uses_coil'
  | 'uses_pod'
  | 'uses_battery'
  | 'uses_liquid'
  | 'recommended_for_liquid'
  | 'has_connector'
  | 'replaces';

type CompatibilityScope = 'specific_model' | 'class_generalization';
type CompatibilityMatchKind = 'COMPATIBLE' | 'INCOMPATIBLE' | 'NEEDS_MORE_CONTEXT' | 'NO_GROUNDED_MATCH' | 'REVIEW_PRODUCT';
type RetrievalSource = 'CATALOG_COMPATIBILITY_GRAPH' | 'SAFE_CART_CONTEXT' | 'CATALOG_QUERY_MATCH' | 'NONE';

type ProductRef = {
  id: string;
  name: string;
  slug: string;
  section: 'vape' | '420';
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  section: 'vape' | '420' | null;
  sku: string | null;
  stock: number;
  is_active: boolean;
  status: string;
  description: string | null;
  short_description: string | null;
  ai_sales_note: string | null;
  tags: string[] | null;
  specs: Record<string, unknown> | null;
  ai_is_featured: boolean | null;
  updated_at?: string;
};

type ProductConceptRow = {
  id: string;
  name: string;
  concept_type: string;
  product_id: string | null;
};

type CompatibilityRelationRow = {
  concept_a_id: string;
  concept_b_id: string;
  relation_type: CompatibilityRelationType;
  scope: CompatibilityScope;
  status: 'confirmed_compatible' | 'confirmed_incompatible' | 'unknown_unconfirmed';
  notes: string | null;
  concept_b: {
    product_id: string | null;
  } | null;
};

export interface CompatibilityCheckResolution {
  kind: CompatibilityMatchKind;
  message: string;
  retrievalSource: RetrievalSource;
  resolvedProducts: ProductRef[];
  signal: {
    kind: CompatibilityMatchKind;
    scope: 'ANCHOR_AND_CANDIDATE' | 'SAFE_CART_CONTEXT' | 'ANCHOR_ONLY' | 'NONE';
    anchor_product: ProductRef | null;
    candidate_product: ProductRef | null;
    relation_type: CompatibilityRelationType | null;
    relation_scope: CompatibilityScope | null;
    resolved_relation_count: number;
    suggestion_count: number;
    cart_context_used: boolean;
    fit_confidence: 'high' | 'medium' | 'low' | null;
  };
  matchStrategy: CompatibilityMatchKind;
  anchor: ProductRow | null;
  candidate: ProductRow | null;
}

const FIT_STRIP_PATTERNS = [
  /\ble queda a mi\b/g,
  /\ble queda\b/g,
  /\bsirve para\b/g,
  /\bfunciona con\b/g,
  /\bme funciona con\b/g,
  /\bcompatible con\b/g,
  /\bcompatibilidad con\b/g,
  /\bque coil le sirve\b/g,
  /\bque pod le sirve\b/g,
  /\bque bateria le sirve\b/g,
  /\bque liquido le sirve\b/g,
  /\bque resistencia le sirve\b/g,
  /\bcon el que traigo\b/g,
  /\bcon lo que traigo\b/g,
  /\bcon el que tengo\b/g,
  /\bmi equipo\b/g,
  /\bmi pod\b/g,
  /\bmi bateria\b/g,
];

const STOPWORDS = new Set([
  'mi', 'mis', 'tu', 'tuya', 'tuyo', 'este', 'esta', 'ese', 'esa', 'eso', 'con', 'el', 'la', 'los', 'las',
  'que', 'cual', 'cuÃ¡l', 'sirve', 'sirven', 'queda', 'quedan', 'funciona', 'funciona', 'compatible',
  'compatibilidad', 'traigo', 'tengo', 'llevo', 'equipo', 'pod', 'pods', 'bateria', 'liquido', 'resistencia',
  'para', 'con', 'al', 'del', 'de', 'mi', 'me', 'lo', 'que', 'un', 'una', 'unos', 'unas',
]);

const COMPATIBLE_RELATION_TYPES: CompatibilityRelationType[] = [
  'uses_coil',
  'uses_pod',
  'uses_battery',
  'uses_liquid',
  'recommended_for_liquid',
  'has_connector',
  'replaces',
];

const PRODUCT_SELECT = `
  id, name, slug, sku, section, stock, is_active, status,
  description, short_description, ai_sales_note, tags, specs, ai_is_featured, updated_at
`;

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
  return Array.from(new Set(
    normalizeText(value)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 1 && !STOPWORDS.has(token)),
  )).slice(0, 6);
}

function stripFitLanguage(query: string): string {
  let normalized = normalizeText(query);
  for (const pattern of FIT_STRIP_PATTERNS) {
    normalized = normalized.replace(pattern, ' ');
  }

  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .join(' ')
    .trim();
}

function textForProduct(product: ProductRow): string {
  const tagsText = Array.isArray(product.tags) ? product.tags.join(' ') : '';
  const specsText = product.specs && typeof product.specs === 'object'
    ? Object.entries(product.specs).flatMap(([key, value]) => [key, String(value ?? '')]).join(' ')
    : '';

  return normalizeText([
    product.name,
    product.slug,
    product.sku ?? '',
    product.description ?? '',
    product.short_description ?? '',
    product.ai_sales_note ?? '',
    tagsText,
    specsText,
  ].join(' '));
}

function toProductRef(product: ProductRow): ProductRef | null {
  if (!product.section) return null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    section: product.section,
  };
}

function scoreProduct(product: ProductRow, query: string): number {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(query);
  const text = textForProduct(product);
  let score = 0;

  if (text.includes(normalizedQuery)) score += 60;
  if (normalizeText(product.name) === normalizedQuery) score += 80;
  if (normalizeText(product.slug).includes(normalizedQuery.replace(/\s+/g, '-'))) score += 30;
  if ((product.sku ?? '').toLowerCase() === query.trim().toLowerCase()) score += 90;

  for (const token of queryTokens) {
    if (text.includes(token)) score += 12;
  }

  if (product.ai_is_featured) score += 2;
  if (product.stock > 0) score += 2;
  return score;
}

async function fetchProductPool(supabase: any, query: string): Promise<ProductRow[]> {
  const base = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('status', 'active')
    .limit(80);

  const tokens = tokenize(stripFitLanguage(query));
  if (tokens.length > 0) {
    const orFilter = tokens.slice(0, 4)
      .flatMap((token) => [
        `name.ilike.%${token}%`,
        `slug.ilike.%${token}%`,
        `sku.ilike.%${token}%`,
        `description.ilike.%${token}%`,
        `short_description.ilike.%${token}%`,
        `ai_sales_note.ilike.%${token}%`,
      ])
      .join(',');

    const { data: filtered } = await base.or(orFilter);
    if (Array.isArray(filtered) && filtered.length > 0) {
      return filtered as ProductRow[];
    }
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(80);

  if (error || !Array.isArray(data)) return [];
  return data as ProductRow[];
}

function pickBestProduct(pool: ProductRow[], query: string): ProductRow | null {
  const scored = pool
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((entry) => entry.score >= 24)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return (right.product.stock ?? 0) - (left.product.stock ?? 0);
    });

  return scored[0]?.product ?? null;
}

function pickSecondProduct(pool: ProductRow[], query: string, anchorId: string): ProductRow | null {
  const scored = pool
    .filter((product) => product.id !== anchorId)
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((entry) => entry.score >= 18)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return (right.product.stock ?? 0) - (left.product.stock ?? 0);
    });

  return scored[0]?.product ?? null;
}

async function resolveDirectProductMatch(input: {
  supabase: any;
  query: string;
  cartProductIds: string[];
}): Promise<{ anchor: ProductRow | null; candidate: ProductRow | null; usedCartContext: boolean; productPool: ProductRow[] }> {
  const pool = await fetchProductPool(input.supabase, input.query);
  const cartProductId = input.cartProductIds.length === 1 ? input.cartProductIds[0] : null;
  let anchor: ProductRow | null = null;
  let usedCartContext = false;

  if (cartProductId) {
    const { data: cartProduct } = await input.supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', cartProductId)
      .maybeSingle();

    if (cartProduct && (cartProduct.is_active === true || cartProduct.status === 'active')) {
      anchor = cartProduct as ProductRow;
      usedCartContext = true;
    }
  }

  if (!anchor) {
    anchor = pickBestProduct(pool, stripFitLanguage(input.query));
  }

  const candidate = anchor ? pickSecondProduct(pool, input.query, anchor.id) : pickBestProduct(pool, input.query);
  return {
    anchor,
    candidate: candidate && anchor && candidate.id === anchor.id ? null : candidate,
    usedCartContext,
    productPool: pool,
  };
}

async function resolveConceptIds(input: {
  supabase: any;
  productId: string;
}): Promise<string[]> {
  const { data, error } = await input.supabase
    .from('product_concepts')
    .select('id, product_id')
    .eq('product_id', input.productId);

  if (error || !Array.isArray(data)) return [];
  return (data as ProductConceptRow[]).map((row) => row.id).filter(Boolean);
}

async function resolveDirectRelations(input: {
  supabase: any;
  anchorConceptIds: string[];
  candidateConceptIds: string[];
}): Promise<CompatibilityRelationRow[]> {
  if (input.anchorConceptIds.length === 0 || input.candidateConceptIds.length === 0) return [];

  const query = `
      concept_a_id,
      concept_b_id,
      relation_type,
      scope,
      status,
      notes,
      concept_b:product_concepts!concept_b_id(product_id)
    `;

  const { data: forwardData, error: forwardError } = await input.supabase
    .from('compatibility_relations')
    .select(query)
    .in('concept_a_id', input.anchorConceptIds)
    .in('concept_b_id', input.candidateConceptIds);

  const { data: reverseData, error: reverseError } = await input.supabase
    .from('compatibility_relations')
    .select(query)
    .in('concept_a_id', input.candidateConceptIds)
    .in('concept_b_id', input.anchorConceptIds);

  if (forwardError && reverseError) return [];

  return [
    ...((Array.isArray(forwardData) ? forwardData : []) as unknown as CompatibilityRelationRow[]),
    ...((Array.isArray(reverseData) ? reverseData : []) as unknown as CompatibilityRelationRow[]),
  ];
}

async function resolveCompatibilitySuggestions(input: {
  supabase: any;
  anchorConceptIds: string[];
}): Promise<{ products: ProductRow[]; relationCount: number; sampleRelation: CompatibilityRelationRow | null }> {
  if (input.anchorConceptIds.length === 0) {
    return { products: [], relationCount: 0, sampleRelation: null };
  }

  const { data, error } = await input.supabase
    .from('compatibility_relations')
    .select(`
      concept_a_id,
      concept_b_id,
      relation_type,
      scope,
      status,
      notes,
      concept_b:product_concepts!concept_b_id(product_id)
    `)
    .in('concept_a_id', input.anchorConceptIds)
    .eq('status', 'confirmed_compatible')
    .in('relation_type', COMPATIBLE_RELATION_TYPES);

  if (error || !Array.isArray(data) || data.length === 0) {
    return { products: [], relationCount: 0, sampleRelation: null };
  }

  const relationRows = data as unknown as CompatibilityRelationRow[];
  const relatedProductIds = Array.from(new Set(
    relationRows
      .map((row) => row.concept_b?.product_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  ));

  if (relatedProductIds.length === 0) {
    return { products: [], relationCount: relationRows.length, sampleRelation: relationRows[0] ?? null };
  }

  const { data: products, error: productError } = await input.supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('id', relatedProductIds)
    .eq('is_active', true)
    .eq('status', 'active')
    .gt('stock', 0);

  if (productError || !Array.isArray(products)) {
    return { products: [], relationCount: relationRows.length, sampleRelation: relationRows[0] ?? null };
  }

  const pool = products as ProductRow[];
  return {
    products: pool.sort((left, right) => (right.stock ?? 0) - (left.stock ?? 0)).slice(0, 3),
    relationCount: relationRows.length,
    sampleRelation: relationRows[0] ?? null,
  };
}

function buildProductRefList(values: Array<ProductRow | null | undefined>): ProductRef[] {
  const seen = new Set<string>();
  const refs: ProductRef[] = [];

  for (const product of values) {
    const ref = product ? toProductRef(product) : null;
    if (!ref || seen.has(ref.id)) continue;
    seen.add(ref.id);
    refs.push(ref);
  }

  return refs;
}

function formatProductNames(products: ProductRow[]): string {
  return products.map((product) => product.name).join(', ');
}

function buildCompatibilityMessage(input: {
  kind: CompatibilityMatchKind;
  anchor: ProductRow | null;
  candidate: ProductRow | null;
  suggestions: ProductRow[];
  relation: CompatibilityRelationRow | null;
  usedCartContext: boolean;
}): string {
  const anchorName = input.anchor?.name ?? 'ese producto';
  const candidateName = input.candidate?.name ?? 'ese otro producto';

  if (input.kind === 'COMPATIBLE' && input.anchor && input.candidate) {
    return `SÃ­, ${candidateName} sÃ­ le queda a ${anchorName}. La relaciÃ³n estÃ¡ confirmada en la verdad actual.`;
  }

  if (input.kind === 'INCOMPATIBLE' && input.anchor && input.candidate) {
    return `No, ${candidateName} no le queda a ${anchorName}. La relaciÃ³n en la verdad actual marca incompatibilidad confirmada.`;
  }

  if (input.kind === 'REVIEW_PRODUCT' && input.anchor && input.suggestions.length > 0) {
    return `No te lo cierro como ajuste especÃ­fico todavÃ­a, pero sÃ­ tengo opciones confirmadas que encajan con ${anchorName}: ${formatProductNames(input.suggestions)}.`;
  }

  if (input.kind === 'REVIEW_PRODUCT' && input.anchor && input.relation?.scope === 'class_generalization') {
    return `La compatibilidad que tengo para ${anchorName} es de clase, no de modelo exacto. Prefiero dejarla en revisiÃ³n antes de decirte un sÃ­ definitivo.`;
  }

  if (input.kind === 'NEEDS_MORE_CONTEXT') {
    return input.usedCartContext
      ? 'Necesito el modelo exacto o la pieza exacta que quieres verificar. Con el carrito solo no me alcanza para cerrar la compatibilidad con seguridad.'
      : 'Necesito el modelo exacto del dispositivo o la pieza exacta que quieres revisar para decirte si sÃ­ le queda.';
  }

  if (input.kind === 'NO_GROUNDED_MATCH') {
    return `No encontrÃ© una relaciÃ³n de compatibilidad confirmada para ${anchorName}${input.candidate ? ` con ${candidateName}` : ''} en la verdad actual.`;
  }

  return 'No pude cerrar la compatibilidad con la verdad actual.';
}

export async function resolveStorefrontCompatibilityCheck(input: {
  query: string;
  cartProductIds: string[];
  supabase: any;
}): Promise<CompatibilityCheckResolution> {
  const directMatch = await resolveDirectProductMatch(input);
  const anchor = directMatch.anchor;
  const candidate = directMatch.candidate;

  if (!anchor) {
    return {
      kind: 'NEEDS_MORE_CONTEXT',
      message: buildCompatibilityMessage({
        kind: 'NEEDS_MORE_CONTEXT',
        anchor: null,
        candidate: null,
        suggestions: [],
        relation: null,
        usedCartContext: directMatch.usedCartContext,
      }),
      retrievalSource: directMatch.usedCartContext ? 'SAFE_CART_CONTEXT' : 'CATALOG_QUERY_MATCH',
      resolvedProducts: [],
      signal: {
        kind: 'NEEDS_MORE_CONTEXT',
        scope: directMatch.usedCartContext ? 'SAFE_CART_CONTEXT' : 'NONE',
        anchor_product: null,
        candidate_product: null,
        relation_type: null,
        relation_scope: null,
        resolved_relation_count: 0,
        suggestion_count: 0,
        cart_context_used: directMatch.usedCartContext,
        fit_confidence: null,
      },
      matchStrategy: 'NEEDS_MORE_CONTEXT',
      anchor: null,
      candidate: null,
    };
  }

  const anchorConceptIds = await resolveConceptIds({ supabase: input.supabase, productId: anchor.id });
  const candidateConceptIds = candidate ? await resolveConceptIds({ supabase: input.supabase, productId: candidate.id }) : [];
  const directRelations = candidate ? await resolveDirectRelations({
    supabase: input.supabase,
    anchorConceptIds,
    candidateConceptIds,
  }) : [];

  const confirmedIncompatible = directRelations.find((relation) => relation.status === 'confirmed_incompatible') ?? null;
  const confirmedCompatibleSpecific = directRelations.find((relation) => relation.status === 'confirmed_compatible' && relation.scope === 'specific_model') ?? null;
  const confirmedCompatibleGeneral = directRelations.find((relation) => relation.status === 'confirmed_compatible' && relation.scope === 'class_generalization') ?? null;

  const { products: suggestions, relationCount, sampleRelation } = await resolveCompatibilitySuggestions({
    supabase: input.supabase,
    anchorConceptIds,
  });

  const anchorRef = toProductRef(anchor);
  const candidateRef = candidate ? toProductRef(candidate) : null;
  const suggestionRefs = buildProductRefList(suggestions);

  if (confirmedIncompatible && anchorRef && candidateRef) {
    return {
      kind: 'INCOMPATIBLE',
      message: buildCompatibilityMessage({
        kind: 'INCOMPATIBLE',
        anchor,
        candidate,
        suggestions: [],
        relation: confirmedIncompatible,
        usedCartContext: directMatch.usedCartContext,
      }),
      retrievalSource: 'CATALOG_COMPATIBILITY_GRAPH',
      resolvedProducts: buildProductRefList([anchor, candidate]),
      signal: {
        kind: 'INCOMPATIBLE',
        scope: 'ANCHOR_AND_CANDIDATE',
        anchor_product: anchorRef,
        candidate_product: candidateRef,
        relation_type: confirmedIncompatible.relation_type,
        relation_scope: confirmedIncompatible.scope,
        resolved_relation_count: directRelations.length,
        suggestion_count: suggestionRefs.length,
        cart_context_used: directMatch.usedCartContext,
        fit_confidence: 'high',
      },
      matchStrategy: 'INCOMPATIBLE',
      anchor,
      candidate,
    };
  }

  if (confirmedCompatibleSpecific && anchorRef && candidateRef) {
    return {
      kind: 'COMPATIBLE',
      message: buildCompatibilityMessage({
        kind: 'COMPATIBLE',
        anchor,
        candidate,
        suggestions: [],
        relation: confirmedCompatibleSpecific,
        usedCartContext: directMatch.usedCartContext,
      }),
      retrievalSource: 'CATALOG_COMPATIBILITY_GRAPH',
      resolvedProducts: buildProductRefList([anchor, candidate]),
      signal: {
        kind: 'COMPATIBLE',
        scope: 'ANCHOR_AND_CANDIDATE',
        anchor_product: anchorRef,
        candidate_product: candidateRef,
        relation_type: confirmedCompatibleSpecific.relation_type,
        relation_scope: confirmedCompatibleSpecific.scope,
        resolved_relation_count: directRelations.length,
        suggestion_count: suggestionRefs.length,
        cart_context_used: directMatch.usedCartContext,
        fit_confidence: 'high',
      },
      matchStrategy: 'COMPATIBLE',
      anchor,
      candidate,
    };
  }

  if (suggestionRefs.length > 0) {
    const resultKind: CompatibilityMatchKind = candidate ? 'REVIEW_PRODUCT' : 'REVIEW_PRODUCT';

    return {
      kind: resultKind,
      message: buildCompatibilityMessage({
        kind: 'REVIEW_PRODUCT',
        anchor,
        candidate,
        suggestions,
        relation: confirmedCompatibleGeneral ?? sampleRelation,
        usedCartContext: directMatch.usedCartContext,
      }),
      retrievalSource: directMatch.usedCartContext ? 'SAFE_CART_CONTEXT' : candidate ? 'CATALOG_QUERY_MATCH' : 'CATALOG_COMPATIBILITY_GRAPH',
      resolvedProducts: buildProductRefList([anchor, candidate, ...suggestions]),
      signal: {
        kind: 'REVIEW_PRODUCT',
        scope: candidate ? 'ANCHOR_AND_CANDIDATE' : (directMatch.usedCartContext ? 'SAFE_CART_CONTEXT' : 'ANCHOR_ONLY'),
        anchor_product: anchorRef,
        candidate_product: candidateRef,
        relation_type: confirmedCompatibleGeneral?.relation_type ?? sampleRelation?.relation_type ?? null,
        relation_scope: confirmedCompatibleGeneral?.scope ?? sampleRelation?.scope ?? null,
        resolved_relation_count: relationCount,
        suggestion_count: suggestionRefs.length,
        cart_context_used: directMatch.usedCartContext,
        fit_confidence: candidate ? 'medium' : 'low',
      },
      matchStrategy: 'REVIEW_PRODUCT',
      anchor,
      candidate,
    };
  }

  if (candidate && !directRelations.length) {
    return {
      kind: 'NO_GROUNDED_MATCH',
      message: buildCompatibilityMessage({
        kind: 'NO_GROUNDED_MATCH',
        anchor,
        candidate,
        suggestions: [],
        relation: null,
        usedCartContext: directMatch.usedCartContext,
      }),
      retrievalSource: 'CATALOG_QUERY_MATCH',
      resolvedProducts: buildProductRefList(candidate ? [anchor, candidate] : [anchor]),
      signal: {
        kind: 'NO_GROUNDED_MATCH',
        scope: 'ANCHOR_AND_CANDIDATE',
        anchor_product: anchorRef,
        candidate_product: candidateRef,
        relation_type: null,
        relation_scope: null,
        resolved_relation_count: 0,
        suggestion_count: 0,
        cart_context_used: directMatch.usedCartContext,
        fit_confidence: 'low',
      },
      matchStrategy: 'NO_GROUNDED_MATCH',
      anchor,
      candidate,
    };
  }

  return {
    kind: 'NEEDS_MORE_CONTEXT',
    message: buildCompatibilityMessage({
      kind: 'NEEDS_MORE_CONTEXT',
      anchor,
      candidate: null,
      suggestions: [],
      relation: null,
      usedCartContext: directMatch.usedCartContext,
    }),
    retrievalSource: directMatch.usedCartContext ? 'SAFE_CART_CONTEXT' : 'CATALOG_QUERY_MATCH',
    resolvedProducts: buildProductRefList([anchor]),
    signal: {
      kind: 'NEEDS_MORE_CONTEXT',
      scope: directMatch.usedCartContext ? 'SAFE_CART_CONTEXT' : 'ANCHOR_ONLY',
      anchor_product: anchorRef,
      candidate_product: null,
      relation_type: null,
      relation_scope: null,
      resolved_relation_count: directRelations.length,
      suggestion_count: suggestionRefs.length,
      cart_context_used: directMatch.usedCartContext,
      fit_confidence: suggestionRefs.length > 0 ? 'medium' : null,
    },
    matchStrategy: 'NEEDS_MORE_CONTEXT',
    anchor,
    candidate: null,
  };
}
