import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    resolveStorefrontAttachmentOffers,
    resolveStorefrontCartDependencyOffer,
} from '../storefront-attachments.ts'
import {
    resolveStorefrontCompatibilityCheck,
} from '../storefront-compatibility.ts'
import { corsHeaders } from '../shared/cors.ts';

export async function handleStorefrontAttachments(body: any, supabase: SupabaseClient) {
    const { product_ids } = body;
    const normalizedProductIds = Array.isArray(product_ids)
        ? product_ids.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [];
    const attachmentOffers = await resolveStorefrontAttachmentOffers({
        productIds: normalizedProductIds,
        supabase,
    });

    return new Response(JSON.stringify({
        attachment_offers: attachmentOffers,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

export async function handleStorefrontCartDependencyOffer(body: any, supabase: SupabaseClient) {
    const { cart_product_ids } = body;
    const normalizedCartProductIds = Array.isArray(cart_product_ids)
        ? cart_product_ids.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [];
    const cartDependencyOffer = await resolveStorefrontCartDependencyOffer({
        cartProductIds: normalizedCartProductIds,
        supabase,
    });

    return new Response(JSON.stringify({
        cart_dependency_offer: cartDependencyOffer,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

export async function handleStorefrontCompatibilityCheck(body: any, supabase: SupabaseClient) {
    const { query, cart_product_ids } = body;
    if (!query) throw new Error('Query is required for compatibility checking');
    const normalizedCartProductIds = Array.isArray(cart_product_ids)
        ? cart_product_ids.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [];
    const compatibilityCheck = await resolveStorefrontCompatibilityCheck({
        query,
        cartProductIds: normalizedCartProductIds,
        supabase,
    });

    return new Response(JSON.stringify({
        compatibility_check: compatibilityCheck,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
