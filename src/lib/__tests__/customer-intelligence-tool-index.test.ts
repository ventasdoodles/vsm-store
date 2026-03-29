import { describe, expect, it } from 'vitest';

import { getCapabilityIdsForIntent, getCapabilityDefinition } from '../../../supabase/functions/customer-intelligence/tool-index';

describe('customer-intelligence tool index', () => {
  it('classifies model knowledge, native public slots, and own functions explicitly', () => {
    expect(getCapabilityDefinition('model_turn_reasoning')?.class).toBe('MODEL_KNOWLEDGE');
    expect(getCapabilityDefinition('model_turn_reasoning')?.execution).toBe('model_only');
    expect(getCapabilityDefinition('lightweight_memory_read')?.class).toBe('MODEL_KNOWLEDGE');
    expect(getCapabilityDefinition('response_synthesis')?.execution).toBe('model_only');

    expect(getCapabilityDefinition('public_web_search')?.class).toBe('NATIVE_PUBLIC');
    expect(getCapabilityDefinition('public_web_search')?.status).toBe('reserved');

    expect(getCapabilityDefinition('product_search_integrity')?.class).toBe('OWN_FUNCTION');
    expect(getCapabilityDefinition('product_search_integrity')?.execution).toBe('client_capsule');
    expect(getCapabilityDefinition('track_order')?.execution).toBe('edge_function');
  });

  it('keeps gating metadata explicit for search and policy capabilities', () => {
    expect(getCapabilityDefinition('product_search_integrity')?.gatingConstraints).toContain(
      'Only use when the current turn is search-leading and the catalog gate is open.',
    );
    expect(getCapabilityDefinition('knowledge_rag_foundation')?.doesNotDo).toContain(
      'Does not claim order status',
    );
  });

  it('exposes routing priority by intent without hiding product search inside UNKNOWN rescue', () => {
    expect(getCapabilityIdsForIntent('PRODUCT_SEARCH')).toEqual([
      'product_search_integrity',
      'search_products',
    ]);
    expect(getCapabilityIdsForIntent('POLICY_INQUIRY')).toEqual([
      'knowledge_rag_foundation',
      'get_store_policy',
    ]);
    expect(getCapabilityIdsForIntent('UNKNOWN')).toEqual([]);
  });
});
