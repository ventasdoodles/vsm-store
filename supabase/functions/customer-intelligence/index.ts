/**
 * customer-intelligence â€” Supabase Edge Function
 * 
 * Multi-action AI function for customer-facing intelligence:
 *   - parse_admin_intent: NLP parsing of admin commands
 *   - generate_supplier_message: AI-generated supplier restock messages
 *   - generate_whatsapp_copy: Marketing copy for WhatsApp campaigns
 *   - analyze_loyalty: Customer loyalty pattern analysis
 *   - generate_customer_message: Personalized customer communications
 * 
 * @model storefront concierge: gemini-2.5-pro
 * @model auxiliary generation: gemini-2.5-flash
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * RUNTIME POLICY:
 * - Gemini REST calls inside customer-intelligence converge on v1beta.
 * - This includes generateContent, native Google Search / URL context tools,
 *   and gemini-embedding-001 embeddings so runtime behavior is explicit.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    geminiEmbedText,
    geminiGenerateContent,
    getGeminiRuntimePolicy,
} from '../_shared/gemini-api.ts'

import { SYSTEM_PERSONA, VSM_OPERATIONAL_RULES, RESPONSE_FORMAT_RULES, RESPONSE_SHAPE_RULES, compactCesarinResponseText } from './persona.ts'
import { buildDegradedPolicyInquiryFallback } from './policy-degraded-fallback.ts'
import { buildNeutralAnalystFallbackReport } from './analyst-fallback.ts'
import { buildCesarinCommercialMemoryPromptGuidance } from './commercial-memory.ts'
import { buildClarificationFirstFallbackText, guardClarificationFirstFinalText, shapeCesarinResponseText, shouldSuppressCesarinConversationalPrefix } from './response-shaping.ts'
import { buildSoftContinuityContext } from './soft-continuity.ts'
import {
    detectStorefrontTurnSignals,
    filterToolCallsForIntent,
    isHighConfidenceProductSearchTurn,
    resolveCatalogGate,
    resolveStorefrontWeakIntent,
    resolveTurnFirstIntent,
} from './intent-guardrails.ts'
import { buildRuntimeCapabilityPlan } from './tool-selection.ts'
import { executeTools, ToolCall, ToolResult } from './tools.ts'
import {
    buildCustomerPreferencePromptSummary,
    collectCustomerPreferenceSignals,
    hasCustomerPreferenceSummary,
    persistMemory,
} from './memory.ts'
import { buildCapabilityPromptSummary } from './tool-index.ts'
import {
    resolveStorefrontAttachmentOffers,
    resolveStorefrontCartDependencyOffer,
} from './storefront-attachments.ts'
import {
    resolveStorefrontCompatibilityCheck,
} from './storefront-compatibility.ts'
import {
    buildCustomerIntelligenceNoWriteSmokeMetadata,
    buildCustomerIntelligenceNoWriteSmokeErrorFields,
    type CustomerIntelligenceNoWriteSmokeMetadata,
    isCustomerIntelligenceNoWriteSmokeRequest,
    shouldSuppressCustomerIntelligenceCall,
    shouldSuppressCustomerIntelligenceWrite,
} from './no-write-smoke.ts'

// Credentials will be loaded per-request for maximum resilience
// â•â•â• MODEL STACK (Converged storefront baseline, validated 2026-03-29) â•â•â•
const AUXILIARY_MODEL = Deno.env.get('AUXILIARY_MODEL') || 'gemini-2.5-flash';
const CONCIERGE_ANALYST_MODEL = Deno.env.get('CONCIERGE_ANALYST_MODEL') || 'gemini-2.5-pro';
const CONCIERGE_SOMMELIER_MODEL = Deno.env.get('CONCIERGE_SOMMELIER_MODEL') || 'gemini-2.5-pro';

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

type TelemetryContractReason = 'capsule_handoff' | 'edge_logged' | 'edge_insert_failed';

function buildTelemetryContract(input: {
    owner: 'edge' | 'client';
    edgeLogged: boolean;
    reason: TelemetryContractReason;
}) {
    return {
        owner: input.owner,
        edge_logged: input.edgeLogged,
        client_should_log_fallback: input.owner === 'client' || !input.edgeLogged,
        reason: input.reason,
    };
}

async function invokeGeminiTextModel(
    apiKey: string,
    model: string,
    body: Record<string, unknown>,
    errorContext: string,
): Promise<any> {
    const response = await geminiGenerateContent({
        apiKey,
        model,
        body,
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result?.error?.message || errorContext);
    }

    return result;
}

type PublicSourceContext = {
    label: string;
    brief?: string;
    sources: Array<{ title: string; url: string }>;
};

function extractPublicSourceUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const parsed = new URL(value.trim());
        return /^https?:$/.test(parsed.protocol) ? parsed.toString() : null;
    } catch {
        return null;
    }
}

function normalizePublicSourceTitle(title: unknown, url: string): string {
    if (typeof title === 'string' && title.trim()) {
        return title.trim().slice(0, 80);
    }

    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return 'Fuente publica';
    }
}

function buildPublicSourceContext(toolResults: ToolResult[]): PublicSourceContext | null {
    const publicToolResults = toolResults.filter((result) =>
        result.status === 'success'
        && (result.name === 'public_web_search' || result.name === 'public_url_context'),
    );

    if (publicToolResults.length === 0) return null;

    const sources: Array<{ title: string; url: string }> = [];
    const seenUrls = new Set<string>();

    for (const result of publicToolResults) {
        const metadata = (result as any)?.metadata ?? {};
        const rawEntries = result.name === 'public_web_search'
            ? (Array.isArray(metadata.sources) ? metadata.sources : [])
            : (Array.isArray(metadata.urls) ? metadata.urls : []);

        for (const entry of rawEntries) {
            const url = extractPublicSourceUrl(
                entry?.url
                ?? entry?.uri
                ?? entry?.retrieved_url
                ?? entry?.retrievedUrl,
            );
            if (!url || seenUrls.has(url)) continue;
            seenUrls.add(url);
            sources.push({
                title: normalizePublicSourceTitle(entry?.title, url),
                url,
            });

            if (sources.length >= 2) break;
        }

        if (sources.length >= 2) break;
    }

    const brief = sources.length > 0
        ? sources.map((source) => source.title).join(' Â· ')
        : undefined;

    return {
        label: 'Contexto publico',
        brief,
        sources,
    };
}

function extractTelemetryNextStepTruth(raw: unknown): {
    next_step_family: string | null;
    assist_action_present: boolean;
} {
    const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null;

    return {
        next_step_family: typeof record?.family === 'string' ? record.family : null,
        assist_action_present: Boolean(record?.assistAction),
    };
}

function resolveTelemetryRetrievalSource(toolResults: ToolResult[]): string | null {
    const successfulNames = new Set(
        toolResults
            .filter((result) => result.status === 'success')
            .map((result) => result.name),
    );

    if (successfulNames.has('public_url_context')) return 'PUBLIC_URL_CONTEXT';
    if (successfulNames.has('public_web_search')) return 'PUBLIC_WEB_SEARCH';
    if (successfulNames.has('get_inventory_outlook')) return 'INVENTORY_OUTLOOK';
    if (successfulNames.has('storefront_compatibility_check')) return 'COMPATIBILITY_CHECK';
    if (successfulNames.has('check_compatibility')) return 'COMPATIBILITY_CHECK';
    if (successfulNames.has('track_order')) return 'ORDER_TRACKING';
    if (successfulNames.has('knowledge_rag_foundation') || successfulNames.has('get_store_policy')) return 'STORE_POLICY';
    if (successfulNames.has('search_products')) return 'SEARCH_PRODUCTS';

    return null;
}

function formatCompactSourceLines(lines: string[], fallback: string, maxLines = 3): string {
    const compactLines = lines
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, maxLines);

    return compactLines.length > 0 ? compactLines.join('\n') : fallback;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const _GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const _SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const _SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let noWriteSmokeForError: CustomerIntelligenceNoWriteSmokeMetadata | null = null;

    console.warn(`[customer-intelligence] Action: ${req.method} URL: ${req.url}`)
    const apiKeyStatus = _GEMINI_API_KEY ? 'Present' : 'MISSING';
    console.warn(`[customer-intelligence] Gemini Key Status: ${apiKeyStatus}`)

    try {
        if (!_GEMINI_API_KEY || !_SUPABASE_URL || !_SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Environment secrets (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not properly configured.');
        }

        const body = await req.json()
        const { customerId, action, context, query, history, customerContext: cContext, customer_context, product_ids, cart_product_ids } = body
        const customerContext = cContext || customer_context
        const noWriteSmoke = isCustomerIntelligenceNoWriteSmokeRequest(body, action)
            ? buildCustomerIntelligenceNoWriteSmokeMetadata()
            : null;
        noWriteSmokeForError = noWriteSmoke;
        const supabase = createClient(_SUPABASE_URL, _SUPABASE_SERVICE_ROLE_KEY)

        if (action === 'resolve_storefront_attachments') {
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

        if (action === 'resolve_storefront_cart_dependency_offer') {
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

        if (action === 'resolve_storefront_compatibility_check') {
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

        const { data: storeSettings } = await supabase
            .from('store_settings')
            .select('whatsapp_number')
            .eq('id', 1)
            .single()

        const whatsappNumber = storeSettings?.whatsapp_number || '5212281234567'

        if (action === 'parse_admin_intent') {
            if (!query) throw new Error('Query is required for NLP parsing')
            const prompt = `
                Eres el cerebro de administraciÃ³n de "VSM Store".
                Convierte la peticiÃ³n del administrador en una acciÃ³n estructurada.
                ACCIONES DISPONIBLES:
                - search: Buscar productos, clientes o Ã³rdenes.
                - navigate: Ir a una secciÃ³n (products, orders, customers, coupons, settings, dashboard).
                - filter: Aplicar filtros a la vista actual.

                QUERY: "${query}"

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "action": "search | navigate | filter | unknown",
                    "target": "nombre_de_la_seccion_o_busqueda",
                    "params": {},
                    "message": "Respuesta corta de confirmaciÃ³n"
                }
            `
            const result = await invokeGeminiTextModel(
                _GEMINI_API_KEY,
                AUXILIARY_MODEL,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        response_mime_type: 'application/json',
                    },
                },
                'Error from Google API (parse_admin_intent)',
            )
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            return new Response(rawText.trim(), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'generate_supplier_copy') {
            const { productName, currentStock, sku } = body
            const prompt = `
                Genera un mensaje profesional de WhatsApp para un proveedor de vapeo.
                Necesito reabastecer: ${productName} (SKU: ${sku}).
                Stock actual: ${currentStock}.
                Pide cotizaciÃ³n para 50 unidades. Tono empresarial pero directo.
            `
            const result = await invokeGeminiTextModel(
                _GEMINI_API_KEY,
                AUXILIARY_MODEL,
                { contents: [{ parts: [{ text: prompt }] }] },
                'Error from Google API (generate_supplier_copy)',
            )
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const message = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
            return new Response(JSON.stringify({ message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'generate_whatsapp_copy') {
            if (!customerId) throw new Error('Customer ID is required for WhatsApp copy')
            
            const { data: intel, error: dbError } = await supabase
                .from('customer_intelligence_360')
                .select('full_name, segment')
                .or(`id.eq.${customerId},customer_id.eq.${customerId}`)
                .maybeSingle()

            if (dbError) throw new Error(`Database Error: ${dbError.message}`)
            if (!intel) throw new Error(`Customer not found in intelligence view: ${customerId}`)
            const prompt = `
                Eres un experto en comunicaciÃ³n para "VSM Store".
                Genera un mensaje de WhatsApp amigable, corto y persuasivo para este cliente.
                DATOS DEL CLIENTE:
                - Nombre: ${intel?.full_name || 'Cliente'}
                - Segmento: ${intel?.segment || 'Regular'}
                - Contexto Adicional: ${context || 'N/A'}
                REGLAS:
                - Usa emojis relacionados con vapeo (ðŸ’¨, âš¡, ðŸ’Ž).
                - MÃ¡ximo 50 palabras.
            `
            const result = await invokeGeminiTextModel(
                _GEMINI_API_KEY,
                AUXILIARY_MODEL,
                { contents: [{ parts: [{ text: prompt }] }] },
                'Error from Google API (generate_whatsapp_copy)',
            )
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const message = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
            return new Response(JSON.stringify({ message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'concierge_chat' || action === 'semantic_search') {
            // â•â•â• HARDENING 1: SERVER-SIDE PILOT ENFORCEMENT (SUPABASE AUTH VERIFICATION) â•â•â•
            // Verify bearer token using Supabase Auth API (server-trusted validation).
            // body.is_pilot is context only; enforcement relies on verified user session.
            const authHeader = req.headers.get('Authorization') || '';
            const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

            let isAuthenticated = false;
            let authError: string | null = null;
            let _authenticatedUser: any = null;

            if (!bearerToken) {
                authError = 'No JWT provided';
            } else {
                try {
                    // Server-side verification: call Supabase Auth API to validate token
                    // getUser() returns the user object if token is valid, or error if invalid/expired
                    const { data: { user }, error: getUserError } = await supabase.auth.getUser(bearerToken);

                    if (getUserError || !user) {
                        authError = getUserError?.message || 'User verification failed';
                    } else {
                        isAuthenticated = true;
                        _authenticatedUser = user;
                        console.warn(`[AUTH] Server-verified user: ${user.id}`);
                    }
                } catch (e: any) {
                    authError = `Auth verification error: ${e.message}`;
                }
            }

            // Enforce: Only authenticated users can invoke concierge_chat
            if (!isAuthenticated) {
                console.warn(`[PILOT GATE] Request rejected: authentication failed (${authError})`);
                return new Response(JSON.stringify({
                    error: 'Cesarin AI requires authentication',
                    reason: 'authentication_required',
                    auth_error: authError,
                    server_telemetry_logged: false,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'edge',
                        edgeLogged: false,
                        reason: 'edge_insert_failed',
                    }),
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 403
                });
            }

            // Note: body.is_pilot remains as context for telemetry/logging,
            // but server-side enforcement is server-verified Supabase Auth user session only.

            const { audio, mimeType } = body;

            // --- Phase 4.0: Selective Memory Read ---
            let customerMemory: any = null;
            const memoryTrace: any = {
                read_attempted: false,
                row_found: false,
                context_injected: false,
                interests_count: 0,
                preference_signal_count: 0,
                preference_summary_injected: false,
                soft_continuity_source: 'none',
                soft_continuity_topic: null,
                soft_continuity_shift: false,
                soft_reopen_candidate: false,
                skipped_reason: null
            };

            const cid = customerContext?.id;
            if (cid) {
                memoryTrace.read_attempted = true;
                console.log(`[Memory] Reading for cid: ${cid}`);
                const { data: mem, error: memErr } = await supabase
                    .from('ai_customer_memory')
                    .select('detected_interests, interests_metadata, preference_signals, preference_summary, last_interaction_at')
                    .eq('customer_id', cid)
                    .maybeSingle();
                
                if (memErr) {
                   console.error(`[Memory] Query error: ${memErr.message}`);
                   memoryTrace.skipped_reason = `query_error: ${memErr.message}`;
                } else if (mem && ((mem.detected_interests?.length ?? 0) > 0 || hasCustomerPreferenceSummary(mem.preference_summary))) {
                    // --- Strength-Based Prioritization ---
                    const meta = mem.interests_metadata || {};
                    const detectedInterests = mem.detected_interests || [];
                    const sortedInterests = [...detectedInterests].sort((a, b) => {
                        const metaA = meta[a.toLowerCase()] || { hits: 0, last_at: '0' };
                        const metaB = meta[b.toLowerCase()] || { hits: 0, last_at: '0' };
                        
                        // 1. Primary: Frequency (hits)
                        if (metaB.hits !== metaA.hits) return metaB.hits - metaA.hits;
                        // 2. Secondary: Recency (last_at)
                        return new Date(metaB.last_at).getTime() - new Date(metaA.last_at).getTime();
                    });

                    customerMemory = {
                        ...mem,
                        prioritized_interests: sortedInterests
                    };
                    memoryTrace.row_found = true;
                    memoryTrace.context_injected = true;
                    memoryTrace.interests_count = detectedInterests.length;
                    memoryTrace.preference_signal_count = Object.keys(mem.preference_signals || {}).length;
                    memoryTrace.preference_summary_injected = hasCustomerPreferenceSummary(mem.preference_summary);
                    console.log(
                        `[Memory] Success: interests=${detectedInterests.length}, preference_signals=${memoryTrace.preference_signal_count}, summary=${memoryTrace.preference_summary_injected}`
                    );
                } else { 
                    memoryTrace.skipped_reason = mem ? "empty_memory" : "no_row"; 
                    console.log(`[Memory] Skipped: ${memoryTrace.skipped_reason}`);
                }
            } else { 
                memoryTrace.skipped_reason = "no_id"; 
                console.log(`[Memory] No CID provided in context.`);
            }

            const customerPreferencePromptSummary = buildCustomerPreferencePromptSummary(
                customerMemory?.preference_summary || null,
            );
            const customerCommercialMemoryGuidance = buildCesarinCommercialMemoryPromptGuidance(
                customerMemory?.preference_summary || null,
                query || '',
            );
            const softContinuity = buildSoftContinuityContext({
                query: query || '',
                history: history || [],
                customerContext,
                customerMemory,
            });
            memoryTrace.soft_continuity_source = softContinuity.source;
            memoryTrace.soft_continuity_topic = softContinuity.recent_topic;
            memoryTrace.soft_continuity_shift = softContinuity.topic_shift;
            memoryTrace.soft_reopen_candidate = softContinuity.should_offer_soft_reopen;
            const analystCapabilitySummary = buildCapabilityPromptSummary([
                'model_turn_reasoning',
                'lightweight_memory_read',
                'product_search_integrity',
                'storefront_compatibility_check',
                'storefront_budget_rescue',
                'knowledge_rag_foundation',
                'cart_operator',
                'storefront_checkout_readiness',
                'storefront_inventory_outlook',
                'storefront_kitting_basket',
                'authenticated_order_tracking',
                'authenticated_warranty_triage',
                'authenticated_loyalty_status',
                'track_order',
                'get_inventory_outlook',
                'check_compatibility',
                'public_url_context',
                'public_web_search',
            ]);
            const preAnalystSignals = detectStorefrontTurnSignals(query || '');
            const analystTimeoutMs = !audio && (
                preAnalystSignals.isPolicyMatch
                || preAnalystSignals.isInventoryMatch
                || isHighConfidenceProductSearchTurn(preAnalystSignals.normalizedQuery)
            )
                ? 12000
                : 20000;

            // --- ENGINE 1: THE ANALYST (Structured Intelligence) ---
            const analystPrompt = `
                Eres "The Analyst", el motor de decision por turno de VSM Store.
                Decide primero si este turno se resuelve mejor con respuesta directa, una pregunta corta o una capacidad real de tienda.
                No empujes catalogo, politicas, carrito ni herramientas por reflejo.
                
                MENSAJE: "${query || 'Audio Context'}"
                CONTEXTO CLIENTE: ${JSON.stringify(customerContext || 'Nuevo')}
                ${customerMemory ? `
                --- MEMORIA PERSISTENTE (SESIÃ“N ANTERIOR) ---
                ESTA INFORMACIÃ“N ES SOLO PARA SESGAR BÃšSQUEDAS Y DESAMBIGUAR.
                LOS INTERESES AL INICIO DE LA LISTA TIENEN MAYOR FRECUENCIA/PESO HISTÃ“RICO.
                REGLA: EL DESEO ACTUAL DEL USUARIO SIEMPRE TIENE PRIORIDAD ABSOLUTA.
                ${customerMemory.prioritized_interests?.length ? `INTERESES PREVIOS (ORDENADOS POR PESO): ${customerMemory.prioritized_interests.join(', ')}` : ''}
                ${customerPreferencePromptSummary ? `RESUMEN LIGERO DE GUSTOS: ${customerPreferencePromptSummary}` : ''}
                ${customerCommercialMemoryGuidance ? `GUIA COMERCIAL DE CONTINUIDAD: ${customerCommercialMemoryGuidance}` : ''}
                REGLAS:
                - Lo actual manda sobre lo historico.
                - Una tendencia debil no es verdad dura.
                - Solo usa esta memoria si ayuda a recomendar mejor o a evitar algo que ya rechazo.
                - Si la memoria ya da una direccion util y el turno viene abierto, puedes aterrizar mas rapido sin preguntar de mas.
                ÃšLTIMA INTERACCIÃ“N: ${customerMemory.last_interaction_at}
                ` : ''}
                ${softContinuity.prompt_block ? `
                ${softContinuity.prompt_block}
                REGLA DE CONTINUIDAD:
                - Si usas continuidad, que sea una frase corta y humilde.
                - Si el turno actual cambio de carril, no arrastres el carril previo.
                - No abras catalogo, carrito ni politicas solo por contexto previo.
                ` : ''}
                HISTORIAL: ${JSON.stringify(history?.slice(-3) || [])}

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "intent": "CART_OPERATION | CHECKOUT_READINESS | KIT_ASSEMBLY | BUDGET_RESCUE | WARRANTY_SUPPORT | LOYALTY_SUPPORT | POLICY_INQUIRY | PUBLIC_INFO | PRODUCT_SEARCH | ORDER_TRACKING | INVENTORY_OUTLOOK | COMPATIBILITY_CHECK | CHIT_CHAT | UNKNOWN | OUT_OF_DOMAIN",
                    "primary_intent": "same as intent",
                    "secondary_intents": ["intentos secundarios en orden de prioridad"],
                    "turn_priority": ["primary_intent", "secondary_intent"],
                    "current_turn_decision": "DIRECT_ANSWER | ASK_CLARIFYING_QUESTION | USE_CAPABILITY",
                    "turn_decision": "DIRECT_ANSWER | ASK_CLARIFYING_QUESTION | USE_CAPABILITY",
                    "doubts": ["lista de dudas percibidas"],
                    "tool_calls": [
                        { "name": "cart_operator", "args": { "action": "ADD", "product_ref": "vape de menta", "quantity": 2 }, "reason": "cliente explÃ­citamente pidiÃ³ meterlo al carrito" },
                        { "name": "knowledge_rag_foundation", "args": { "query": "bÃºsqueda semÃ¡ntica de polÃ­tica", "is_ambiguous": false }, "reason": "porque pregunta sobre envÃ­os" },
                        { "name": "product_search_integrity", "args": { "query": "bÃºsqueda", "is_ambiguous": false, "requires_semantic_expansion": true }, "reason": "porque busca vapes" }
                    ],
                    "customer_dna": {
                        "interests": ["vapes", "menta"],
                        "preference_signals": [
                            { "category": "flavor", "value": "menta", "evidence": "explicit", "label": "menta" },
                            { "category": "budget", "value": "barato", "evidence": "inferred", "label": "cuida precio" }
                        ]
                    },
                    "conversational_prefix": "Frase opcional, corta y natural. Solo si aporta contexto real; no repitas la respuesta ni cierres por reflejo. VacÃ­o si no es posible."
                }

                EJEMPLOS MINIMOS:
                1. "hola" -> {"intent": "CHIT_CHAT", "turn_decision": "DIRECT_ANSWER", "tool_calls": []}
                2. "Â¿cuÃ¡l es la polÃ­tica de envÃ­os?" -> {"intent": "POLICY_INQUIRY", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "knowledge_rag_foundation", "args": {"query": "polÃ­tica de envÃ­os", "is_ambiguous": false}}]}
                3. "agrega un vape de uva" -> {"intent": "CART_OPERATION", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "cart_operator", "args": {"action": "ADD", "product_ref": "vape de uva", "quantity": 1}}]}
                4. "resumeme esta pagina https://ejemplo.com/lanzamiento" -> {"intent": "PUBLIC_INFO", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "public_url_context", "args": {"query": "resumeme esta pagina", "urls": ["https://ejemplo.com/lanzamiento"]}}]}
                
                5. "armame un kit con pods y liquido al 5%" -> {"intent": "KIT_ASSEMBLY", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "storefront_kitting_basket", "args": {"query": "armame un kit con pods y liquido al 5%", "upgrade_intent": true, "wants_device": true, "wants_consumable": true, "wants_liquid": true}}]}

                6. "ya puedo pagar?" -> {"intent": "CHECKOUT_READINESS", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "storefront_checkout_readiness", "args": {"query": "ya puedo pagar?"}}]}

                7. "algo parecido pero mas barato que el caliburn g3" -> {"intent": "BUDGET_RESCUE", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "storefront_budget_rescue", "args": {"query": "algo parecido pero mas barato que el caliburn g3"}}]}

                8. "le queda a mi caliburn g3?" -> {"intent": "COMPATIBILITY_CHECK", "turn_decision": "USE_CAPABILITY", "tool_calls": [{"name": "storefront_compatibility_check", "args": {"query": "le queda a mi caliburn g3?", "cart_product_ids": []}}]}

                REGLA DE TURNO PRIMARIO:
                - El intent debe reflejar el turno actual mÃ¡s importante, no la inercia del historial.
                - Si el mensaje trae dos necesidades, elige una primera y deja la otra como secondary_intents.
                - No mezcles varias necesidades en una sola salida robÃ³tica.
                
                CAPABILITY BOX:
                ${analystCapabilitySummary}
                
                REGLAS DE CAPACIDAD:
                - Por defecto gana model_turn_reasoning si el turno se puede resolver honestamente sin lookup ni accion real.
                - OWN_FUNCTION gana cuando hace falta verdad privada, estado interno o accion real.
                - NATIVE_PUBLIC solo entra si hace falta contexto publico externo de verdad; no por reflejo.
                - Si primero conviene aclarar, deja "tool_calls" en [] aunque exista una capacidad posible.
                - REGLA DE requires_semantic_expansion: false para nombres especÃ­ficos; true solo para conceptos o preferencias vagas.
                - Usa OUT_OF_DOMAIN si el cliente pregunta por algo completamente ajeno a vapeo, 420 y la tienda. Deja "tool_calls" vacÃ­o [].
                
                ATAJOS DE CLASIFICACION SOLO SI EL TURNO LO PIDE:
                - KITS, starter setup o hardware upgrade -> KIT_ASSEMBLY.
                - ALGO MAS BARATO / price friction / trade-down -> BUDGET_RESCUE.
                - CHECKOUT readiness / close-now friction / payment-method / shipping-cost readiness -> CHECKOUT_READINESS.
                - COMPATIBILIDAD/FIT -> COMPATIBILITY_CHECK.
                - URL explicita o verificacion publica externa real -> PUBLIC_INFO.
                - FUERA DE DOMINIO -> OUT_OF_DOMAIN sin herramientas.
                - SOLO usa UNKNOWN si el mensaje es realmente indescifrable.
            `;

            // â•â•â• HARDENING 2: GEMINI RESILIENCE â€” ANALYST CALL WITH FALLBACK â•â•â•
            let analystResult: any = {};
            let analystResponse: Response | null = null;
            let geminiError: string | null = null;
            let rawAnalystText = '';

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), analystTimeoutMs);

                analystResponse = await geminiGenerateContent({
                    apiKey: _GEMINI_API_KEY,
                    model: CONCIERGE_ANALYST_MODEL,
                    body: {
                        contents: [{ parts: [{ text: analystPrompt }] }],
                        generationConfig: { temperature: 0.1 },
                        safetySettings: SAFETY_SETTINGS,
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // Handle 429 (rate limit) and 500+ errors gracefully
                if (analystResponse.status === 429) {
                    console.warn(`[Analyst] Rate limited (429): backing off`);
                    geminiError = 'Gemini rate limit (429)';
                } else if (analystResponse.status >= 500) {
                    console.warn(`[Analyst] Server error (${analystResponse.status}): Gemini degraded`);
                    geminiError = `Gemini server error (${analystResponse.status})`;
                } else if (!analystResponse.ok) {
                    analystResult = await analystResponse.json();
                    console.error(`[Analyst] HTTP ${analystResponse.status}:`, JSON.stringify(analystResult).slice(0, 300));
                    geminiError = analystResult.error?.message || `HTTP ${analystResponse.status}`;
                } else {
                    analystResult = await analystResponse.json();
                    rawAnalystText = analystResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    console.warn(`[Analyst] raw status: ${analystResponse.status}, text length: ${rawAnalystText.length}`);
                }
            } catch (e: any) {
                if (e.name === 'AbortError') {
                    console.warn(`[Analyst] Request timeout (>${analystTimeoutMs}ms): Gemini response degraded`);
                    geminiError = 'Analyst timeout';
                } else {
                    console.error(`[Analyst] Fetch error: ${e.message}`);
                    geminiError = e.message;
                }
            }

            // Parse analyst response with strict contract validation
            // Contract: Analyst must emit { intent, tool_calls: [] }
            // Valid intents: CART_OPERATION | CHECKOUT_READINESS | KIT_ASSEMBLY | BUDGET_RESCUE | WARRANTY_SUPPORT | LOYALTY_SUPPORT | POLICY_INQUIRY | PRODUCT_SEARCH | ORDER_TRACKING | INVENTORY_OUTLOOK | COMPATIBILITY_CHECK | CHIT_CHAT | UNKNOWN | OUT_OF_DOMAIN
            const VALID_INTENTS = ['CART_OPERATION', 'CHECKOUT_READINESS', 'KIT_ASSEMBLY', 'BUDGET_RESCUE', 'WARRANTY_SUPPORT', 'LOYALTY_SUPPORT', 'POLICY_INQUIRY', 'PUBLIC_INFO', 'PRODUCT_SEARCH', 'ORDER_TRACKING', 'INVENTORY_OUTLOOK', 'COMPATIBILITY_CHECK', 'CHIT_CHAT', 'UNKNOWN', 'OUT_OF_DOMAIN'];

            let analystReport: any = { intent: 'UNKNOWN', tool_calls: [] };
            let analystParseValid = false;

            if (rawAnalystText) {
                try {
                    // Parse JSON: try direct parse first, fall back to regex extraction if needed
                    let parsed: any = null;
                    try {
                        parsed = JSON.parse(rawAnalystText);
                    } catch {
                        // Fallback: regex extraction for cases with leading/trailing text
                        const jsonMatch = rawAnalystText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            parsed = JSON.parse(jsonMatch[0]);
                        } else {
                            throw new Error('No valid JSON found in response');
                        }
                    }

                    // Validate Analyst contract
                    if (!parsed || typeof parsed !== 'object') {
                        throw new Error('Analyst response is not a JSON object');
                    }

                    const reportIntent = (parsed.intent || '').toUpperCase();
                    if (!VALID_INTENTS.includes(reportIntent)) {
                        console.error(`[Analyst] Invalid intent: "${reportIntent}", valid options: ${VALID_INTENTS.join(', ')}`);
                        geminiError = `Analyst invalid intent: "${reportIntent}"`;
                    } else if (!Array.isArray(parsed.tool_calls)) {
                        console.error('[Analyst] tool_calls is not an array');
                        geminiError = 'Analyst tool_calls not array';
                    } else {
                        // Contract valid: required fields present and well-formed
                        analystReport = parsed;
                        analystParseValid = true;
                        console.warn(`[Analyst] Contract valid: intent="${reportIntent}", tool_calls.length=${(parsed.tool_calls || []).length}`);
                    }
                } catch (e) {
                    console.error("[Analyst] Parse error:", (e as any).message);
                    geminiError = geminiError || `Analyst parse error: ${(e as any).message}`;
                }
            }

            // If Analyst failed (gemini error) OR contract validation failed (malformed/invalid output),
            // use safe degradation. Do NOT continue with malformed output as if it were valid.
            if (geminiError || !analystParseValid) {
                console.warn(`[Analyst] Degradation fallback active due to: ${geminiError || 'contract validation failed'}`);
                analystReport = buildNeutralAnalystFallbackReport();
            }

            let intent = (analystReport.intent || 'UNKNOWN').toUpperCase();
            const analystIntent = intent; // A85: captured before any guardrail override
            let analystToolCalls: ToolCall[] = analystReport.tool_calls || [];
            const guardrailOverrides: string[] = []; // A85: populated by each override that changes intent

            // --- QUALITY GUARDRAIL: Deterministic Intent Override (brain-first) ---
            // Las capsules ejecutan; el Analyst tiene autoridad semÃ¡ntica primaria.
            // --- QUALITY GUARDRAIL: Deterministic Intent Override (brain-first) ---

            const normalizedQuery = (query || "").toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[Â¿?Â¡!]/g, " ")
                .trim();

            const isCompatibilityMatch = /compatible|compatibilidad|(me|te|le|nos|os|les)\s*(queda|quedan)\s+(a|al|con|para)\b|sirve para|funciona con|(me|te|le|nos|os|les)\s*(cabe|caben)|que coil|que pod|que bateria|que liquido|que resistencia|usa mi|(me|te|le|nos|os|les)\s*(sirve|sirven)/.test(normalizedQuery);
            const isInventoryMatch     = /stock|inventario|disponible|disponibilidad|queda|agotara|agota|agotarse|agotado|durara/.test(normalizedQuery);
            const isPolicyMatch        = /politica|envio|pago|reembolso|devolucion|garantia|entrega|costo|tarifa|aceptan|horario|horarios|(?:a\s+)?que hora abren|(?:a\s+)?que hora cierran|cuando abren|cuando cierran|abren hoy|cierran hoy|abierto hoy|abiertos hoy|hora de apertura|hora de cierre/.test(normalizedQuery);
            const isProductMatch       = /quiero|busco|buscas|tienen|tienes|hay|tengo|frutal|dulce|suave|fuerte|fresco|mentol|rico|intenso|cremoso|tropical|acido|uva|mango|fresa|sandia|melon|mora|cereza|menta|hielo|ice|tabaco|caramelo|barato|economico|precio|oferta|descuento|recomienda|conviene|guste|probar|comprar|liquido|vape|pod|pods|mod|kit|kits|cartucho|cartuchos|desechable|desechables|dispositivo|vaporizador/.test(normalizedQuery);
            const isGreeting           = /hola|buenos dias|buenas tardes|que tal|buenas|quien eres|quien soy|quien es|quien eres tu/.test(normalizedQuery);
            const isTrackingMatch      = /pedido|rastreo|tracking|seguimiento|guia|numero de pedido|orden|order number/.test(normalizedQuery);
            const isWarrantyMatch      = /\b(sabe a quemado|huele a quemado|olor a quemado|llego roto|llego quebrado|llego danado|llego chorreado|chorreado|fuga|fugando|derram|no prende|no enciende|no sirve|no funciona|vino fallado|falla|defecto)\b/.test(normalizedQuery)
                || (/\b(garantia|devolucion|rma)\b/.test(normalizedQuery) && /\b(mi|me|llego|vino|pedido|orden|compra|producto|equipo|vape|pod|cartucho|dispositivo|falla|roto|chorreado|prende|sirve|funciona)\b/.test(normalizedQuery));
            const isLoyaltyMatch       = /\b(cuantos puntos tengo|mis puntos|puntos|vcoins|v coins|v-coins|cuanto valen mis puntos|valor de mis puntos|equivalen mis puntos|descuento por puntos|me alcanza con mis puntos|me alcanza para algo con mis puntos|que nivel soy|mi nivel|soy vip|estatus vip|status vip|que tier soy|mi tier|nivel vip)\b/.test(normalizedQuery);
            const isCartMatch          = /carrito|agrega|agregar|meter|sumar|anade|aÃ±ade|aÃ±adir|quitar|sacar|checkout|comprar ahora/.test(normalizedQuery);
            const _hasTimeContext      = /cuanto tiempo|cuando|cuantos dias|cuantos minutos|cuantas horas|se agota|se agotan/.test(normalizedQuery);

            const guardrailDebug = { normalizedQuery, isCompatibilityMatch, isInventoryMatch, isPolicyMatch, isProductMatch, isGreeting, isTrackingMatch, isWarrantyMatch, isLoyaltyMatch, isCartMatch, initialIntent: analystReport.intent };

            const weakIntentResolution = resolveStorefrontWeakIntent({
                intent: intent as Parameters<typeof resolveStorefrontWeakIntent>[0]['intent'],
                isInventoryMatch,
                isPolicyMatch,
                isProductMatch,
                isGreeting,
                isTrackingMatch,
                isWarrantyMatch,
                isLoyaltyMatch,
                isCartMatch,
            });

            intent = weakIntentResolution.intent;
            guardrailOverrides.push(...weakIntentResolution.guardrailOverrides);

            const turnSignals = detectStorefrontTurnSignals(query || '');
            const turnProfile = resolveTurnFirstIntent({
                analystIntent: intent as Parameters<typeof resolveTurnFirstIntent>[0]['analystIntent'],
                analystDecision: analystReport.turn_decision ?? analystReport.current_turn_decision ?? null,
                query: turnSignals.normalizedQuery || (query || ''),
                toolCalls: analystToolCalls,
                preferPolicyForNoWriteSmoke: Boolean(noWriteSmoke),
            });
            const catalogGate = resolveCatalogGate({
                turnProfile,
                turnSignals,
                intent: intent as Parameters<typeof resolveCatalogGate>[0]['intent'],
            });
            (guardrailDebug as any).catalog_gate = catalogGate;
            intent = turnProfile.primary_intent;
            analystToolCalls = turnProfile.primary_tool_calls.length > 0
                ? turnProfile.primary_tool_calls
                : filterToolCallsForIntent(analystToolCalls, intent as Parameters<typeof filterToolCallsForIntent>[1]);

            const capabilityPlan = buildRuntimeCapabilityPlan({
                intent: intent as Parameters<typeof buildRuntimeCapabilityPlan>[0]['intent'],
                query: query || '',
                toolCalls: analystToolCalls,
                hasAudio: Boolean(audio),
                hasMemorySummary: hasCustomerPreferenceSummary(customerMemory?.preference_summary),
                turnProfile,
                catalogGate,
            });
            const toolCalls = capabilityPlan.toolCalls;

            // [HARDENING] Synchronize corrected intent back to analystReport for Sommelier and Debug visibility
            analystReport.intent = intent;
            analystReport.primary_intent = turnProfile.primary_intent;
            analystReport.secondary_intents = turnProfile.secondary_intents;
            analystReport.turn_priority = turnProfile.turn_priority;
            analystReport.turn_decision = turnProfile.current_turn_decision;
            analystReport.current_turn_decision = turnProfile.current_turn_decision;
            analystReport.turn_focus = turnProfile.turn_focus;
            const analystConversationalPrefix = compactCesarinResponseText(analystReport.conversational_prefix || '') || null;

            // --- A85: Structured Guardrail Decision Telemetry ---
            // Captures the full Analystâ†’guardrailâ†’injection decision chain for persistent diagnostics.
            // Appended to the debug payload of every capsule router response so the client can
            // persist it in ai_logic_debug without needing to parse edge function logs.
            const guardrailTelemetry = {
                analyst_intent: analystIntent,
                guardrail_intent: intent,
                guardrail_overrides: guardrailOverrides,
                injected_tools: capabilityPlan.forcedCapability ? [capabilityPlan.forcedCapability] : [],
                turn_decision: turnProfile.current_turn_decision,
                analyst_turn_decision: analystReport.turn_decision || null,
                catalog_gate: {
                    is_open: catalogGate.is_open,
                    reason: catalogGate.reason,
                    explicit_product_request: catalogGate.explicit_product_request,
                    search_leading: catalogGate.search_leading,
                    materially_helpful: catalogGate.materially_helpful,
                    clarification_required: catalogGate.clarification_required,
                },
                turn_profile: {
                    primary_intent: turnProfile.primary_intent,
                    secondary_intents: turnProfile.secondary_intents,
                    turn_priority: turnProfile.turn_priority,
                    current_turn_decision: turnProfile.current_turn_decision,
                    turn_focus: turnProfile.turn_focus,
                },
                capability_box: capabilityPlan.capabilityBox,
            };

            let memoryPersistAttempted = false;
            const persistStorefrontCustomerMemoryIfPossible = async () => {
                if (memoryPersistAttempted) return;
                memoryPersistAttempted = true;

                const persistentCustomerId = customerContext?.id;
                if (!persistentCustomerId) return;

                const newInterests = analystReport.customer_dna?.interests || [];
                const preferenceSignals = collectCustomerPreferenceSignals({
                    query: query || '',
                    interests: newInterests,
                    analystSignals: analystReport.customer_dna?.preference_signals,
                });

                if (newInterests.length === 0 && preferenceSignals.length === 0) {
                    return;
                }

                const memoryResult = await persistMemory(supabase, persistentCustomerId, {
                    interests: newInterests,
                    preferenceSignals,
                });

                if (!memoryResult.ok) {
                    console.error(
                        `[Memory] Persistence not completed for ${persistentCustomerId}: ${memoryResult.error || 'unknown'}`
                    );
                }
            };

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Product Search Integrity) ---
            const searchCapsuleCall = toolCalls.find(c => c.name === 'product_search_integrity' || c.name === 'search_products');
            const inventoryOutlookCapsuleCall = toolCalls.find(c => c.name === 'storefront_inventory_outlook' || c.name === 'get_inventory_outlook');
            const kittingCapsuleCall = toolCalls.find(c => c.name === 'storefront_kitting_basket');
            const budgetRescueCapsuleCall = toolCalls.find(c => c.name === 'storefront_budget_rescue');
            const compatibilityCheckCapsuleCall = toolCalls.find(c => c.name === 'storefront_compatibility_check' || c.name === 'check_compatibility');
            const knowledgeCapsuleCall = toolCalls.find(c => c.name === 'knowledge_rag_foundation' || c.name === 'get_store_policy');
            const orderTrackingCapsuleCall = toolCalls.find(c => c.name === 'authenticated_order_tracking');
            const warrantyTriageCapsuleCall = toolCalls.find(c => c.name === 'authenticated_warranty_triage');
            const loyaltyStatusCapsuleCall = toolCalls.find(c => c.name === 'authenticated_loyalty_status');
            const checkoutReadinessCapsuleCall = toolCalls.find(c => c.name === 'storefront_checkout_readiness');

            const noWriteSmokeKnowledgePath =
                intent === 'POLICY_INQUIRY'
                && (capabilityPlan.primaryCapability.name === 'knowledge_rag_foundation' || capabilityPlan.primaryCapability.name === 'get_store_policy')
                && Boolean(knowledgeCapsuleCall);

            if (noWriteSmoke && !noWriteSmokeKnowledgePath) {
                return new Response(JSON.stringify({
                    error: 'No-write smoke contract only supports concierge_chat knowledge handoff',
                    reason: 'no_write_smoke_scope_mismatch',
                    no_write_smoke: noWriteSmoke,
                    server_telemetry_logged: false,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'edge',
                        edgeLogged: false,
                        reason: 'edge_insert_failed',
                    }),
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 409,
                });
            }
            
            // EL DESVÃO A CAPSULE SOLO SI EL INTENTO FINAL (tras guardrail) LO PERMITE.
            // Strict intent-gated dispatch: only route to a capsule when the guardrail-resolved
            // intent matches it. OR-arm conditions that used tool_call presence as a secondary
            // signal were swallowing CART_OPERATION / ORDER_TRACKING / INVENTORY_OUTLOOK whenever
            // the Analyst emitted a search call alongside the primary tool â€” silent misroutes.
            // Guardrail injections (lines 388-403) already guarantee tool call presence for every
            // routable intent, making the OR arms structurally redundant. (A83)
            if (catalogGate.is_open && intent === 'PRODUCT_SEARCH' && capabilityPlan.primaryCapability.name === 'product_search_integrity' && searchCapsuleCall) {
                console.warn('[ROUTER] Delegating Product Search to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'product_search_integrity',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    memory_context: customerMemory?.preference_summary
                        ? { preference_summary: customerMemory.preference_summary }
                        : null,
                    tool_args: searchCapsuleCall?.args || {
                        query: query || "",
                        is_ambiguous: true,
                        requires_semantic_expansion: true
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Storefront Kitting Basket) ---
            if (catalogGate.is_open && intent === 'KIT_ASSEMBLY' && capabilityPlan.primaryCapability.name === 'storefront_kitting_basket' && kittingCapsuleCall) {
                console.warn('[ROUTER] Delegating Storefront Kitting Basket to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'storefront_kitting_basket',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: kittingCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Storefront Budget Rescue) ---
            if (catalogGate.is_open && intent === 'BUDGET_RESCUE' && capabilityPlan.primaryCapability.name === 'storefront_budget_rescue' && budgetRescueCapsuleCall) {
                console.warn('[ROUTER] Delegating Storefront Budget Rescue to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'storefront_budget_rescue',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: budgetRescueCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Storefront Compatibility Check) ---
            if (intent === 'COMPATIBILITY_CHECK' && capabilityPlan.primaryCapability.name === 'storefront_compatibility_check' && compatibilityCheckCapsuleCall) {
                console.warn('[ROUTER] Delegating Storefront Compatibility Check to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'storefront_compatibility_check',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: compatibilityCheckCapsuleCall?.args || {
                        query: query || '',
                        cart_product_ids: [],
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Knowledge RAG Foundation) ---
            if (intent === 'POLICY_INQUIRY' && (capabilityPlan.primaryCapability.name === 'knowledge_rag_foundation' || capabilityPlan.primaryCapability.name === 'get_store_policy') && knowledgeCapsuleCall) {
                console.warn('[ROUTER] Delegating Knowledge RAG to Client-Side Capability Capsule');
                if (!shouldSuppressCustomerIntelligenceWrite(noWriteSmoke, 'ai_customer_memory')) {
                    await persistStorefrontCustomerMemoryIfPossible();
                }
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'knowledge_rag_foundation',
                    ...(noWriteSmoke ? { no_write_smoke: noWriteSmoke } : {}),
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: knowledgeCapsuleCall?.args || {
                        query: query || "",
                        is_ambiguous: true
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Storefront Inventory Outlook) ---
            if (intent === 'INVENTORY_OUTLOOK' && capabilityPlan.primaryCapability.name === 'storefront_inventory_outlook' && inventoryOutlookCapsuleCall) {
                console.warn('[ROUTER] Delegating Storefront Inventory Outlook to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'storefront_inventory_outlook',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: inventoryOutlookCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Authenticated Order Tracking) ---
            if (intent === 'ORDER_TRACKING' && capabilityPlan.primaryCapability.name === 'authenticated_order_tracking' && orderTrackingCapsuleCall) {
                console.warn('[ROUTER] Delegating Authenticated Order Tracking to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'authenticated_order_tracking',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: orderTrackingCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Authenticated Warranty Triage) ---
            if (intent === 'WARRANTY_SUPPORT' && capabilityPlan.primaryCapability.name === 'authenticated_warranty_triage' && warrantyTriageCapsuleCall) {
                console.warn('[ROUTER] Delegating Authenticated Warranty Triage to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'authenticated_warranty_triage',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: warrantyTriageCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Authenticated Loyalty Status) ---
            if (intent === 'LOYALTY_SUPPORT' && capabilityPlan.primaryCapability.name === 'authenticated_loyalty_status' && loyaltyStatusCapsuleCall) {
                console.warn('[ROUTER] Delegating Authenticated Loyalty Status to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'authenticated_loyalty_status',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: loyaltyStatusCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Storefront Checkout Readiness) ---
            if (intent === 'CHECKOUT_READINESS' && capabilityPlan.primaryCapability.name === 'storefront_checkout_readiness' && checkoutReadinessCapsuleCall) {
                console.warn('[ROUTER] Delegating Storefront Checkout Readiness to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'storefront_checkout_readiness',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: checkoutReadinessCapsuleCall?.args || {
                        query: query || "",
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail: guardrailDebug,
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: CONCIERGE_ANALYST_MODEL,
                            ...getGeminiRuntimePolicy(),
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Cart Operator) ---
            const cartOperatorCall = toolCalls.find(c => c.name === 'cart_operator');
            if (intent === 'CART_OPERATION' && capabilityPlan.primaryCapability.name === 'cart_operator' && cartOperatorCall) {
                console.warn('[ROUTER] Delegating Cart Operator to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'cart_operator',
                    conversational_prefix: analystConversationalPrefix,
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'client',
                        edgeLogged: false,
                        reason: 'capsule_handoff',
                    }),
                    tool_args: cartOperatorCall?.args || {
                        action: "ADD",
                        product_ref: query || "",
                        quantity: 1
                    },
                    debug: {
                        detected_intent: intent,
                        intent,
                        routing_path: 'pre_routed',
                        guardrail_telemetry: guardrailTelemetry,
                        capability_box: capabilityPlan.capabilityBox,
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- OUT OF DOMAIN: Fast-path rejection (no Sommelier call, no product search) ---
            if (intent === 'OUT_OF_DOMAIN') {
                const oodReplyText = 'Solo puedo ayudarte con productos de nuestra tienda de vapeo y 420. Para ese tipo de consulta te recomiendo buscar en otro lugar. Â¿Hay algo de nuestro catÃ¡logo en lo que pueda ayudarte?';
                const { error: oodTelemetryErr } = await supabase.from('ai_analytics').insert({
                    query: query,
                    response_text: oodReplyText,
                    detected_intent: 'OUT_OF_DOMAIN',
                    frustration_detected: false,
                    primary_intent: guardrailTelemetry.turn_profile.primary_intent,
                    current_turn_decision: guardrailTelemetry.turn_profile.current_turn_decision,
                    turn_focus: guardrailTelemetry.turn_profile.turn_focus,
                    catalog_gate_open: guardrailTelemetry.catalog_gate.is_open,
                    catalog_gate_reason: guardrailTelemetry.catalog_gate.reason,
                    next_step_family: null,
                    assist_action_present: false,
                    source_context_present: false,
                    retrieval_source: null,
                    ai_logic_debug: {
                        detected_intent: 'OUT_OF_DOMAIN',
                        routing_path: 'pre_routed',
                        out_of_domain: true,
                        guardrail: guardrailDebug,
                        analyst_intent: guardrailTelemetry.analyst_intent,
                        guardrail_overrides: guardrailTelemetry.guardrail_overrides,
                        injected_tools: guardrailTelemetry.injected_tools,
                        primary_intent: guardrailTelemetry.turn_profile.primary_intent,
                        current_turn_decision: guardrailTelemetry.turn_profile.current_turn_decision,
                        turn_focus: guardrailTelemetry.turn_profile.turn_focus,
                        catalog_gate_open: guardrailTelemetry.catalog_gate.is_open,
                        catalog_gate_reason: guardrailTelemetry.catalog_gate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: false,
                        retrieval_source: null,
                        semantic_match_success: false,
                        fallback_used: false,
                        product_card_count: 0,
                        has_product_cards: false,
                        zero_results: true,
                    }
                });
                if (oodTelemetryErr) {
                    console.error('[Analytics] OUT_OF_DOMAIN insert failed:', oodTelemetryErr.message);
                }
                return new Response(JSON.stringify({
                    text: oodReplyText,
                    intent: 'info',
                    turn_profile: guardrailTelemetry.turn_profile,
                    catalog_gate: guardrailTelemetry.catalog_gate,
                    routed_capsule: null,
                    fallback_reason: 'OUT_OF_DOMAIN',
                    products: [],
                    server_telemetry_logged: !oodTelemetryErr,
                    telemetry_contract: buildTelemetryContract({
                        owner: 'edge',
                        edgeLogged: !oodTelemetryErr,
                        reason: oodTelemetryErr ? 'edge_insert_failed' : 'edge_logged',
                    }),
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            const serverToolCalls = capabilityPlan.serverToolCalls;

            // Shared Embedding Logic (Reduce API calls)
            let sharedEmbedding: number[] | undefined = undefined;
            const needsEmbedding = serverToolCalls.some(c => ['search_products'].includes(c.name));
            
            if (needsEmbedding && query) {
                try {
                    console.warn(`[customer-intelligence] Generating shared embedding for ${serverToolCalls.length} server tools...`);
                    sharedEmbedding = await geminiEmbedText({
                        apiKey: _GEMINI_API_KEY,
                        text: query,
                        taskType: 'RETRIEVAL_QUERY',
                    });
                } catch (e) {
                    console.error(`[customer-intelligence] Shared embedding failed: ${e}`);
                }
            }

            // Log tools requested
            console.warn(`[Analyst] Tool calls requested: ${toolCalls.map(c => c.name).join(', ') || 'None'}`);
            console.warn(`[Runtime] Server tools to execute: ${serverToolCalls.map(c => c.name).join(', ') || 'None'}`);

            const startTools = Date.now();
            const toolResults: ToolResult[] = await executeTools(serverToolCalls, supabase, _GEMINI_API_KEY, sharedEmbedding);
            const totalToolLatency = Date.now() - startTools;

            // Process specific tool outputs for Sommelier context
            const knowledgeResult = toolResults.find(r => r.name === 'knowledge_rag_foundation' || r.name === 'get_store_policy');
            const knowledgeOutput = knowledgeResult?.output || 'No se consultaron polÃ­ticas especÃ­ficas.';
            const knowledgeMatchCount = (knowledgeResult as any)?.metadata?.chunks_found || 0;
            const searchOutput = toolResults.find(r => r.name === 'search_products')?.output || 'No se realizÃ³ bÃºsqueda de productos.';
            const trackOutput = toolResults.find(r => r.name === 'track_order')?.output || 'No se consultÃ³ el estado de ningÃºn pedido.';
            const inventoryResult = toolResults.find(r => r.name === 'get_inventory_outlook');
            const inventoryOutput = inventoryResult?.output || 'No se consultÃ³ la proyecciÃ³n de inventario.';
            const inventorySignalQuality = (inventoryResult as any)?.signal_quality || 'unknown';
            const compatibilityOutput = toolResults.find(r => r.name === 'storefront_compatibility_check' || r.name === 'check_compatibility')?.output || 'No se consultÃ³ informaciÃ³n de compatibilidad.';

            const publicWebSearchResult = toolResults.find(r => r.name === 'public_web_search');
            const publicUrlContextResult = toolResults.find(r => r.name === 'public_url_context');
            const publicWebSearchOutput = publicWebSearchResult?.output || 'No se consultÃƒÂ³ web publica.';
            const publicUrlContextOutput = publicUrlContextResult?.output || 'No se consultÃƒÂ³ contexto de URL publica.';
            const publicWebSearchSources = Array.isArray((publicWebSearchResult as any)?.metadata?.sources)
                ? (publicWebSearchResult as any).metadata.sources
                    .map((source: any) => `- ${source.title || 'Fuente'}: ${source.url || 'sin_url'}`)
                    .join('\n')
                : 'Sin fuentes publicas registradas.';
            const publicUrlContextSources = Array.isArray((publicUrlContextResult as any)?.metadata?.urls)
                ? (publicUrlContextResult as any).metadata.urls
                    .map((entry: any) => `- ${entry.retrieved_url || entry.url || 'sin_url'} | ${entry.status || 'UNKNOWN'}`)
                    .join('\n')
                : 'Sin URLs recuperadas.';
            const compactPublicWebSearchSources = formatCompactSourceLines(
                publicWebSearchSources.split('\n'),
                'Sin fuentes publicas registradas.',
            );
            const compactPublicUrlContextSources = formatCompactSourceLines(
                publicUrlContextSources.split('\n'),
                'Sin URLs recuperadas.',
            );
            const publicSourceContext = buildPublicSourceContext(toolResults);

            // Fallback config (needed for Sommelier context below)
            const { data: aiConfig } = await supabase.from('ai_configs').select('*').eq('key', 'vsm-cesarin').maybeSingle();
            const { data: aiRules } = await supabase.from('ai_rules').select('content').eq('is_enabled', true).order('priority', { ascending: false });

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (General Concierge Dialog) ---
            // --- ENGINE 2: THE SOMMELIER (Creative & Empathetic Response) ---
            const sommelierPrompt = `
                IDENTIDAD: Eres ${aiConfig?.name || 'Cesarin'}. ${aiConfig?.voice_tone || SYSTEM_PERSONA}
                MENSJE INICIAL: ${aiConfig?.welcome_message || ''}
                MODO: ${aiConfig?.behavior_mode || 'vendedor'}
                
                REGLAS DE COMPORTAMIENTO:
                ${aiRules?.map((r: { content: string }) => `- ${r.content}`).join('\n') || ''}

                POLÃTICAS OPERATIVAS (BÃ¡sicas):
                ${VSM_OPERATIONAL_RULES}

                PRESENCIA COMERCIAL:
                - Suena como vendedor bueno de mostrador: calido, claro, con colmillo tranquilo.
                - Si el cliente duda, primero baja la friccion y luego orienta.
                - Si comparas, marca la diferencia que si cambia la decision; no recites catalogo.
                - Si recomiendas con soporte real, toma postura con naturalidad; no te escondas en neutralidad falsa.
                - Si el soporte es debil, habla con calma y humildad, no con miedo ni tecnicismo.
                - Si el momento ya da para cerrar, avanza corto y natural, sin urgencia inventada.
                - Humor ligero o picardia solo si sale solo y no roba foco.
                - No narres estados internos ni hables como sistema acomodando carriles.

                --- CONOCIMIENTO OPERATIVO (Tools / Source of Truth) ---
                POLÃTICAS:
                ${knowledgeOutput}

                PRODUCTOS ENCONTRADOS:
                ${searchOutput}
                
                ESTADO DE PEDIDO (Tracking):
                ${trackOutput}

                PROYECCIÃ“N DE INVENTARIO:
                ${inventoryOutput}

                CALIDAD_SEÃ‘AL:
                ${inventorySignalQuality}
                REGLAS DE RESPUESTA DE DISPONIBILIDAD:
                - Di primero la disponibilidad actual tal como venga en el reporte.
                - Si mencionas outlook o proyeccion, dejalo despues y como estimacion secundaria.
                - No conviertas outlook en promesa de regreso, restock o disponibilidad futura.
                - Si hoy esta agotado, dilo como agotado hoy o en este momento.

                COMPATIBILIDAD (Source of Truth):
                ${compatibilityOutput}
                REGLAS DE RESPUESTA DE COMPATIBILIDAD:
                1. Si el reporte dice [GENERALIZACION], DEBES usar lenguaje precavido ("normalmente", "por lo general", "suelen").
                2. Si el reporte dice [ESPECIFICO], puedes ser directo ("SÃ­, es compatible").
                3. Si el estatus es UNKNOWN_UNCONFIRMED, DEBES admitir que no tienes confirmaciÃ³n, preguntar detalles (modelo/marca) y sugerir contacto por WhatsApp solo como refuerzo.
                4. NUNCA inventes compatibilidades que no estÃ©n en el reporte.

                WEB PUBLICA (Contexto externo, no privado):
                BUSQUEDA:
                ${publicWebSearchOutput}
                FUENTES:
                ${compactPublicWebSearchSources}

                URL CONTEXT:
                ${publicUrlContextOutput}
                URLS RECUPERADAS:
                ${compactPublicUrlContextSources}
                REGLAS DE WEB PUBLICA:
                - Trata web publica como contexto externo y verificable, no como verdad privada de la tienda.
                - Si no hubo hallazgo claro en web publica, dilo corto y sin inflar la respuesta.
                - Si existe verdad privada o accion real del sistema, esa manda sobre la web publica.
                - No conviertas web publica en reporte largo ni reabras catalogo si el gate sigue cerrado.
                - Si el turno se resuelve solo con modelo o continuidad ligera, no fuerces a contar la web como protagonista.

                --- INFORME DEL ANALISTA ---
                ${JSON.stringify(analystReport)}

                ${customerPreferencePromptSummary ? `
                --- MEMORIA LIGERA DE GUSTOS (CLIENTE AUTENTICADO) ---
                ${customerPreferencePromptSummary}
                REGLAS DE MEMORIA:
                - Usala solo si afina recomendacion o evita repetir algo que ya rechazo.
                - Si la senal es debil, hablalo con humildad y deja espacio para que te corrija.
                - No hables como si tuvieras memoria perfecta ni como si conocieras toda su historia.
                - Si lo que pide hoy contradice memoria previa, gana lo de hoy.
                ${customerCommercialMemoryGuidance ? `- GUIA COMERCIAL EXTRA: ${customerCommercialMemoryGuidance}` : ''}
                ` : ''}
                ${softContinuity.prompt_block ? `
                ${softContinuity.prompt_block}
                REGLA DE CONTINUIDAD BLANDA:
                - Si retomas algo previo, hazlo corto, humilde y solo si ayuda.
                - Si el turno cambio de carril, responde el carril actual sin quedarte pegado al anterior.
                - No conviertas continuidad en backstory ni en empuje comercial.
                ` : ''}
                --- PERFIL DE TURNO ACTUAL ---
                INTENT PRINCIPAL: ${turnProfile.primary_intent}
                INTENTOS SECUNDARIOS: ${turnProfile.secondary_intents.join(', ') || 'ninguno'}
                PRIORIDAD: ${turnProfile.turn_priority.join(' > ')}
                DECISION DEL TURNO: ${turnProfile.current_turn_decision}
                FOCO: ${turnProfile.turn_focus}
                REGLA DE TURNO:
                - Responde directo cuando baste.
                - Pregunta solo por el dato minimo util.
                - Resuelve primero el intent principal del turno actual.
                - Si hay intents secundarios, dejalos como cola natural y no los mezcles todos en una sola salida.
                - Si el cliente cambio de carril, sigue el carril del turno actual y no la inercia del historial.
                - Si no hubo verdad real de catalogo, politica, tracking, compatibilidad o contexto web publico util, no inventes.
                - Haz una sola jugada central por turno.
                - Usa maximo dos frases cortas cuando alcance.
                - Usa maximo una pregunta.
                - No repitas la misma recomendacion en respuesta, resumen y cierre.
                - No cierres con empuje comercial por reflejo.

                --- CATALOG GATE ---
                ABIERTO: ${catalogGate.is_open ? 'SI' : 'NO'}
                RAZON: ${catalogGate.reason}
                REGLA DE CATALOGO:
                - Si el gate esta cerrado, no muestres tarjetas, recuperacion aproximada ni siguiente paso de producto.
                - Si el gate esta abierto, puedes usar catalogo solo para resolver mejor el turno actual.

                CLIENTE: "${query || 'Audio Context'}"
                HISTORIAL: ${JSON.stringify(history?.slice(-6) || [])}
                
                ${RESPONSE_SHAPE_RULES}
                ${RESPONSE_FORMAT_RULES.replace('NUMBER', whatsappNumber)}
            `;

            const shouldShortCircuitClarification =
                turnProfile.current_turn_decision === 'ASK_CLARIFYING_QUESTION'
                && toolCalls.length === 0
                && Boolean(analystConversationalPrefix);

            // â•â•â• HARDENING 2: GEMINI RESILIENCE â€” SOMMELIER CALL WITH FALLBACK â•â•â•
            let sommelierResult: any = {};
            let sommelierResponse: Response | null = null;
            let sommelier_gemini_error: string | null = null;
            let rawText = '';
            const sommelier_fallback_on_error = 'A ver, ahi si se me cruzaron los cables. Dame un momento y vuelveme a tirar la pregunta.';

            if (!shouldShortCircuitClarification) {
                const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
                if (audio) {
                    parts.push({ inline_data: { mime_type: mimeType || 'audio/webm', data: audio } });
                }
                parts.push({ text: sommelierPrompt });

                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s sommelier timeout (includes audio processing)

                    sommelierResponse = await geminiGenerateContent({
                        apiKey: _GEMINI_API_KEY,
                        model: CONCIERGE_SOMMELIER_MODEL,
                        body: {
                            contents: [{ parts }],
                            generationConfig: { temperature: 0.2 },
                            safetySettings: SAFETY_SETTINGS,
                        },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    // Handle degradation gracefully
                    if (sommelierResponse.status === 429) {
                        console.warn('[Sommelier] Rate limited (429): using fallback');
                        sommelier_gemini_error = 'Sommelier rate limit (429)';
                    } else if (sommelierResponse.status >= 500) {
                        console.warn(`[Sommelier] Server error (${sommelierResponse.status}): using fallback`);
                        sommelier_gemini_error = `Sommelier server error (${sommelierResponse.status})`;
                    } else if (!sommelierResponse.ok) {
                        sommelierResult = await sommelierResponse.json();
                        console.error(`[Sommelier] HTTP ${sommelierResponse.status}:`, JSON.stringify(sommelierResult).slice(0, 300));
                        sommelier_gemini_error = sommelierResult.error?.message || `HTTP ${sommelierResponse.status}`;
                    } else {
                        sommelierResult = await sommelierResponse.json();
                        rawText = sommelierResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                        console.warn(`[Sommelier] HTTP ${sommelierResponse.status}, text length: ${rawText.length}`);
                    }
                } catch (e: any) {
                    if (e.name === 'AbortError') {
                        console.warn('[Sommelier] Request timeout (>25s): using fallback');
                        sommelier_gemini_error = 'Sommelier timeout';
                    } else {
                        console.error(`[Sommelier] Fetch error: ${e.message}`);
                        sommelier_gemini_error = e.message;
                    }
                }
            }

            // Parse Sommelier or use fallback
            const sommelierDiag = shouldShortCircuitClarification
                ? {
                    http_status: 'skipped',
                    candidates_count: 0,
                    finish_reason: 'SKIPPED_CLARIFICATION',
                    safety_ratings: [],
                    raw_text_length: 0,
                    raw_text_preview: '',
                    prompt_feedback: null,
                    gemini_error: null,
                    using_fallback: false
                }
                : {
                    http_status: sommelierResponse?.status || 'no_response',
                    candidates_count: sommelierResult.candidates?.length || 0,
                    finish_reason: sommelierResult.candidates?.[0]?.finishReason || 'NONE',
                    safety_ratings: sommelierResult.candidates?.[0]?.safetyRatings?.map((r: any) => `${r.category}:${r.probability}`) || [],
                    raw_text_length: rawText.length,
                    raw_text_preview: rawText.slice(0, 300),
                    prompt_feedback: sommelierResult.promptFeedback || null,
                    gemini_error: sommelier_gemini_error,
                    using_fallback: !!sommelier_gemini_error
                };
            console.warn(`[Sommelier] DIAG:`, JSON.stringify(sommelierDiag));

            let aiData: any = {};
            if (shouldShortCircuitClarification) {
                const clarificationText = buildClarificationFirstFallbackText({
                    text: analystConversationalPrefix,
                    query: query || '',
                    primaryIntent: turnProfile.primary_intent,
                    currentTurnDecision: turnProfile.current_turn_decision,
                    catalogGateReason: catalogGate.reason,
                    toolCallCount: toolCalls.length,
                    hasProductSurfaces: catalogGate.is_open,
                });

                aiData = {
                    text: clarificationText,
                    intent: analystReport.intent || 'support',
                    fallback_reason: 'ANALYST_CLARIFICATION',
                    products: [],
                    routed_capsule: null,
                    conversational_prefix: null
                };
            } else if (sommelier_gemini_error) {
                // Gemini degraded: keep bounded policy turns useful before falling back to the generic degraded line
                console.warn(`[Sommelier] Using fallback due to: ${sommelier_gemini_error}`);
                const degradedPolicyFallback = intent === 'POLICY_INQUIRY' && !catalogGate.is_open
                    ? buildDegradedPolicyInquiryFallback({
                        query: query || '',
                        policyOutput: knowledgeOutput,
                        policyMatchCount: knowledgeMatchCount,
                    })
                    : null;
                aiData = {
                    text: compactCesarinResponseText(degradedPolicyFallback?.text || sommelier_fallback_on_error)
                        || degradedPolicyFallback?.text
                        || sommelier_fallback_on_error,
                    intent: analystReport.intent || 'support',
                    fallback_reason: 'GEMINI_DEGRADED',
                    products: [],
                    routed_capsule: null
                };
            } else {
                try {
                    // Parse Sommelier JSON: clean markdown code blocks, then parse
                    const cleanSommelierJson = rawText.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
                    if (!cleanSommelierJson) {
                        throw new Error('Sommelier response is empty after cleanup');
                    }

                    aiData = JSON.parse(cleanSommelierJson);

                    // Validate Sommelier contract: must have 'text' field (required, non-empty)
                    if (!aiData || typeof aiData !== 'object') {
                        throw new Error('Sommelier response is not a JSON object');
                    }

                    // Text extraction with fallback chain: text â†’ message â†’ response â†’ respuesta â†’ answer â†’ reply
                    let responseText = aiData.text;
                    if (!responseText || typeof responseText !== 'string' || responseText.trim() === '') {
                        responseText = aiData.message || aiData.response || aiData.respuesta || aiData.answer || aiData.reply || '';
                    }

                    // If still empty after all fallbacks, this violates the contract
                    if (!responseText || responseText.trim() === '') {
                        throw new Error('Sommelier response missing required "text" field and all fallback fields empty');
                    }

                    const compactedResponseText = compactCesarinResponseText(responseText.trim());
                    aiData.text = compactedResponseText || responseText.trim();
                    if (typeof aiData.conversational_prefix === 'string') {
                        const compactedPrefix = compactCesarinResponseText(aiData.conversational_prefix);
                        aiData.conversational_prefix = compactedPrefix || null;
                    }
                    console.warn(`[Sommelier] Contract valid: parsed keys: ${Object.keys(aiData).join(', ')}, text length: ${aiData.text.length}`);
                } catch (_e) {
                    console.error("[Sommelier] JSON parse error:", (_e as any).message, "Raw:", rawText.slice(0, 200));
                    aiData = {
                        text: compactCesarinResponseText(sommelier_fallback_on_error) || sommelier_fallback_on_error,
                        intent: analystReport.intent || 'support',
                        fallback_reason: 'JSON_PARSE_ERROR'
                    };
                }
            }

            // â”€â”€ Business Telemetry Computation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            if (aiData.intent === 'whatsapp' && !aiData.action) {
                const helpMessage = encodeURIComponent(`Hola, vengo del chat de Cesarin y necesito ayuda con esto: ${query || 'consulta de tienda'}`);
                aiData.action = {
                    label: 'Seguir por WhatsApp',
                    url: `https://wa.me/${whatsappNumber}?text=${helpMessage}`,
                    type: 'whatsapp'
                };
            }

            if (shouldSuppressCesarinConversationalPrefix({
                prefix: aiData.conversational_prefix,
                text: aiData.text,
                primaryIntent: turnProfile.primary_intent,
                currentTurnDecision: turnProfile.current_turn_decision,
                hasPublicSourceContext: Boolean(publicSourceContext),
            })) {
                aiData.conversational_prefix = null;
            }

            if (
                !aiData.conversational_prefix
                && analystConversationalPrefix
                && !shouldSuppressCesarinConversationalPrefix({
                    prefix: analystConversationalPrefix,
                    text: aiData.text,
                    primaryIntent: turnProfile.primary_intent,
                    currentTurnDecision: turnProfile.current_turn_decision,
                    hasPublicSourceContext: Boolean(publicSourceContext),
                })
            ) {
                aiData.conversational_prefix = analystConversationalPrefix;
            }

            if (!catalogGate.is_open) {
                aiData.products = [];
                aiData.recommended_products = [];
                aiData.resolved_products = [];
                aiData.next_step_view = null;
                if (aiData.capsule_contract && typeof aiData.capsule_contract === 'object') {
                    aiData.capsule_contract = {
                        ...aiData.capsule_contract,
                        resolved_products: [],
                        next_step_view: null,
                        catalog_gate: guardrailTelemetry.catalog_gate,
                        turn_analysis: guardrailTelemetry.turn_profile,
                    };
                }
            }

            if (typeof aiData.text === 'string' && aiData.text.trim().length > 0) {
                aiData.text = shapeCesarinResponseText({
                    text: aiData.text,
                    primaryIntent: turnProfile.primary_intent,
                    currentTurnDecision: turnProfile.current_turn_decision,
                    hasProductSurfaces: catalogGate.is_open && (
                        (Array.isArray(aiData.products) && aiData.products.length > 0)
                        || (Array.isArray(aiData.recommended_products) && aiData.recommended_products.length > 0)
                        || (Array.isArray(aiData.resolved_products) && aiData.resolved_products.length > 0)
                    ),
                    hasNextStep: Boolean(aiData.next_step_view),
                    actionType: aiData.action?.type ?? null,
                });
            }

            if (publicSourceContext) {
                aiData.source_context = publicSourceContext;
            }

            const knowledgeChunksCount = toolResults
                .filter(r => r.name === 'knowledge_rag_foundation' || r.name === 'get_store_policy')
                .reduce((acc, r) => acc + ( (r as any).metadata?.chunks_found || 0), 0);

            // semantic_match_success: true if either products or knowledge returned real matches
            const productSearchResult = toolResults.find(r => r.name === 'search_products');
            const productMatchCount = (productSearchResult as any)?.metadata?.match_count || 0;
            const knowledgeMatchCountForTelemetry  = (knowledgeResult as any)?.metadata?.chunks_found || 0;
            const semanticMatchSuccess = productMatchCount > 0 || knowledgeMatchCount > 0
                || toolResults.some(r => r.name === 'storefront_compatibility_check' && r.status === 'success')
                || toolResults.some(r => r.name === 'check_compatibility' && r.status === 'success')
                || toolResults.some(r => r.name === 'track_order' && r.status === 'success')
                || toolResults.some(r => r.name === 'get_inventory_outlook' && r.status === 'success')
                || toolResults.some(r => r.name === 'public_web_search' && r.status === 'success')
                || toolResults.some(r => r.name === 'public_url_context' && r.status === 'success');

            // fallback_used: true if Sommelier generated a fallback (no knowledge/products found)
            const fallbackUsed = !semanticMatchSuccess && !!(aiData.fallback_reason || aiData.text?.includes('Disculpa') || aiData.text?.includes('No encontrÃ©'));

            // product_card_count: number of product cards recommended by Sommelier
            const productCardCount = Array.isArray(aiData.products) ? aiData.products.length
                : Array.isArray(aiData.recommended_products) ? aiData.recommended_products.length
                : productMatchCount > 0 ? productMatchCount : 0;

            // cart_action_detected: true if cart_operator was invoked
            const cartActionDetected = toolCalls.some(c => c.name === 'cart_operator');

            // â”€â”€ frustration_detected: MVP 3-signal heuristic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Signal 1: Escalation â€” user explicitly asks for human/WhatsApp
            const escalationRequested = aiData.intent === 'whatsapp'
                || aiData.action?.type === 'whatsapp'
                || /hablar con (un |una )?(humano|persona|asesor|agente)/i.test(query || '');

            // Signal 2: Zero-results persistence â€” current search returned 0 AND
            //   a recent assistant message in history already apologised for no results
            const zeroNow = intent === 'PRODUCT_SEARCH' && productCardCount === 0;
            const priorZeroSignal = Array.isArray(history) && history.some(
                (h: { role: string; content: string }) =>
                    h.role === 'assistant' &&
                    /no encontr[eÃ©]|no tenemos|no estÃ¡ disponible|sin resultados|agotado/i.test(h.content)
            );
            const zeroResultsPersistence = zeroNow && priorZeroSignal;

            // Signal 3: Fallback + empty â€” fallback route fired AND zero product cards
            //   Exclude greetings/chit-chat: these are intentionally zero-card, zero-tool responses
            const isConversationalIntent = intent === 'CHIT_CHAT' || isGreeting
                || aiData.fallback_reason === 'GREETING' || aiData.fallback_reason === 'CHIT_CHAT';
            const fallbackEmpty = fallbackUsed && productCardCount === 0 && !isConversationalIntent;

            const frustrationDetected = escalationRequested || zeroResultsPersistence || fallbackEmpty;

            aiData.debug = {
                // Observability: Model + Config
                sommelier_model: CONCIERGE_SOMMELIER_MODEL,
                analyst_model: CONCIERGE_ANALYST_MODEL,
                sommelier_temperature: 0.2,
                sommelier_http_status: sommelierResponse?.status || 500,
                sommelier_routed_capsule: aiData.routed_capsule || null,
                sommelier_fallback_reason: aiData.fallback_reason || null,
                sommelier_diag: sommelierDiag,
                // Standard debug fields
                detected_intent: analystReport.intent,
                intent: aiData.intent || analystReport.intent, // Sommelier intent preferred; fallback to Analyst intent if missing
                sommelier_intent: aiData.intent || 'MISSING',
                requires_client_capsule: !!aiData.requires_client_capsule,
                tool_calls: toolCalls, // [CANONICAL]
                tool_calls_requested: toolCalls.length,
                tools_executed: toolResults.filter(r => r.status === 'success').map(r => r.name),
                knowledge_chunks_count: knowledgeChunksCount,
                memory_trace: memoryTrace,
                latency_ms: Date.now() - startTools,
                gemini_api_error: geminiError,
                raw_analyst_report: analystReport,
                should_close_session: analystReport.should_close_session || aiData.should_close_session || false,
                analyst_report: {
                    intent: analystReport.intent,
                    turn_decision: analystReport.turn_decision || null,
                    doubts: analystReport.doubts,
                    customer_dna: analystReport.customer_dna,
                    tool_calls_requested: toolCalls.length,
                    tool_results: toolResults.map(r => ({ 
                        name: r.name, 
                        status: r.status, 
                        latency: r.latency_ms,
                        summary: r.summary,
                        args: r.args
                    })),
                    total_tool_latency: totalToolLatency,
                    shared_embedding_used: !!sharedEmbedding,
                    capability_box: capabilityPlan.capabilityBox,
                    primary_capability: capabilityPlan.primaryCapability,
                },
                sommelier_report: {
                    rules_applied: aiRules?.map((r: { content: string }) => r.content).slice(0, 3) || [],
                    tone_correction: true,
                    creative_layer: "Active"
                },
                runtime_truth: {
                    analyst_model: CONCIERGE_ANALYST_MODEL,
                    sommelier_model: CONCIERGE_SOMMELIER_MODEL,
                    ...getGeminiRuntimePolicy(),
                    project_ref: 'cvvlorbiwtuhkxolhfie',
                    correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                }
            };

            // â”€â”€ Memory Persistence (Non-blocking â€” unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            if (aiData.text) {
                aiData.text = compactCesarinResponseText(aiData.text) || aiData.text;
                await persistStorefrontCustomerMemoryIfPossible();
            }

            // TEXT GUARANTEE: Ensure aiData always has a text field before returning
            if (!aiData.text && !aiData.message) {
                console.warn('[CONCIERGE_CHAT] TEXT GUARANTEE: No text/message in aiData. Injecting fallback from analyst/sommelier.');
                aiData.text = compactCesarinResponseText(aiData.response || 'Estoy aquÃ­ para ayudarte. Â¿QuÃ© necesitas?') || aiData.response || 'Estoy aquÃ­ para ayudarte. Â¿QuÃ© necesitas?';
                aiData.intent = analystReport.intent || 'support';
            }

            if (typeof aiData.text === 'string') {
                aiData.text = guardClarificationFirstFinalText({
                    text: aiData.text,
                    query: query || '',
                    primaryIntent: guardrailTelemetry.turn_profile.primary_intent,
                    currentTurnDecision: guardrailTelemetry.turn_profile.current_turn_decision,
                    catalogGateReason: guardrailTelemetry.catalog_gate.reason,
                    catalogGateOpen: guardrailTelemetry.catalog_gate.is_open,
                    toolCallCount: toolCalls.length,
                    productCardCount,
                    hasProductSurfaces: Boolean(
                        (Array.isArray(aiData.products) && aiData.products.length > 0)
                        || (Array.isArray(aiData.recommended_products) && aiData.recommended_products.length > 0)
                        || (Array.isArray(aiData.resolved_products) && aiData.resolved_products.length > 0)
                    ),
                });
            }

            // â”€â”€ Analytics Persistence (Awaited, post-guarantee text, non-capsule only) â”€â”€
            // Capsule paths delegate telemetry to the client; edge must not claim ownership for those.
            // Determine routing path: pre-routed intents (PRODUCT_SEARCH, KIT_ASSEMBLY, BUDGET_RESCUE, CHECKOUT_READINESS, WARRANTY_SUPPORT, LOYALTY_SUPPORT, POLICY_INQUIRY, CART_OPERATION, ORDER_TRACKING, COMPATIBILITY_CHECK, OUT_OF_DOMAIN)
            // were handled before reaching Sommelier. All others (INVENTORY_OUTLOOK, CHIT_CHAT, UNKNOWN) are fallback_handled by Sommelier.
            const preRoutedIntents = ['PRODUCT_SEARCH', 'KIT_ASSEMBLY', 'BUDGET_RESCUE', 'CHECKOUT_READINESS', 'WARRANTY_SUPPORT', 'LOYALTY_SUPPORT', 'POLICY_INQUIRY', 'CART_OPERATION', 'ORDER_TRACKING', 'COMPATIBILITY_CHECK', 'OUT_OF_DOMAIN'];
            const routingPath = preRoutedIntents.includes(intent) ? 'pre_routed' : 'fallback_handled';
            const telemetryNextStep = extractTelemetryNextStepTruth(aiData.next_step_view);
            const telemetryRetrievalSource = resolveTelemetryRetrievalSource(toolResults);

            if (!aiData.requires_client_capsule) {
                const analyticsPayload = {
                    query: query,
                    response_text: aiData.text ?? null,
                    detected_intent: analystReport.intent,
                    frustration_detected: frustrationDetected,
                    primary_intent: guardrailTelemetry.turn_profile.primary_intent,
                    current_turn_decision: guardrailTelemetry.turn_profile.current_turn_decision,
                    turn_focus: guardrailTelemetry.turn_profile.turn_focus,
                    catalog_gate_open: guardrailTelemetry.catalog_gate.is_open,
                    catalog_gate_reason: guardrailTelemetry.catalog_gate.reason,
                    next_step_family: telemetryNextStep.next_step_family,
                    assist_action_present: telemetryNextStep.assist_action_present,
                    source_context_present: Boolean(publicSourceContext),
                    retrieval_source: telemetryRetrievalSource,
                    recommended_product_ids: Array.isArray(aiData.products)
                        ? aiData.products.map((p: any) => p.id).filter(Boolean)
                        : [],
                ai_logic_debug: {
                    ...aiData.debug,
                    turn_profile: guardrailTelemetry.turn_profile,
                    // Cognitive Integrity: routing path distinguishes pre-routed vs fallback-handled
                    routing_path: routingPath,
                        primary_intent: guardrailTelemetry.turn_profile.primary_intent,
                        current_turn_decision: guardrailTelemetry.turn_profile.current_turn_decision,
                        turn_focus: guardrailTelemetry.turn_profile.turn_focus,
                        catalog_gate_open: guardrailTelemetry.catalog_gate.is_open,
                        catalog_gate_reason: guardrailTelemetry.catalog_gate.reason,
                        next_step_family: telemetryNextStep.next_step_family,
                        assist_action_present: telemetryNextStep.assist_action_present,
                        source_context_present: Boolean(publicSourceContext),
                        retrieval_source: telemetryRetrievalSource,
                        // Business KPIs persisted to ai_analytics
                        semantic_match_success: semanticMatchSuccess,
                        fallback_used: fallbackUsed,
                        product_card_count: productCardCount,
                        cart_action_detected: cartActionDetected,
                        frustration_detected: frustrationDetected,
                        frustration_signals: {
                            escalation: escalationRequested,
                            zero_results_persistence: zeroResultsPersistence,
                            fallback_empty: fallbackEmpty
                        },
                        product_match_count: productMatchCount,
                        policy_match_count: knowledgeMatchCountForTelemetry
                    }
                };
                const suppressEdgeAnalytics = shouldSuppressCustomerIntelligenceWrite(noWriteSmoke, 'ai_analytics');
                const { data: analyticsData, error: analyticsErr } = suppressEdgeAnalytics
                    ? { data: null, error: null }
                    : await supabase.from('ai_analytics').insert(analyticsPayload).select('id').maybeSingle();
                if (analyticsErr) {
                    console.error('[Analytics] Insert failed:', analyticsErr.message);
                } else if (suppressEdgeAnalytics) {
                    console.warn('[Analytics] Suppressed by customer-intelligence no-write smoke contract');
                } else {
                    console.warn(`[Analytics] Persisted â€” intent:${analystReport.intent} semantic_ok:${semanticMatchSuccess} fallback:${fallbackUsed} cards:${productCardCount} cart:${cartActionDetected}`);
                }
                // Truthful ownership: only claim edge-logged if insert actually succeeded
                const edgeTelemetryLogged = !analyticsErr && !suppressEdgeAnalytics;
                aiData.server_telemetry_logged = edgeTelemetryLogged;
                if (noWriteSmoke) {
                    aiData.no_write_smoke = noWriteSmoke;
                }
                aiData.telemetry_contract = buildTelemetryContract({
                    owner: 'edge',
                    edgeLogged: edgeTelemetryLogged,
                    reason: edgeTelemetryLogged ? 'edge_logged' : 'edge_insert_failed',
                });

                // â•â•â• HARDENING 3: ASYNC QA JUDGE HOOK (NON-BLOCKING) â•â•â•
                // Trigger background evaluation for risky turns without blocking user response
                const qaJudgeEnabled = Deno.env.get('DISABLE_QA_JUDGE') !== 'true'
                    && !shouldSuppressCustomerIntelligenceCall(noWriteSmoke, 'cesarin-qa-judge');
                const shouldEvaluate = qaJudgeEnabled && (frustrationDetected || (intent === 'PRODUCT_SEARCH' && productCardCount === 0));
                if (shouldEvaluate && analyticsData?.id) {
                    // Non-blocking: fire-and-forget via fetch with no await
                    (async () => {
                        try {
                            const judgePayload = {
                                action: 'evaluate_turn',
                                analytics_id: analyticsData.id,
                                turn_data: {
                                    query: query,
                                    response_text: aiData.text,
                                    intent: analystReport.intent,
                                    frustration_detected: frustrationDetected,
                                    zero_results: intent === 'PRODUCT_SEARCH' && productCardCount === 0,
                                    product_count: productCardCount,
                                    metadata: {
                                        sommelier_model: CONCIERGE_SOMMELIER_MODEL,
                                        timestamp: new Date().toISOString()
                                    }
                                }
                            };

                            // Best-effort: 5s timeout, no retry
                            const jc = new AbortController();
                            const jt = setTimeout(() => jc.abort(), 5000);

                            const judgeRes = await fetch(
                                `${_SUPABASE_URL}/functions/v1/cesarin-qa-judge`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${_SUPABASE_SERVICE_ROLE_KEY}`
                                    },
                                    body: JSON.stringify(judgePayload),
                                    signal: jc.signal
                                }
                            );

                            clearTimeout(jt);

                            if (!judgeRes.ok) {
                                console.warn(`[QA Judge] Background eval returned ${judgeRes.status} (non-critical)`);
                            } else {
                                console.warn('[QA Judge] Background evaluation queued');
                            }
                        } catch (e: any) {
                            // Silently log: Judge failure must not impact user response
                            console.warn(`[QA Judge] Background eval error (non-blocking): ${e.message}`);
                        }
                    })();
                }
            } else {
                // Capsule path: client owns telemetry, do not suppress client fallback logging
                aiData.server_telemetry_logged = false;
                aiData.telemetry_contract = buildTelemetryContract({
                    owner: 'client',
                    edgeLogged: false,
                    reason: 'capsule_handoff',
                });
            }

            aiData.turn_profile = guardrailTelemetry.turn_profile;
            aiData.catalog_gate = guardrailTelemetry.catalog_gate;

            return new Response(JSON.stringify(aiData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (action === 'generate_proactive_insights') {
            const { data: lowStock } = await supabase.from('products').select('name').lt('stock', 5).limit(3)
            const { data: atRisk } = await supabase.from('customer_intelligence_360').select('full_name').eq('segment', 'En Riesgo').limit(3)
            const prompt = `
                Analiza el estado de VSM Store y genera 3 insights estratÃ©gicos rÃ¡pidos.
                PRODUCTOS BAJO STOCK: ${(lowStock || []).map((p: { name: string }) => p.name).join(', ') || 'Ninguno'}
                CLIENTES EN RIESGO: ${(atRisk || []).map((c: { full_name: string }) => c.full_name).join(', ') || 'Ninguno'}
                
                RETORNA JSON:
                {
                    "insights": [
                        { "type": "warning", "title": "...", "description": "..." }
                    ]
                }
            `
            const result = await invokeGeminiTextModel(
                _GEMINI_API_KEY,
                AUXILIARY_MODEL,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                    },
                },
                'Error from Google API (generate_proactive_insights)',
            )
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            const aiData = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim())
            return new Response(JSON.stringify(aiData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        throw new Error(`AcciÃ³n no soportada: ${action}`)
    } catch (error: any) {
        const errorMsg = `[Customer-Intelligence] Error: ${error.message}`;
        console.error(errorMsg);
        const errorPayload: Record<string, unknown> = {
            version: "V3.4B-STABILIZED-2026-COMPLIANT",
            error: error.message,
            context: 'customer-intelligence',
            gemini_key_present: !!_GEMINI_API_KEY,
            ...buildCustomerIntelligenceNoWriteSmokeErrorFields(noWriteSmokeForError),
            ...(noWriteSmokeForError ? {} : { full_error: error.stack }),
        };
        return new Response(JSON.stringify(errorPayload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

