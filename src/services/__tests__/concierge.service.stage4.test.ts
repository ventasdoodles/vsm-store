import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn<any>();
const insertMock = vi.fn<any>();
const executeProductSearchCapsuleMock = vi.fn<any>();
const executeStorefrontBudgetRescueCapsuleMock = vi.fn<any>();
const executeStorefrontCheckoutReadinessCapsuleMock = vi.fn<any>();
const executeStorefrontCompatibilityCheckCapsuleMock = vi.fn<any>();
const executeStorefrontInventoryOutlookCapsuleMock = vi.fn<any>();
const executeStorefrontKittingBasketCapsuleMock = vi.fn<any>();
const executeAuthenticatedOrderTrackingCapsuleMock = vi.fn<any>();
const executeAuthenticatedWarrantyTriageCapsuleMock = vi.fn<any>();
const executeAuthenticatedLoyaltyStatusCapsuleMock = vi.fn<any>();
const getProductsByIdsMock = vi.fn<any>();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => (invokeMock as any)(args[0], args[1]),
    },
    from: vi.fn(() => ({
      insert: (...args: unknown[]) => (insertMock as any)(args[0]),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

vi.mock('@/services/ai-capsule-orchestrator.service', () => ({
  executeProductSearchCapsule: (...args: unknown[]) => (executeProductSearchCapsuleMock as any)(args[0]),
  executeStorefrontBudgetRescueCapsule: (...args: unknown[]) => (executeStorefrontBudgetRescueCapsuleMock as any)(args[0]),
  executeStorefrontCheckoutReadinessCapsule: (...args: unknown[]) => (executeStorefrontCheckoutReadinessCapsuleMock as any)(args[0], args[1]),
  executeStorefrontCompatibilityCheckCapsule: (...args: unknown[]) => (executeStorefrontCompatibilityCheckCapsuleMock as any)(args[0]),
  executeStorefrontInventoryOutlookCapsule: (...args: unknown[]) => (executeStorefrontInventoryOutlookCapsuleMock as any)(args[0]),
  executeStorefrontKittingBasketCapsule: (...args: unknown[]) => (executeStorefrontKittingBasketCapsuleMock as any)(args[0]),
  executeKnowledgeCapsule: vi.fn(),
  executeCartOperatorCapsule: vi.fn(),
  executeAuthenticatedOrderTrackingCapsule: (...args: unknown[]) => (executeAuthenticatedOrderTrackingCapsuleMock as any)(args[0], args[1]),
  executeAuthenticatedWarrantyTriageCapsule: (...args: unknown[]) => (executeAuthenticatedWarrantyTriageCapsuleMock as any)(args[0], args[1]),
  executeAuthenticatedLoyaltyStatusCapsule: (...args: unknown[]) => (executeAuthenticatedLoyaltyStatusCapsuleMock as any)(args[0], args[1]),
}));

vi.mock('@/lib/pilot-activation', () => ({
  isPilotActive: () => true,
}));

vi.mock('@/services/products.service', () => ({
  getProductsByIds: (...args: unknown[]) => (getProductsByIdsMock as any)(args[0]),
}));

import { conciergeService } from '../concierge.service';

describe('conciergeService Stage 4 adaptive conversation', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    insertMock.mockClear();
    executeProductSearchCapsuleMock.mockReset();
    executeStorefrontBudgetRescueCapsuleMock.mockReset();
    executeStorefrontCheckoutReadinessCapsuleMock.mockReset();
    executeStorefrontCompatibilityCheckCapsuleMock.mockReset();
    executeStorefrontInventoryOutlookCapsuleMock.mockReset();
    executeStorefrontKittingBasketCapsuleMock.mockReset();
    executeAuthenticatedOrderTrackingCapsuleMock.mockReset();
    executeAuthenticatedWarrantyTriageCapsuleMock.mockReset();
    executeAuthenticatedLoyaltyStatusCapsuleMock.mockReset();
    getProductsByIdsMock.mockReset();
  });

  it('trusts the explicit edge telemetry contract over the legacy boolean when deciding client fallback logging', async () => {
    invokeMock.mockResolvedValue({
      data: {
        text: 'Respuesta ya persistida por edge.',
        intent: 'info',
        requires_client_capsule: false,
        server_telemetry_logged: false,
        telemetry_contract: {
          owner: 'edge',
          edge_logged: true,
          client_should_log_fallback: false,
          reason: 'edge_logged',
        },
        turn_profile: {
          primary_intent: 'CHIT_CHAT',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'DIRECT_ANSWER',
          turn_focus: null,
        },
        catalog_gate: {
          is_open: true,
          reason: 'explicit_product_request',
          explicit_product_request: true,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('hola', []);

    expect(response.message).toContain('Respuesta ya persistida por edge.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('adapts a broad returning-user recommendation into a shorter direct path', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'recomiendame algo para diario',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        memory_context: {
          preference_summary: {
            confirmed_likes: ['menta'],
            explicit_likes: [],
            weak_tendencies: [],
            rejected_preferences: ['dulce'],
            format_preferences: [],
            brand_affinity: [],
            budget_posture: 'cuida precio',
            intensity_posture: null,
            experience_posture: null,
          },
        },
        conversational_prefix: 'A ver, ya te voy ubicando un poco.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Te dejo unas opciones que si te pueden caer.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
        {
          id: 'berry',
          slug: 'berry-chill',
          section: 'vape',
          name: 'Berry Chill',
          display_price: '$280',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'frutal suave',
          description: 'frutal',
          specs: null,
        },
        {
          id: 'sweet',
          slug: 'sweet-rush',
          section: 'vape',
          name: 'Sweet Rush',
          display_price: '$420',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'dulce intenso',
          description: 'dulce cremoso',
          specs: null,
        },
      ],
    });
    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'berry',
        slug: 'berry-chill',
        section: 'vape',
        name: 'Berry Chill',
        description: null,
        short_description: null,
        price: 280,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('recomiendame algo para diario', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.catalog_gate?.reason).toBe('search_leading');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint', 'berry']);
    expect(response.message).toContain('A ver, ya te voy ubicando un poco.');
    expect(response.message).not.toContain('yo arrancaria');
    expect((response.message.match(/A ver, ya te voy ubicando un poco\./g) ?? []).length).toBe(1);
    expect((response as any).capsule_contract?.next_step_view?.guidance).toBe('Mint Fresh y Berry Chill son los dos que mas sentido traen; yo compararia esos antes de decidir.');
    expect((response as any).capsule_contract?.next_step_view?.family).toBe('COMPARE_TWO');
  });

  it('surfaces a bounded cheaper trade-down through existing product and next-step structures', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'storefront_budget_rescue',
        tool_args: {
          query: 'algo parecido pero mas barato al caliburn g3',
        },
        turn_profile: {
          primary_intent: 'BUDGET_RESCUE',
          secondary_intents: ['PRODUCT_SEARCH'],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: 'budget',
        },
        catalog_gate: {
          is_open: true,
          reason: 'search_leading',
          explicit_product_request: false,
          search_leading: true,
          clarification_required: false,
        },
        conversational_prefix: 'Va, lo aterrizo por precio.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'BUDGET_RESCUE',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeStorefrontBudgetRescueCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_budget_rescue',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'CHEAPER_ALTERNATIVE_FOUND',
      customer_response_draft: 'Si quieres bajar gasto sin salirte tanto de Caliburn G3, te dejo estas opciones mas accesibles y en stock.',
      retrieval_source: 'CATALOG_ANCHORED_PRODUCT',
      resolved_products: [
        { id: 'budget-1', name: 'Caliburn AK3', slug: 'caliburn-ak3', section: 'vape' },
        { id: 'budget-2', name: 'Caliburn A2S', slug: 'caliburn-a2s', section: 'vape' },
      ],
      budget_rescue_signal: {
        kind: 'CHEAPER_ALTERNATIVE_FOUND',
        scope: 'ANCHORED_PRODUCT',
        anchor_product: { id: 'anchor-1', name: 'Caliburn G3', slug: 'caliburn-g3', section: 'vape' },
        cheaper_product: { id: 'budget-1', name: 'Caliburn AK3', slug: 'caliburn-ak3', section: 'vape' },
        anchor_price: 499,
        cheaper_price: 399,
        savings_amount: 100,
        alternative_count: 2,
        compatibility_sensitive: false,
        used_cart_context: false,
        anchored_by: 'query_product_match',
      },
    });
    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'budget-1',
        slug: 'caliburn-ak3',
        section: 'vape',
        name: 'Caliburn AK3',
        description: null,
        short_description: null,
        price: 399,
        compare_at_price: null,
        stock: 7,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'budget-2',
        slug: 'caliburn-a2s',
        section: 'vape',
        name: 'Caliburn A2S',
        description: null,
        short_description: null,
        price: 359,
        compare_at_price: null,
        stock: 9,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('algo parecido pero mas barato al caliburn g3', []);

    expect(response.intent).toBe('recommendation');
    expect(response.turn_analysis?.primary_intent).toBe('BUDGET_RESCUE');
    expect(response.suggestedProducts?.length).toBe(2);
    expect(response.capsule_contract?.next_step_view?.family).toBe('COMPARE_TWO');
  });

  it('keeps authenticated warranty triage message-only and bound to support context', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'authenticated_warranty_triage',
        tool_args: {
          query: 'mi pod llego roto',
        },
        conversational_prefix: 'Ya vi por donde va.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'WARRANTY_SUPPORT',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeAuthenticatedWarrantyTriageCapsuleMock.mockResolvedValue({
      capsule_name: 'authenticated_warranty_triage',
      execution_status: 'SUCCESS',
      match_strategy: 'AUTHENTICATED_SINGLE_ITEM_ORDER',
      customer_response_draft: 'Si ubico tu pod en un pedido reciente y si conviene seguirlo por soporte.',
      retrieval_source: 'AUTHENTICATED_RECENT_ORDER',
      warranty_triage_signal: {
        kind: 'LIKELY_ELIGIBLE',
        defect_type: 'broken_on_arrival',
        scope: 'RECENT_FULFILLED_ORDERS',
        order_id: 'order-1',
        order_number: 'VSM-123',
        order_status: 'delivered',
        matched_item_name: 'OXBAR Pod',
        matched_product_id: 'product-1',
        matched_variant_id: 'variant-1',
        days_since_order: 4,
        policy_window_days: 90,
        matched_by: 'single_item_order',
      },
    });

    const response = await conciergeService.chat('mi pod llego roto', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    expect(response.intent).toBe('support');
    expect(response.message).toContain('Ya vi por donde va.');
    expect(response.suggestedProducts).toBeUndefined();
    expect(response.catalog_gate?.is_open).toBe(false);
    expect((response as any).capsule_contract?.warranty_triage_signal?.kind).toBe('LIKELY_ELIGIBLE');
  });

  it('surfaces a bounded kitting basket as a coherent storefront recommendation set', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'storefront_kitting_basket',
        tool_args: {
          query: 'armame un kit con pods y liquido al 5%',
          flavor_preference: 'mango',
          nicotine_preference: '5%',
          format_preference: 'pods',
          upgrade_intent: true,
          wants_device: true,
          wants_consumable: true,
          wants_liquid: true,
        },
        conversational_prefix: 'Va, te lo aterrizo.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'KIT_ASSEMBLY',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeStorefrontKittingBasketCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_kitting_basket',
      execution_status: 'SUCCESS',
      match_strategy: 'FULL_KIT',
      customer_response_draft: 'Te arme un kit compatible y en stock: Nova Pod Kit + Nova Pod + Mango Ice 5%.',
      retrieval_source: 'CATALOG_KITTING',
      resolved_products: [
        { id: 'kit-base', name: 'Nova Pod Kit', slug: 'nova-pod-kit', section: 'vape' },
        { id: 'kit-pod', name: 'Nova Pod', slug: 'nova-pod', section: 'vape' },
        { id: 'kit-liquid', name: 'Mango Ice 5%', slug: 'mango-ice-5', section: 'vape' },
      ],
      kitting_signal: {
        kind: 'FULL_KIT',
        setup_focus: 'starter_kit',
        scope: 'CATALOG_KIT',
        base_product: { id: 'kit-base', name: 'Nova Pod Kit', slug: 'nova-pod-kit', section: 'vape' },
        consumable_product: { id: 'kit-pod', name: 'Nova Pod', slug: 'nova-pod', section: 'vape' },
        liquid_product: { id: 'kit-liquid', name: 'Mango Ice 5%', slug: 'mango-ice-5', section: 'vape' },
        missing_piece: null,
        flavor_preference: 'mango',
        nicotine_preference: '5%',
        format_preference: 'pods',
        upgrade_intent: true,
        wants_device: true,
        wants_consumable: true,
        wants_liquid: true,
        kit_size: 3,
      },
    });
    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'kit-base',
        slug: 'nova-pod-kit',
        section: 'vape',
        name: 'Nova Pod Kit',
        description: null,
        short_description: null,
        price: 599,
        compare_at_price: null,
        stock: 8,
        sku: null,
        category_id: 'cat-kit',
        tags: ['kit'],
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'kit-pod',
        slug: 'nova-pod',
        section: 'vape',
        name: 'Nova Pod',
        description: null,
        short_description: null,
        price: 199,
        compare_at_price: null,
        stock: 20,
        sku: null,
        category_id: 'cat-pod',
        tags: ['pod'],
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'kit-liquid',
        slug: 'mango-ice-5',
        section: 'vape',
        name: 'Mango Ice 5%',
        description: null,
        short_description: null,
        price: 169,
        compare_at_price: null,
        stock: 12,
        sku: null,
        category_id: 'cat-liquid',
        tags: ['liquid'],
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('armame un kit con pods y liquido al 5%', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    expect(response.intent).toBe('recommendation');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['kit-base', 'kit-pod', 'kit-liquid']);
    expect(response.catalog_gate?.is_open).toBe(true);
    expect((response as any).capsule_contract?.kitting_signal?.kind).toBe('FULL_KIT');
    expect((response as any).capsule_contract?.next_step_view?.family).toBe('REVIEW_ONE');
  });

  it('records a compact compare-worthy commercial move on the active turn instead of leaving it to late-stage reinterpretation', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'entre esos dos cual conviene mas',
          is_ambiguous: false,
          requires_semantic_expansion: true,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'SEMANTIC',
      customer_response_draft: 'Traigo dos cercanas para compararlas bien.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
        {
          id: 'berry',
          slug: 'berry-chill',
          section: 'vape',
          name: 'Berry Chill',
          display_price: '$280',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'frutal suave',
          description: 'frutal',
          specs: null,
        },
      ],
    });
    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'berry',
        slug: 'berry-chill',
        section: 'vape',
        name: 'Berry Chill',
        description: null,
        short_description: null,
        price: 280,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('entre esos dos cual conviene mas', []);

    expect(response.turn_analysis?.commercial_move).toBe('COMPARE_TWO');
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('COMPARE_TWO');
    expect((response as any).capsule_contract?.next_step_view?.family).toBe('COMPARE_TWO');
  });

  it('keeps an upstream add-ready move downgraded only to selector-needed on the real service path when a purchase-defining selector is still missing', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'me llevo ese waka',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Ese ya viene bien encaminado.',
      resolved_products: [
        {
          id: 'waka',
          slug: 'waka-pod',
          section: 'vape',
          name: 'Waka Pod',
          display_price: '$299',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'pod recargable',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'waka',
        slug: 'waka-pod',
        section: 'vape',
        name: 'Waka Pod',
        description: null,
        short_description: null,
        price: 299,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [
          {
            id: 'waka-variant-1',
            product_id: 'waka',
            sku: null,
            price: null,
            stock: 10,
            images: [],
            is_active: true,
            options: [
              {
                variant_id: 'waka-variant-1',
                attribute_value_id: 'waka-value-1',
                attribute_name: 'Sabor',
                attribute_value: {
                  id: 'waka-value-1',
                  attribute_id: 'attr-sabor',
                  value: 'Menta',
                },
              },
            ],
          },
          {
            id: 'waka-variant-2',
            product_id: 'waka',
            sku: null,
            price: null,
            stock: 10,
            images: [],
            is_active: true,
            options: [
              {
                variant_id: 'waka-variant-2',
                attribute_value_id: 'waka-value-2',
                attribute_name: 'Sabor',
                attribute_value: {
                  id: 'waka-value-2',
                  attribute_id: 'attr-sabor',
                  value: 'Mango',
                },
              },
            ],
          },
        ],
      },
    ]);

    const response = await conciergeService.chat('me llevo ese waka', []);

    expect(response.turn_analysis?.commercial_move).toBe('ADD_READY');
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('ADD_READY');
    expect((response as any).capsule_contract?.next_step_view?.family).toBe('SELECTOR_NEEDED');
    expect((response as any).capsule_contract?.next_step_view?.missingSelector).toBe('sabor');
    expect((response as any).capsule_contract?.next_step_view?.primaryAction?.label).toBe('Revisar Waka Pod');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'PRODUCT_SEARCH',
      current_turn_decision: 'USE_CAPABILITY',
      turn_focus: null,
      catalog_gate_open: true,
      catalog_gate_reason: 'search_leading',
      next_step_family: 'SELECTOR_NEEDED',
      assist_action_present: false,
      source_context_present: false,
      retrieval_source: null,
      ai_logic_debug: expect.objectContaining({
        catalog_gate_open: true,
        next_step_family: 'SELECTOR_NEEDED',
        assist_action_present: false,
        source_context_present: false,
      }),
    }));
  });

  it('answers a concrete product fact question directly without keeping secondary stage help alive afterward', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'cuantas caladas trae mint fresh',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        turn_analysis: {
          primary_intent: 'PRODUCT_SEARCH',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'DIRECT_ANSWER',
          turn_focus: 'product_fact',
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      retrieval_source: 'DIRECT_EXACT',
      customer_response_draft: 'Mint Fresh trae 6000 caladas.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Puffs',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'mint',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: { caladas: '6000' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { caladas: '6000' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('cuantas caladas trae mint fresh', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain('Mint Fresh trae 6000 caladas.');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint']);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('REVIEW_ONE');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'PRODUCT_SEARCH',
      current_turn_decision: 'DIRECT_ANSWER',
      turn_focus: 'product_fact',
      catalog_gate_open: true,
      catalog_gate_reason: 'search_leading',
      next_step_family: null,
      assist_action_present: false,
      source_context_present: false,
      retrieval_source: 'DIRECT_EXACT',
      ai_logic_debug: expect.objectContaining({
        primary_intent: 'PRODUCT_SEARCH',
        current_turn_decision: 'DIRECT_ANSWER',
        turn_focus: 'product_fact',
        catalog_gate_open: true,
        product_card_count: 1,
        fallback_used: false,
        next_step_family: null,
        assist_action_present: false,
        source_context_present: false,
        retrieval_source: 'DIRECT_EXACT',
      }),
    }));
  });

  it('consumes capsule direct-answer truth literally on the real service path instead of re-deriving secondary help from query patterns', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'dato exacto de mint fresh',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Mint Fresh viene con 5% de nicotina.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Nicotina',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'mint',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: { 'ConcentraciÃ³n de nicotina': '5%' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { 'ConcentraciÃ³n de nicotina': '5%' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('dato exacto de mint fresh', []);

    expect(response.message).toContain('Mint Fresh viene con 5% de nicotina.');
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'FACT',
      fact_family: 'Nicotina',
    });
  });

  it('keeps a nicotine fact answer direct on the real storefront service path', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'que nicotina trae mint fresh',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Mint Fresh viene con 5% de nicotina.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Nicotina',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'mint',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: { 'Concentración de nicotina': '5%' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { 'Concentración de nicotina': '5%' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('que nicotina trae mint fresh', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain('Mint Fresh viene con 5% de nicotina.');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint']);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('REVIEW_ONE');
  });

  it('keeps a version fact answer direct on the real storefront service path', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'que version es caliburn g3',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'La version de Caliburn G3 es G3 Pro.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Modelo',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'caliburn-g3',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'caliburn-g3',
          slug: 'caliburn-g3',
          section: 'vape',
          name: 'Caliburn G3',
          display_price: '$599',
          raw_stock: 6,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'pod compacto',
          description: 'pod recargable',
          specs: { 'Versión': 'G3 Pro' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'caliburn-g3',
        slug: 'caliburn-g3',
        section: 'vape',
        name: 'Caliburn G3',
        description: null,
        short_description: null,
        price: 599,
        compare_at_price: null,
        stock: 6,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { 'Versión': 'G3 Pro' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('que version es caliburn g3', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain('La version de Caliburn G3 es G3 Pro.');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['caliburn-g3']);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('REVIEW_ONE');
  });

  it('keeps a flavor fact answer direct on the real storefront service path', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'que sabor es mint fresh',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'El sabor de Mint Fresh es menta helada.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Sabor',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'mint',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: { Flavor: 'Menta Helada' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Flavor: 'Menta Helada' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('que sabor es mint fresh', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain('El sabor de Mint Fresh es menta helada.');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint']);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('REVIEW_ONE');
  });

  it('keeps a compatibility fact answer direct on the real storefront service path', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'waka pod compatible con que',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'La ficha de Waka Pod indica compatibilidad con cartuchos Waka X.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Compatibilidad',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'waka-pod',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'waka-pod',
          slug: 'waka-pod',
          section: 'vape',
          name: 'Waka Pod',
          display_price: '$299',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'pod recargable',
          description: 'pod compacto',
          specs: { 'Compatible con': 'cartuchos Waka X' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'waka-pod',
        slug: 'waka-pod',
        section: 'vape',
        name: 'Waka Pod',
        description: null,
        short_description: null,
        price: 299,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { 'Compatible con': 'cartuchos Waka X' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('waka pod compatible con que', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain('La ficha de Waka Pod indica compatibilidad con cartuchos Waka X.');
    expect(response.message).not.toContain('Waka Pod es compatible con');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['waka-pod']);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'FACT',
      fact_family: 'Compatibilidad',
    });
    expect((response as any).capsule_contract?.help_contract?.action_strength).toBe('review_only');
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('REVIEW_ONE');
  });

  it('keeps compatibility fact answers explicit and honest when the supported fact is missing', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'waka pod compatible con que',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft:
        'No veo una compatibilidad exacta cargada para Waka Pod. Mejor revisa la ficha antes de tomarlo como dato exacto.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'HONEST_MISSING_FACT',
        fact_family: 'Compatibilidad',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'waka-pod',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'waka-pod',
          slug: 'waka-pod',
          section: 'vape',
          name: 'Waka Pod',
          display_price: '$299',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'pod recargable',
          description: 'pod compacto',
          specs: { Sabor: 'Menta' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'waka-pod',
        slug: 'waka-pod',
        section: 'vape',
        name: 'Waka Pod',
        description: null,
        short_description: null,
        price: 299,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Sabor: 'Menta' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('waka pod compatible con que', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain(
      'No veo una compatibilidad exacta cargada para Waka Pod. Mejor revisa la ficha antes de tomarlo como dato exacto.',
    );
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['waka-pod']);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect((response as any).capsule_contract?.turn_analysis?.commercial_move).toBe('REVIEW_ONE');
  });

  it('compresses repeated closing tails instead of echoing the same closing line twice', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'recomiendame algo para diario',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        conversational_prefix: 'Si quieres, te ayudo con eso.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Si quieres, te ayudo con eso. Te dejo unas opciones.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('recomiendame algo para diario', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    const occurrences = (response.message.match(/si quieres/gi) ?? []).length;

    expect(occurrences).toBeLessThanOrEqual(1);
    expect(response.message).not.toContain('Te dejo unas opciones. Te dejo unas opciones.');
  });

  it('keeps a mixed turn anchored on the declared current primary intent instead of forcing product-search cadence', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'y cuanto tarda el envio, recomiendame algo ligero',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: ['PRODUCT_SEARCH'],
          turn_priority: 'mixed',
          current_turn_decision: 'ANSWER_POLICY_FIRST',
        },
        conversational_prefix: 'Primero te aclaro eso.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Primero te aclaro el envio y luego te dejo opciones.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('y cuanto tarda el envio, recomiendame algo ligero', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.reason).toBe('non_catalog_lane');
    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.message).toContain('Primero te aclaro el envio');
    expect(response.message).not.toContain('yo arrancaria por');
    expect((response as any).capsule_contract?.turn_analysis?.secondary_intents).toEqual(['PRODUCT_SEARCH']);
    expect(response.suggestedProducts).toEqual([]);
  });

  it('suppresses product surfaces when the current turn is catalog-closed', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'politica de envios y recomiendame algo frutal',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: ['PRODUCT_SEARCH'],
          turn_priority: 'mixed',
          current_turn_decision: 'USE_CAPABILITY',
        },
        conversational_prefix: 'Primero aclaro eso.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      customer_response_draft: 'Te dejo unas opciones.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([]);

    const response = await conciergeService.chat('politica de envios y recomiendame algo frutal', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.reason).toBe('non_catalog_lane');
    expect(response.suggestedProducts).toEqual([]);
    expect((response as any).capsule_contract?.resolved_products).toEqual([]);
    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
  });

  it('keeps store-hours turns out of PRODUCT_SEARCH and product recovery', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Hoy abrimos de 11:00 a 20:00.',
        intent: 'info',
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
        },
        catalog_gate: {
          is_open: true,
          reason: 'explicit_product_request',
          explicit_product_request: true,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('a que hora abren hoy?', []);

    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.reason).toBe('non_catalog_lane');
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toBe('Hoy abrimos de 11:00 a 20:00.');
    expect(executeProductSearchCapsuleMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'POLICY_INQUIRY',
      current_turn_decision: 'USE_CAPABILITY',
      catalog_gate_open: false,
      catalog_gate_reason: 'non_catalog_lane',
      retrieval_source: null,
    }));
  });

  it('uses a bounded degraded fallback for store-hours turns without reopening catalog recovery', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Ahorita no traigo el horario exacto confirmado en sistema. Si te urge, te lo confirmo por WhatsApp.',
        intent: 'info',
        fallback_reason: 'GEMINI_DEGRADED',
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('a que hora abren hoy?', []);

    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toContain('horario exacto');
    expect(response.message).not.toContain('se me cruzaron los cables');
    expect(executeProductSearchCapsuleMock).not.toHaveBeenCalled();
  });

  it('keeps exact shipping-policy phrasing on the non-catalog lane', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Si hacemos envios a todo Mexico.',
        intent: 'info',
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('hacen envios a todo mexico?', []);

    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.reason).toBe('non_catalog_lane');
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toBe('Si hacemos envios a todo Mexico.');
    expect(executeProductSearchCapsuleMock).not.toHaveBeenCalled();
  });

  it('uses a useful degraded shipping fallback without opening catalog recovery', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Manejamos envios por DHL Express a sucursal. Si quieres, te confirmo el alcance exacto para tu zona.',
        intent: 'info',
        fallback_reason: 'GEMINI_DEGRADED',
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('hacen envios a todo mexico?', []);

    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toContain('DHL Express');
    expect(response.message).not.toContain('se me cruzaron los cables');
    expect(executeProductSearchCapsuleMock).not.toHaveBeenCalled();
  });

  it('uses a useful degraded payment fallback without opening catalog recovery', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Por ahora manejamos solo transferencia o deposito bancario.',
        intent: 'info',
        fallback_reason: 'GEMINI_DEGRADED',
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('aceptan pago con tarjeta?', []);

    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toContain('transferencia');
    expect(response.message).not.toContain('se me cruzaron los cables');
    expect(executeProductSearchCapsuleMock).not.toHaveBeenCalled();
  });

  it('keeps PUBLIC_INFO turns non-catalog while preserving compact public source context', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Segun contexto publico, ese lanzamiento si aparece anunciado.',
        conversational_prefix: 'La ultima vez veniamos viendo pods, pero no asumo que sigas en eso.',
        intent: 'info',
        products: [
          {
            id: 'prod-1',
            name: 'Should Stay Hidden',
            slug: 'should-stay-hidden',
            section: 'vape',
            price: 299,
          },
        ],
        turn_analysis: {
          primary_intent: 'PUBLIC_INFO',
          secondary_intents: ['PRODUCT_SEARCH'],
          turn_priority: 'mixed',
          current_turn_decision: 'DIRECT_ANSWER',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
        source_context: {
          label: 'Contexto publico',
          sources: [
            { title: 'Marca oficial', url: 'https://example.com/oficial' },
          ],
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('ese modelo ya salio oficialmente?', []);

    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.primary_intent).toBe('PUBLIC_INFO');
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toBe('Segun contexto publico, ese lanzamiento si aparece anunciado.');
    expect(response.message).not.toContain('La ultima vez veniamos viendo pods');
    expect(response.source_context).toEqual({
      label: 'Contexto publico',
      sources: [
        { title: 'Marca oficial', url: 'https://example.com/oficial' },
      ],
    });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'PUBLIC_INFO',
      current_turn_decision: 'DIRECT_ANSWER',
      turn_focus: null,
      catalog_gate_open: false,
      catalog_gate_reason: 'non_catalog_lane',
      next_step_family: null,
      assist_action_present: false,
      source_context_present: true,
      retrieval_source: null,
      ai_logic_debug: expect.objectContaining({
        primary_intent: 'PUBLIC_INFO',
        current_turn_decision: 'DIRECT_ANSWER',
        catalog_gate_open: false,
        source_context_present: true,
        next_step_family: null,
        assist_action_present: false,
      }),
    }));
  });

  it('preserves availability-first final text on INVENTORY_OUTLOOK turns without implying unsupported return', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Hoy esta agotado. Como outlook secundario, no tengo una proyeccion confiable mientras siga agotado y no hay base para prometer regreso o restock.',
        intent: 'info',
        turn_analysis: {
          primary_intent: 'INVENTORY_OUTLOOK',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'DIRECT_ANSWER',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('todavia hay stock del caliburn g3?', []);

    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.primary_intent).toBe('INVENTORY_OUTLOOK');
    expect(response.suggestedProducts).toEqual([]);
    expect(response.message).toContain('Hoy esta agotado.');
    expect(response.message).toContain('Como outlook secundario');
    expect(response.message).toContain('no hay base para prometer regreso o restock');
    expect(response.message.indexOf('Hoy esta agotado.')).toBeLessThan(
      response.message.indexOf('Como outlook secundario'),
    );
    expect(response.message).not.toContain('temporalmente agotado');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'INVENTORY_OUTLOOK',
      current_turn_decision: 'DIRECT_ANSWER',
      turn_focus: null,
      catalog_gate_open: false,
      catalog_gate_reason: 'non_catalog_lane',
      next_step_family: null,
      assist_action_present: false,
      source_context_present: false,
      retrieval_source: null,
      ai_logic_debug: expect.objectContaining({
        primary_intent: 'INVENTORY_OUTLOOK',
        current_turn_decision: 'DIRECT_ANSWER',
        catalog_gate_open: false,
        source_context_present: false,
        next_step_family: null,
        assist_action_present: false,
        retrieval_source: null,
        has_product_cards: false,
        product_card_count: 0,
      }),
    }));
  });

  it('routes INVENTORY_OUTLOOK through the client capsule path and can surface one grounded product card without opening broad catalog search', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'storefront_inventory_outlook',
        tool_args: {
          query: 'todavia hay stock del caliburn g3?',
        },
        turn_profile: {
          primary_intent: 'INVENTORY_OUTLOOK',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: 'inventory',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'INVENTORY_OUTLOOK',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeStorefrontInventoryOutlookCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_inventory_outlook',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'CATALOG_IN_STOCK_ONLINE',
      customer_response_draft: 'Ahorita Caliburn G3 si aparece disponible en linea.',
      latency_ms: 12,
      inventory_outlook_signal: {
        kind: 'IN_STOCK_ONLINE',
        scope: 'ONLINE_ONLY',
        product: {
          id: 'inventory-1',
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
      resolved_products: [
        {
          id: 'inventory-1',
          name: 'Caliburn G3',
          slug: 'caliburn-g3',
          section: 'vape',
        },
      ],
      retrieval_source: 'CATALOG_ONLINE_STOCK',
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'inventory-1',
        name: 'Caliburn G3',
        slug: 'caliburn-g3',
        description: 'Pod refillable',
        short_description: 'Pod refillable',
        price: 499,
        compare_at_price: null,
        stock: 12,
        sku: 'CAL-G3',
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
    ]);

    const response = await conciergeService.chat('todavia hay stock del caliburn g3?', []);

    expect(executeStorefrontInventoryOutlookCapsuleMock).toHaveBeenCalledWith({
      query: 'todavia hay stock del caliburn g3?',
    });
    expect(response.catalog_gate?.primary_intent).toBe('INVENTORY_OUTLOOK');
    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['inventory-1']);
    expect(response.message).toContain('Caliburn G3');
    expect(response.message).toContain('disponible en linea');
    expect(response.capsule_contract?.next_step_view?.family).toBeTruthy();
  });

  it('passes bounded authenticated ia_context to the edge request for soft continuity', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Primero voy con el envio.',
        intent: 'info',
      },
      error: null,
    });

    await conciergeService.chat('y el envio como va?', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: {
        last_query: 'quiero algo frutal para diario',
        last_intent: 'PRODUCT_SEARCH',
        updated_at: '2026-03-29T10:00:00.000Z',
      },
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });

    expect(invokeMock).toHaveBeenCalledWith('customer-intelligence', expect.objectContaining({
      body: expect.objectContaining({
        customerContext: expect.objectContaining({
          ia_context: {
            last_query: 'quiero algo frutal para diario',
            last_intent: 'PRODUCT_SEARCH',
            updated_at: '2026-03-29T10:00:00.000Z',
          },
        }),
      }),
    }));
  });

  it('applies a soft conversational prefix on generic non-catalog turns without reopening product surfaces', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Te confirmo el envio.',
        conversational_prefix: 'La ultima vez veniamos con pods, pero no asumo que sigas en eso.',
        intent: 'info',
        products: [
          {
            id: 'prod-1',
            name: 'Should Stay Hidden',
            slug: 'should-stay-hidden',
            section: 'vape',
            price: 299,
          },
        ],
        turn_analysis: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: ['PRODUCT_SEARCH'],
          turn_priority: 'mixed',
          current_turn_decision: 'DIRECT_ANSWER',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('y el envio como va?', []);

    expect(response.message).toContain('La ultima vez veniamos con pods');
    expect(response.message).toContain('Te confirmo el envio.');
    expect(response.suggestedProducts).toEqual([]);
    expect(response.catalog_gate?.is_open).toBe(false);
  });

  it('uses canonical fallback turn decisions instead of leaking legacy conversation_mode_hint', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Te confirmo el envio.',
        intent: 'support',
        conversation_mode_hint: 'EXPLORE_LIGHT',
      },
      error: null,
    });

    const response = await conciergeService.chat('y el envio como va?', []);

    expect(response.turn_analysis?.primary_intent).toBe('POLICY_INQUIRY');
    expect(response.turn_analysis?.current_turn_decision).toBe('USE_CAPABILITY');
    expect(response.turn_analysis?.current_turn_decision).not.toBe('EXPLORE_LIGHT');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.reason).toBe('non_catalog_lane');
  });

  it('keeps clarification-first turns lean instead of prepending stale continuity text', async () => {
    invokeMock.mockResolvedValue({
      data: {
        message: 'Necesito el modelo exacto para decirte si si le queda. ¿Que equipo traes?',
        conversational_prefix: 'La ultima vez estabamos viendo pods, pero no asumo que sigas en eso.',
        intent: 'info',
        turn_analysis: {
          primary_intent: 'COMPATIBILITY_CHECK',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'ASK_CLARIFYING_QUESTION',
        },
        catalog_gate: {
          is_open: false,
          reason: 'clarification_first',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: true,
        },
      },
      error: null,
    });

    const response = await conciergeService.chat('le queda a mi equipo?', []);

    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.catalog_gate?.reason).toBe('clarification_first');
    expect(response.message).toBe('Necesito el modelo exacto para decirte si si le queda. ¿Que equipo traes?');
    expect(response.message).not.toContain('La ultima vez estabamos viendo pods');
    expect(response.suggestedProducts).toEqual([]);
  });

  it('keeps weak-support search turns humble instead of collapsing them into action-ready next steps', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'algo parecido a ese',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        conversational_prefix: 'Te sigo el hilo.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'SEMANTIC',
      customer_response_draft: 'Te dejo una pista util sin cerrartela de mas.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('algo parecido a ese', []);

    expect((response as any).capsule_contract?.next_step_view?.family).toBe('KEEP_EXPLORING');
    expect((response as any).capsule_contract?.next_step_view?.guidance).toBe('Todavia no veo una clara; mejor afinamos un poco mas y de ahi sale mejor.');
    expect((response as any).capsule_contract?.next_step_view?.primaryAction).toBeNull();
    expect((response as any).capsule_contract?.next_step_view?.assistAction).toBeNull();
    expect(response.message).toContain('Te sigo el hilo.');
    expect(response.message).not.toContain('agregarlo es el paso natural');
  });

  it('drops redundant keep-exploring next-step text when the main response already carries the same move', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'que tienes por ahi',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        conversational_prefix: 'Te dejo esto para que lo veas con calma.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'SEMANTIC',
      customer_response_draft: 'Todavia no veo una clara; mejor afinamos un poco mas y de ahi sale mejor.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('que tienes por ahi', []);

    expect((response as any).capsule_contract?.next_step_view).toBeUndefined();
    expect(response.message).toContain('Te dejo esto para que lo veas con calma.');
    expect(response.message).not.toContain('Todavia no veo una clara; mejor afinamos un poco mas y de ahi sale mejor.');
  });

  it('keeps grounded capsule response text as the storefront message when late shaping would weaken it', async () => {
    const groundedDraft = 'Te rescate dos rutas reales con perfil fresco. La primera es Nic Salt Sandia Mint 30ml 35mg porque coincide con menta y stock real.';

    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'quiero algo fresco de menta',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'FEATURED_FALLBACK',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: groundedDraft,
      resolved_products: [
        {
          id: 'salt-mint',
          slug: 'nicsalt-sandia-mint-30ml-35mg',
          section: 'vape',
          name: 'Nic Salt Sandia Mint 30ml 35mg',
          display_price: '$260',
          raw_stock: 33,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'sandia mint',
          specs: { Nicotina: '35mg' },
        },
        {
          id: 'menthol-ice',
          slug: 'eliquid-mentolado-ice-120ml-3mg',
          section: 'vape',
          name: 'E-Liquid Mentolado Ice 120ml 3mg',
          display_price: '$220',
          raw_stock: 24,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'mentolado ice',
          specs: { Nicotina: '3mg' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'salt-mint',
        secondary_product_id: 'menthol-ice',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'salt-mint',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        section: 'vape',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 33,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '35mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'menthol-ice',
        slug: 'eliquid-mentolado-ice-120ml-3mg',
        section: 'vape',
        name: 'E-Liquid Mentolado Ice 120ml 3mg',
        description: null,
        short_description: null,
        price: 220,
        compare_at_price: null,
        stock: 24,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '3mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('quiero algo fresco de menta', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['salt-mint', 'menthol-ice']);
    expect(response.message).toBe(groundedDraft);
    expect(response.message).not.toMatch(/no la tengo clara|no encuentro referencia|seguir explorando|no la ubico con suficiente certeza/i);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      response_text: groundedDraft,
      ai_logic_debug: expect.objectContaining({
        offered_products: [
          { id: 'salt-mint', name: 'Nic Salt Sandia Mint 30ml 35mg', slug: 'nicsalt-sandia-mint-30ml-35mg' },
          { id: 'menthol-ice', name: 'E-Liquid Mentolado Ice 120ml 3mg', slug: 'eliquid-mentolado-ice-120ml-3mg' },
        ],
      }),
    }));
  });

  it('still keeps harmless prefix compaction when it preserves grounded capsule truth', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'cuantas caladas trae mint fresh',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        conversational_prefix: 'Va, te confirmo rapido.',
        turn_analysis: {
          primary_intent: 'PRODUCT_SEARCH',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'DIRECT_ANSWER',
          turn_focus: 'product_fact',
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      retrieval_source: 'DIRECT_EXACT',
      customer_response_draft: 'Mint Fresh trae 6000 caladas.',
      truth_signals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Puffs',
      },
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'mint',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: { caladas: '6000' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { caladas: '6000' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('cuantas caladas trae mint fresh', []);

    expect(response.message).toBe('Va, te confirmo rapido. Mint Fresh trae 6000 caladas.');
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint']);
  });

  it('adds a subtle reentry action on weak review-first product help without turning it into a pushy close', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'no estoy seguro si ese me conviene',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        conversational_prefix: 'Puede ir por ahi.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'SEMANTIC',
      customer_response_draft: 'Puede ir por ahi.',
      resolved_products: [
        {
          id: 'mint',
          slug: 'mint-fresh',
          section: 'vape',
          name: 'Mint Fresh',
          display_price: '$260',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: null,
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'mint-fresh',
        section: 'vape',
        name: 'Mint Fresh',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('no estoy seguro si ese me conviene', []);

    expect((response as any).capsule_contract?.next_step_view?.family).toBe('REVIEW_ONE');
    expect((response as any).capsule_contract?.next_step_view?.guidance).toBe('Mint Fresh pinta mejor por ahora; yo lo revisaria primero y si no te convence, le damos otra vuelta.');
    expect((response as any).capsule_contract?.next_step_view?.assistAction).toEqual({
      label: 'Seguimos viendo',
      message: 'Seguimos viendo',
    });
  });

  it('surfaces recovered products for a broad unknown-brand search instead of ending in a dead zero-card fallback', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'busco un waka pero no se cual',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        conversational_prefix: 'Te ayudo a aterrizarlo.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'FEATURED_FALLBACK',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'No veo Waka tal cual cargado, pero si te sirve salir de ahi con algo parecido, te dejo opciones reales de vape que si estan activas.',
      resolved_products: [
        {
          id: 'starter',
          slug: 'pod-system-starter-kit',
          section: 'vape',
          name: 'Pod System Starter Kit',
          display_price: '$480',
          raw_stock: 40,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'kit sencillo',
          specs: { Tipo: 'Pod' },
        },
        {
          id: 'pen',
          slug: 'vape-pen-22mm',
          section: 'vape',
          name: 'Vape Pen 22mm',
          display_price: '$390',
          raw_stock: 18,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'pen compacto',
          specs: { Tipo: 'Pen' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'starter',
        secondary_product_id: 'pen',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'starter',
        slug: 'pod-system-starter-kit',
        section: 'vape',
        name: 'Pod System Starter Kit',
        description: null,
        short_description: null,
        price: 480,
        compare_at_price: null,
        stock: 40,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Tipo: 'Pod' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'pen',
        slug: 'vape-pen-22mm',
        section: 'vape',
        name: 'Vape Pen 22mm',
        description: null,
        short_description: null,
        price: 390,
        compare_at_price: null,
        stock: 18,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Tipo: 'Pen' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('busco un waka pero no se cual', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['starter', 'pen']);
    expect(response.message).not.toContain('no logre encontrar una salida clara');
    expect(response.message).toContain('opciones reales');
    expect((response as any).capsule_contract?.retrieval_source).toBe('TOKEN_RECOVERY');
  });

  it('keeps a plausible fact ask grounded in nearby real products instead of collapsing to generic no-match', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'que nicotina trae mint fresh',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'TOKEN_RECOVERY',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'No encontre "mint fresh" exacto, pero Nic Salt Sandia Mint 30ml 35mg es de lo mas cercano y viene con 35mg de nicotina.',
      resolved_products: [
        {
          id: 'salt-mint',
          slug: 'nicsalt-sandia-mint-30ml-35mg',
          section: 'vape',
          name: 'Nic Salt Sandia Mint 30ml 35mg',
          display_price: '$260',
          raw_stock: 33,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'sandia mint',
          specs: { Nicotina: '35mg' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'salt-mint',
        secondary_product_id: null,
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'salt-mint',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        section: 'vape',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 33,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '35mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('que nicotina trae mint fresh', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['salt-mint']);
    expect(response.message).toContain('35mg de nicotina');
    expect(response.message).not.toContain('no logre encontrar una salida clara');
  });

  it('preserves mixed recovery help when both a small vape and a grape liquid are recoverable', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'quiero un vape chico y ademas un liquido de uva',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'FEATURED_FALLBACK',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'Te rescate dos rutas reales: un vape compacto y un liquido de uva para que no arranques de cero.',
      resolved_products: [
        {
          id: 'mini-mod',
          slug: 'mini-mod-40w-stealth',
          section: 'vape',
          name: 'Mini Mod 40W Stealth',
          display_price: '$650',
          raw_stock: 30,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'compacto',
          specs: { Potencia: '40W' },
        },
        {
          id: 'juice-uva',
          slug: 'juicee-uva-60-ml',
          section: 'vape',
          name: 'Juicee Uva 60 ml',
          display_price: '$200',
          raw_stock: 20,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'uva',
          specs: { Sabor: 'Uva' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'mini-mod',
        secondary_product_id: 'juice-uva',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mini-mod',
        slug: 'mini-mod-40w-stealth',
        section: 'vape',
        name: 'Mini Mod 40W Stealth',
        description: null,
        short_description: null,
        price: 650,
        compare_at_price: null,
        stock: 30,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Potencia: '40W' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'juice-uva',
        slug: 'juicee-uva-60-ml',
        section: 'vape',
        name: 'Juicee Uva 60 ml',
        description: null,
        short_description: null,
        price: 200,
        compare_at_price: null,
        stock: 20,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Sabor: 'Uva' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('quiero un vape chico y ademas un liquido de uva', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mini-mod', 'juice-uva']);
    expect(response.message).toContain('vape compacto');
    expect(response.message).toContain('liquido de uva');
  });

  it('keeps an exact menta-plus-budget narrowing turn on the real runtime path instead of dropping into the old dead zone', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'de menta y no muy caro',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'FEATURED_FALLBACK',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'Te deje dos rutas reales con perfil fresco y sin irnos a lo caro.',
      resolved_products: [
        {
          id: 'menthol-ice',
          slug: 'eliquid-mentolado-ice-120ml-3mg',
          section: 'vape',
          name: 'E-Liquid Mentolado Ice 120ml 3mg',
          display_price: '$220',
          raw_stock: 24,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'mentolado fresco',
          specs: { Nicotina: '3mg' },
        },
        {
          id: 'sandia-mint',
          slug: 'nicsalt-sandia-mint-30ml-35mg',
          section: 'vape',
          name: 'Nic Salt Sandia Mint 30ml 35mg',
          display_price: '$260',
          raw_stock: 18,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'sandia con menta',
          specs: { Nicotina: '35mg' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'menthol-ice',
        secondary_product_id: 'sandia-mint',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'menthol-ice',
        slug: 'eliquid-mentolado-ice-120ml-3mg',
        section: 'vape',
        name: 'E-Liquid Mentolado Ice 120ml 3mg',
        description: null,
        short_description: null,
        price: 220,
        compare_at_price: null,
        stock: 24,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '3mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'sandia-mint',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        section: 'vape',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 18,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '35mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('de menta y no muy caro', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['menthol-ice', 'sandia-mint']);
    expect((response as any).capsule_contract?.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(response.message).toContain('fresco');
    expect(response.message).not.toContain('no logre encontrar una salida clara');
  });

  it('keeps the exact frutal exploratory wording on the real runtime path with grounded options instead of the old no-match collapse', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'quiero algo frutal para diario',
          is_ambiguous: true,
          requires_semantic_expansion: true,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'FEATURED_FALLBACK',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'Te rescate varias opciones frutales que si te sirven para diario sin inventarte un match exacto.',
      resolved_products: [
        {
          id: 'juice-uva',
          slug: 'juicee-uva-60-ml',
          section: 'vape',
          name: 'Juicee Uva 60 ml',
          display_price: '$200',
          raw_stock: 20,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'uva para diario',
          specs: { Sabor: 'Uva' },
        },
        {
          id: 'sandia-mint',
          slug: 'nicsalt-sandia-mint-30ml-35mg',
          section: 'vape',
          name: 'Nic Salt Sandia Mint 30ml 35mg',
          display_price: '$260',
          raw_stock: 18,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'sandia fresca',
          specs: { Sabor: 'Sandia Mint' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'juice-uva',
        secondary_product_id: 'sandia-mint',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'juice-uva',
        slug: 'juicee-uva-60-ml',
        section: 'vape',
        name: 'Juicee Uva 60 ml',
        description: null,
        short_description: null,
        price: 200,
        compare_at_price: null,
        stock: 20,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Sabor: 'Uva' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'sandia-mint',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        section: 'vape',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 18,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Sabor: 'Sandia Mint' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('quiero algo frutal para diario', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['juice-uva', 'sandia-mint']);
    expect((response as any).capsule_contract?.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(response.message).toContain('frutales');
    expect(response.message).not.toContain('no logre encontrar una salida clara');
  });

  it('keeps the exact waka menta wording on the real runtime path with grounded vape recovery instead of the old no-match collapse', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'waka menta',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'TOKEN_RECOVERY',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'No veo Waka Menta tal cual cargado, pero si buscas algo fresco de vape, estas dos rutas reales se acercan mas.',
      resolved_products: [
        {
          id: 'salt-mint',
          slug: 'nicsalt-sandia-mint-30ml-35mg',
          section: 'vape',
          name: 'Nic Salt Sandia Mint 30ml 35mg',
          display_price: '$260',
          raw_stock: 33,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'sandia mint',
          specs: { Nicotina: '35mg' },
        },
        {
          id: 'menthol-ice',
          slug: 'eliquid-mentolado-ice-120ml-3mg',
          section: 'vape',
          name: 'E-Liquid Mentolado Ice 120ml 3mg',
          display_price: '$220',
          raw_stock: 24,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'mentolado ice',
          specs: { Nicotina: '3mg' },
        },
      ],
      help_contract: {
        compare_supported: true,
        preferred_product_id: 'salt-mint',
        secondary_product_id: 'menthol-ice',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'salt-mint',
        slug: 'nicsalt-sandia-mint-30ml-35mg',
        section: 'vape',
        name: 'Nic Salt Sandia Mint 30ml 35mg',
        description: null,
        short_description: null,
        price: 260,
        compare_at_price: null,
        stock: 33,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '35mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'menthol-ice',
        slug: 'eliquid-mentolado-ice-120ml-3mg',
        section: 'vape',
        name: 'E-Liquid Mentolado Ice 120ml 3mg',
        description: null,
        short_description: null,
        price: 220,
        compare_at_price: null,
        stock: 24,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Nicotina: '3mg' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('waka menta', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['salt-mint', 'menthol-ice']);
    expect((response as any).capsule_contract?.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(response.message).toContain('fresco');
    expect(response.message).not.toContain('no logre encontrar una salida clara');
  });

  it('keeps the exact missing waka somatch wording on the real runtime path with honest alternatives instead of a dead no-match', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'no encuentro el waka somatch mb6000',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'FEATURED_FALLBACK',
      retrieval_source: 'TOKEN_RECOVERY',
      customer_response_draft: 'No encontre Waka Somatch MB6000 tal cual, pero si quieres salir de ahi con algo cercano, te dejo alternativas reales que si estan activas.',
      resolved_products: [
        {
          id: 'starter',
          slug: 'pod-system-starter-kit',
          section: 'vape',
          name: 'Pod System Starter Kit',
          display_price: '$480',
          raw_stock: 40,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'kit sencillo',
          specs: { Tipo: 'Pod' },
        },
        {
          id: 'pen',
          slug: 'vape-pen-22mm',
          section: 'vape',
          name: 'Vape Pen 22mm',
          display_price: '$390',
          raw_stock: 18,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: 'pen compacto',
          specs: { Tipo: 'Pen' },
        },
      ],
      help_contract: {
        compare_supported: false,
        preferred_product_id: 'starter',
        secondary_product_id: 'pen',
        action_strength: 'review_only',
      },
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'starter',
        slug: 'pod-system-starter-kit',
        section: 'vape',
        name: 'Pod System Starter Kit',
        description: null,
        short_description: null,
        price: 480,
        compare_at_price: null,
        stock: 40,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Tipo: 'Pod' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'pen',
        slug: 'vape-pen-22mm',
        section: 'vape',
        name: 'Vape Pen 22mm',
        description: null,
        short_description: null,
        price: 390,
        compare_at_price: null,
        stock: 18,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Tipo: 'Pen' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('no encuentro el waka somatch mb6000', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['starter', 'pen']);
    expect((response as any).capsule_contract?.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(response.message).toContain('No encontre Waka Somatch MB6000 tal cual');
    expect(response.message).not.toContain('no logre encontrar una salida clara');
  });

  it('keeps bounded real promotion copy on the live storefront path without turning it into coupon spam', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'waka menta vale la pena',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      retrieval_source: 'DIRECT_EXACT',
      customer_response_draft:
        'Aqui tienes exactamente lo que buscabas. Si te ayuda en precio, Waka Menta trae flash deal real ahorita: baja de $299 a $249 mientras siga activo.',
      promotion_signal: {
        kind: 'FLASH_DEAL',
        product_id: 'mint',
        product_name: 'Waka Menta',
        flash_price: 249,
        original_price: 299,
        savings_amount: 50,
        ends_at: '2026-04-05T00:00:00.000Z',
        informational_only: true,
      },
      resolved_products: [
        {
          id: 'mint',
          slug: 'waka-menta',
          section: 'vape',
          name: 'Waka Menta',
          display_price: '$299',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'menta fresca',
          description: 'perfil fresco',
          specs: { Sabor: 'Menta' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'mint',
        slug: 'waka-menta',
        section: 'vape',
        name: 'Waka Menta',
        description: null,
        short_description: null,
        price: 299,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: { Sabor: 'Menta' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('waka menta vale la pena', []);

    expect(response.catalog_gate?.is_open).toBe(true);
    expect(response.message).toContain('flash deal real ahorita: baja de $299 a $249');
    expect(response.message).not.toContain('Yo no te lo aplico');
    expect((response as any).capsule_contract?.promotion_signal).toEqual({
      kind: 'FLASH_DEAL',
      product_id: 'mint',
      product_name: 'Waka Menta',
      flash_price: 249,
      original_price: 299,
      savings_amount: 50,
      ends_at: '2026-04-05T00:00:00.000Z',
      informational_only: true,
    });
  });

  it('keeps authenticated replenishment actionable on the live storefront path with quantity and variant intact', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'lo de siempre',
          is_ambiguous: false,
          requires_semantic_expansion: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'PRODUCT_SEARCH',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeProductSearchCapsuleMock.mockResolvedValue({
      capsule_name: 'product_search_integrity',
      execution_status: 'SUCCESS',
      match_strategy: 'EXACT',
      retrieval_source: 'AUTHENTICATED_REORDER',
      customer_response_draft:
        'Revise tu historial real y Pods Mango si sigue vigente para repetir x2 con el catalogo actual.',
      replenishment_signal: {
        kind: 'READY',
        source_order_id: 'order-1',
        source_order_created_at: '2026-03-20T00:00:00.000Z',
        source_phrase: 'LO_DE_SIEMPRE',
        primary_product: {
          id: 'pods-mango',
          slug: 'pods-mango',
          section: 'vape',
          name: 'Pods Mango',
        },
        variant_id: 'pods-variant-mango',
        variant_label: 'Mango',
        quantity: 2,
        requested_quantity: 2,
        blocked_item_count: 0,
        action_mode: 'ADD_TO_CART',
      },
      resolved_products: [
        {
          id: 'pods-mango',
          slug: 'pods-mango',
          section: 'vape',
          name: 'Pods Mango',
          display_price: '$199',
          raw_stock: 12,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: 'pods de mango',
          description: 'recarga mango',
          specs: { Sabor: 'Mango' },
        },
      ],
    });

    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'pods-mango',
        slug: 'pods-mango',
        section: 'vape',
        name: 'Pods Mango',
        description: null,
        short_description: null,
        price: 199,
        compare_at_price: null,
        stock: 12,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-20T00:00:00.000Z',
        specs: { Sabor: 'Mango' },
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [
          {
            id: 'pods-variant-mango',
            product_id: 'pods-mango',
            sku: null,
            price: null,
            stock: 12,
            images: [],
            is_active: true,
            options: [
              {
                variant_id: 'pods-variant-mango',
                attribute_value_id: 'pods-value-mango',
                attribute_name: 'Sabor',
                attribute_value: {
                  id: 'pods-value-mango',
                  attribute_id: 'attr-sabor',
                  value: 'Mango',
                },
              },
            ],
          },
        ],
      },
    ]);

    const response = await conciergeService.chat('lo de siempre', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 4,
      total_spent: 1200,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-20T00:00:00.000Z',
    });

    expect(response.catalog_gate?.is_open).toBe(true);
    expect((response as any).capsule_contract?.retrieval_source).toBe('AUTHENTICATED_REORDER');
    expect((response as any).capsule_contract?.next_step_view?.family).toBe('ADD_READY');
    expect((response as any).capsule_contract?.next_step_view?.primaryAction).toEqual({
      kind: 'ADD_TO_CART',
      label: 'Agregar 2 x Pods Mango',
      product: {
        id: 'pods-mango',
        name: 'Pods Mango',
        slug: 'pods-mango',
        section: 'vape',
      },
      quantity: 2,
      variantToken: {
        id: 'pods-variant-mango',
        name: 'Mango',
      },
    });
    expect((response as any).capsule_contract?.next_step_view?.guidance).toContain('sigue vigente para repetir x2');
  });

  it('answers authenticated post-purchase payment truth from the order-tracking capsule instead of falling into generic policy copy', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'authenticated_order_tracking',
        tool_args: {
          query: 'ya paso mi pago?',
        },
        turn_profile: {
          primary_intent: 'ORDER_TRACKING',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: 'tracking',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'ORDER_TRACKING',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeAuthenticatedOrderTrackingCapsuleMock.mockResolvedValue({
      capsule_name: 'authenticated_order_tracking',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'AUTHENTICATED_ACTIVE_ORDER',
      customer_response_draft: 'Tu pedido VSM-321 sigue registrado. Pago confirmado. El pago ya quedo confirmado en tu pedido.',
      latency_ms: 12,
      order_tracking_signal: {
        kind: 'FOUND',
        focus: 'payment_status',
        scope: 'RECENT_ACTIVE_ORDERS',
        order_id: 'order-321',
        order_number: 'VSM-321',
        order_status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'mercadopago',
        tracking_number: null,
        tracking_link: null,
        matched_by: 'recent_active_order',
      },
      retrieval_source: 'AUTHENTICATED_ACTIVE_ORDER',
    });

    const response = await conciergeService.chat('ya paso mi pago?', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 4,
      total_spent: 1200,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-20T00:00:00.000Z',
    });

    expect(executeAuthenticatedOrderTrackingCapsuleMock).toHaveBeenCalledWith(
      { query: 'ya paso mi pago?' },
      { customerId: 'customer-1' },
    );
    expect(response.intent).toBe('support');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.message).toContain('Pago confirmado');
    expect((response as any).capsule_contract?.retrieval_source).toBe('AUTHENTICATED_ACTIVE_ORDER');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'ORDER_TRACKING',
      current_turn_decision: 'USE_CAPABILITY',
      catalog_gate_open: false,
      catalog_gate_reason: 'non_catalog_lane',
      retrieval_source: 'AUTHENTICATED_ACTIVE_ORDER',
    }));
  });

  it('degrades honestly when the authenticated account has no recent relevant orders for the question', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'authenticated_order_tracking',
        tool_args: {
          query: 'donde va mi pedido?',
        },
        turn_profile: {
          primary_intent: 'ORDER_TRACKING',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: 'tracking',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'ORDER_TRACKING',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeAuthenticatedOrderTrackingCapsuleMock.mockResolvedValue({
      capsule_name: 'authenticated_order_tracking',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_RELEVANT_ORDER',
      customer_response_draft: 'No veo pedidos recientes o activos en esta cuenta para responder esa duda con verdad persistida.',
      latency_ms: 9,
      degraded_reason: 'NO_RELEVANT_ORDER',
      order_tracking_signal: {
        kind: 'NO_RELEVANT_ORDER',
        focus: 'shipping_status',
        scope: 'RECENT_ACTIVE_ORDERS',
        matched_by: 'none',
      },
      retrieval_source: 'NONE',
    });

    const response = await conciergeService.chat('donde va mi pedido?', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      total_orders: 0,
      total_spent: 0,
      avatar_url: null,
      favorite_category_id: null,
      points: 0,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-20T00:00:00.000Z',
    });

    expect(response.intent).toBe('support');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.message).toContain('No veo pedidos recientes o activos');
    expect((response as any).capsule_contract?.order_tracking_signal?.kind).toBe('NO_RELEVANT_ORDER');
    expect((response as any).capsule_contract?.retrieval_source).toBe('NONE');
  });

  it('returns message-only authenticated loyalty truth without opening catalog surfaces', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'authenticated_loyalty_status',
        tool_args: {
          query: 'cuanto valen mis puntos?',
        },
        turn_profile: {
          primary_intent: 'LOYALTY_SUPPORT',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: 'loyalty',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'LOYALTY_SUPPORT',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeAuthenticatedLoyaltyStatusCapsuleMock.mockResolvedValue({
      capsule_name: 'authenticated_loyalty_status',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'AUTHENTICATED_POINTS_BALANCE',
      customer_response_draft: 'Ahorita tienes 320 V-Coins. Con la configuracion vigente eso equivale a $32 MXN. Tu nivel actual es Silver.',
      latency_ms: 11,
      loyalty_status_signal: {
        kind: 'POINTS_BALANCE',
        focus: 'value',
        scope: 'AUTHENTICATED_LOYALTY_PROFILE',
        customer_id: 'customer-1',
        tier: 'silver',
        tier_label: 'Silver',
        points_balance: 320,
        monetary_value: 32,
        currency_per_point: 0.1,
        total_spent: 5500,
        next_tier: 'gold',
        next_tier_label: 'Gold',
        amount_to_next_tier: 14500,
        tier_progress: 10,
        loyalty_enabled: true,
      },
      retrieval_source: 'AUTHENTICATED_CUSTOMER_PROFILE',
    });

    const response = await conciergeService.chat('cuanto valen mis puntos?', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'silver',
      account_status: 'active',
      suspension_end: null,
      total_orders: 6,
      total_spent: 5500,
      avatar_url: null,
      favorite_category_id: null,
      points: 320,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-04-01T00:00:00.000Z',
    });

    expect(executeAuthenticatedLoyaltyStatusCapsuleMock).toHaveBeenCalledWith(
      { query: 'cuanto valen mis puntos?' },
      { customerId: 'customer-1' },
    );
    expect(response.intent).toBe('info');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.message).toContain('320 V-Coins');
    expect(response.suggestedProducts ?? []).toEqual([]);
    expect((response as any).capsule_contract?.loyalty_status_signal?.kind).toBe('POINTS_BALANCE');
    expect((response as any).capsule_contract?.retrieval_source).toBe('AUTHENTICATED_CUSTOMER_PROFILE');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'LOYALTY_SUPPORT',
      current_turn_decision: 'USE_CAPABILITY',
      catalog_gate_open: false,
      catalog_gate_reason: 'non_catalog_lane',
      retrieval_source: 'AUTHENTICATED_CUSTOMER_PROFILE',
    }));
  });

  it('returns message-only checkout-readiness truth without opening catalog surfaces', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'storefront_checkout_readiness',
        tool_args: {
          query: 'ya puedo pagar?',
        },
        turn_profile: {
          primary_intent: 'CHECKOUT_READINESS',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: 'checkout',
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          explicit_product_request: false,
          search_leading: false,
          clarification_required: false,
        },
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'CHECKOUT_READINESS',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeStorefrontCheckoutReadinessCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_checkout_readiness',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'READY_TO_CHECKOUT',
      customer_response_draft: 'Si, con lo que veo ahorita tu carrito esta listo para pasar a checkout.',
      latency_ms: 14,
      checkout_readiness_signal: {
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
      retrieval_source: 'CART_VALIDATION',
    });

    const response = await conciergeService.chat('ya puedo pagar?', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'silver',
      account_status: 'active',
      suspension_end: null,
      total_orders: 6,
      total_spent: 5500,
      avatar_url: null,
      favorite_category_id: null,
      points: 320,
      referral_code: null,
      referred_by: null,
      ai_preferences: null,
      ia_context: null,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-04-01T00:00:00.000Z',
    });

    expect(executeStorefrontCheckoutReadinessCapsuleMock).toHaveBeenCalledWith(
      { query: 'ya puedo pagar?' },
      { customerId: 'customer-1' },
    );
    expect(response.intent).toBe('support');
    expect(response.catalog_gate?.is_open).toBe(false);
    expect(response.message).toContain('listo para pasar a checkout');
    expect(response.suggestedProducts ?? []).toEqual([]);
    expect((response as any).capsule_contract?.checkout_readiness_signal?.kind).toBe('READY_TO_CHECKOUT');
    expect((response as any).capsule_contract?.retrieval_source).toBe('CART_VALIDATION');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      primary_intent: 'CHECKOUT_READINESS',
      current_turn_decision: 'USE_CAPABILITY',
      catalog_gate_open: false,
      catalog_gate_reason: 'non_catalog_lane',
      retrieval_source: 'CART_VALIDATION',
    }));
  });

  it('surfaces grounded compatibility fit results through the stage 4 storefront view', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'storefront_compatibility_check',
        tool_args: {
          query: 'le queda a mi caliburn g3?',
          cart_product_ids: ['anchor'],
        },
        conversational_prefix: 'Va, lo reviso con la verdad de compatibilidad.',
        debug: {
          guardrail_telemetry: {
            analyst_intent: 'COMPATIBILITY_CHECK',
            guardrail_overrides: [],
            injected_tools: [],
          },
          routing_path: 'pre_routed',
        },
      },
      error: null,
    });

    executeStorefrontCompatibilityCheckCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_compatibility_check',
      capsule_version: '1.0.0',
      execution_status: 'SUCCESS',
      match_strategy: 'COMPATIBLE',
      customer_response_draft: 'Si, el pod si le queda al Caliburn G3.',
      resolved_products: [
        {
          id: 'anchor',
          slug: 'caliburn-g3',
          section: 'vape',
          name: 'Caliburn G3',
          display_price: '$499',
          raw_stock: 10,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: null,
          specs: null,
        },
        {
          id: 'candidate',
          slug: 'pod-g3',
          section: 'vape',
          name: 'Pod G3',
          display_price: '$159',
          raw_stock: 12,
          status_signal: 'IN_STOCK',
          commercial_flag: 'STANDARD',
          ai_sales_note: null,
          description: null,
          specs: null,
        },
      ],
      retrieval_source: 'CATALOG_COMPATIBILITY_GRAPH',
      compatibility_check_signal: {
        kind: 'COMPATIBLE',
        scope: 'ANCHOR_AND_CANDIDATE',
        anchor_product: {
          id: 'anchor',
          name: 'Caliburn G3',
          slug: 'caliburn-g3',
          section: 'vape',
        },
        candidate_product: {
          id: 'candidate',
          name: 'Pod G3',
          slug: 'pod-g3',
          section: 'vape',
        },
        relation_type: 'uses_pod',
        relation_scope: 'specific_model',
        resolved_relation_count: 1,
        suggestion_count: 0,
        cart_context_used: true,
        fit_confidence: 'high',
      },
    });
    getProductsByIdsMock.mockResolvedValue([
      {
        id: 'anchor',
        slug: 'caliburn-g3',
        section: 'vape',
        name: 'Caliburn G3',
        description: null,
        short_description: null,
        price: 499,
        compare_at_price: null,
        stock: 10,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
      {
        id: 'candidate',
        slug: 'pod-g3',
        section: 'vape',
        name: 'Pod G3',
        description: null,
        short_description: null,
        price: 159,
        compare_at_price: null,
        stock: 12,
        sku: null,
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
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
      },
    ]);

    const response = await conciergeService.chat('le queda a mi caliburn g3?', [], {
      id: 'customer-1',
      email: 'test@example.com',
      full_name: 'Juan Perez',
      phone: null,
      whatsapp: null,
      birthdate: null,
      tier: 'bronze',
      account_status: 'active',
      suspension_end: null,
      registered_at: '2026-03-01T00:00:00.000Z',
      last_login_at: '2026-04-01T00:00:00.000Z',
    } as any);

    expect(response.message).toContain('Caliburn G3');
    expect(response.message).toContain('le queda');
    const suggestedProducts = response.suggestedProducts ?? [];
    expect(suggestedProducts.map((product) => product.name)).toEqual([
      'Caliburn G3',
      'Pod G3',
    ]);
    expect(suggestedProducts).toHaveLength(2);
    expect(response.capsule_contract?.capsule_name).toBe('storefront_compatibility_check');
  });
});
