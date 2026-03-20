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
import { executeTools, ToolCall, ToolResult } from './tools.ts'

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

// --- Phase 4.0: Memory Helpers ---
const GENERIC_INTERESTS = new Set(['vape', 'vaping', 'e-liquid', 'vapeo', 'store', 'tienda', 'producto', 'hola', 'cesar', 'cesarin', 'asistente', 'asistencia', 'vsm', 'ayuda', 'comprar', 'precio', 'costo', 'gracias', 'hola', 'buenos', 'dias', 'tardes', 'noches']);

/**
 * Sanitizes and merges new interests with existing ones.
 * Rules: Deduplicate, ignore generic, limit to 10.
 */
function sanitizeAndMergeInterests(existing: string[] = [], newInterests: string[] = []): string[] {
    const combined = new Set(existing.map(i => i.toLowerCase().trim()));
    
    newInterests.forEach(interest => {
        const clean = interest.toLowerCase().trim();
        if (clean && !GENERIC_INTERESTS.has(clean) && clean.length > 2) {
            combined.add(clean);
        }
    });

    return Array.from(combined).slice(-10); // Keep most recent 10
}

/**
 * Updates interest strength metadata based on repetition and recency.
 * Rules: Alignment with active capped set, increment hits, update last_at.
 */
function updateInterestsMetadata(
    existing: Record<string, { hits: number, last_at: string }> = {}, 
    activeInterests: string[]
): Record<string, { hits: number, last_at: string }> {
    const updated: Record<string, { hits: number, last_at: string }> = {};
    const now = new Date().toISOString();

    activeInterests.forEach(term => {
        const clean = term.toLowerCase().trim();
        const prev = existing[clean];
        
        updated[clean] = {
            hits: (prev?.hits || 0) + 1,
            last_at: now
        };
    });

    return updated;
}

