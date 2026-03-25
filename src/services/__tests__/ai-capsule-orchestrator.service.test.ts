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
  hydrateData: [] as Array<{ id: string; specs: Record<string, string> | null }>,
  embedResponse: { data: null, error: null } as EmbedResponse,
  rpcResponse: { data: [], error: null } as RpcResponse,
  exactQueries: 0,
  tokenQueries: 0,
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

        return Promise.resolve({ data: [], error: null });
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
    mockState.hydrateData = [];
    mockState.embedResponse = { data: null, error: { message: 'not-called' } };
    mockState.rpcResponse = { data: [], error: null };
    mockState.exactQueries = 0;
    mockState.tokenQueries = 0;
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

  it('does not activate token recovery when requires_semantic_expansion is true', async () => {
    mockState.tokenData = [makeRow()];
    mockState.embedResponse = { data: { embedding: [0.1, 0.2, 0.3] }, error: null };
    mockState.rpcResponse = { data: [], error: null };

    const contract = await executeProductSearchCapsule({
      query: 'algo frutal y fresco',
      is_ambiguous: false,
      requires_semantic_expansion: true,
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.retrieval_source).toBe('NONE');
    expect(mockState.tokenQueries).toBe(0);
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
});
