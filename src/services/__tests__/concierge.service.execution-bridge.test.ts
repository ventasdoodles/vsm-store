import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn<any>();
const insertMock = vi.fn<any>();
const executeStorefrontCheckoutReadinessCapsuleMock = vi.fn<any>();
const executeAuthenticatedOrderTrackingCapsuleMock = vi.fn<any>();

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
  executeProductSearchCapsule: vi.fn(),
  executeKnowledgeCapsule: vi.fn(),
  executeCartOperatorCapsule: vi.fn(),
  executeStorefrontBudgetRescueCapsule: vi.fn(),
  executeStorefrontCheckoutReadinessCapsule: (...args: unknown[]) => (executeStorefrontCheckoutReadinessCapsuleMock as any)(args[0], args[1]),
  executeStorefrontCompatibilityCheckCapsule: vi.fn(),
  executeStorefrontInventoryOutlookCapsule: vi.fn(),
  executeStorefrontKittingBasketCapsule: vi.fn(),
  executeAuthenticatedOrderTrackingCapsule: (...args: unknown[]) => (executeAuthenticatedOrderTrackingCapsuleMock as any)(args[0], args[1]),
  executeAuthenticatedWarrantyTriageCapsule: vi.fn(),
  executeAuthenticatedLoyaltyStatusCapsule: vi.fn(),
}));

vi.mock('@/lib/pilot-activation', () => ({
  isPilotActive: () => true,
}));

import { conciergeService } from '../concierge.service';
import type { CustomerProfile } from '@/types/customer';

const customerProfile: CustomerProfile = {
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
};

function mockCheckoutRoute(query: string) {
  invokeMock.mockResolvedValue({
    data: {
      requires_client_capsule: true,
      capsule_name: 'storefront_checkout_readiness',
      tool_args: { query },
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
}

function mockOrderTrackingRoute(query: string) {
  invokeMock.mockResolvedValue({
    data: {
      requires_client_capsule: true,
      capsule_name: 'authenticated_order_tracking',
      tool_args: { query },
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
}

describe('conciergeService execution bridge', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    insertMock.mockClear();
    executeStorefrontCheckoutReadinessCapsuleMock.mockReset();
    executeAuthenticatedOrderTrackingCapsuleMock.mockReset();

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

  it('adds a checkout handoff CTA only for ready-to-checkout storefront truth', async () => {
    mockCheckoutRoute('ya puedo pagar?');
    executeStorefrontCheckoutReadinessCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_checkout_readiness',
      execution_status: 'SUCCESS',
      match_strategy: 'READY_TO_CHECKOUT',
      customer_response_draft: 'Si, con lo que veo ahorita tu carrito esta listo para pasar a checkout.',
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
      },
      retrieval_source: 'CART_VALIDATION',
    });

    const response = await conciergeService.chat('ya puedo pagar?', [], customerProfile);

    expect(response.action).toEqual({
      label: 'Abrir checkout',
      url: '/checkout',
      type: 'link',
    });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      assist_action_present: true,
    }));
  });

  it('adds an open-order continuation CTA only for recoverable open-order blockers', async () => {
    mockCheckoutRoute('quiero cerrar la compra');
    executeStorefrontCheckoutReadinessCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_checkout_readiness',
      execution_status: 'SUCCESS',
      match_strategy: 'CART_BLOCKER',
      customer_response_draft: 'Ya existe una orden abierta que debes retomar antes de abrir otra.',
      checkout_readiness_signal: {
        kind: 'CART_BLOCKER',
        focus: 'checkout',
        scope: 'AUTHENTICATED_OPEN_ORDER',
        cart_item_count: 1,
        purchasable_item_count: 1,
        checkout_status: 'blocked',
        delivery_type: 'pickup',
        payment_method: 'mercadopago',
        enabled_payment_methods: ['transfer', 'mercadopago'],
        missing_fields: [],
        blocker_reason: 'open_recoverable_order',
        can_proceed_to_checkout: false,
        can_submit_checkout: false,
        open_order_id: 'order-open-1',
        open_order_number: 'VSM-401',
      },
      retrieval_source: 'AUTHENTICATED_ORDER_RECOVERY',
    });

    const response = await conciergeService.chat('quiero cerrar la compra', [], customerProfile);

    expect(response.action).toEqual({
      label: 'Retomar orden abierta',
      url: '/orders/order-open-1',
      type: 'link',
    });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      assist_action_present: true,
    }));
  });

  it('keeps non-eligible checkout states advisory-only', async () => {
    mockCheckoutRoute('que me falta para comprar');
    executeStorefrontCheckoutReadinessCapsuleMock.mockResolvedValue({
      capsule_name: 'storefront_checkout_readiness',
      execution_status: 'SUCCESS',
      match_strategy: 'MISSING_REQUIRED_INFO',
      customer_response_draft: 'Te falta elegir metodo de pago antes de cerrar.',
      checkout_readiness_signal: {
        kind: 'MISSING_REQUIRED_INFO',
        focus: 'checkout',
        scope: 'CHECKOUT_DRAFT',
        cart_item_count: 1,
        purchasable_item_count: 1,
        checkout_status: 'review',
        delivery_type: 'pickup',
        payment_method: null,
        enabled_payment_methods: ['transfer', 'mercadopago'],
        missing_fields: ['payment_method'],
        blocker_reason: 'none',
        can_proceed_to_checkout: true,
        can_submit_checkout: false,
        open_order_id: null,
        open_order_number: null,
      },
      retrieval_source: 'CHECKOUT_DRAFT',
    });

    const response = await conciergeService.chat('que me falta para comprar', [], customerProfile);

    expect(response.action).toBeUndefined();
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      assist_action_present: false,
    }));
  });

  it('adds a payment continuation CTA only for pending Mercado Pago orders', async () => {
    mockOrderTrackingRoute('ya paso mi pago?');
    executeAuthenticatedOrderTrackingCapsuleMock.mockResolvedValue({
      capsule_name: 'authenticated_order_tracking',
      execution_status: 'SUCCESS',
      match_strategy: 'AUTHENTICATED_ACTIVE_ORDER',
      customer_response_draft: 'Tu pedido VSM-321 sigue registrado. El pago sigue pendiente.',
      order_tracking_signal: {
        kind: 'FOUND',
        focus: 'payment_status',
        scope: 'RECENT_ACTIVE_ORDERS',
        order_id: 'order-321',
        order_number: 'VSM-321',
        order_status: 'confirmed',
        payment_status: 'pending',
        payment_method: 'mercadopago',
        tracking_number: null,
        tracking_link: null,
        matched_by: 'recent_active_order',
      },
      retrieval_source: 'AUTHENTICATED_ACTIVE_ORDER',
    });

    const response = await conciergeService.chat('ya paso mi pago?', [], customerProfile);

    expect(response.action).toEqual({
      label: 'Continuar pago pendiente',
      url: '/payment/pending?order_id=order-321',
      type: 'link',
    });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      assist_action_present: true,
    }));
  });
});
