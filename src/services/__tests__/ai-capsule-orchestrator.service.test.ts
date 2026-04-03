import { beforeEach, describe, expect, it, vi } from 'vitest';

type ProductRow = {
  id: string;
  slug: string;
  section: 'vape' | '420';
  name: string;
  price: number;
  stock: number;
  ai_is_featured: boolean;
  ai_sales_note: string | null;
  description: string | null;
  specs: Record<string, string> | null;
};

type EmbedResponse = {
  data: { embedding: number[] } | null;
  error: { message: string } | null;
};

type RpcResponse = {
  data: ProductRow[];
  error: { message: string } | null;
};

const mockState = vi.hoisted(() => ({
  exactData: [] as ProductRow[],
  tokenData: [] as ProductRow[],
  snapshotData: [] as ProductRow[],
  hydrateData: [] as Array<{ id: string; specs: Record<string, string> | null }>,
  embedResponse: { data: null, error: null } as EmbedResponse,
  rpcResponse: { data: [], error: null } as RpcResponse,
  exactQueries: 0,
  tokenQueries: 0,
  snapshotQueries: 0,
  hydrateQueries: 0,
  functionInvokes: 0,
  rpcCalls: 0,
}));

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn((table: string) => {
    if (table !== 'products') {
      throw new Error(`Unexpected table: ${table}`);
    }

    const queryState = { mode: 'unknown' as 'unknown' | 'exact' | 'token' };
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      ilike: vi.fn(() => {
        queryState.mode = 'exact';
        mockState.exactQueries += 1;
        return builder;
      }),
      or: vi.fn(() => {
        queryState.mode = 'token';
        mockState.tokenQueries += 1;
        return builder;
      }),
      in: vi.fn(() => {
        mockState.hydrateQueries += 1;
        return Promise.resolve({ data: mockState.hydrateData, error: null });
      }),
      limit: vi.fn(() => {
        if (queryState.mode === 'exact') {
          return Promise.resolve({ data: mockState.exactData, error: null });
        }

        if (queryState.mode === 'token') {
          return Promise.resolve({ data: mockState.tokenData, error: null });
        }

        mockState.snapshotQueries += 1;
        return Promise.resolve({ data: mockState.snapshotData, error: null });
      }),
    };

    return builder;
  }),
  functions: {
    invoke: vi.fn(async () => {
      mockState.functionInvokes += 1;
      return mockState.embedResponse;
    }),
  },
  rpc: vi.fn(async () => {
    mockState.rpcCalls += 1;
    return mockState.rpcResponse;
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

import { executeProductSearchCapsule } from '../ai-capsule-orchestrator.service';

function makeRow(overrides?: Partial<ProductRow>): ProductRow {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'waka-somatch-menta',
    section: 'vape',
    name: 'Waka Somatch Menta',
    price: 299,
    stock: 10,
    ai_is_featured: false,
    ai_sales_note: 'menta fresca',
    description: 'Disposable de menta.',
    specs: { Sabor: 'Menta', Puffs: '6000' },
    ...overrides,
  };
}

describe('executeProductSearchCapsule token recovery boundaries', () => {
  beforeEach(() => {
    mockState.exactData = [];
    mockState.tokenData = [];
    mockState.snapshotData = [];
    mockState.hydrateData = [];
    mockState.embedResponse = { data: null, error: { message: 'not-called' } };
    mockState.rpcResponse = { data: [], error: null };
    mockState.exactQueries = 0;
    mockState.tokenQueries = 0;
    mockState.snapshotQueries = 0;
    mockState.hydrateQueries = 0;
    mockState.functionInvokes = 0;
    mockState.rpcCalls = 0;
    vi.clearAllMocks();
  });

  it('activates token recovery only when requires_semantic_expansion is false', async () => {
    mockState.tokenData = [makeRow()];

    const contract = await executeProductSearchCapsule({
      query: 'waka somatch mb6000',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    });

    expect(contract.match_strategy).toBe('TOKEN_RECOVERY');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(mockState.tokenQueries).toBe(1);
    expect(mockState.functionInvokes).toBe(0);
    expect(mockState.rpcCalls).toBe(0);
  });

  it('activates token recovery when semantic expansion produces no matches but tokens still ground the turn', async () => {
    mockState.tokenData = [
      makeRow({
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Vape Tropical Ice',
        slug: 'vape-tropical-ice',
        description: 'Perfil tropical y fresco para diario.',
        specs: { Sabor: 'Tropical' },
      }),
    ];
    mockState.embedResponse = { data: { embedding: [0.1, 0.2, 0.3] }, error: null };
    mockState.rpcResponse = { data: [], error: null };

    const contract = await executeProductSearchCapsule({
      query: 'algo frutal y fresco',
      is_ambiguous: false,
      requires_semantic_expansion: true,
    });

    expect(contract.match_strategy).toBe('TOKEN_RECOVERY');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.resolved_products?.map((product) => product.name)).toContain('Vape Tropical Ice');
    expect(mockState.tokenQueries).toBe(1);
    expect(mockState.functionInvokes).toBe(1);
    expect(mockState.rpcCalls).toBe(1);
  });

  it('does not promote weak lexical overlap into a nearby match', async () => {
    mockState.tokenData = [
      makeRow({
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Menta Basica',
        slug: 'menta-basica',
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'waka somatch mb6000',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.retrieval_source).toBe('NONE');
    expect(mockState.tokenQueries).toBe(1);
    expect(mockState.functionInvokes).toBe(0);
    expect(mockState.rpcCalls).toBe(0);
  });

  it('preserves true semantic recovery as a separate path', async () => {
    mockState.embedResponse = { data: { embedding: [0.1, 0.2, 0.3] }, error: null };
    mockState.rpcResponse = {
      data: [
        makeRow({
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Vape Tropical Ice',
          slug: 'vape-tropical-ice',
        }),
      ],
      error: null,
    };
    mockState.hydrateData = [
      { id: '33333333-3333-3333-3333-333333333333', specs: { Sabor: 'Tropical', Puffs: '8000' } },
    ];

    const contract = await executeProductSearchCapsule({
      query: 'algo tropical y fresco',
      is_ambiguous: false,
      requires_semantic_expansion: true,
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.retrieval_source).toBe('EMBEDDING_SEMANTIC');
    expect(mockState.tokenQueries).toBe(0);
    expect(mockState.functionInvokes).toBe(1);
    expect(mockState.rpcCalls).toBe(1);
  });

  it('recovers an exploratory unknown-brand turn with guided catalog grounding instead of collapsing to no-match', async () => {
    mockState.embedResponse = { data: { embedding: [0.1, 0.2, 0.3] }, error: null };
    mockState.rpcResponse = { data: [], error: null };
    mockState.snapshotData = [
      makeRow({
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Pod System Starter Kit',
        slug: 'pod-system-starter-kit',
        description: 'Kit sencillo para empezar a vapear diario.',
        specs: { Tipo: 'Pod' },
      }),
      makeRow({
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Mini Mod 40W Stealth',
        slug: 'mini-mod-40w-stealth',
        price: 650,
        description: 'Mod compacto de bolsillo.',
        specs: { Potencia: '40W' },
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'busco un waka pero no se cual',
      is_ambiguous: true,
      requires_semantic_expansion: true,
    });

    expect(contract.match_strategy).toBe('FEATURED_FALLBACK');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.resolved_products?.length).toBeGreaterThan(0);
    expect(contract.customer_response_draft).toContain('Veo varias opciones que podrian encajar');
    expect(mockState.snapshotQueries).toBe(1);
  });

  it('recovers an attribute-led narrowing turn from real catalog grounding instead of dropping to no-match', async () => {
    mockState.snapshotData = [
      makeRow({
        id: '66666666-6666-6666-6666-666666666666',
        name: 'E-Liquid Mentolado Ice 120ml 3mg',
        slug: 'eliquid-mentolado-ice-120ml-3mg',
        price: 220,
        description: 'Liquido mentolado fresco y accesible para diario.',
        specs: { Nicotina: '3mg' },
      }),
      makeRow({
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        price: 260,
        description: 'Sales con sandia y menta fresca.',
        specs: { Nicotina: '35mg' },
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'de menta y no muy caro',
      is_ambiguous: true,
      requires_semantic_expansion: true,
    });

    expect(contract.match_strategy).toBe('FEATURED_FALLBACK');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.resolved_products?.map((product) => product.name)).toContain('E-Liquid Mentolado Ice 120ml 3mg');
    expect(contract.customer_response_draft).toContain('Veo varias opciones que podrian encajar');
  });

  it('recovers mixed product needs with both a small device and a grape liquid when both are grounded', async () => {
    mockState.snapshotData = [
      makeRow({
        id: '88888888-8888-8888-8888-888888888888',
        name: 'Mini Mod 40W Stealth',
        slug: 'mini-mod-40w-stealth',
        price: 650,
        description: 'Mod ultra compacto de bolsillo.',
        specs: { Potencia: '40W' },
      }),
      makeRow({
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Juicee Uva 60 ml',
        slug: 'juicee-uva-60-ml',
        price: 200,
        description: 'Liquido sabor uva para vapear diario.',
        specs: { Sabor: 'Uva' },
      }),
      makeRow({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Pod System Starter Kit',
        slug: 'pod-system-starter-kit',
        price: 480,
        description: 'Pod sencillo y compacto.',
        specs: { Tipo: 'Pod' },
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'quiero un vape chico y ademas un liquido de uva',
      is_ambiguous: true,
      requires_semantic_expansion: true,
    });

    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.resolved_products?.map((product) => product.name)).toEqual(
      expect.arrayContaining(['Mini Mod 40W Stealth', 'Juicee Uva 60 ml']),
    );
    expect(contract.match_strategy === 'FEATURED_FALLBACK' || contract.match_strategy === 'TOKEN_RECOVERY' || contract.match_strategy === 'SEMANTIC').toBe(true);
  });

  it('recovers a near-exact missing product turn with honest alternatives instead of a dead-end no-match', async () => {
    mockState.snapshotData = [
      makeRow({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Pod System Starter Kit',
        slug: 'pod-system-starter-kit',
        description: 'Kit sencillo para empezar a vapear.',
        specs: { Tipo: 'Pod' },
      }),
      makeRow({
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Vape Pen 22mm',
        slug: 'vape-pen-22mm',
        description: 'Dispositivo compacto para uso diario.',
        specs: { Tipo: 'Pen' },
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'no encuentro el waka somatch mb6000',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    });

    expect(contract.match_strategy).not.toBe('NO_MATCH');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.resolved_products?.length).toBeGreaterThan(0);
    expect(contract.customer_response_draft).toContain('No encontre');
  });
});
