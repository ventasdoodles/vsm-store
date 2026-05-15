import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  edgeInvoke: vi.fn(),
  telemetryFrom: vi.fn(),
  telemetryInsert: vi.fn(),
  executeKnowledgeCapsule: vi.fn(),
  executeProductSearchCapsule: vi.fn(),
  executeCartOperatorCapsule: vi.fn(),
  executeStorefrontBudgetRescueCapsule: vi.fn(),
  executeStorefrontCheckoutReadinessCapsule: vi.fn(),
  executeStorefrontCompatibilityCheckCapsule: vi.fn(),
  executeStorefrontInventoryOutlookCapsule: vi.fn(),
  executeStorefrontKittingBasketCapsule: vi.fn(),
  executeAuthenticatedOrderTrackingCapsule: vi.fn(),
  executeAuthenticatedWarrantyTriageCapsule: vi.fn(),
  executeAuthenticatedLoyaltyStatusCapsule: vi.fn(),
  getProductsByIds: vi.fn(),
  resolveStorefrontAttachmentOffers: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mocks.edgeInvoke(...args),
    },
    from: (...args: unknown[]) => mocks.telemetryFrom(...args),
  },
}));

vi.mock('@/services/ai-capsule-orchestrator.service', () => ({
  executeProductSearchCapsule: (...args: unknown[]) => mocks.executeProductSearchCapsule(...args),
  executeKnowledgeCapsule: (...args: unknown[]) => mocks.executeKnowledgeCapsule(...args),
  executeCartOperatorCapsule: (...args: unknown[]) => mocks.executeCartOperatorCapsule(...args),
  executeStorefrontBudgetRescueCapsule: (...args: unknown[]) => mocks.executeStorefrontBudgetRescueCapsule(...args),
  executeStorefrontCheckoutReadinessCapsule: (...args: unknown[]) => mocks.executeStorefrontCheckoutReadinessCapsule(...args),
  executeStorefrontCompatibilityCheckCapsule: (...args: unknown[]) => mocks.executeStorefrontCompatibilityCheckCapsule(...args),
  executeStorefrontInventoryOutlookCapsule: (...args: unknown[]) => mocks.executeStorefrontInventoryOutlookCapsule(...args),
  executeStorefrontKittingBasketCapsule: (...args: unknown[]) => mocks.executeStorefrontKittingBasketCapsule(...args),
  executeAuthenticatedOrderTrackingCapsule: (...args: unknown[]) => mocks.executeAuthenticatedOrderTrackingCapsule(...args),
  executeAuthenticatedWarrantyTriageCapsule: (...args: unknown[]) => mocks.executeAuthenticatedWarrantyTriageCapsule(...args),
  executeAuthenticatedLoyaltyStatusCapsule: (...args: unknown[]) => mocks.executeAuthenticatedLoyaltyStatusCapsule(...args),
}));

vi.mock('@/lib/pilot-activation', () => ({
  isPilotActive: () => true,
}));

vi.mock('@/services/products.service', () => ({
  getProductsByIds: (...args: unknown[]) => mocks.getProductsByIds(...args),
}));

vi.mock('@/services/storefront-attachments.service', () => ({
  resolveStorefrontAttachmentOffers: (...args: unknown[]) => mocks.resolveStorefrontAttachmentOffers(...args),
}));

import { conciergeService } from '../concierge.service';

