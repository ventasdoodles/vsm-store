type AttachableRelationType =
  | 'uses_coil'
  | 'uses_pod'
  | 'uses_battery'
  | 'uses_liquid'
  | 'recommended_for_liquid'
  | 'has_connector'
  | 'replaces';

type CompatibilityScope = 'specific_model' | 'class_generalization';
type StrictCartDependencyRelationType =
  | 'uses_coil'
  | 'uses_pod'
  | 'uses_battery'
  | 'uses_liquid';

type ProductConceptRow = {
  id: string;
  product_id: string | null;
};

type AttachmentRelationRow = {
  concept_a_id: string;
  concept_b_id: string;
  relation_type: AttachableRelationType;
  scope: CompatibilityScope;
  concept_b: {
    product_id: string | null;
  } | null;
};

type CartDependencyRelationRow = {
  concept_a_id: string;
  concept_b_id: string;
  relation_type: StrictCartDependencyRelationType;
  scope: CompatibilityScope;
  concept_b: {
    product_id: string | null;
  } | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  section: 'vape' | '420' | null;
  stock: number;
  ai_is_featured: boolean | null;
};

export interface StorefrontAttachmentOffer {
  primary_product_id: string;
  relation_type: AttachableRelationType;
  scope: CompatibilityScope;
  rationale: string;
  attached_product: {
    id: string;
    name: string;
    slug: string;
    section: 'vape' | '420';
  };
}

export interface StorefrontCartDependencyOffer {
  primary_product_id: string;
  relation_type: StrictCartDependencyRelationType;
  scope: CompatibilityScope;
  rationale: string;
  missing_product: {
    id: string;
    name: string;
    slug: string;
    section: 'vape' | '420';
  };
}

const ATTACHABLE_RELATION_TYPES: AttachableRelationType[] = [
  'uses_pod',
  'uses_coil',
  'uses_battery',
  'uses_liquid',
  'recommended_for_liquid',
  'replaces',
  'has_connector',
];

const STRICT_CART_DEPENDENCY_RELATION_TYPES: StrictCartDependencyRelationType[] = [
  'uses_pod',
  'uses_coil',
  'uses_battery',
  'uses_liquid',
];

const RELATION_PRIORITY: Record<AttachableRelationType, number> = {
  uses_pod: 120,
  uses_coil: 115,
  uses_battery: 108,
  uses_liquid: 102,
  recommended_for_liquid: 96,
  replaces: 90,
  has_connector: 84,
};

function describeAttachmentLabel(relationType: AttachableRelationType): string {
  switch (relationType) {
    case 'uses_pod':
      return 'pod compatible';
    case 'uses_coil':
      return 'resistencia compatible';
    case 'uses_battery':
      return 'bateria compatible';
    case 'uses_liquid':
      return 'liquido compatible';
    case 'recommended_for_liquid':
      return 'liquido recomendado';
    case 'replaces':
      return 'repuesto compatible';
    case 'has_connector':
      return 'accesorio compatible';
  }
}

function buildAttachmentRationale(
  relationType: AttachableRelationType,
  scope: CompatibilityScope,
  attachedProductName: string,
): string {
  const scopeLine = scope === 'specific_model'
    ? 'Compatibilidad confirmada para ese modelo.'
    : 'Compatibilidad confirmada a nivel de clase.';

  return `${attachedProductName} aparece como ${describeAttachmentLabel(relationType)}. ${scopeLine}`;
}

function buildCartDependencyRationale(
  relationType: StrictCartDependencyRelationType,
  scope: CompatibilityScope,
  missingProductName: string,
): string {
  const scopeLine = scope === 'specific_model'
    ? 'Compatibilidad confirmada para ese modelo.'
    : 'Compatibilidad confirmada a nivel de clase.';

  return `${missingProductName} aparece como ${describeAttachmentLabel(relationType)} y sigue disponible. ${scopeLine}`;
}

