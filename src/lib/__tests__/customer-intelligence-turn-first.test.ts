import { describe, expect, it } from 'vitest';

import {
  filterToolCallsForIntent,
  resolveStorefrontWeakIntent,
  resolveTurnFirstIntent,
} from '../../../supabase/functions/customer-intelligence/intent-guardrails';

describe('customer-intelligence turn-first intent resolution', () => {
  it('prefers policy over product search when both are present in the same turn', () => {
    const profile = resolveTurnFirstIntent({
      analystIntent: 'PRODUCT_SEARCH',
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
});
