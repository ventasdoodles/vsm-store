import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn<any>();
const insertMock = vi.fn<any>();
const executeProductSearchCapsuleMock = vi.fn<any>();
const getProductsByIdsMock = vi.fn<any>();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => (invokeMock as any)(args[0], args[1]),
    },
    from: vi.fn(() => ({
      insert: (...args: unknown[]) => (insertMock as any)(args[0]),
    })),
  },
}));

vi.mock('@/services/ai-capsule-orchestrator.service', () => ({
  executeProductSearchCapsule: (...args: unknown[]) => (executeProductSearchCapsuleMock as any)(args[0]),
  executeKnowledgeCapsule: vi.fn(),
  executeCartOperatorCapsule: vi.fn(),
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
    getProductsByIdsMock.mockReset();
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
    expect((response as any).capsule_contract?.next_step_view?.family).toBe('REVIEW_ONE');
    expect((response as any).capsule_contract?.next_step_view?.guidance).toBe('Lo mas util ahorita es abrir Mint Fresh.');
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
});