describe('conciergeService knowledge capsule no-mutation harness', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.telemetryFrom.mockImplementation(() => {
      throw new Error('telemetry disabled in no-mutation harness');
    });
    mocks.edgeInvoke.mockResolvedValue({
      data: {
        requires_client_capsule: true,
        capsule_name: 'knowledge_rag_foundation',
        conversational_prefix: null,
        tool_args: {
          query: 'cuanto cuesta el envio por DHL',
          is_ambiguous: false,
        },
        turn_profile: {
          primary_intent: 'POLICY_INQUIRY',
          secondary_intents: [],
          turn_priority: 'primary',
          current_turn_decision: 'USE_CAPABILITY',
          turn_focus: null,
        },
        catalog_gate: {
          is_open: false,
          reason: 'non_catalog_lane',
          primary_intent: 'POLICY_INQUIRY',
          explicit_product_request: false,
          search_leading: false,
          needs_clarification: false,
        },
        debug: {
          routing_path: 'pre_routed',
          guardrail_telemetry: {
            analyst_intent: 'POLICY_INQUIRY',
            guardrail_overrides: [],
            injected_tools: ['knowledge_rag_foundation'],
          },
        },
      },
      error: null,
    });
    mocks.executeKnowledgeCapsule.mockResolvedValue({
      capsule_name: 'knowledge_rag_foundation',
      execution_status: 'SUCCESS',
      match_strategy: 'MODERATE_CONFIDENCE_MULTI_SOURCE',
      ui_render_hint: 'He recopilado esta informacion relacionada para ayudarte.',
      resolved_chunks: [
        {
          id: 'chunk-shipping-1',
          source_id: 'politica-envios-detallada-v1',
          title: 'Politica de envio DHL',
          category: 'shipping',
          content: 'El envio por DHL se cotiza antes de confirmar el pedido y se comparte con el cliente.',
          similarity: 0.7278,
        },
        {
          id: 'chunk-payments-1',
          source_id: 'politica-pagos-v2',
          title: 'Metodos de pago aceptados',
          category: 'payments',
          content: 'Se aceptan transferencia bancaria y deposito; el pedido avanza cuando se confirma el pago.',
          similarity: 0.7289,
        },
        {
          id: 'chunk-onboarding-1',
          source_id: 'guia-onboarding-v1',
          title: 'Como hacer un pedido',
          category: 'onboarding',
          content: 'Para comprar, el cliente elige producto, confirma disponibilidad y recibe instrucciones de pago.',
          similarity: 0.7349,
        },
        {
          id: 'chunk-xalapa-1',
          source_id: 'info-ubicacion-xalapa-v1',
          title: 'Atencion en Xalapa',
          category: 'policies',
          content: 'La tienda opera en linea y no maneja showroom publico ni entregas personales abiertas.',
          similarity: 0.7728,
        },
        {
          id: 'chunk-vape-basics-1',
          source_id: 'guia-dejar-fumar-v1',
          title: 'Guia inicial de nicotina',
          category: 'vape_basics',
          content: 'La eleccion de nicotina depende del consumo previo y la tolerancia de quien empieza.',
          similarity: 0.7906,
        },
      ],
    });
  });

  it('returns a generic knowledge answer plus resolved chunks suitable for AIConcierge rendering', async () => {
    const response = await conciergeService.chat('cuanto cuesta el envio por DHL', []);

    expect(mocks.edgeInvoke).toHaveBeenCalledWith('customer-intelligence', expect.objectContaining({
      body: expect.objectContaining({
        action: 'concierge_chat',
        query: 'cuanto cuesta el envio por DHL',
      }),
    }));
    expect(mocks.executeKnowledgeCapsule).toHaveBeenCalledWith({
      query: 'cuanto cuesta el envio por DHL',
      is_ambiguous: false,
    });
    expect(response.message).toBe('He recopilado esta informacion relacionada para ayudarte.');
    expect(response.message).not.toContain('El envio por DHL se cotiza');
    expect(response.intent).toBe('info');
    expect(response.capsule_contract).toMatchObject({
      capsule_name: 'knowledge_rag_foundation',
      execution_status: 'SUCCESS',
      match_strategy: 'MODERATE_CONFIDENCE_MULTI_SOURCE',
      ui_render_hint: 'He recopilado esta informacion relacionada para ayudarte.',
    });

    const chunks = response.capsule_contract?.resolved_chunks ?? [];
    expect(chunks).toHaveLength(5);
    expect(chunks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source_id: 'politica-envios-detallada-v1',
        title: 'Politica de envio DHL',
        category: 'shipping',
        content: expect.stringContaining('El envio por DHL se cotiza'),
      }),
      expect.objectContaining({
        source_id: 'politica-pagos-v2',
        category: 'payments',
        content: expect.stringContaining('transferencia bancaria'),
      }),
      expect.objectContaining({
        source_id: 'guia-onboarding-v1',
        category: 'onboarding',
        content: expect.stringContaining('confirma disponibilidad'),
      }),
      expect.objectContaining({
        source_id: 'info-ubicacion-xalapa-v1',
        category: 'policies',
        content: expect.stringContaining('no maneja showroom publico'),
      }),
      expect.objectContaining({
        source_id: 'guia-dejar-fumar-v1',
        category: 'vape_basics',
        content: expect.stringContaining('eleccion de nicotina'),
      }),
    ]));
    expect(response.capsule_contract?.turn_analysis).toMatchObject({
      primary_intent: 'POLICY_INQUIRY',
      current_turn_decision: 'USE_CAPABILITY',
    });
    expect(response.capsule_contract?.catalog_gate).toMatchObject({
      is_open: false,
      reason: 'non_catalog_lane',
    });
    expect(mocks.telemetryFrom).toHaveBeenCalledWith('ai_analytics');
    expect(mocks.telemetryInsert).not.toHaveBeenCalled();
    expect(mocks.executeProductSearchCapsule).not.toHaveBeenCalled();
    expect(mocks.executeCartOperatorCapsule).not.toHaveBeenCalled();
  });
});