function scoreAttachmentCandidate(
  relationType: AttachableRelationType,
  scope: CompatibilityScope,
  product: ProductRow,
): number {
  return RELATION_PRIORITY[relationType]
    + (scope === 'specific_model' ? 18 : 0)
    + (product.ai_is_featured ? 2 : 0)
    + Math.min(product.stock, 12) / 12;
}

export async function resolveStorefrontAttachmentOffers(input: {
  productIds: string[];
  supabase: any;
}): Promise<StorefrontAttachmentOffer[]> {
  const productIds = [...new Set(input.productIds.filter((value) => typeof value === 'string' && value.length > 0))];
  if (productIds.length === 0) return [];

  const { data: concepts, error: conceptError } = await input.supabase
    .from('product_concepts')
    .select('id, product_id')
    .in('product_id', productIds);

  if (conceptError || !concepts?.length) {
    return [];
  }

  const conceptRows = (concepts as ProductConceptRow[]).filter((row) => row.product_id);
  if (conceptRows.length === 0) return [];

  const conceptToPrimaryProductId = new Map<string, string>();
  for (const concept of conceptRows) {
    if (!concept.product_id) continue;
    conceptToPrimaryProductId.set(concept.id, concept.product_id);
  }

  const { data: relations, error: relationError } = await input.supabase
    .from('compatibility_relations')
    .select(`
      concept_a_id,
      concept_b_id,
      relation_type,
      scope,
      concept_b:product_concepts!concept_b_id(product_id)
    `)
    .in('concept_a_id', conceptRows.map((row) => row.id))
    .eq('status', 'confirmed_compatible')
    .in('relation_type', ATTACHABLE_RELATION_TYPES);

  if (relationError || !relations?.length) {
    return [];
  }

  const relationRows = (relations as AttachmentRelationRow[]).filter((row) => {
    const primaryProductId = conceptToPrimaryProductId.get(row.concept_a_id);
    const attachedProductId = row.concept_b?.product_id;

    return Boolean(
      primaryProductId
      && attachedProductId
      && attachedProductId !== primaryProductId,
    );
  });

  if (relationRows.length === 0) return [];

  const attachedProductIds = [...new Set(
    relationRows
      .map((row) => row.concept_b?.product_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  )];

  if (attachedProductIds.length === 0) return [];

  const { data: products, error: productError } = await input.supabase
    .from('products')
    .select('id, name, slug, section, stock, ai_is_featured')
    .in('id', attachedProductIds)
    .eq('is_active', true)
    .eq('status', 'active')
    .gt('stock', 0);

  if (productError || !products?.length) {
    return [];
  }

  const productsById = new Map<string, ProductRow>();
  for (const product of products as ProductRow[]) {
    if (!product.section) continue;
    productsById.set(product.id, product);
  }

  const bestByPrimaryProductId = new Map<string, { score: number; offer: StorefrontAttachmentOffer }>();

  for (const relation of relationRows) {
    const primaryProductId = conceptToPrimaryProductId.get(relation.concept_a_id);
    const attachedProductId = relation.concept_b?.product_id;
    if (!primaryProductId || !attachedProductId) continue;

    const attachedProduct = productsById.get(attachedProductId);
    if (!attachedProduct) continue;

    const offer: StorefrontAttachmentOffer = {
      primary_product_id: primaryProductId,
      relation_type: relation.relation_type,
      scope: relation.scope,
      rationale: buildAttachmentRationale(relation.relation_type, relation.scope, attachedProduct.name),
      attached_product: {
        id: attachedProduct.id,
        name: attachedProduct.name,
        slug: attachedProduct.slug,
        section: attachedProduct.section,
      },
    };
    const score = scoreAttachmentCandidate(relation.relation_type, relation.scope, attachedProduct);
    const current = bestByPrimaryProductId.get(primaryProductId);

    if (!current || score > current.score) {
      bestByPrimaryProductId.set(primaryProductId, { score, offer });
    }
  }

  return Array.from(bestByPrimaryProductId.values()).map((entry) => entry.offer);
}

export async function resolveStorefrontCartDependencyOffer(input: {
  cartProductIds: string[];
  supabase: any;
}): Promise<StorefrontCartDependencyOffer | null> {
  const cartProductIds = [...new Set(input.cartProductIds.filter((value) => typeof value === 'string' && value.length > 0))];
  if (cartProductIds.length === 0) return null;

  const cartProductIdSet = new Set(cartProductIds);

  const { data: concepts, error: conceptError } = await input.supabase
    .from('product_concepts')
    .select('id, product_id')
    .in('product_id', cartProductIds);

  if (conceptError || !concepts?.length) {
    return null;
  }

  const conceptRows = (concepts as ProductConceptRow[]).filter((row) => row.product_id);
  if (conceptRows.length === 0) return null;

  const cartConceptIds = new Set<string>();
  const conceptToPrimaryProductId = new Map<string, string>();

  for (const concept of conceptRows) {
    if (!concept.product_id) continue;
    cartConceptIds.add(concept.id);
    conceptToPrimaryProductId.set(concept.id, concept.product_id);
  }

  const { data: relations, error: relationError } = await input.supabase
    .from('compatibility_relations')
    .select(`
      concept_a_id,
      concept_b_id,
      relation_type,
      scope,
      concept_b:product_concepts!concept_b_id(product_id)
    `)
    .in('concept_a_id', conceptRows.map((row) => row.id))
    .eq('status', 'confirmed_compatible')
    .in('relation_type', STRICT_CART_DEPENDENCY_RELATION_TYPES);

  if (relationError || !relations?.length) {
    return null;
  }

  const relationRows = (relations as CartDependencyRelationRow[]).filter((row) => {
    const primaryProductId = conceptToPrimaryProductId.get(row.concept_a_id);
    const missingProductId = row.concept_b?.product_id;

    return Boolean(
      primaryProductId
      && missingProductId
      && missingProductId !== primaryProductId
      && !cartProductIdSet.has(missingProductId)
      && !cartConceptIds.has(row.concept_b_id),
    );
  });

  if (relationRows.length === 0) {
    return null;
  }

  const missingProductIds = [...new Set(
    relationRows
      .map((row) => row.concept_b?.product_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  )];

  if (missingProductIds.length === 0) {
    return null;
  }

  const { data: products, error: productError } = await input.supabase
    .from('products')
    .select('id, name, slug, section, stock, ai_is_featured')
    .in('id', missingProductIds)
    .eq('is_active', true)
    .eq('status', 'active')
    .gt('stock', 0);

  if (productError || !products?.length) {
    return null;
  }

  const productsById = new Map<string, ProductRow>();
  for (const product of products as ProductRow[]) {
    if (!product.section) continue;
    productsById.set(product.id, product);
  }

  let bestOffer: { score: number; offer: StorefrontCartDependencyOffer } | null = null;

  for (const relation of relationRows) {
    const primaryProductId = conceptToPrimaryProductId.get(relation.concept_a_id);
    const missingProductId = relation.concept_b?.product_id;
    if (!primaryProductId || !missingProductId) continue;

    const missingProduct = productsById.get(missingProductId);
    if (!missingProduct) continue;

    const offer: StorefrontCartDependencyOffer = {
      primary_product_id: primaryProductId,
      relation_type: relation.relation_type,
      scope: relation.scope,
      rationale: buildCartDependencyRationale(relation.relation_type, relation.scope, missingProduct.name),
      missing_product: {
        id: missingProduct.id,
        name: missingProduct.name,
        slug: missingProduct.slug,
        section: missingProduct.section,
      },
    };

    const score = scoreAttachmentCandidate(relation.relation_type, relation.scope, missingProduct);

    if (!bestOffer || score > bestOffer.score) {
      bestOffer = { score, offer };
    }
  }

  return bestOffer?.offer ?? null;
}
