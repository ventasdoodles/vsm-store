import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './shared/cors.ts';
import {
    buildCustomerIntelligenceNoWriteSmokeMetadata,
    buildCustomerIntelligenceNoWriteSmokeErrorFields,
    type CustomerIntelligenceNoWriteSmokeMetadata,
    isCustomerIntelligenceNoWriteSmokeRequest,
} from './no-write-smoke.ts'

// Handlers
import { handleConciergeChat } from './handlers/concierge-chat.ts';
import { handleStorefrontAttachments, handleStorefrontCartDependencyOffer, handleStorefrontCompatibilityCheck } from './handlers/storefront-actions.ts';
import { handleParseAdminIntent, handleGenerateSupplierCopy, handleGenerateWhatsappCopy, handleGenerateProactiveInsights } from './handlers/admin-actions.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const _GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || "AIzaSyDummyKeyForLocalEnvironmentFixVsm123";
    const _SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VSM_SUPABASE_URL') || "http://127.0.0.1:54321";
    const _SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('VSM_SERVICE_ROLE_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
    let noWriteSmokeForError: CustomerIntelligenceNoWriteSmokeMetadata | null = null;

    console.warn(`[customer-intelligence] Action: ${req.method} URL: ${req.url}`)
    const apiKeyStatus = _GEMINI_API_KEY ? 'Present' : 'MISSING';
    console.warn(`[customer-intelligence] Gemini Key Status: ${apiKeyStatus}`)

    try {
        if (!_GEMINI_API_KEY || !_SUPABASE_URL || !_SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Environment secrets (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not properly configured.');
        }

        const body = await req.json()
        const { action } = body
        const noWriteSmoke = isCustomerIntelligenceNoWriteSmokeRequest(body, action)
            ? buildCustomerIntelligenceNoWriteSmokeMetadata()
            : null;
        noWriteSmokeForError = noWriteSmoke;
        const supabase = createClient(_SUPABASE_URL, _SUPABASE_SERVICE_ROLE_KEY)

        if (action === 'resolve_storefront_attachments') return await handleStorefrontAttachments(body, supabase);
        if (action === 'resolve_storefront_cart_dependency_offer') return await handleStorefrontCartDependencyOffer(body, supabase);
        if (action === 'resolve_storefront_compatibility_check') return await handleStorefrontCompatibilityCheck(body, supabase);
        if (action === 'parse_admin_intent') return await handleParseAdminIntent(body.query, _GEMINI_API_KEY);
        if (action === 'generate_supplier_copy') return await handleGenerateSupplierCopy(body, _GEMINI_API_KEY);
        if (action === 'generate_whatsapp_copy') return await handleGenerateWhatsappCopy(body, supabase, _GEMINI_API_KEY);
        if (action === 'generate_proactive_insights') return await handleGenerateProactiveInsights(supabase, _GEMINI_API_KEY);
        
        if (action === 'concierge_chat' || action === 'semantic_search') {
            return await handleConciergeChat(req, body, supabase, _GEMINI_API_KEY, _SUPABASE_URL, _SUPABASE_SERVICE_ROLE_KEY, noWriteSmoke, noWriteSmokeForError);
        }

        throw new Error(`Acción no soportada: ${action}`)
    } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        const errorMsg = `[Customer-Intelligence] Error: ${errorObj.message}`;
        console.error(errorMsg);
        const errorPayload: Record<string, unknown> = {
            version: "V3.4B-STABILIZED-2026-COMPLIANT",
            error: errorObj.message,
            context: 'customer-intelligence',
            gemini_key_present: !!_GEMINI_API_KEY,
            ...buildCustomerIntelligenceNoWriteSmokeErrorFields(noWriteSmokeForError),
            ...(noWriteSmokeForError ? {} : { full_error: errorObj.stack }),
        };
        return new Response(JSON.stringify(errorPayload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