async function persistMemory(supabase: any, customerId: string, newInterests: string[]) {
    try {
        console.warn(`[Memory] Persisting for customer: ${customerId}`);
        
        // 1. Fetch current memory to merge interests and metadata
        const { data: currentMemory } = await supabase
            .from('ai_customer_memory')
            .select('detected_interests, interests_metadata')
            .eq('customer_id', customerId)
            .maybeSingle();

        // A. Separate Sanitization/Deduplication
        const mergedInterests = sanitizeAndMergeInterests(
            currentMemory?.detected_interests || [],
            newInterests
        );

        // B. Separate Strength Metadata Update
        const updatedMetadata = updateInterestsMetadata(
            currentMemory?.interests_metadata || {},
            mergedInterests
        );

        // 2. Upsert Memory
        const { error } = await supabase
            .from('ai_customer_memory')
            .upsert({
                customer_id: customerId,
                detected_interests: mergedInterests,
                interests_metadata: updatedMetadata,
                last_interaction_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { 
                onConflict: 'customer_id' 
            });

        if (error) throw error;
        console.warn(`[Memory] Success for ${customerId}. Active: ${mergedInterests.length}, Metadata: ${Object.keys(updatedMetadata).length}`);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[Memory] Failed for ${customerId}:`, msg);
    }
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
            const { audio, mimeType } = body;

            // --- Phase 4.0: Selective Memory Read ---
            let customerMemory: any = null;
            const memoryTrace: any = {
                read_attempted: false,
                row_found: false,
                context_injected: false,
                interests_count: 0,
                skipped_reason: null
            };

            const cid = customerContext?.id;
            if (cid) {
                memoryTrace.read_attempted = true;
                console.log(`[Memory] Reading for cid: ${cid}`);
                const { data: mem, error: memErr } = await supabase
                    .from('ai_customer_memory')
                    .select('detected_interests, interests_metadata, last_interaction_at')
                    .eq('customer_id', cid)
                    .maybeSingle();
                
                if (memErr) {
                   console.error(`[Memory] Query error: ${memErr.message}`);
                   memoryTrace.skipped_reason = `query_error: ${memErr.message}`;
                } else if (mem && mem.detected_interests?.length > 0) {
                    // --- Strength-Based Prioritization ---
                    const meta = mem.interests_metadata || {};
                    const sortedInterests = [...mem.detected_interests].sort((a, b) => {
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
                    memoryTrace.context_injected = true;
                    memoryTrace.interests_count = mem.detected_interests.length;
                    console.log(`[Memory] Success: ${mem.detected_interests.length} interests found.`);
                } else { 
                    memoryTrace.skipped_reason = mem ? "empty_interests" : "no_row"; 
                    console.log(`[Memory] Skipped: ${memoryTrace.skipped_reason}`);
                }
            } else { 
                memoryTrace.skipped_reason = "no_id"; 
                console.log(`[Memory] No CID provided in context.`);
            }

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
                INTERESES PREVIOS (ORDENADOS POR PESO): ${customerMemory.prioritized_interests.join(', ')}
                ÚLTIMA INTERACCIÓN: ${customerMemory.last_interaction_at}
                ` : ''}
                
                HISTORIAL: ${JSON.stringify(history?.slice(-3) || [])}

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "intent": "CART_OPERATION | POLICY_INQUIRY | PRODUCT_SEARCH | ORDER_TRACKING | INVENTORY_OUTLOOK | CHIT_CHAT | UNKNOWN",
                    "doubts": ["lista de dudas percibidas"],
                    "tool_calls": [
                        { "name": "cart_operator", "args": { "action": "ADD", "product_ref": "vape de menta", "quantity": 2 }, "reason": "cliente explícitamente pidió meterlo al carrito" },
                        { "name": "knowledge_rag_foundation", "args": { "query": "búsqueda semántica de política", "is_ambiguous": false }, "reason": "porque pregunta sobre envíos" },
                        { "name": "product_search_integrity", "args": { "query": "búsqueda", "is_ambiguous": false, "requires_semantic_expansion": true }, "reason": "porque busca vapes" }
                    ],
                    "customer_dna": { "interests": ["vapes", "menta"] }
                }

                EJEMPLOS DE CLASIFICACIÓN (FEW-SHOT):
                1. "¿qué vapes tienes?" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "vapes"}}] }
                2. "¿cuál es la política de envíos?" -> {"intent": "POLICY_INQUIRY", "tool_calls": [{"name": "knowledge_rag_foundation", "args": {"query": "política de envíos"}}] }
                3. "hola" -> {"intent": "CHIT_CHAT", "tool_calls": [] }
                4. "agrega un vape de uva" -> {"intent": "CART_OPERATION", "tool_calls": [{"name": "cart_operator", "args": {"action": "ADD", "product_ref": "vape de uva", "quantity": 1}}] }
                5. "quiero algo barato y frutal" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "algo barato y frutal", "requires_semantic_expansion": true}}] }
                6. "recomiéndame algo frutal" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "recomendación frutal", "requires_semantic_expansion": true}}] }
                7. "quiero algo suave y rico" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "suave y rico", "requires_semantic_expansion": true}}] }
                8. "quiero dejar de fumar" -> {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "kits de inicio dejar de fumar vapes", "requires_semantic_expansion": true}}] }

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

                REGLA DE ORO DE INTENTOS:
                - COMPATIBILIDAD/FIT (¿le queda?, ¿sirve para?, ¿qué usa X?) -> COMPATIBILITY_CHECK (PRIORIDAD TÉCNICA).
                - PREFERENCIAS COMERCIALES (barato, frutal, dulce, recomiéndame, etc.) -> PRODUCT_SEARCH.
                - RECOMENDACIÓN DE COMPRA ("tengo X, ¿qué me recomiendas?") -> PRODUCT_SEARCH.
                - POLÍTICAS/ENVÍOS -> POLICY_INQUIRY.
                - CHIT-CHAT/TRIVIAL -> CHIT_CHAT.
                - SOLO usa UNKNOWN si el mensaje es completamente indescifrable.
            `;

            const analystResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${ANALYST_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: analystPrompt }] }],
                    generationConfig: { 
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    },
                    safetySettings: SAFETY_SETTINGS
                })
            });

            const analystResult = await analystResponse.json();
            if (!analystResponse.ok) {
                console.error(`[Analyst] HTTP ${analystResponse.status}:`, JSON.stringify(analystResult).slice(0, 300));
            }
            console.warn(`[Analyst] raw status: ${analystResponse.status}`);
            const rawAnalystText = analystResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
            console.warn(`[Analyst] Raw Response: ${rawAnalystText}`);
            const geminiError = analystResult.error || (analystResult.candidates ? null : "No candidates returned");
            if (geminiError) console.error(`[Analyst] Gemini Error: ${JSON.stringify(geminiError)}`);
            
            let analystReport: any = { intent: 'UNKNOWN', tool_calls: [] };
            if (rawAnalystText) {
                try {
                    const jsonMatch = rawAnalystText.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : rawAnalystText;
                    analystReport = JSON.parse(cleanJson);
                } catch (e) {
                    console.error("Analyst parse fail", e);
                }
            }

            let intent = (analystReport.intent || 'UNKNOWN').toUpperCase();
            const toolCalls: ToolCall[] = analystReport.tool_calls || [];
            
            // --- QUALITY GUARDRAIL: Deterministic Intent Override (brain-first) ---
            // Las capsules ejecutan; el Analyst tiene autoridad semántica primaria.
            // --- QUALITY GUARDRAIL: Deterministic Intent Override (brain-first) ---

            const normalizedQuery = (query || "").toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[¿?¡!]/g, " ")
                .trim();

            const isCompatibilityMatch = /compatible|compatibilidad|le queda|sirve para|funciona con|le cabe|que coil|que pod|que bateria|que liquido|que resistencia|usa mi|le sirve/.test(normalizedQuery);
            const isInventoryMatch     = /stock|inventario|disponible|disponibilidad|queda|agotara|agota|durara/.test(normalizedQuery);
            const isPolicyMatch        = /politica|envio|pago|reembolso|devolucion|garantia|entrega|costo|tarifa|aceptan/.test(normalizedQuery);
            const isProductMatch       = /frutal|dulce|suave|fuerte|fresco|mentol|rico|intenso|cremoso|tropical|acido|uva|mango|fresa|sandia|melon|mora|cereza|menta|hielo|ice|tabaco|caramelo|barato|economico|precio|oferta|descuento|recomienda|conviene|guste|probar|comprar/.test(normalizedQuery);
            const isGreeting           = /hola|buenos dias|buenas tardes|que tal|buenas/.test(normalizedQuery);

            const guardrailDebug = { normalizedQuery, isCompatibilityMatch, isInventoryMatch, isProductMatch, initialIntent: analystReport.intent };

            // --- STRICT PRECEDENCE OVERRIDES ---
            
            // 1. Force Compatibility (Technical fit always wins over commercial search)
            if (isCompatibilityMatch) {
                if (intent !== 'COMPATIBILITY_CHECK') {
                    console.warn(`[GUARDRAIL] Force-Corrected → COMPATIBILITY_CHECK (Query: ${normalizedQuery.slice(0,30)})`);
                    intent = 'COMPATIBILITY_CHECK';
                }
                // Always prune search/policy tools in technical mode
                for (let i = toolCalls.length - 1; i >= 0; i--) {
                    if (['product_search_integrity', 'search_products', 'knowledge_rag_foundation', 'get_store_policy'].includes(toolCalls[i].name)) {
                        toolCalls.splice(i, 1);
                    }
                }
            } 
            // 2. Resolve UNKNOWN or Upgrade weak detections
            else if (intent === 'UNKNOWN' || intent === 'CHIT_CHAT') {
                if (isInventoryMatch) intent = 'INVENTORY_OUTLOOK';
                else if (isPolicyMatch) intent = 'POLICY_INQUIRY';
                else if (isProductMatch) intent = 'PRODUCT_SEARCH';
                else if (isGreeting) intent = 'CHIT_CHAT';
            }
            // 3. Robust Hybrid Detection (Commercial intent recovery)
            else if (isProductMatch && (intent === 'UNKNOWN' || intent === 'SOCRATIC_CLARIFICATION')) {
                intent = 'PRODUCT_SEARCH';
            }

            // If guardrail upgraded intent but Analyst gave no tool_calls, inject the canonical tool
            if (intent === 'PRODUCT_SEARCH' && !toolCalls.some(c => c.name === 'product_search_integrity' || c.name === 'search_products')) {
                console.warn('[GUARDRAIL] Injecting product_search_integrity tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'product_search_integrity', args: { query: query || '', requires_semantic_expansion: true }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'POLICY_INQUIRY' && !toolCalls.some(c => c.name === 'knowledge_rag_foundation' || c.name === 'get_store_policy')) {
                console.warn('[GUARDRAIL] Injecting knowledge_rag_foundation tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'knowledge_rag_foundation', args: { query: query || '' }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'INVENTORY_OUTLOOK' && !toolCalls.some(c => c.name === 'get_inventory_outlook')) {
                console.warn('[GUARDRAIL] Injecting get_inventory_outlook tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'get_inventory_outlook', args: { product_ref: query || '' }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }
            if (intent === 'COMPATIBILITY_CHECK' && !toolCalls.some(c => c.name === 'check_compatibility')) {
                console.warn('[GUARDRAIL] Injecting check_compatibility tool_call (Analyst omitted it)');
                toolCalls.push({ name: 'check_compatibility', args: { query: query || '' }, reason: 'guardrail_injection' } as unknown as ToolCall);
            }

            // [HARDENING] Synchronize corrected intent back to analystReport for Sommelier and Debug visibility
            analystReport.intent = intent;

            // --- CAPABILITY CAPSULE ROUTING HANDOFF (Product Search Integrity) ---
            const searchCapsuleCall = toolCalls.find(c => c.name === 'product_search_integrity' || c.name === 'search_products');
            const knowledgeCapsuleCall = toolCalls.find(c => c.name === 'knowledge_rag_foundation' || c.name === 'get_store_policy');
            
            // EL DESVÍO A CAPSULE SOLO SI EL INTENTO FINAL (tras guardrail) LO PERMITE
            if ((intent === 'PRODUCT_SEARCH' && searchCapsuleCall) || (searchCapsuleCall && intent !== 'COMPATIBILITY_CHECK' && intent !== 'POLICY_INQUIRY')) {
                console.warn('[ROUTER] Delegating Product Search to Client-Side Capability Capsule');
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'product_search_integrity',
                    tool_args: searchCapsuleCall?.args || { 
                        query: query || "", 
                        is_ambiguous: true, 
                        requires_semantic_expansion: true 
                    },
                    debug: { 
                        detected_intent: intent,
                        intent,
                        guardrail: guardrailDebug,
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
            if (intent === 'POLICY_INQUIRY' || knowledgeCapsuleCall) {
                console.warn('[ROUTER] Delegating Knowledge RAG to Client-Side Capability Capsule');
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
                        guardrail: guardrailDebug,
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
            if (intent === 'CART_OPERATION' || cartOperatorCall) {
                console.warn('[ROUTER] Delegating Cart Operator to Client-Side Capability Capsule');
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
                        tool_calls: toolCalls,
                        raw_analyst: rawAnalystText
                    }
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
                                content: { parts: [{ text: query }] }
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
            if (intent === 'CHIT_CHAT') {
                console.warn('[ROUTER] Delegating Chit-Chat to Client-Side Capability Capsule');
                return new Response(JSON.stringify({
                    requires_client_capsule: true,
                    capsule_name: 'general_concierge_dialog',
                    tool_args: { query: query || "" },
                    debug: { 
                        detected_intent: intent,
                        intent,
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

                CLIENTE: "${query || 'Audio Context'}"
                HISTORIAL: ${JSON.stringify(history?.slice(-6) || [])}
                
                ${RESPONSE_FORMAT_RULES.replace('NUMBER', whatsappNumber)}
            `;

            const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
            if (audio) {
                parts.push({ inline_data: { mime_type: mimeType || 'audio/webm', data: audio } });
            }
            parts.push({ text: sommelierPrompt });

            const sommelierResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${SOMMELIER_MODEL}:generateContent?key=${_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: { temperature: 0.2 },
                    safetySettings: SAFETY_SETTINGS
                })
            });

            const sommelierResult = await sommelierResponse.json();
            if (!sommelierResponse.ok) {
                console.error(`[Sommelier] HTTP ${sommelierResponse.status}:`, JSON.stringify(sommelierResult).slice(0, 300));
            }
            const rawText = sommelierResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const sommelierDiag = {
                http_status: sommelierResponse.status,
                candidates_count: sommelierResult.candidates?.length || 0,
                finish_reason: sommelierResult.candidates?.[0]?.finishReason || 'NONE',
                safety_ratings: sommelierResult.candidates?.[0]?.safetyRatings?.map((r: any) => `${r.category}:${r.probability}`) || [],
                raw_text_length: rawText.length,
                raw_text_preview: rawText.slice(0, 300),
                prompt_feedback: sommelierResult.promptFeedback || null,
                raw_text_is_default: rawText === '{}'
            };
            console.warn(`[Sommelier] DIAG:`, JSON.stringify(sommelierDiag));
            
            let aiData: any = {};
            try {
                const cleanSommelierJson = rawText.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
                aiData = JSON.parse(cleanSommelierJson);
                // Smart text extraction: check multiple possible key names
                if (!aiData.text) {
                    aiData.text = aiData.message || aiData.response || aiData.respuesta || aiData.answer || aiData.reply || '';
                }
                console.warn(`[Sommelier] Parsed keys: ${Object.keys(aiData).join(', ')}, text length: ${(aiData.text || '').length}, text preview: ${(aiData.text || '').slice(0, 100)}`);
            } catch (_e) {
                console.error("[CONCIERGE_CHAT] Sommelier JSON parse failed. Raw:", rawText);
                aiData = { text: "Disculpa, tuve un problema procesando eso. ¿Podemos intentar de nuevo?", intent: analystReport.intent || 'support' };
            }

            // ── Business Telemetry Computation ──────────────────────────────
            const knowledgeChunksCount = toolResults
                .filter(r => r.name === 'get_store_policy')
                .reduce((acc, r) => acc + ( (r as any).metadata?.chunks_found || 0), 0);

            // semantic_match_success: true if either products or knowledge returned real matches
            const productSearchResult = toolResults.find(r => r.name === 'search_products');
            const policyResult = toolResults.find(r => r.name === 'get_store_policy');
            const productMatchCount = (productSearchResult as any)?.metadata?.match_count || 0;
            const policyMatchCount  = (policyResult as any)?.metadata?.chunks_found || 0;
            const semanticMatchSuccess = productMatchCount > 0 || policyMatchCount > 0;

            // fallback_used: true if Sommelier generated a fallback (no knowledge/products found)
            const fallbackUsed = !semanticMatchSuccess && !!(aiData.fallback_reason || aiData.text?.includes('Disculpa') || aiData.text?.includes('No encontré'));

            // product_card_count: number of product cards recommended by Sommelier
            const productCardCount = Array.isArray(aiData.products) ? aiData.products.length
                : Array.isArray(aiData.recommended_products) ? aiData.recommended_products.length
                : productMatchCount > 0 ? productMatchCount : 0;

            // cart_action_detected: true if cart_operator was invoked
            const cartActionDetected = toolCalls.some(c => c.name === 'cart_operator');

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
                intent: analystReport.intent, // [BACKWARD_COMPAT]
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

            // ── Analytics Persistence (Non-blocking) ─────────────────────────
            if (aiData.text) {
                const analyticsPayload = {
                    query: query,
                    detected_intent: analystReport.intent,
                    recommended_product_ids: Array.isArray(aiData.products)
                        ? aiData.products.map((p: any) => p.id).filter(Boolean)
                        : [],
                    ai_logic_debug: {
                        ...aiData.debug,
                        // Business KPIs persisted to ai_analytics
                        semantic_match_success: semanticMatchSuccess,
                        fallback_used: fallbackUsed,
                        product_card_count: productCardCount,
                        cart_action_detected: cartActionDetected,
                        product_match_count: productMatchCount,
                        policy_match_count: policyMatchCount
                    }
                };
                supabase.from('ai_analytics').insert(analyticsPayload)
                    .then(({ error: analyticsErr }: { error: { message: string } | null }) => {
                        if (analyticsErr) {
                            console.error('[Analytics] Insert failed:', analyticsErr.message);
                        } else {
                            console.warn(`[Analytics] Persisted — intent:${analystReport.intent} semantic_ok:${semanticMatchSuccess} fallback:${fallbackUsed} cards:${productCardCount} cart:${cartActionDetected}`);
                        }
                    });

                // Phase 4.0: Memory Persistence (Non-blocking)
                const customerId = customerContext?.id;
                const newInterests = analystReport.customer_dna?.interests || [];
                
                if (customerId) {
                    persistMemory(supabase, customerId, newInterests).catch(e => 
                        console.error("[Memory] Background task failed:", e)
                    );
                }
            }

            // TEXT GUARANTEE: Ensure aiData always has a text field before returning
            if (!aiData.text && !aiData.message) {
                console.warn('[CONCIERGE_CHAT] TEXT GUARANTEE: No text/message in aiData. Injecting fallback from analyst/sommelier.');
                aiData.text = aiData.response || 'Estoy aquí para ayudarte. ¿Qué necesitas?';
                aiData.intent = analystReport.intent || 'support';
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
