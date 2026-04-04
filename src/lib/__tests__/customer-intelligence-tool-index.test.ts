import { describe, expect, it } from 'vitest';

import { getCapabilityIdsForIntent, getCapabilityDefinition } from '../../../supabase/functions/customer-intelligence/tool-index';

describe('customer-intelligence tool index', () => {
  it('classifies model knowledge, native public slots, and own functions explicitly', () => {
    expect(getCapabilityDefinition('model_turn_reasoning')?.class).toBe('MODEL_KNOWLEDGE');
    expect(getCapabilityDefinition('model_turn_reasoning')?.execution).toBe('model_only');
    expect(getCapabilityDefinition('lightweight_memory_read')?.class).toBe('MODEL_KNOWLEDGE');
    expect(getCapabilityDefinition('response_synthesis')?.execution).toBe('model_only');

    expect(getCapabilityDefinition('public_web_search')?.class).toBe('NATIVE_PUBLIC');
    expect(getCapabilityDefinition('public_web_search')?.status).toBe('active');
    expect(getCapabilityDefinition('public_url_context')?.status).toBe('active');

    expect(getCapabilityDefinition('product_search_integrity')?.class).toBe('OWN_FUNCTION');
    expect(getCapabilityDefinition('product_search_integrity')?.execution).toBe('client_capsule');
    expect(getCapabilityDefinition('storefront_checkout_readiness')?.class).toBe('OWN_FUNCTION');
    expect(getCapabilityDefinition('storefront_checkout_readiness')?.execution).toBe('client_capsule');
    expect(getCapabilityDefinition('storefront_inventory_outlook')?.class).toBe('OWN_FUNCTION');
    expect(getCapabilityDefinition('storefront_inventory_outlook')?.execution).toBe('client_capsule');
    expect(getCapabilityDefinition('storefront_kitting_basket')?.class).toBe('OWN_FUNCTION');
    expect(getCapabilityDefinition('storefront_kitting_basket')?.execution).toBe('client_capsule');
    expect(getCapabilityDefinition('track_order')?.execution).toBe('edge_function');
  });

  it('keeps gating metadata explicit for search and policy capabilities', () => {
    expect(getCapabilityDefinition('product_search_integrity')?.gatingConstraints).toContain(
      'Only use when the current turn is search-leading and the catalog gate is open.',
    );
    expect(getCapabilityDefinition('knowledge_rag_foundation')?.doesNotDo).toContain(
      'Does not claim order status',
    );
    expect(getCapabilityDefinition('storefront_checkout_readiness')?.doesNotDo).toContain(
      'Does not create orders',
    );
    expect(getCapabilityDefinition('storefront_inventory_outlook')?.doesNotDo).toContain(
      'Does not invent ETA',
    );
    expect(getCapabilityDefinition('public_web_search')?.gatingConstraints).toContain(
      'Do not use for greetings, ambiguity-first turns, or store-private/action requests.',
    );
    expect(getCapabilityDefinition('public_url_context')?.gatingConstraints).toContain(
      'Use only when the current turn provides a URL or clearly points to a specific public page.',
    );
  });

  it('exposes routing priority by intent without hiding product search inside UNKNOWN rescue', () => {
    expect(getCapabilityIdsForIntent('PUBLIC_INFO')).toEqual([
      'public_url_context',
      'public_web_search',
    ]);
    expect(getCapabilityIdsForIntent('PRODUCT_SEARCH')).toEqual([
      'product_search_integrity',
      'search_products',
    ]);
    expect(getCapabilityIdsForIntent('KIT_ASSEMBLY')).toEqual([
      'storefront_kitting_basket',
    ]);
    expect(getCapabilityIdsForIntent('CHECKOUT_READINESS')).toEqual([
      'storefront_checkout_readiness',
    ]);
    expect(getCapabilityIdsForIntent('INVENTORY_OUTLOOK')).toEqual([
      'storefront_inventory_outlook',
      'get_inventory_outlook',
    ]);
    expect(getCapabilityIdsForIntent('POLICY_INQUIRY')).toEqual([
      'knowledge_rag_foundation',
      'get_store_policy',
    ]);
    expect(getCapabilityIdsForIntent('UNKNOWN')).toEqual([]);
  });
});
