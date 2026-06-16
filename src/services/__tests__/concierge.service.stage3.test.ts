import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn<any>();
const insertMock = vi.fn<any>();
const executeProductSearchCapsuleMock = vi.fn<any>();
const executeStorefrontCheckoutReadinessCapsuleMock = vi.fn<any>();
const executeStorefrontInventoryOutlookCapsuleMock = vi.fn<any>();
const executeAuthenticatedOrderTrackingCapsuleMock = vi.fn<any>();
const executeAuthenticatedWarrantyTriageCapsuleMock = vi.fn<any>();
const executeAuthenticatedLoyaltyStatusCapsuleMock = vi.fn<any>();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => (invokeMock as any)(args[0], args[1]),
    },
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: vi.fn(() => ({
      insert: (...args: unknown[]) => (insertMock as any)(args[0]),
    })),
  },
}));

vi.mock('@/services/ai-capsule-orchestrator.service', () => ({
  executeProductSearchCapsule: (...args: unknown[]) => (executeProductSearchCapsuleMock as any)(args[0]),
  executeStorefrontCheckoutReadinessCapsule: (...args: unknown[]) => (executeStorefrontCheckoutReadinessCapsuleMock as any)(args[0], args[1]),
  executeStorefrontInventoryOutlookCapsule: (...args: unknown[]) => (executeStorefrontInventoryOutlookCapsuleMock as any)(args[0]),
  executeKnowledgeCapsule: vi.fn(),
  executeCartOperatorCapsule: vi.fn(),
  executeAuthenticatedOrderTrackingCapsule: (...args: unknown[]) => (executeAuthenticatedOrderTrackingCapsuleMock as any)(args[0], args[1]),
  executeAuthenticatedWarrantyTriageCapsule: (...args: unknown[]) => (executeAuthenticatedWarrantyTriageCapsuleMock as any)(args[0], args[1]),
  executeAuthenticatedLoyaltyStatusCapsule: (...args: unknown[]) => (executeAuthenticatedLoyaltyStatusCapsuleMock as any)(args[0], args[1]),
}));

vi.mock('@/lib/pilot-activation', () => ({
  isPilotActive: () => true,
}));

import { conciergeService } from '../concierge.service';

describe('conciergeService Stage 3 memory-aware reranking', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    insertMock.mockClear();
    executeProductSearchCapsuleMock.mockReset();
    executeStorefrontCheckoutReadinessCapsuleMock.mockReset();
    executeStorefrontInventoryOutlookCapsuleMock.mockReset();
    executeAuthenticatedOrderTrackingCapsuleMock.mockReset();
    executeAuthenticatedWarrantyTriageCapsuleMock.mockReset();
    executeAuthenticatedLoyaltyStatusCapsuleMock.mockReset();

    global.fetch = vi.fn().mockImplementation(async (_url: string, options: any) => {
        const body = options?.body ? JSON.parse(options.body) : {};
        const result = await (invokeMock as any)('customer-intelligence', { body });
        
        if (result && result.error) {
            if (result.error.message && result.error.message.includes('fetch failed')) {
                throw new TypeError('fetch failed');
            }
            if (result.error.message === 'REQUEST_TIMEOUT') {
                throw new Error('REQUEST_TIMEOUT');
            }
            return {
                ok: false,
                status: 403,
                text: async () => JSON.stringify(result.error)
            };
        }
        
        return {
            ok: true,
            status: 200,
            json: async () => result?.data || {},
            headers: new Map([['content-type', 'application/json']])
        };
    });
  });

  it('reranks client capsule product suggestions using compact memory context', async () => {
    invokeMock.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'product_search_integrity',
        tool_args: {
          query: 'algo tranqui',
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
      customer_response_draft: 'Te dejo unas cercanas.',
      resolved_products: [
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

    const response = await conciergeService.chat('algo tranqui', [], {
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

    expect(response.suggestedProducts?.map((product) => product.id)).toEqual(['mint', 'sweet']);
  });
});
