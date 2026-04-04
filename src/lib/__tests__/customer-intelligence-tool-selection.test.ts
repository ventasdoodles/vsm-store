import { describe, expect, it } from 'vitest';

import { buildRuntimeCapabilityPlan } from '../../../supabase/functions/customer-intelligence/tool-selection';

function makeTurnProfile(overrides: Record<string, unknown> = {}) {
  return {
    primary_intent: 'UNKNOWN',
    secondary_intents: [],
    turn_priority: ['UNKNOWN'],
    current_turn_decision: 'DIRECT_ANSWER',
    turn_focus: 'unknown',
    primary_tool_calls: [],
    queued_tool_calls: [],
    ...overrides,
  } as any;
}

function makeCatalogGate(overrides: Record<string, unknown> = {}) {
  return {
    is_open: false,
    reason: 'non_catalog_lane',
    explicit_product_request: false,
    search_leading: false,
    materially_helpful: false,
    clarification_required: false,
    ...overrides,
  } as any;
}

describe('customer-intelligence tool selection', () => {
  it('keeps greeting and small-talk turns in model knowledge without activating tools', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'CHIT_CHAT',
      query: 'hola cesarin',
      toolCalls: [],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'CHIT_CHAT',
        turn_priority: ['CHIT_CHAT'],
        turn_focus: 'chit_chat',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.toolCalls).toEqual([]);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('model_knowledge');
    expect(plan.capabilityBox.modelKnowledge.map((entry) => entry.id)).toEqual([
      'model_turn_reasoning',
      'response_synthesis',
    ]);
    expect(plan.capabilityBox.ownFunctions).toEqual([]);
  });

  it('strips catalog capabilities when clarification-first turns keep the gate closed', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'PRODUCT_SEARCH',
      query: 'quiero algo pero todavia no se bien que',
      toolCalls: [
        { name: 'product_search_integrity', args: { query: 'algo', is_ambiguous: true } },
        { name: 'search_products', args: { query: 'algo' } },
      ],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'PRODUCT_SEARCH',
        turn_priority: ['PRODUCT_SEARCH'],
        current_turn_decision: 'ASK_CLARIFYING_QUESTION',
        turn_focus: 'product_search',
        primary_tool_calls: [
          { name: 'product_search_integrity', args: { query: 'algo', is_ambiguous: true } },
        ],
      }),
      catalogGate: makeCatalogGate({
        reason: 'clarification_first',
        clarification_required: true,
      }),
    });

    expect(plan.toolCalls).toEqual([]);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('model_knowledge');
    expect(plan.capabilityBox.ownFunctions).toEqual([]);
  });

  it('keeps a bounded search capability plan when the turn is genuinely search-leading', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'PRODUCT_SEARCH',
      query: 'vapes frutales para diario',
      toolCalls: [
        { name: 'product_search_integrity', args: { query: 'vapes frutales para diario' } },
      ],
      hasAudio: false,
      hasMemorySummary: true,
      turnProfile: makeTurnProfile({
        primary_intent: 'PRODUCT_SEARCH',
        turn_priority: ['PRODUCT_SEARCH'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'product_search',
        primary_tool_calls: [
          { name: 'product_search_integrity', args: { query: 'vapes frutales para diario' } },
        ],
      }),
      catalogGate: makeCatalogGate({
        is_open: true,
        reason: 'search_leading',
        search_leading: true,
        materially_helpful: true,
      }),
    });

    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['product_search_integrity']);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('product_search_integrity');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['product_search_integrity']);
    expect(plan.capabilityBox.modelKnowledge.map((entry) => entry.id)).toContain('lightweight_memory_read');
  });

  it('selects the kitting capability when the turn asks for a starter setup', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'KIT_ASSEMBLY',
      query: 'armame un kit con pods y liquido al 5%',
      toolCalls: [
        { name: 'storefront_kitting_basket', args: { query: 'armame un kit con pods y liquido al 5%' } },
      ],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'KIT_ASSEMBLY',
        turn_priority: ['KIT_ASSEMBLY'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'kitting',
        primary_tool_calls: [
          { name: 'storefront_kitting_basket', args: { query: 'armame un kit con pods y liquido al 5%' } },
        ],
      }),
      catalogGate: makeCatalogGate({
        is_open: true,
        reason: 'search_leading',
        search_leading: true,
        materially_helpful: true,
      }),
    });

    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['storefront_kitting_basket']);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('storefront_kitting_basket');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['storefront_kitting_basket']);
  });

  it('selects the bounded budget-rescue capsule when the turn explicitly asks for a cheaper trade-down', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'BUDGET_RESCUE',
      query: 'algo parecido pero mas barato al caliburn g3',
      toolCalls: [
        { name: 'storefront_budget_rescue', args: { query: 'algo parecido pero mas barato al caliburn g3' } },
      ],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'BUDGET_RESCUE',
        turn_priority: ['BUDGET_RESCUE'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'budget',
        primary_tool_calls: [
          { name: 'storefront_budget_rescue', args: { query: 'algo parecido pero mas barato al caliburn g3' } },
        ],
      }),
      catalogGate: makeCatalogGate({
        is_open: true,
        reason: 'search_leading',
        search_leading: true,
        materially_helpful: true,
      }),
    });

    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['storefront_budget_rescue']);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('storefront_budget_rescue');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['storefront_budget_rescue']);
  });

  it('selects the bounded compatibility capsule when the turn asks for fit truth', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'COMPATIBILITY_CHECK',
      query: 'le queda a mi caliburn g3?',
      toolCalls: [
        { name: 'storefront_compatibility_check', args: { query: 'le queda a mi caliburn g3?' } },
      ],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'COMPATIBILITY_CHECK',
        turn_priority: ['COMPATIBILITY_CHECK'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'compatibility',
        primary_tool_calls: [
          { name: 'storefront_compatibility_check', args: { query: 'le queda a mi caliburn g3?' } },
        ],
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['storefront_compatibility_check']);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('storefront_compatibility_check');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['storefront_compatibility_check']);
  });

  it('forces the bounded checkout-readiness capsule for close-now friction turns', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'CHECKOUT_READINESS',
      query: 'ya puedo pagar?',
      toolCalls: [],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'CHECKOUT_READINESS',
        turn_priority: ['CHECKOUT_READINESS'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'checkout',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.forcedCapability).toBe('storefront_checkout_readiness');
    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['storefront_checkout_readiness']);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('storefront_checkout_readiness');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['storefront_checkout_readiness']);
  });

  it('keeps private truth explicit by forcing tracking through an own function when needed', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'ORDER_TRACKING',
      query: 'VSM-1234',
      toolCalls: [],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'ORDER_TRACKING',
        turn_priority: ['ORDER_TRACKING'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'order_tracking',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.forcedCapability).toBe('authenticated_order_tracking');
    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['authenticated_order_tracking']);
    expect(plan.serverToolCalls.map((toolCall) => toolCall.name)).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('authenticated_order_tracking');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['authenticated_order_tracking']);
  });

  it('upgrades inventory outlook to the bounded client capsule path before the legacy edge tool', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'INVENTORY_OUTLOOK',
      query: 'todavia hay stock del caliburn g3?',
      toolCalls: [],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'INVENTORY_OUTLOOK',
        turn_priority: ['INVENTORY_OUTLOOK'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'inventory',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.forcedCapability).toBe('storefront_inventory_outlook');
    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['storefront_inventory_outlook']);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('storefront_inventory_outlook');
    expect(plan.capabilityBox.ownFunctions.map((entry) => entry.id)).toEqual(['storefront_inventory_outlook']);
  });

  it('does not activate public web for ambiguous clarify-first turns', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'UNKNOWN',
      query: 'quiero saber algo actual',
      toolCalls: [{ name: 'public_web_search', args: { query: 'quiero saber algo actual' } }],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'UNKNOWN',
        turn_priority: ['UNKNOWN'],
        current_turn_decision: 'ASK_CLARIFYING_QUESTION',
        turn_focus: 'unknown',
      }),
      catalogGate: makeCatalogGate({
        reason: 'clarification_first',
        clarification_required: true,
      }),
    });

    expect(plan.toolCalls).toEqual([]);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('model_knowledge');
  });

  it('does not let web-like wording reopen public web when the turn profile is still product-search', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'PRODUCT_SEARCH',
      query: 'quiero ver el pod waka oficial',
      toolCalls: [{ name: 'public_web_search', args: { query: 'quiero ver el pod waka oficial' } }],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'PRODUCT_SEARCH',
        turn_priority: ['PRODUCT_SEARCH'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'product_search',
      }),
      catalogGate: makeCatalogGate({
        is_open: true,
        reason: 'search_leading',
        search_leading: true,
        materially_helpful: true,
      }),
    });

    expect(plan.toolCalls).toEqual([]);
    expect(plan.serverToolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('model_knowledge');
  });

  it('keeps own functions above public web when the turn needs private truth or action', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'ORDER_TRACKING',
      query: 'rastrea mi pedido VSM-1234 aunque lo busques en internet',
      toolCalls: [{ name: 'public_web_search', args: { query: 'rastrea mi pedido VSM-1234' } }],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'ORDER_TRACKING',
        turn_priority: ['ORDER_TRACKING', 'PUBLIC_INFO'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'tracking',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.forcedCapability).toBe('authenticated_order_tracking');
    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['authenticated_order_tracking']);
    expect(plan.serverToolCalls.map((toolCall) => toolCall.name)).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('client_capsule');
    expect(plan.primaryCapability.name).toBe('authenticated_order_tracking');
  });

  it('makes public_url_context eligible only for explicit URL/page-context turns', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'PUBLIC_INFO',
      query: 'resumeme esta pagina https://example.com/lanzamiento',
      toolCalls: [{ name: 'public_url_context', args: { query: 'resumeme esta pagina', urls: ['https://example.com/lanzamiento'] } }],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'PUBLIC_INFO',
        turn_priority: ['PUBLIC_INFO'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'public_info',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['public_url_context']);
    expect(plan.serverToolCalls.map((toolCall) => toolCall.name)).toEqual(['public_url_context']);
    expect(plan.primaryCapability.kind).toBe('native_public');
    expect(plan.primaryCapability.name).toBe('public_url_context');
  });

  it('makes public_web_search eligible for genuine public-external-info turns without reopening catalog', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'PUBLIC_INFO',
      query: 'ese modelo ya salio este ano oficialmente o sigue anunciado?',
      toolCalls: [{ name: 'public_web_search', args: { query: 'ese modelo ya salio este ano oficialmente o sigue anunciado?' } }],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'PUBLIC_INFO',
        turn_priority: ['PUBLIC_INFO', 'PRODUCT_SEARCH'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'public_info',
      }),
      catalogGate: makeCatalogGate({
        is_open: false,
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['public_web_search']);
    expect(plan.serverToolCalls.map((toolCall) => toolCall.name)).toEqual(['public_web_search']);
    expect(plan.primaryCapability.kind).toBe('native_public');
    expect(plan.primaryCapability.name).toBe('public_web_search');
    expect(plan.toolCalls.some((toolCall) => toolCall.name === 'product_search_integrity')).toBe(false);
  });

  it('does not force an own-function fallback when the turn profile did not ask for capability use', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'ORDER_TRACKING',
      query: 'VSM-1234',
      toolCalls: [],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'ORDER_TRACKING',
        turn_priority: ['ORDER_TRACKING'],
        current_turn_decision: 'DIRECT_ANSWER',
        turn_focus: 'tracking',
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.forcedCapability).toBeNull();
    expect(plan.toolCalls).toEqual([]);
    expect(plan.primaryCapability.kind).toBe('model_knowledge');
  });

  it('does not inject a duplicate policy capsule when an equivalent edge truth function is already present', () => {
    const plan = buildRuntimeCapabilityPlan({
      intent: 'POLICY_INQUIRY',
      query: 'politica de envios',
      toolCalls: [
        { name: 'get_store_policy', args: { query: 'politica de envios' } },
      ],
      hasAudio: false,
      hasMemorySummary: false,
      turnProfile: makeTurnProfile({
        primary_intent: 'POLICY_INQUIRY',
        turn_priority: ['POLICY_INQUIRY'],
        current_turn_decision: 'USE_CAPABILITY',
        turn_focus: 'policy',
        primary_tool_calls: [
          { name: 'get_store_policy', args: { query: 'politica de envios' } },
        ],
      }),
      catalogGate: makeCatalogGate({
        reason: 'non_catalog_lane',
      }),
    });

    expect(plan.forcedCapability).toBeNull();
    expect(plan.toolCalls.map((toolCall) => toolCall.name)).toEqual(['get_store_policy']);
    expect(plan.primaryCapability.name).toBe('get_store_policy');
  });
});
