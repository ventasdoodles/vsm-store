import { describe, expect, it } from 'vitest';

import { resolveStorefrontWeakIntent } from '../../../supabase/functions/customer-intelligence/intent-guardrails';

describe('storefront customer-intelligence weak intent guardrails', () => {
    it('keeps genuinely unresolved turns as UNKNOWN instead of forcing product certainty', () => {
        const unresolved = resolveStorefrontWeakIntent({
            intent: 'UNKNOWN',
            isInventoryMatch: false,
            isPolicyMatch: false,
            isProductMatch: false,
            isGreeting: false,
        });

        expect(unresolved.intent).toBe('UNKNOWN');
        expect(unresolved.guardrailOverrides).toEqual([]);

        const productLike = resolveStorefrontWeakIntent({
            intent: 'UNKNOWN',
            isInventoryMatch: false,
            isPolicyMatch: false,
            isProductMatch: true,
            isGreeting: false,
        });

        expect(productLike.intent).toBe('UNKNOWN');
        expect(productLike.guardrailOverrides).toEqual([]);
    });

    it('still rescues edge-truth intents like policy and inventory without forcing catalog search', () => {
        const policyLike = resolveStorefrontWeakIntent({
            intent: 'UNKNOWN',
            isInventoryMatch: false,
            isPolicyMatch: true,
            isProductMatch: false,
            isGreeting: false,
        });

        expect(policyLike.intent).toBe('POLICY_INQUIRY');
        expect(policyLike.guardrailOverrides).toContain('UNKNOWN_RESOLVE_POLICY');
    });
});
