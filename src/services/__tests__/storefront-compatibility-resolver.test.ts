import { describe, expect, it } from 'vitest';

import { resolveStorefrontCompatibilityCheck } from '../../../supabase/functions/customer-intelligence/storefront-compatibility';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  section: 'vape' | '420';
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
};

function makeProduct(overrides: Partial<ProductRow>): ProductRow {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Caliburn G3',
    slug: 'caliburn-g3',
    section: 'vape',
    sku: 'CAL-G3',
    stock: 10,
    is_active: true,
    status: 'active',
    description: 'Pod refillable',
    short_description: 'Pod refillable',
    ai_sales_note: 'pod refillable',
    tags: ['pod'],
    specs: {},
    ai_is_featured: false,
    ...overrides,
  };
}

function createSupabaseMock(options: {
  products: ProductRow[];
  conceptsByProductId: Record<string, Array<{ id: string; product_id: string }>>;
  directRelations: any[];
  suggestions: any[];
}) {
  const resolveProducts = (state: any) => {
    if (state.maybeSingle) {
      const idFilter = state.eqFilters.find((entry: any) => entry.field === 'id');
      if (idFilter) {
        return options.products.find((product) => product.id === idFilter.value) ?? null;
      }
    }

    return options.products;
  };

  const resolveRows = (state: any) => {
    if (state.table === 'product_concepts') {
      const productId = state.eqFilters.find((entry: any) => entry.field === 'product_id')?.value;
      return options.conceptsByProductId[productId] ?? [];
    }

    if (state.table === 'compatibility_relations') {
      const wantsConfirmedCompatible = state.eqFilters.some((entry: any) => entry.field === 'status' && entry.value === 'confirmed_compatible');
      return wantsConfirmedCompatible ? options.suggestions : options.directRelations;
    }

    return resolveProducts(state);
  };

  const buildBuilder = (table: string) => {
    const state: any = {
      table,
      eqFilters: [] as Array<{ field: string; value: unknown }>,
      inFilters: [] as Array<{ field: string; value: unknown }>,
      maybeSingle: false,
      orFilter: null as string | null,
      limitCount: null as number | null,
    };

    const builder: any = {
      select: () => builder,
      eq: (field: string, value: unknown) => {
        state.eqFilters.push({ field, value });
        return builder;
      },
      in: (field: string, value: unknown) => {
        state.inFilters.push({ field, value });
        return builder;
      },
      or: (filter: string) => {
        state.orFilter = filter;
        return builder;
      },
      limit: (count: number) => {
        state.limitCount = count;
        return builder;
      },
      order: () => builder,
      maybeSingle: () => {
        state.maybeSingle = true;
        return builder;
      },
      then: (resolve: (value: { data: unknown; error: null }) => void, reject: (reason: unknown) => void) => {
        Promise.resolve({ data: resolveRows(state), error: null }).then(resolve, reject);
      },
    };

    return builder;
  };

  return {
    from: (table: string) => buildBuilder(table),
  };
}

describe('resolveStorefrontCompatibilityCheck', () => {
  it('returns COMPATIBLE when a specific model relation is grounded', async () => {
    const anchor = makeProduct({ id: 'anchor', name: 'Caliburn G3', slug: 'caliburn-g3', sku: 'CAL-G3' });
    const candidate = makeProduct({
      id: 'candidate',
      name: 'Pod G3',
      slug: 'pod-g3',
      sku: 'POD-G3',
      stock: 8,
    });

    const supabase = createSupabaseMock({
      products: [anchor, candidate],
      conceptsByProductId: {
        [anchor.id]: [{ id: 'concept-anchor', product_id: anchor.id }],
        [candidate.id]: [{ id: 'concept-candidate', product_id: candidate.id }],
      },
      directRelations: [
        {
          concept_a_id: 'concept-anchor',
          concept_b_id: 'concept-candidate',
          relation_type: 'uses_pod',
          scope: 'specific_model',
          status: 'confirmed_compatible',
          notes: 'confirmed',
          concept_b: { product_id: candidate.id },
        },
      ],
      suggestions: [],
    });

    const resolution = await resolveStorefrontCompatibilityCheck({
      query: 'le queda a mi caliburn g3 el pod g3?',
      cartProductIds: ['anchor'],
      supabase: supabase as any,
    });

    expect(resolution.kind).toBe('COMPATIBLE');
    expect(resolution.retrievalSource).toBe('CATALOG_COMPATIBILITY_GRAPH');
    expect(resolution.signal.kind).toBe('COMPATIBLE');
    expect(resolution.signal.fit_confidence).toBe('high');
    expect(resolution.resolvedProducts.map((product) => product.slug)).toEqual([
      'caliburn-g3',
      'pod-g3',
    ]);
    expect(resolution.message).toContain('le queda');
  });

  it('returns INCOMPATIBLE when the catalog relation is explicitly negative', async () => {
    const anchor = makeProduct({ id: 'anchor', name: 'Caliburn G3', slug: 'caliburn-g3', sku: 'CAL-G3' });
    const candidate = makeProduct({
      id: 'candidate',
      name: 'Pod G3',
      slug: 'pod-g3',
      sku: 'POD-G3',
      stock: 8,
    });

    const supabase = createSupabaseMock({
      products: [anchor, candidate],
      conceptsByProductId: {
        [anchor.id]: [{ id: 'concept-anchor', product_id: anchor.id }],
        [candidate.id]: [{ id: 'concept-candidate', product_id: candidate.id }],
      },
      directRelations: [
        {
          concept_a_id: 'concept-anchor',
          concept_b_id: 'concept-candidate',
          relation_type: 'uses_pod',
          scope: 'specific_model',
          status: 'confirmed_incompatible',
          notes: 'confirmed incompatible',
          concept_b: { product_id: candidate.id },
        },
      ],
      suggestions: [],
    });

    const resolution = await resolveStorefrontCompatibilityCheck({
      query: 'le queda a mi caliburn g3 el pod g3?',
      cartProductIds: ['anchor'],
      supabase: supabase as any,
    });

    expect(resolution.kind).toBe('INCOMPATIBLE');
    expect(resolution.signal.kind).toBe('INCOMPATIBLE');
    expect(resolution.message).toContain('no le queda');
  });

  it('asks for more context when the query is too vague to ground fit truth', async () => {
    const supabase = createSupabaseMock({
      products: [],
      conceptsByProductId: {},
      directRelations: [],
      suggestions: [],
    });

    const resolution = await resolveStorefrontCompatibilityCheck({
      query: 'sirve para mi equipo?',
      cartProductIds: [],
      supabase: supabase as any,
    });

    expect(resolution.kind).toBe('NEEDS_MORE_CONTEXT');
    expect(resolution.signal.kind).toBe('NEEDS_MORE_CONTEXT');
    expect(resolution.message).toContain('modelo exacto');
  });
});
