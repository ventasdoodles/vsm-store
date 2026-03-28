export type StorefrontResolvedIntent =
    | 'CART_OPERATION'
    | 'POLICY_INQUIRY'
    | 'PRODUCT_SEARCH'
    | 'ORDER_TRACKING'
    | 'INVENTORY_OUTLOOK'
    | 'COMPATIBILITY_CHECK'
    | 'CHIT_CHAT'
    | 'UNKNOWN'
    | 'OUT_OF_DOMAIN';

export interface StorefrontWeakIntentGuardrailInput {
    intent: StorefrontResolvedIntent;
    isInventoryMatch: boolean;
    isPolicyMatch: boolean;
    isProductMatch: boolean;
    isGreeting: boolean;
}

export interface StorefrontWeakIntentGuardrailResult {
    intent: StorefrontResolvedIntent;
    guardrailOverrides: string[];
}

export function resolveStorefrontWeakIntent(
    input: StorefrontWeakIntentGuardrailInput,
): StorefrontWeakIntentGuardrailResult {
    let nextIntent = input.intent;
    const guardrailOverrides: string[] = [];

    if (nextIntent === 'UNKNOWN' || nextIntent === 'CHIT_CHAT') {
        if (input.isInventoryMatch) {
            nextIntent = 'INVENTORY_OUTLOOK';
            guardrailOverrides.push('UNKNOWN_RESOLVE_INVENTORY');
        } else if (input.isPolicyMatch) {
            nextIntent = 'POLICY_INQUIRY';
            guardrailOverrides.push('UNKNOWN_RESOLVE_POLICY');
        } else if (input.isProductMatch) {
            nextIntent = 'PRODUCT_SEARCH';
            guardrailOverrides.push('UNKNOWN_RESOLVE_PRODUCT');
        } else if (input.isGreeting) {
            nextIntent = 'CHIT_CHAT';
            guardrailOverrides.push('UNKNOWN_RESOLVE_CHIT_CHAT');
        }
    }

    return {
        intent: nextIntent,
        guardrailOverrides,
    };
}
