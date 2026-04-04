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

const resolveStorefrontPromotionSignalMock = vi.hoisted(() => vi.fn(async () => null) as any);
const resolveStorefrontReplenishmentSignalMock = vi.hoisted(() => vi.fn(async () => null) as any);
const resolveStorefrontCheckoutReadinessMock = vi.hoisted(() => vi.fn(async () => null) as any);
const resolveStorefrontInventoryOutlookMock = vi.hoisted(() => vi.fn(async () => null) as any);

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

vi.mock('../storefront-promotions.service', () => ({
  resolveStorefrontPromotionSignal: (...args: any[]) => resolveStorefrontPromotionSignalMock(...args),
}));

vi.mock('../storefront-replenishment.service', () => ({
  resolveStorefrontReplenishmentSignal: (...args: any[]) => resolveStorefrontReplenishmentSignalMock(...args),
}));

vi.mock('../storefront-checkout-readiness.service', () => ({
  resolveStorefrontCheckoutReadiness: (...args: any[]) => resolveStorefrontCheckoutReadinessMock(...args),
}));

vi.mock('../storefront-inventory-outlook.service', () => ({
  resolveStorefrontInventoryOutlook: (...args: any[]) => resolveStorefrontInventoryOutlookMock(...args),
}));

import { executeProductSearchCapsule, executeStorefrontCheckoutReadinessCapsule, executeStorefrontInventoryOutlookCapsule } from '../ai-capsule-orchestrator.service';

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
    resolveStorefrontPromotionSignalMock.mockReset();
    resolveStorefrontPromotionSignalMock.mockResolvedValue(null);
    resolveStorefrontReplenishmentSignalMock.mockReset();
    resolveStorefrontReplenishmentSignalMock.mockResolvedValue(null);
    resolveStorefrontCheckoutReadinessMock.mockReset();
    resolveStorefrontCheckoutReadinessMock.mockResolvedValue(null);
    resolveStorefrontInventoryOutlookMock.mockReset();
    resolveStorefrontInventoryOutlookMock.mockResolvedValue(null);
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

  it('recovers a product-fact follow-up from live-like catalog grounding instead of collapsing to no-match', async () => {
    mockState.snapshotData = [
      makeRow({
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        price: 260,
        description: 'Sabor a sandia dulce con toque de menta fresca en sales de nicotina.',
        specs: { Nicotina: '35mg' },
      }),
      makeRow({
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'E-Liquid Mentolado Ice 120ml 3mg',
        slug: 'eliquid-mentolado-ice-120ml-3mg',
        price: 220,
        description: 'Liquido mentolado fresco y accesible para diario.',
        specs: { Nicotina: '3mg' },
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'que nicotina trae mint fresh',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    });

    expect(contract.match_strategy).not.toBe('NO_MATCH');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.resolved_products?.map((product) => product.name)).toContain('Nic Salt Sandia Mint 30ml 35mg');
    expect(contract.customer_response_draft).toContain('35mg');
  });

  it('hydrates variant truth from live-like catalog rows and steps down when the exact variant is missing', async () => {
    mockState.exactData = [
      makeRow({
        id: 'ffff1111-1111-1111-1111-111111111111',
        name: 'Waka Pod Rojo',
        slug: 'waka-pod-rojo',
        variants: [
          {
            id: 'variant-blue',
            product_id: 'ffff1111-1111-1111-1111-111111111111',
            sku: 'WAKA-BLUE',
            price: null,
            stock: 6,
            is_active: true,
            options: [
              {
                variant_id: 'variant-blue',
                attribute_value_id: 'value-blue',
                attribute_value: {
                  value: 'Azul',
                  attribute: { name: 'Color' },
                },
              },
            ],
          },
        ],
      }),
    ];

    const contract = await executeProductSearchCapsule({
      query: 'waka pod rojo',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.resolved_products).toEqual([]);
    expect(contract.search_confidence).toBeLessThan(0.9);
    expect(contract.customer_response_draft).toContain('El producto existe, pero la variante pedida rojo no esta disponible ahorita.');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('hydrates a bounded promotion signal onto the capsule when real promotion truth is available', async () => {
    mockState.exactData = [makeRow()];
    resolveStorefrontPromotionSignalMock.mockResolvedValue({
      kind: 'FLASH_DEAL',
      product_id: '11111111-1111-1111-1111-111111111111',
      product_name: 'Waka Somatch Menta',
      flash_price: 249,
      original_price: 299,
      savings_amount: 50,
      ends_at: '2026-04-05T00:00:00.000Z',
      informational_only: true,
    });

    const contract = await executeProductSearchCapsule({
      query: 'waka somatch menta',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    });

    expect(resolveStorefrontPromotionSignalMock).toHaveBeenCalled();
    expect(contract.promotion_signal).toEqual({
      kind: 'FLASH_DEAL',
      product_id: '11111111-1111-1111-1111-111111111111',
      product_name: 'Waka Somatch Menta',
      flash_price: 249,
      original_price: 299,
      savings_amount: 50,
      ends_at: '2026-04-05T00:00:00.000Z',
      informational_only: true,
    });
  });

  it('short-circuits into authenticated reorder truth when replenishment intent resolves against current catalog reality', async () => {
    resolveStorefrontReplenishmentSignalMock.mockResolvedValue({
      signal: {
        kind: 'READY',
        source_order_id: '99999999-9999-9999-9999-999999999999',
        source_order_created_at: '2026-04-01T00:00:00.000Z',
        source_phrase: 'LO_DE_SIEMPRE',
        primary_product: {
          id: '77777777-7777-7777-7777-777777777777',
          name: 'Pods Mango',
          slug: 'pods-mango',
          section: 'vape',
        },
        variant_id: '88888888-8888-8888-8888-888888888888',
        variant_label: 'Mango',
        quantity: 2,
        requested_quantity: 2,
        blocked_item_count: 0,
        partial_quantity: false,
        action_mode: 'ADD_TO_CART',
        blocked_reason_detail: null,
      },
      resolvedProduct: {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Pods Mango',
        slug: 'pods-mango',
        description: null,
        short_description: null,
        price: 320,
        compare_at_price: null,
        stock: 12,
        sku: null,
        section: 'vape',
        category_id: 'cat-1',
        tags: [],
        status: 'active',
        images: [],
        cover_image: null,
        is_featured: false,
        is_featured_until: null,
        is_new: false,
        is_new_until: null,
        is_bestseller: false,
        is_bestseller_until: null,
        is_active: true,
        created_at: '2026-04-01T00:00:00.000Z',
        updated_at: '2026-04-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    });

    const contract = await executeProductSearchCapsule({
      query: 'lo de siempre',
      is_ambiguous: false,
      requires_semantic_expansion: false,
    }, {
      customerId: 'customer-1',
    });

    expect(resolveStorefrontReplenishmentSignalMock).toHaveBeenCalledWith({
      customerId: 'customer-1',
      query: 'lo de siempre',
    });
    expect(mockState.exactQueries).toBe(0);
    expect(mockState.functionInvokes).toBe(0);
    expect(contract.retrieval_source).toBe('AUTHENTICATED_REORDER');
    expect(contract.replenishment_signal?.action_mode).toBe('ADD_TO_CART');
    expect(contract.customer_response_draft).toContain('Revise tu historial real');
  });

  it('maps the bounded inventory outlook resolver into the storefront inventory capsule contract', async () => {
    resolveStorefrontCheckoutReadinessMock.mockResolvedValue({
      kind: 'READY_TO_CHECKOUT',
      message: 'Si, tu carrito actual ya puede pasar a checkout sin cambios pendientes.',
      matchStrategy: 'READY_TO_CHECKOUT',
      retrievalSource: 'CART_VALIDATION',
      signal: {
        kind: 'READY_TO_CHECKOUT',
        focus: 'checkout',
        scope: 'CART_VALIDATION',
        cart_item_count: 2,
        purchasable_item_count: 2,
        checkout_status: 'ready',
        delivery_type: 'pickup',
        payment_method: 'transfer',
        enabled_payment_methods: ['transfer', 'mercadopago'],
        missing_fields: [],
        blocker_reason: 'none',
        can_proceed_to_checkout: true,
        can_submit_checkout: true,
        open_order_id: null,
        open_order_number: null,
        coupon_code: null,
        coupon_valid: null,
        coupon_message: null,
        shipping_quote_available: null,
      },
    });

    const contract = await executeStorefrontCheckoutReadinessCapsule({
      query: 'ya puedo pagar?',
    }, {
      customerId: 'customer-1',
    });

    expect(resolveStorefrontCheckoutReadinessMock).toHaveBeenCalledWith({
      customerId: 'customer-1',
      query: 'ya puedo pagar?',
    });
    expect(contract.capsule_name).toBe('storefront_checkout_readiness');
    expect(contract.execution_status).toBe('SUCCESS');
    expect(contract.match_strategy).toBe('READY_TO_CHECKOUT');
    expect(contract.retrieval_source).toBe('CART_VALIDATION');
    expect(contract.checkout_readiness_signal.kind).toBe('READY_TO_CHECKOUT');
    expect(contract.checkout_readiness_signal.can_submit_checkout).toBe(true);
  });

  it('maps the bounded inventory outlook resolver into the storefront inventory capsule contract', async () => {
    resolveStorefrontInventoryOutlookMock.mockResolvedValue({
      kind: 'IN_STOCK_ONLINE',
      message: 'Ahorita Caliburn G3 si aparece disponible en linea.',
      matchStrategy: 'CATALOG_IN_STOCK_ONLINE',
      retrievalSource: 'CATALOG_ONLINE_STOCK',
      resolvedProducts: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Caliburn G3',
          slug: 'caliburn-g3',
          section: 'vape',
        },
      ],
      signal: {
        kind: 'IN_STOCK_ONLINE',
        scope: 'ONLINE_ONLY',
        product: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Caliburn G3',
          slug: 'caliburn-g3',
          section: 'vape',
        },
        variant_id: null,
        variant_label: null,
        current_stock: 12,
        stock_basis: 'product',
        omnichannel_label: null,
        restock_eta: null,
        days_until_out: 6,
        depletion_date: '2026-04-09',
        urgency_level: 'medium',
        signal_quality: 'high',
      },
    });

    const contract = await executeStorefrontInventoryOutlookCapsule({
      query: 'todavia hay stock del caliburn g3?',
    });

    expect(resolveStorefrontInventoryOutlookMock).toHaveBeenCalledWith({
      query: 'todavia hay stock del caliburn g3?',
    });
    expect(contract.capsule_name).toBe('storefront_inventory_outlook');
    expect(contract.execution_status).toBe('SUCCESS');
    expect(contract.match_strategy).toBe('CATALOG_IN_STOCK_ONLINE');
    expect(contract.retrieval_source).toBe('CATALOG_ONLINE_STOCK');
    expect(contract.inventory_outlook_signal.kind).toBe('IN_STOCK_ONLINE');
    expect(contract.resolved_products?.[0]?.slug).toBe('caliburn-g3');
  });
});
