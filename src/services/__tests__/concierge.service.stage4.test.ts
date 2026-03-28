import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn<any>();
const insertMock = vi.fn<any>();
const executeProductSearchCapsuleMock = vi.fn<any>();

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

import { conciergeService } from '../concierge.service';

describe('conciergeService Stage 4 adaptive conversation', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    insertMock.mockClear();
    executeProductSearchCapsuleMock.mockReset();
  });

  it('adapts a broad returning-user recommendation into a shorter direct path', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        conversation_mode_hint: 'DIRECT_RECOMMEND',
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

    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint', 'berry']);
    expect(response.message).toContain('yo arrancaria por Mint Fresh');
    expect(response.message).toContain('A ver, ya te voy ubicando un poco.');
  });
});
