import { describe, expect, it } from 'vitest';

import {
  resolveCatalogGate,
  filterToolCallsForIntent,
  resolveStorefrontWeakIntent,
  resolveTurnFirstIntent,
} from '../../../supabase/functions/customer-intelligence/intent-guardrails';

describe('customer-intelligence turn-first intent resolution', () => {
  it('prefers policy over product search when both are present in the same turn', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'quiero algo frutal pero cual es la politica de envios',
      toolCalls: [
        { name: 'product_search_integrity', args: { query: 'frutal' } },
        { name: 'knowledge_rag_foundation', args: { query: 'politica de envios' } },
      ],
    });

    expect(profile.primary_intent).toBe('POLICY_INQUIRY');
    expect(profile.secondary_intents).toContain('PRODUCT_SEARCH');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.turn_priority[0]).toBe('POLICY_INQUIRY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('knowledge_rag_foundation');
    expect(profile.queued_tool_calls.map((toolCall) => toolCall.name)).toContain('product_search_integrity');
    expect(filterToolCallsForIntent(profile.queued_tool_calls, 'PRODUCT_SEARCH').length).toBe(1);
  });

  it('prefers tracking over product curiosity when an order question is also present', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'mi pedido VSM-123 y de paso que sabores tienen',
      toolCalls: [
        { name: 'track_order', args: { order_number: 'VSM-123' } },
        { name: 'product_search_integrity', args: { query: 'sabores' } },
      ],
    });

    expect(profile.primary_intent).toBe('ORDER_TRACKING');
    expect(profile.secondary_intents).toContain('PRODUCT_SEARCH');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('track_order');
    expect(profile.queued_tool_calls.map((toolCall) => toolCall.name)).toContain('product_search_integrity');
  });

  it('prefers compatibility over cart pressure when the current turn asks fit questions', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'CART_OPERATION',
      analystDecision: 'USE_CAPABILITY',
      query: 'agrega este vape pero que coil usa mi equipo',
      toolCalls: [
        { name: 'cart_operator', args: { action: 'ADD', product_ref: 'vape', quantity: 1 } },
        { name: 'check_compatibility', args: { query: 'que coil usa mi equipo' } },
      ],
    });

    expect(profile.primary_intent).toBe('COMPATIBILITY_CHECK');
    expect(profile.secondary_intents).toContain('CART_OPERATION');
    expect(profile.turn_focus).toBe('compatibility');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('check_compatibility');
    expect(profile.queued_tool_calls.map((toolCall) => toolCall.name)).toContain('cart_operator');
  });

  it('lets UNKNOWN resolve to current-turn tracking or cart signals instead of staying stale', () => {
    const tracking = resolveStorefrontWeakIntent({
      intent: 'UNKNOWN',
      isInventoryMatch: false,
      isPolicyMatch: false,
      isProductMatch: false,
      isGreeting: false,
      isTrackingMatch: true,
      isCartMatch: false,
    });

    const cart = resolveStorefrontWeakIntent({
      intent: 'UNKNOWN',
      isInventoryMatch: false,
      isPolicyMatch: false,
      isProductMatch: false,
      isGreeting: false,
      isTrackingMatch: false,
      isCartMatch: true,
    });

    expect(tracking.intent).toBe('ORDER_TRACKING');
    expect(tracking.guardrailOverrides).toContain('UNKNOWN_RESOLVE_TRACKING');
    expect(cart.intent).toBe('CART_OPERATION');
    expect(cart.guardrailOverrides).toContain('UNKNOWN_RESOLVE_CART');
  });

  it('opens the catalog gate for a clear search-leading turn', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'vapes frutales para diario',
      toolCalls: [
        { name: 'product_search_integrity', args: { query: 'vapes frutales' } },
      ],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'vapes frutales para diario',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: false,
        isProductMatch: true,
        isGreeting: false,
        isTrackingMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(gate.is_open).toBe(true);
    expect(gate.reason).toBe('search_leading');
    expect(gate.search_leading).toBe(true);
    expect(gate.explicit_product_request).toBe(false);
    expect(gate.clarification_required).toBe(false);
  });

  it('keeps clarification-first turns catalog-suppressed', () => {
    const gate = resolveCatalogGate({
      turnProfile: {
        primary_intent: 'UNKNOWN',
        secondary_intents: [],
        turn_priority: ['UNKNOWN'],
        current_turn_decision: 'ASK_CLARIFYING_QUESTION',
        turn_focus: 'unknown',
        primary_tool_calls: [],
        queued_tool_calls: [],
      } as any,
      turnSignals: {
        normalizedQuery: 'me ayudas',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: false,
        isProductMatch: false,
        isGreeting: false,
        isTrackingMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('clarification_first');
    expect(gate.clarification_required).toBe(true);
  });

  it('keeps policy-first turns catalog-suppressed even if product language is present', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'cual es la politica de envios y tambien recomiendame algo frutal',
      toolCalls: [
        { name: 'knowledge_rag_foundation', args: { query: 'politica de envios' } },
        { name: 'product_search_integrity', args: { query: 'frutal' } },
      ],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'cual es la politica de envios y tambien recomiendame algo frutal',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: true,
        isProductMatch: true,
        isGreeting: false,
        isTrackingMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('non_catalog_lane');
    expect(gate.materially_helpful).toBe(true);
  });

  it('keeps search turns clarification-first when the analyst says products would be premature', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'ASK_CLARIFYING_QUESTION',
      query: 'quiero algo pero antes dime cual me conviene mas',
      toolCalls: [
        { name: 'product_search_integrity', args: { query: 'algo', is_ambiguous: true, requires_semantic_expansion: true } },
      ],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'quiero algo pero antes dime cual me conviene mas',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: false,
        isProductMatch: true,
        isGreeting: false,
        isTrackingMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(turnProfile.primary_intent).toBe('PRODUCT_SEARCH');
    expect(turnProfile.current_turn_decision).toBe('ASK_CLARIFYING_QUESTION');
    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('clarification_first');
  });

  it('routes explicit public-web turns to PUBLIC_INFO without opening the catalog gate', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'UNKNOWN',
      analystDecision: 'USE_CAPABILITY',
      query: 'resumeme esta pagina https://example.com/lanzamiento',
      toolCalls: [],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'resumeme esta pagina https://example.com/lanzamiento',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: false,
        isProductMatch: false,
        isGreeting: false,
        isTrackingMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: true,
        needsPublicWebContext: true,
      },
    });

    expect(turnProfile.primary_intent).toBe('PUBLIC_INFO');
    expect(turnProfile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('non_catalog_lane');
  });

  it('routes store-hours turns to POLICY_INQUIRY without opening the catalog gate', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'UNKNOWN',
      analystDecision: null,
      query: 'a que hora abren hoy?',
      toolCalls: [],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'a que hora abren hoy',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: true,
        isProductMatch: false,
        isGreeting: false,
        isTrackingMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(turnProfile.primary_intent).toBe('POLICY_INQUIRY');
    expect(turnProfile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('non_catalog_lane');
  });

  it('does not let public-web regex cues overtake a resolved product-search analyst turn by themselves', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'quiero ver un pod waka oficial',
      toolCalls: [
        { name: 'product_search_integrity', args: { query: 'pod waka' } },
      ],
    });

    expect(turnProfile.primary_intent).toBe('PRODUCT_SEARCH');
    expect(turnProfile.secondary_intents).not.toContain('PUBLIC_INFO');
    expect(turnProfile.primary_tool_calls.map((toolCall) => toolCall.name)).toEqual(['product_search_integrity']);
  });

  it('keeps a bare URL as clarification-first instead of auto-triggering public web', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'UNKNOWN',
      analystDecision: null,
      query: 'https://example.com/lanzamiento',
      toolCalls: [],
    });

    expect(turnProfile.primary_intent).toBe('UNKNOWN');
    expect(turnProfile.current_turn_decision).toBe('ASK_CLARIFYING_QUESTION');
  });
});
