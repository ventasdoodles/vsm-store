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
        { name: 'authenticated_order_tracking', args: { query: 'mi pedido VSM-123' } },
        { name: 'product_search_integrity', args: { query: 'sabores' } },
      ],
    });

    expect(profile.primary_intent).toBe('ORDER_TRACKING');
    expect(profile.secondary_intents).toContain('PRODUCT_SEARCH');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('authenticated_order_tracking');
    expect(profile.queued_tool_calls.map((toolCall) => toolCall.name)).toContain('product_search_integrity');
  });

  it('routes payment-confirmation phrasing to ORDER_TRACKING without opening the catalog lane', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'UNKNOWN',
      analystDecision: 'USE_CAPABILITY',
      query: 'ya paso mi pago?',
      toolCalls: [
        { name: 'authenticated_order_tracking', args: { query: 'ya paso mi pago?' } },
      ],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'ya paso mi pago',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: true,
        isProductMatch: false,
        isKittingMatch: false,
        isReplenishmentMatch: false,
        isGreeting: false,
        isTrackingMatch: true,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(turnProfile.primary_intent).toBe('ORDER_TRACKING');
    expect(turnProfile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('non_catalog_lane');
  });

  it('prefers warranty support over product curiosity when the turn reports a post-purchase defect', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'mi pod llego roto y de paso que sabores tienen',
      toolCalls: [
        { name: 'authenticated_warranty_triage', args: { query: 'mi pod llego roto' } },
        { name: 'product_search_integrity', args: { query: 'sabores' } },
      ],
    });

    expect(profile.primary_intent).toBe('WARRANTY_SUPPORT');
    expect(profile.secondary_intents).toContain('PRODUCT_SEARCH');
    expect(profile.turn_focus).toBe('warranty');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('authenticated_warranty_triage');
  });

  it('prefers loyalty support over product curiosity when the turn asks for authenticated points truth', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'cuantos puntos tengo y de paso que sabores tienen',
      toolCalls: [
        { name: 'authenticated_loyalty_status', args: { query: 'cuantos puntos tengo' } },
        { name: 'product_search_integrity', args: { query: 'sabores' } },
      ],
    });

    expect(profile.primary_intent).toBe('LOYALTY_SUPPORT');
    expect(profile.secondary_intents).toContain('PRODUCT_SEARCH');
    expect(profile.turn_focus).toBe('loyalty');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('authenticated_loyalty_status');
  });

  it('prefers kitting over product curiosity when the turn asks for a bounded starter setup', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'armame un kit con pods y liquido al 5%',
      toolCalls: [
        { name: 'storefront_kitting_basket', args: { query: 'armame un kit con pods y liquido al 5%' } },
        { name: 'product_search_integrity', args: { query: 'pods y liquido' } },
      ],
    });

    expect(profile.primary_intent).toBe('KIT_ASSEMBLY');
    expect(profile.secondary_intents).toContain('PRODUCT_SEARCH');
    expect(profile.turn_focus).toBe('kitting');
    expect(profile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('storefront_kitting_basket');
  });

  it('routes loyalty balance phrasing to LOYALTY_SUPPORT without opening the catalog lane', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'UNKNOWN',
      analystDecision: 'USE_CAPABILITY',
      query: 'cuanto valen mis puntos?',
      toolCalls: [
        { name: 'authenticated_loyalty_status', args: { query: 'cuanto valen mis puntos?' } },
      ],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'cuanto valen mis puntos',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: false,
        isProductMatch: false,
        isKittingMatch: false,
        isReplenishmentMatch: false,
        isGreeting: false,
        isTrackingMatch: false,
        isWarrantyMatch: false,
        isLoyaltyMatch: true,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(turnProfile.primary_intent).toBe('LOYALTY_SUPPORT');
    expect(turnProfile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(gate.is_open).toBe(false);
    expect(gate.reason).toBe('non_catalog_lane');
  });

  it('opens the catalog gate for a clear kitting turn', () => {
    const turnProfile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
      analystDecision: 'USE_CAPABILITY',
      query: 'armame un kit con pods y liquido al 5%',
      toolCalls: [
        { name: 'storefront_kitting_basket', args: { query: 'armame un kit con pods y liquido al 5%' } },
      ],
    });

    const gate = resolveCatalogGate({
      turnProfile,
      turnSignals: {
        normalizedQuery: 'armame un kit con pods y liquido al 5%',
        isCompatibilityMatch: false,
        isInventoryMatch: false,
        isPolicyMatch: false,
        isProductMatch: true,
        isKittingMatch: true,
        isReplenishmentMatch: false,
        isGreeting: false,
        isTrackingMatch: false,
        isWarrantyMatch: false,
        isLoyaltyMatch: false,
        isCartMatch: false,
        isTimeContext: false,
        hasExplicitUrl: false,
        needsPublicWebContext: false,
      },
    });

    expect(turnProfile.primary_intent).toBe('KIT_ASSEMBLY');
    expect(turnProfile.current_turn_decision).toBe('USE_CAPABILITY');
    expect(gate.is_open).toBe(true);
    expect(gate.reason).toBe('search_leading');
  });

  it('keeps generic warranty-policy questions in the policy lane instead of hijacking them as authenticated defect triage', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'POLICY_INQUIRY',
      analystDecision: 'USE_CAPABILITY',
      query: 'cual es la garantia de los pods',
      toolCalls: [
        { name: 'knowledge_rag_foundation', args: { query: 'garantia de los pods', is_ambiguous: false } },
      ],
    });

    expect(profile.primary_intent).toBe('POLICY_INQUIRY');
    expect(profile.turn_focus).toBe('policy');
    expect(profile.primary_tool_calls.map((toolCall) => toolCall.name)).toContain('knowledge_rag_foundation');
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
      isKittingMatch: false,
      isGreeting: false,
      isTrackingMatch: true,
      isLoyaltyMatch: false,
      isCartMatch: false,
    });

    const loyalty = resolveStorefrontWeakIntent({
      intent: 'UNKNOWN',
      isInventoryMatch: false,
      isPolicyMatch: false,
      isProductMatch: false,
      isKittingMatch: false,
      isGreeting: false,
      isTrackingMatch: false,
      isLoyaltyMatch: true,
      isCartMatch: false,
    });

    const cart = resolveStorefrontWeakIntent({
      intent: 'UNKNOWN',
      isInventoryMatch: false,
      isPolicyMatch: false,
      isProductMatch: false,
      isKittingMatch: false,
      isGreeting: false,
      isTrackingMatch: false,
      isLoyaltyMatch: false,
      isCartMatch: true,
    });

    expect(tracking.intent).toBe('ORDER_TRACKING');
    expect(tracking.guardrailOverrides).toContain('UNKNOWN_RESOLVE_TRACKING');
    expect(loyalty.intent).toBe('LOYALTY_SUPPORT');
    expect(loyalty.guardrailOverrides).toContain('UNKNOWN_RESOLVE_LOYALTY');
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
        isKittingMatch: false,
        isReplenishmentMatch: false,
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
        isKittingMatch: false,
        isReplenishmentMatch: false,
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
        isKittingMatch: false,
        isReplenishmentMatch: false,
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
        isKittingMatch: false,
        isReplenishmentMatch: false,
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
        isKittingMatch: false,
        isReplenishmentMatch: false,
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
        isKittingMatch: false,
        isReplenishmentMatch: false,
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
