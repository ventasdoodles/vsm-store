/**
 * customer-intelligence — Supabase Edge Function
 * 
 * Multi-action AI function for customer-facing intelligence:
 *   - parse_admin_intent: NLP parsing of admin commands
 *   - generate_supplier_message: AI-generated supplier restock messages
 *   - generate_whatsapp_copy: Marketing copy for WhatsApp campaigns
 *   - analyze_loyalty: Customer loyalty pattern analysis
 *   - generate_customer_message: Personalized customer communications
 * 
 * @model gemini-2.5-flash (via v1 API)
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-18: gemini-1.5 → gemini-2.5-flash (Total Migration)
 * - 2026-03-18: Added runtime_metadata for compliance audit.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { SYSTEM_PERSONA, VSM_OPERATIONAL_RULES, RESPONSE_FORMAT_RULES } from './persona.ts'
import { resolveStorefrontWeakIntent } from './intent-guardrails.ts'
import { executeTools, ToolCall, ToolResult } from './tools.ts'
import {
    buildCustomerPreferencePromptSummary,
    collectCustomerPreferenceSignals,
    hasCustomerPreferenceSummary,
    persistMemory,
} from './memory.ts'

// Credentials will be loaded per-request for maximum resilience
// ═══ MODEL STACK (Billing-enabled, validated 2026-03-18) ═══
// Router/Sommelier: gemini-2.5-flash (current 2026 standard)
const ANALYST_MODEL = 'gemini-2.5-flash';
const SOMMELIER_MODEL = 'gemini-2.5-flash';

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

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

    console.warn(`[customer-intelligence] Action: ${req.method} URL: ${req.url}`)
    const apiKeyStatus = _GEMINI_API_KEY ? 'Present' : 'MISSING';
    console.warn(`[customer-intelligence] Gemini Key Status: ${apiKeyStatus}`)

    try {
        if (!_GEMINI_API_KEY || !_SUPABASE_URL || !_SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Environment secrets (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not properly configured.');
        }

        const body = await req.json()
        const { customerId, action, context, query, history, customerContext: cContext, customer_context } = body
        const customerContext = cContext || customer_context
        const supabase = createClient(_SUPABASE_URL, _SUPABASE_SERVICE_ROLE_KEY)

        const { data: storeSettings } = await supabase
            .from('store_settings')
            .select('whatsapp_number')
            .eq('id', 1)
            .single()

        const whatsappNumber = storeSettings?.whatsapp_number || '5212281234567'

        if (action === 'parse_admin_intent') {
            if (!query) throw new Error('Query is required for NLP parsing')
            const prompt = `
                Eres el cerebro de administración de "VSM Store".
                Convierte la petición del administrador en una acción estructurada.
                ACCIONES DISPONIBLES:
                - search: Buscar productos, clientes o órdenes.
                - navigate: Ir a una sección (products, orders, customers, coupons, settings, dashboard).
                - filter: Aplicar filtros a la vista actual.

                QUERY: "${query}"

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "action": "search | navigate | filter | unknown",
                    "target": "nombre_de_la_seccion_o_busqueda",
                    "params": {},
                    "message": "Respuesta corta de confirmación"
                }
            `
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ANALYST_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                        temperature: 0.2,
                        response_mime_type: "application/json"
                    }
                })
            })
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Error from Google API (parse_admin_intent)');
            }
            const result = await response.json()
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            return new Response(rawText.trim(), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'generate_supplier_copy') {
            const { productName, currentStock, sku } = body
            const prompt = `
                Genera un mensaje profesional de WhatsApp para un proveedor de vapeo.
                Necesito reabastecer: ${productName} (SKU: ${sku}).
                Stock actual: ${currentStock}.
                Pide cotización para 50 unidades. Tono empresarial pero directo.
            `
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ANALYST_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            })
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Error from Google API (generate_supplier_copy)');
            }
            const result = await response.json()
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
                Eres un experto en comunicación para "VSM Store".
                Genera un mensaje de WhatsApp amigable, corto y persuasivo para este cliente.
                DATOS DEL CLIENTE:
                - Nombre: ${intel?.full_name || 'Cliente'}
                - Segmento: ${intel?.segment || 'Regular'}
                - Contexto Adicional: ${context || 'N/A'}
                REGLAS:
                - Usa emojis relacionados con vapeo (💨, ⚡, 💎).
                - Máximo 50 palabras.
            `
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ANALYST_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            })
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Error from Google API (generate_whatsapp_copy)');
            }
            const result = await response.json()
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const message = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
            return new Response(JSON.stringify({ message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'concierge_chat' || action === 'semantic_search') {
            // ═══ HARDENING 1: SERVER-SIDE PILOT ENFORCEMENT (SUPABASE AUTH VERIFICATION) ═══
            // Verify bearer token using Supabase Auth API (server-trusted validation).
            // body.is_pilot is context only; enforcement relies on verified user session.
            const authHeader = req.headers.get('Authorization') || '';
            const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

            let isAuthenticated = false;
            let authError: string | null = null;
            let authenticatedUser: any = null;

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
                        authenticatedUser = user;
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
                    server_telemetry_logged: false
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

            // --- ENGINE 1: THE ANALYST (Structured Intelligence) ---
            const analystPrompt = `
                Eres "The Analyst", el motor de inteligencia de VSM Store.
                Analiza el mensaje del cliente y extrae metadatos críticos.
                
                MENSAJE: "${query || 'Audio Context'}"
                CONTEXTO CLIENTE: ${JSON.stringify(customerContext || 'Nuevo')}
                ${customerMemory ? `
                --- MEMORIA PERSISTENTE (SESIÓN ANTERIOR) ---
                ESTA INFORMACIÓN ES SOLO PARA SESGAR BÚSQUEDAS Y DESAMBIGUAR.
                LOS INTERESES AL INICIO DE LA LISTA TIENEN MAYOR FRECUENCIA/PESO HISTÓRICO.
                REGLA: EL DESEO ACTUAL DEL USUARIO SIEMPRE TIENE PRIORIDAD ABSOLUTA.
                ${customerMemory.prioritized_interests?.length ? `INTERESES PREVIOS (ORDENADOS POR PESO): ${customerMemory.prioritized_interests.join(', ')}` : ''}
                ${customerPreferencePromptSummary ? `RESUMEN LIGERO DE GUSTOS: ${customerPreferencePromptSummary}` : ''}
                REGLAS:
                - Lo actual manda sobre lo historico.
                - Una tendencia debil no es verdad dura.
                - Solo usa esta memoria si ayuda a recomendar mejor o a evitar algo que ya rechazo.
                ÚLTIMA INTERACCIÓN: ${customerMemory.last_interaction_at}
                ` : ''}
                
                HISTORIAL: ${JSON.stringify(history?.slice(-3) || [])}

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "intent": "CART_OPERATION | POLICY_INQUIRY | PRODUCT_SEARCH | ORDER_TRACKING | INVENTORY_OUTLOOK | COMPATIBILITY_CHECK | CHIT_CHAT | UNKNOWN | OUT_OF_DOMAIN",
                    "doubts": ["lista de dudas percibidas"],
                    "tool_calls": [
                        { "name": "cart_operator", "args": { "action": "ADD", "product_ref": "vape de menta", "quantity": 2 }, "reason": "cliente explícitamente pidió meterlo al carrito" },
                        { "name": "knowledge_rag_foundation", "args": { "query": "búsqueda semántica de política", "is_ambiguous": false }, "reason": "porque pregunta sobre envíos" },
                        { "name": "product_search_integrity", "args": { "query": "búsqueda", "is_ambiguous": false, "requires_semantic_expansion": true }, "reason": "porque busca vapes" }
                    ],
                    "customer_dna": {
                        "interests": ["vapes", "menta"],
                        "preference_signals": [
                            { "category": "flavor", "value": "menta", "evidence": "explicit", "label": "menta" },
                            { "category": "budget", "value": "barato", "evidence": "inferred", "label": "cuida precio" }
                        ]
                    },
                    "conversational_prefix": "Frase de 1 línea empatizando y espejeando hiperlocalización si detectas región (norte='compare'/'carnita asada', costa='brody', cdmx='paps'). Vacío si no es posible."
                }

                EJEMPLOS DE CLASIFICACIÓN (FEW-SHOT):
                1. "¿qué vapes tienes?" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "vapes", "is_ambiguous": true, "requires_semantic_expansion": true}}] }
                2. "¿cuál es la política de envíos?" -> {"intent": "POLICY_INQUIRY", "tool_calls": [{"name": "knowledge_rag_foundation", "args": {"query": "política de envíos", "is_ambiguous": false}}] }
                3. "hola" -> {"intent": "CHIT_CHAT", "tool_calls": [] }
                4. "agrega un vape de uva" -> {"intent": "CART_OPERATION", "tool_calls": [{"name": "cart_operator", "args": {"action": "ADD", "product_ref": "vape de uva", "quantity": 1}}] }
                5. "quiero algo barato y frutal" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "algo barato y frutal", "is_ambiguous": true, "requires_semantic_expansion": true}}] }
                6. "recomiéndame algo frutal" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "recomendación frutal", "is_ambiguous": true, "requires_semantic_expansion": true}}] }
                7. "quiero algo suave y rico" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "suave y rico", "is_ambiguous": true, "requires_semantic_expansion": true}}] }
                8. "quiero dejar de fumar" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "kits de inicio dejar de fumar vapes", "is_ambiguous": true, "requires_semantic_expansion": true}}] }
                9. "quiero un nissan versa" -> {"intent": "OUT_OF_DOMAIN", "tool_calls": [] }
                10. "busco departamento en renta" -> {"intent": "OUT_OF_DOMAIN", "tool_calls": [] }
                11. "cuánto cuesta un kilo de carne" -> {"intent": "OUT_OF_DOMAIN", "tool_calls": [] }
                12. "tienes waka somatch mb6000?" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "waka somatch mb6000", "is_ambiguous": false, "requires_semantic_expansion": false}}] }
                13. "snoop dogg g pen tienes?" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "snoop dogg g pen", "is_ambiguous": false, "requires_semantic_expansion": false}}] }
                14. "necesito una pipa de cristal" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "pipa de cristal", "is_ambiguous": false, "requires_semantic_expansion": false}}] }
                15. "quiero un vape desechable de menta" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "vape desechable menta", "is_ambiguous": false, "requires_semantic_expansion": false}}] }

                REGLAS DE TOOLS (CRÍTICAS):
                - Usa "cart_operator" si el cliente pregunta explícitamente por comprar, añadir, quitar o cambiar la cantidad de un artículo en su carrito (Intento: CART_OPERATION).
                - Usa "knowledge_rag_foundation" si el cliente pregunta por envíos, pagos, políticas o conceptos básicos de vapeo (Intento: POLICY_INQUIRY).
                - Usa "product_search_integrity" si el cliente busca productos por marca, sabor, o expresa preferencias comerciales como: barato, económico, dulce, frutal, fuerte, suave, fresco, mentol, rico, intenso, recomiéndame, qué me conviene, algo que me guste, algo para..., quiero probar, dejar de fumar (Intento: PRODUCT_SEARCH). 
                  REGLA ABSOLUTA: "tengo X, ¿qué me recomiendas?" es PRODUCT_SEARCH (intención de compra).
                - Usa "track_order" si el cliente pregunta por el estado de su pedido (Intento: ORDER_TRACKING).
                - Usa "get_inventory_outlook" si el cliente pregunta por disponibilidad futura o agotamiento (Intento: INVENTORY_OUTLOOK).
                - Usa "check_compatibility" si el cliente pregunta por compatibilidad técnica: si una pieza le queda a otra, qué tipo de líquido usar, o si un componente (coil, batería, pod) sirve para un modelo (Intento: COMPATIBILITY_CHECK).
                  REGLA ABSOLUTA: "¿qué coil/pod usa mi equipo?" es COMPATIBILITY_CHECK (intención técnica de fit).
                - Si no necesitas herramientas, deja "tool_calls" como un array vacío [].
                - Usa OUT_OF_DOMAIN si el cliente pregunta por algo completamente ajeno a vapeo, 420 y la tienda (automóviles, bienes raíces, alimentos no relacionados, servicios ajenos). Deja "tool_calls" vacío []. NUNCA llames product_search_integrity para consultas fuera de dominio.
                - REGLA DE requires_semantic_expansion: Usa requires_semantic_expansion=false cuando el query es un nombre de producto, marca o modelo específico (ejemplos: "G Pen Pro", "Waka MB6000", "pipa de cristal", "Snoop Dogg G Pen"). Usa requires_semantic_expansion=true SOLO para conceptos o preferencias vagas (ejemplos: "algo frutal", "vape suave", "algo para relajarme"). Específico -> false. Concepto -> true.

                REGLA DE ORO DE INTENTOS:
                - COMPATIBILIDAD/FIT (¿le queda?, ¿sirve para?, ¿qué usa X?) -> COMPATIBILITY_CHECK (PRIORIDAD TÉCNICA).
                - PREFERENCIAS COMERCIALES (barato, frutal, dulce, recomiéndame, etc.) -> PRODUCT_SEARCH.
                - RECOMENDACIÓN DE COMPRA ("tengo X, ¿qué me recomiendas?") -> PRODUCT_SEARCH.
                - POLÍTICAS/ENVÍOS -> POLICY_INQUIRY.
                - CHIT-CHAT/TRIVIAL -> CHIT_CHAT.
                - FUERA DE DOMINIO (automóviles, bienes raíces, alimentos ajenos, servicios no relacionados con vapeo o 420) -> OUT_OF_DOMAIN. NUNCA llames herramientas.
                - SOLO usa UNKNOWN si el mensaje es completamente indescifrable.
            `;

            // ═══ HARDENING 2: GEMINI RESILIENCE — ANALYST CALL WITH FALLBACK ═══
            let analystResult: any = {};
            let analystResponse: Response | null = null;
            let geminiError: string | null = null;
            let rawAnalystText = '';

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s analyst timeout

                analystResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${ANALYST_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: analystPrompt }] }],
                        generationConfig: { temperature: 0.1 },
                        safetySettings: SAFETY_SETTINGS
                    }),
                    signal: controller.signal
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
                    console.warn('[Analyst] Request timeout (>20s): Gemini response degraded');
                    geminiError = 'Analyst timeout';
                } else {
                    console.error(`[Analyst] Fetch error: ${e.message}`);
                    geminiError = e.message;
                }
            }

            // Parse analyst response with strict contract validation
            // Contract: Analyst must emit { intent, tool_calls: [] }
            // Valid intents: CART_OPERATION | POLICY_INQUIRY | PRODUCT_SEARCH | ORDER_TRACKING | INVENTORY_OUTLOOK | COMPATIBILITY_CHECK | CHIT_CHAT | UNKNOWN | OUT_OF_DOMAIN
            const VALID_INTENTS = ['CART_OPERATION', 'POLICY_INQUIRY', 'PRODUCT_SEARCH', 'ORDER_TRACKING', 'INVENTORY_OUTLOOK', 'COMPATIBILITY_CHECK', 'CHIT_CHAT', 'UNKNOWN', 'OUT_OF_DOMAIN'];

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
                analystReport = {
                    intent: 'PRODUCT_SEARCH',
                    tool_calls: [{
                        name: 'product_search_integrity',
                        args: { query: query || '', is_ambiguous: true, requires_semantic_expansion: true },
                        reason: 'fallback_due_to_analyst_degradation'
                    }],
                    customer_dna: { interests: [], preference_signals: [] }
                };
            }

            let intent = (analystReport.intent || 'UNKNOWN').toUpperCase();
            const analystIntent = intent; // A85: captured before any guardrail override
            const toolCalls: ToolCall[] = analystReport.tool_calls || [];
            const guardrailOverrides: string[] = []; // A85: populated by each override that changes intent

            // --- QUALITY GUARDRAIL: Deterministic Intent Override (brain-first) ---
            // Las capsules ejecutan; el Analyst tiene autoridad semántica primaria.
            // --- QUALITY GUARDRAIL: Deterministic Intent Override (brain-first) ---

            const normalizedQuery = (query || "").toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[¿?¡!]/g, " ")
                .trim();

            const isCompatibilityMatch = /compatible|compatibilidad|(me|te|le|nos|os|les)\s*(queda|quedan)|sirve para|funciona con|(me|te|le|nos|os|les)\s*(cabe|caben)|que coil|que pod|que bateria|que liquido|que resistencia|usa mi|(me|te|le|nos|os|les)\s*(sirve|sirven)/.test(normalizedQuery);
            const isInventoryMatch     = /stock|inventario|disponible|disponibilidad|queda|agotara|agota|agotarse|agotado|durara/.test(normalizedQuery);
            const isPolicyMatch        = /politica|envio|pago|reembolso|devolucion|garantia|entrega|costo|tarifa|aceptan/.test(normalizedQuery);
            const isProductMatch       = /quiero|busco|buscas|tienen|tienes|hay|tengo|frutal|dulce|suave|fuerte|fresco|mentol|rico|intenso|cremoso|tropical|acido|uva|mango|fresa|sandia|melon|mora|cereza|menta|hielo|ice|tabaco|caramelo|barato|economico|precio|oferta|descuento|recomienda|conviene|guste|probar|comprar|liquido|vape|pod|pods|mod|kit|kits|cartucho|cartuchos|desechable|desechables|dispositivo|vaporizador/.test(normalizedQuery);
            const isGreeting           = /hola|buenos dias|buenas tardes|que tal|buenas|quien eres|quien soy|quien es|quien eres tu/.test(normalizedQuery);
            const hasTimeContext       = /cuanto tiempo|cuando|cuantos dias|cuantos minutos|cuantas horas|se agota|se agotan/.test(normalizedQuery);

            const guardrailDebug = { normalizedQuery, isCompatibilityMatch, isInventoryMatch, isProductMatch, initialIntent: analystReport.intent };

            // --- STRICT PRECEDENCE OVERRIDES ---
            
            // 1. Force Compatibility (Technical fit always wins over commercial search)
            // BUT: do not override if query has time-context signals (inventory timeframe distinction)
            if (isCompatibilityMatch && !hasTimeContext) {
                if (intent !== 'COMPATIBILITY_CHECK') {
                    console.warn(`[GUARDRAIL] Force-Corrected → COMPATIBILITY_CHECK (Query: ${normalizedQuery.slice(0,30)})`);
                    intent = 'COMPATIBILITY_CHECK';
                    guardrailOverrides.push('COMPATIBILITY_FORCE');
                }
                // Always prune search/policy tools in technical mode
                for (let i = toolCalls.length - 1; i >= 0; i--) {
                    if (['product_search_integrity', 'search_products', 'knowledge_rag_foundation', 'get_store_policy'].includes(toolCalls[i].name)) {
                        toolCalls.splice(i, 1);
                    }
                }
            } 
            // 2. Resolve weak storefront turns only when the query has real supporting signals.
            else {
                const weakIntentResolution = resolveStorefrontWeakIntent({
                    intent: intent as Parameters<typeof resolveStorefrontWeakIntent>[0]['intent'],
                    isInventoryMatch,
                    isPolicyMatch,
                    isProductMatch,
                    isGreeting,
                });

                intent = weakIntentResolution.intent;
                guardrailOverrides.push(...weakIntentResolution.guardrailOverrides);
            }

            // If guardrail upgraded intent but Analyst gave no tool_calls, inject the canonical tool
            if (intent === 'PRODUCT_SEARCH' && !toolCalls.some(c => c.name === 'product_search_integrity' || c.name === 'search_products')) {
                console.warn('[GUARDRAIL] Injecting product_search_integrity tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'product_search_integrity', args: { query: query || '', is_ambiguous: true, requires_semantic_expansion: true }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'POLICY_INQUIRY' && !toolCalls.some(c => c.name === 'knowledge_rag_foundation' || c.name === 'get_store_policy')) {
                console.warn('[GUARDRAIL] Injecting knowledge_rag_foundation tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'knowledge_rag_foundation', args: { query: query || '', is_ambiguous: true }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'INVENTORY_OUTLOOK' && !toolCalls.some(c => c.name === 'get_inventory_outlook')) {
                console.warn('[GUARDRAIL] Injecting get_inventory_outlook tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'get_inventory_outlook', args: { product_ref: query || '' }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'COMPATIBILITY_CHECK' && !toolCalls.some(c => c.name === 'check_compatibility')) {
                console.warn('[GUARDRAIL] Injecting check_compatibility tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'check_compatibility', args: { query: query || '' }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'CART_OPERATION' && !toolCalls.some(c => c.name === 'cart_operator')) {
                console.warn('[GUARDRAIL] Injecting cart_operator tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'cart_operator', args: { action: 'ADD', product_ref: query || '', quantity: 1 }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }

            // [HARDENING] Synchronize corrected intent back to analystReport for Sommelier and Debug visibility
            analystReport.intent = intent;

            // --- A85: Structured Guardrail Decision Telemetry ---
            // Captures the full Analyst→guardrail→injection decision chain for persistent diagnostics.
            // Appended to the debug payload of every capsule router response so the client can
            // persist it in ai_logic_debug without needing to parse edge function logs.
            const guardrailTelemetry = {
                analyst_intent: analystIntent,
                guardrail_intent: intent,
                guardrail_overrides: guardrailOverrides,
                injected_tools: toolCalls
                    .filter((c: any) => (c as any).reason === 'guardrail_injection')
                    .map((c: any) => c.name)
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
            const knowledgeCapsuleCall = toolCalls.find(c => c.name === 'knowledge_rag_foundation' || c.name === 'get_store_policy');
            
            // EL DESVÍO A CAPSULE SOLO SI EL INTENTO FINAL (tras guardrail) LO PERMITE.
            // Strict intent-gated dispatch: only route to a capsule when the guardrail-resolved
            // intent matches it. OR-arm conditions that used tool_call presence as a secondary
            // signal were swallowing CART_OPERATION / ORDER_TRACKING / INVENTORY_OUTLOOK whenever
            // the Analyst emitted a search call alongside the primary tool — silent misroutes.
            // Guardrail injections (lines 388-403) already guarantee tool call presence for every
            // routable intent, making the OR arms structurally redundant. (A83)
            if (intent === 'PRODUCT_SEARCH' && searchCapsuleCall) {
                console.warn('[ROUTER] Delegating Product Search to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'product_search_integrity',
                    conversational_prefix: analystReport.conversational_prefix || null,
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
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: ANALYST_MODEL,
                            api_version: 'v1',
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Knowledge RAG Foundation) ---
            if (intent === 'POLICY_INQUIRY' && knowledgeCapsuleCall) {
                console.warn('[ROUTER] Delegating Knowledge RAG to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'knowledge_rag_foundation',
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
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText,
                        runtime_truth: {
                            model: ANALYST_MODEL,
                            api_version: 'v1',
                            project_ref: 'cvvlorbiwtuhkxolhfie',
                            correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                        }
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Cart Operator) ---
            const cartOperatorCall = toolCalls.find(c => c.name === 'cart_operator');
            if (intent === 'CART_OPERATION' && cartOperatorCall) {
                console.warn('[ROUTER] Delegating Cart Operator to Client-Side Capability Capsule');
                await persistStorefrontCustomerMemoryIfPossible();
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'cart_operator',
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
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText
                    }
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- OUT OF DOMAIN: Fast-path rejection (no Sommelier call, no product search) ---
            if (intent === 'OUT_OF_DOMAIN') {
                const oodReplyText = 'Solo puedo ayudarte con productos de nuestra tienda de vapeo y 420. Para ese tipo de consulta te recomiendo buscar en otro lugar. ¿Hay algo de nuestro catálogo en lo que pueda ayudarte?';
                const { error: oodTelemetryErr } = await supabase.from('ai_analytics').insert({
                    query: query,
                    response_text: oodReplyText,
                    detected_intent: 'OUT_OF_DOMAIN',
                    frustration_detected: false,
                    ai_logic_debug: {
                        detected_intent: 'OUT_OF_DOMAIN',
                        routing_path: 'pre_routed',
                        out_of_domain: true,
                        guardrail: guardrailDebug,
                        analyst_intent: guardrailTelemetry.analyst_intent,
                        guardrail_overrides: guardrailTelemetry.guardrail_overrides,
                        injected_tools: guardrailTelemetry.injected_tools,
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
                    routed_capsule: null,
                    fallback_reason: 'OUT_OF_DOMAIN',
                    products: [],
                    server_telemetry_logged: !oodTelemetryErr
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // Shared Embedding Logic (Reduce API calls)
            let sharedEmbedding: number[] | undefined = undefined;
            const needsEmbedding = toolCalls.some(c => ['get_store_policy', 'search_products'].includes(c.name));
            
            if (needsEmbedding && query) {
                try {
                    console.warn(`[customer-intelligence] Generating shared embedding for ${toolCalls.length} tools...`);
                    const embedRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${_GEMINI_API_KEY}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model: 'models/gemini-embedding-001',
                                content: { parts: [{ text: query }] },
                                outputDimensionality: 3072
                            })
                        }
                    );
                    const embedData = await embedRes.json();
                    sharedEmbedding = embedData.embedding?.values;
                } catch (e) {
                    console.error(`[customer-intelligence] Shared embedding failed: ${e}`);
                }
            }

            // Log tools requested
            console.warn(`[Analyst] Tool calls requested: ${toolCalls.map(c => c.name).join(', ') || 'None'}`);

            const startTools = Date.now();
            const toolResults: ToolResult[] = await executeTools(toolCalls, supabase, _GEMINI_API_KEY, sharedEmbedding);
            const totalToolLatency = Date.now() - startTools;

            // Process specific tool outputs for Sommelier context
            const policyOutput = toolResults.find(r => r.name === 'get_store_policy')?.output || 'No se consultaron políticas específicas.';
            const searchOutput = toolResults.find(r => r.name === 'search_products')?.output || 'No se realizó búsqueda de productos.';
            const trackOutput = toolResults.find(r => r.name === 'track_order')?.output || 'No se consultó el estado de ningún pedido.';
            const inventoryResult = toolResults.find(r => r.name === 'get_inventory_outlook');
            const inventoryOutput = inventoryResult?.output || 'No se consultó la proyección de inventario.';
            const inventorySignalQuality = (inventoryResult as any)?.signal_quality || 'unknown';
            const compatibilityOutput = toolResults.find(r => r.name === 'check_compatibility')?.output || 'No se consultó información de compatibilidad.';

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

                POLÍTICAS OPERATIVAS (Básicas):
                ${VSM_OPERATIONAL_RULES}

                --- CONOCIMIENTO OPERATIVO (Tools / Source of Truth) ---
                POLÍTICAS:
                ${policyOutput}

                PRODUCTOS ENCONTRADOS:
                ${searchOutput}
                
                ESTADO DE PEDIDO (Tracking):
                ${trackOutput}

                PROYECCIÓN DE INVENTARIO:
                ${inventoryOutput}

                CALIDAD_SEÑAL:
                ${inventorySignalQuality}

                COMPATIBILIDAD (Source of Truth):
                ${compatibilityOutput}
                REGLAS DE RESPUESTA DE COMPATIBILIDAD:
                1. Si el reporte dice [GENERALIZACION], DEBES usar lenguaje precavido ("normalmente", "por lo general", "suelen").
                2. Si el reporte dice [ESPECIFICO], puedes ser directo ("Sí, es compatible").
                3. Si el estatus es UNKNOWN_UNCONFIRMED, DEBES admitir que no tienes confirmación, preguntar detalles (modelo/marca) y sugerir contacto por WhatsApp solo como refuerzo.
                4. NUNCA inventes compatibilidades que no estén en el reporte.

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
                ` : ''}

                CLIENTE: "${query || 'Audio Context'}"
                HISTORIAL: ${JSON.stringify(history?.slice(-6) || [])}
                
                ${RESPONSE_FORMAT_RULES.replace('NUMBER', whatsappNumber)}
            `;

            const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
            if (audio) {
                parts.push({ inline_data: { mime_type: mimeType || 'audio/webm', data: audio } });
            }
            parts.push({ text: sommelierPrompt });

            // ═══ HARDENING 2: GEMINI RESILIENCE — SOMMELIER CALL WITH FALLBACK ═══
            let sommelierResult: any = {};
            let sommelierResponse: Response | null = null;
            let sommelier_gemini_error: string | null = null;
            let rawText = '';
            const sommelier_fallback_on_error = 'A ver, ahi si se me cruzaron los cables. Dame un momento y vuelveme a tirar la pregunta.';

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s sommelier timeout (includes audio processing)

                sommelierResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${SOMMELIER_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: { temperature: 0.2 },
                        safetySettings: SAFETY_SETTINGS
                    }),
                    signal: controller.signal
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

            // Parse Sommelier or use fallback
            const sommelierDiag = {
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
            if (sommelier_gemini_error) {
                // Gemini degraded: use on-brand fallback text
                console.warn(`[Sommelier] Using fallback due to: ${sommelier_gemini_error}`);
                aiData = {
                    text: sommelier_fallback_on_error,
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

                    // Text extraction with fallback chain: text → message → response → respuesta → answer → reply
                    let responseText = aiData.text;
                    if (!responseText || typeof responseText !== 'string' || responseText.trim() === '') {
                        responseText = aiData.message || aiData.response || aiData.respuesta || aiData.answer || aiData.reply || '';
                    }

                    // If still empty after all fallbacks, this violates the contract
                    if (!responseText || responseText.trim() === '') {
                        throw new Error('Sommelier response missing required "text" field and all fallback fields empty');
                    }

                    aiData.text = responseText.trim();
                    console.warn(`[Sommelier] Contract valid: parsed keys: ${Object.keys(aiData).join(', ')}, text length: ${aiData.text.length}`);
                } catch (_e) {
                    console.error("[Sommelier] JSON parse error:", (_e as any).message, "Raw:", rawText.slice(0, 200));
                    aiData = {
                        text: sommelier_fallback_on_error,
                        intent: analystReport.intent || 'support',
                        fallback_reason: 'JSON_PARSE_ERROR'
                    };
                }
            }

            // ── Business Telemetry Computation ──────────────────────────────
            if (aiData.intent === 'whatsapp' && !aiData.action) {
                const helpMessage = encodeURIComponent(`Hola, vengo del chat de Cesarin y necesito ayuda con esto: ${query || 'consulta de tienda'}`);
                aiData.action = {
                    label: 'Seguir por WhatsApp',
                    url: `https://wa.me/${whatsappNumber}?text=${helpMessage}`,
                    type: 'whatsapp'
                };
            }

            const knowledgeChunksCount = toolResults
                .filter(r => r.name === 'get_store_policy')
                .reduce((acc, r) => acc + ( (r as any).metadata?.chunks_found || 0), 0);

            // semantic_match_success: true if either products or knowledge returned real matches
            const productSearchResult = toolResults.find(r => r.name === 'search_products');
            const policyResult = toolResults.find(r => r.name === 'get_store_policy');
            const productMatchCount = (productSearchResult as any)?.metadata?.match_count || 0;
            const policyMatchCount  = (policyResult as any)?.metadata?.chunks_found || 0;
            const semanticMatchSuccess = productMatchCount > 0 || policyMatchCount > 0
                || toolResults.some(r => r.name === 'check_compatibility' && r.status === 'success')
                || toolResults.some(r => r.name === 'track_order' && r.status === 'success')
                || toolResults.some(r => r.name === 'get_inventory_outlook' && r.status === 'success');

            // fallback_used: true if Sommelier generated a fallback (no knowledge/products found)
            const fallbackUsed = !semanticMatchSuccess && !!(aiData.fallback_reason || aiData.text?.includes('Disculpa') || aiData.text?.includes('No encontré'));

            // product_card_count: number of product cards recommended by Sommelier
            const productCardCount = Array.isArray(aiData.products) ? aiData.products.length
                : Array.isArray(aiData.recommended_products) ? aiData.recommended_products.length
                : productMatchCount > 0 ? productMatchCount : 0;

            // cart_action_detected: true if cart_operator was invoked
            const cartActionDetected = toolCalls.some(c => c.name === 'cart_operator');

            // ── frustration_detected: MVP 3-signal heuristic ────────────────
            // Signal 1: Escalation — user explicitly asks for human/WhatsApp
            const escalationRequested = aiData.intent === 'whatsapp'
                || aiData.action?.type === 'whatsapp'
                || /hablar con (un |una )?(humano|persona|asesor|agente)/i.test(query || '');

            // Signal 2: Zero-results persistence — current search returned 0 AND
            //   a recent assistant message in history already apologised for no results
            const zeroNow = intent === 'PRODUCT_SEARCH' && productCardCount === 0;
            const priorZeroSignal = Array.isArray(history) && history.some(
                (h: { role: string; content: string }) =>
                    h.role === 'assistant' &&
                    /no encontr[eé]|no tenemos|no está disponible|sin resultados|agotado/i.test(h.content)
            );
            const zeroResultsPersistence = zeroNow && priorZeroSignal;

            // Signal 3: Fallback + empty — fallback route fired AND zero product cards
            //   Exclude greetings/chit-chat: these are intentionally zero-card, zero-tool responses
            const isConversationalIntent = intent === 'CHIT_CHAT' || isGreeting
                || aiData.fallback_reason === 'GREETING' || aiData.fallback_reason === 'CHIT_CHAT';
            const fallbackEmpty = fallbackUsed && productCardCount === 0 && !isConversationalIntent;

            const frustrationDetected = escalationRequested || zeroResultsPersistence || fallbackEmpty;

            aiData.debug = {
                // Observability: Model + Config
                sommelier_model: SOMMELIER_MODEL,
                analyst_model: ANALYST_MODEL,
                sommelier_temperature: 0.2,
                sommelier_http_status: sommelierResponse.status,
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
                    shared_embedding_used: !!sharedEmbedding
                },
                sommelier_report: {
                    rules_applied: aiRules?.map((r: { content: string }) => r.content).slice(0, 3) || [],
                    tone_correction: true,
                    creative_layer: "Active"
                },
                runtime_truth: {
                    analyst_model: ANALYST_MODEL,
                    sommelier_model: SOMMELIER_MODEL,
                    api_version: 'v1',
                    project_ref: 'cvvlorbiwtuhkxolhfie',
                    correlation_id: req.headers.get('x-request-id') || 'gen-' + Date.now()
                }
            };

            // ── Memory Persistence (Non-blocking — unchanged) ────────────────
            if (aiData.text) {
                await persistStorefrontCustomerMemoryIfPossible();
            }

            // TEXT GUARANTEE: Ensure aiData always has a text field before returning
            if (!aiData.text && !aiData.message) {
                console.warn('[CONCIERGE_CHAT] TEXT GUARANTEE: No text/message in aiData. Injecting fallback from analyst/sommelier.');
                aiData.text = aiData.response || 'Estoy aquí para ayudarte. ¿Qué necesitas?';
                aiData.intent = analystReport.intent || 'support';
            }

            // ── Analytics Persistence (Awaited, post-guarantee text, non-capsule only) ──
            // Capsule paths delegate telemetry to the client; edge must not claim ownership for those.
            // Determine routing path: pre-routed intents (PRODUCT_SEARCH, POLICY_INQUIRY, CART_OPERATION, OUT_OF_DOMAIN)
            // were handled before reaching Sommelier. All others (COMPATIBILITY_CHECK, INVENTORY_OUTLOOK, ORDER_TRACKING, CHIT_CHAT, UNKNOWN) are fallback_handled by Sommelier.
            const preRoutedIntents = ['PRODUCT_SEARCH', 'POLICY_INQUIRY', 'CART_OPERATION', 'OUT_OF_DOMAIN'];
            const routingPath = preRoutedIntents.includes(intent) ? 'pre_routed' : 'fallback_handled';

            if (!aiData.requires_client_capsule) {
                const analyticsPayload = {
                    query: query,
                    response_text: aiData.text ?? null,
                    detected_intent: analystReport.intent,
                    frustration_detected: frustrationDetected,
                    recommended_product_ids: Array.isArray(aiData.products)
                        ? aiData.products.map((p: any) => p.id).filter(Boolean)
                        : [],
                    ai_logic_debug: {
                        ...aiData.debug,
                        // Cognitive Integrity: routing path distinguishes pre-routed vs fallback-handled
                        routing_path: routingPath,
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
                        policy_match_count: policyMatchCount
                    }
                };
                const { data: analyticsData, error: analyticsErr } = await supabase.from('ai_analytics').insert(analyticsPayload).select('id').maybeSingle();
                if (analyticsErr) {
                    console.error('[Analytics] Insert failed:', analyticsErr.message);
                } else {
                    console.warn(`[Analytics] Persisted — intent:${analystReport.intent} semantic_ok:${semanticMatchSuccess} fallback:${fallbackUsed} cards:${productCardCount} cart:${cartActionDetected}`);
                }
                // Truthful ownership: only claim edge-logged if insert actually succeeded
                aiData.server_telemetry_logged = !analyticsErr;

                // ═══ HARDENING 3: ASYNC QA JUDGE HOOK (NON-BLOCKING) ═══
                // Trigger background evaluation for risky turns without blocking user response
                const shouldEvaluate = frustrationDetected || (intent === 'PRODUCT_SEARCH' && productCardCount === 0);
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
                                        sommelier_model: SOMMELIER_MODEL,
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
            }

            return new Response(JSON.stringify(aiData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (action === 'generate_proactive_insights') {
            const { data: lowStock } = await supabase.from('products').select('name').lt('stock', 5).limit(3)
            const { data: atRisk } = await supabase.from('customer_intelligence_360').select('full_name').eq('segment', 'En Riesgo').limit(3)
            const prompt = `
                Analiza el estado de VSM Store y genera 3 insights estratégicos rápidos.
                PRODUCTOS BAJO STOCK: ${(lowStock || []).map((p: { name: string }) => p.name).join(', ') || 'Ninguno'}
                CLIENTES EN RIESGO: ${(atRisk || []).map((c: { full_name: string }) => c.full_name).join(', ') || 'Ninguno'}
                
                RETORNA JSON:
                {
                    "insights": [
                        { "type": "warning", "title": "...", "description": "..." }
                    ]
                }
            `
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ANALYST_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generation_config: { 
                        temperature: 0.7
                    }
                })
            })
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Error from Google API (generate_proactive_insights)');
            }
            const result = await response.json()
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            const aiData = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim())
            return new Response(JSON.stringify(aiData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        throw new Error(`Acción no soportada: ${action}`)
    } catch (error: any) {
        const errorMsg = `[Customer-Intelligence] Error: ${error.message}`;
        console.error(errorMsg);
        return new Response(JSON.stringify({ 
            version: "V3.4B-STABILIZED-2026-COMPLIANT",
            error: error.message,
            context: 'customer-intelligence',
            gemini_key_present: !!_GEMINI_API_KEY,
            full_error: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
