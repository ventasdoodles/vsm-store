import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn<any>();
const cartStateMock = vi.hoisted(() => ({
  items: [] as Array<{ product: { id: string } | null }>,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => (invokeMock as any)(args[0], args[1]),
    },
  },
}));

vi.mock('@/stores/cart.store', () => ({
  useCartStore: {
    getState: () => cartStateMock,
  },
}));

import { resolveStorefrontCompatibilityCheck } from '../storefront-compatibility-check.service';

describe('resolveStorefrontCompatibilityCheck', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    cartStateMock.items = [];
  });

  it('sends the dedicated compatibility action and safe one-item cart context when the query is fit-specific', async () => {
    cartStateMock.items = [
      {
        product: { id: '11111111-1111-1111-1111-111111111111' },
      },
    ];

    invokeMock.mockResolvedValue({
      data: {
        compatibility_check: {
          kind: 'COMPATIBLE',
          customer_response_draft: 'Si, le queda.',
          match_strategy: 'COMPATIBLE',
          retrieval_source: 'CATALOG_COMPATIBILITY_GRAPH',
          resolved_products: [
            { id: 'anchor', name: 'Caliburn G3', slug: 'caliburn-g3', section: 'vape' },
            { id: 'candidate', name: 'Pod G3', slug: 'pod-g3', section: 'vape' },
          ],
          compatibility_check_signal: {
            kind: 'COMPATIBLE',
            scope: 'ANCHOR_AND_CANDIDATE',
            anchor_product: { id: 'anchor', name: 'Caliburn G3', slug: 'caliburn-g3', section: 'vape' },
            candidate_product: { id: 'candidate', name: 'Pod G3', slug: 'pod-g3', section: 'vape' },
            relation_type: 'uses_pod',
            relation_scope: 'specific_model',
            resolved_relation_count: 1,
            suggestion_count: 0,
            cart_context_used: true,
            fit_confidence: 'high',
          },
        },
      },
      error: null,
    });

    const resolution = await resolveStorefrontCompatibilityCheck({
      query: 'le queda a mi caliburn g3?',
      cart_product_ids: [],
    });

    expect(invokeMock).toHaveBeenCalledWith('customer-intelligence', {
      body: {
        action: 'resolve_storefront_compatibility_check',
        query: 'le queda a mi caliburn g3?',
        cart_product_ids: ['11111111-1111-1111-1111-111111111111'],
      },
    });
    expect(resolution.kind).toBe('COMPATIBLE');
    expect(resolution.message).toContain('le queda');
    expect(resolution.resolvedProducts).toHaveLength(2);
    expect(resolution.signal.cart_context_used).toBe(true);
  });
});
