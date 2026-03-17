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
 * @model gemini-1.5-flash (via v1beta REST API)
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-1.5-flash → gemini-2.0-flash (1.5 retired)
 * - 2026-03-15: Removed 3x responseMimeType from generationConfig (unsupported in v1)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { SYSTEM_PERSONA, VSM_OPERATIONAL_RULES, RESPONSE_FORMAT_RULES } from './persona.ts'
import { executeTools, ToolCall, ToolResult } from './tools.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
if (!GEMINI_API_KEY) {
    console.error('[customer-intelligence] FATAL: GEMINI_API_KEY is not set in environment secrets.')
}
const MODEL = 'gemini-3.1-flash-lite-preview' // Correct ID for March 2026 Preview
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Neural Orchestration Constants (Updated for March 2026 Preview)
/**
 * STABILIZED CONTRACT (Wave 180):
 * - Model: gemini-3.1-flash-lite-preview (Prefered for latency/multimodal)
 * - Endpoint: v1 (Standard GEMINI REST)
 * - Casing: Strict snake_case for REST payload (generation_config, NOT generationConfig)
 * - JSON Mode: Disabled response_mime_type (Unsupported in 2026 v1 REST), enforced via prompt.
 */
const ANALYST_MODEL = 'gemini-3.1-flash-lite-preview';
const SOMMELIER_MODEL = 'gemini-3.1-flash-lite-preview';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    console.warn(`[customer-intelligence] Action: ${req.method} URL: ${req.url}`)
    const apiKeyStatus = GEMINI_API_KEY ? 'Present' : 'MISSING';
    console.warn(`[customer-intelligence] Gemini Key Status: ${apiKeyStatus}`)

    try {
        const body = await req.json()
        const { customerId, action, context, query, history, customerContext } = body
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                        temperature: 0.2,
                        responseMimeType: "application/json"
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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

            // --- ENGINE 1: THE ANALYST (Structured Intelligence) ---
            const analystPrompt = `
                Eres "The Analyst", el motor de inteligencia de VSM Store.
                Analiza el mensaje del cliente y extrae metadatos críticos.
                
                MENSAJE: "${query || 'Audio Context'}"
                CONTEXTO CLIENTE: ${JSON.stringify(customerContext || 'Nuevo')}
                
                HISTORIAL: ${JSON.stringify(history?.slice(-3) || [])}

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "intent": "POLICY_INQUIRY | PRODUCT_SEARCH | ORDER_TRACKING | INVENTORY_OUTLOOK | CHIT_CHAT | UNKNOWN",
                    "doubts": ["lista de dudas percibidas"],
                    "tool_calls": [
                        { "name": "get_store_policy", "args": { "query": "búsqueda semántica de política" }, "reason": "porque pregunta sobre envíos" },
                        { "name": "search_products", "args": { "query": "búsqueda semántica de productos" }, "reason": "porque busca vapes de fresa" },
                        { "name": "track_order", "args": { "order_number": "VSM-1234", "tracking_number": "GUIDE123" }, "reason": "cliente quiere saber dónde está su pedido" },
                        { "name": "get_inventory_outlook", "args": { "query": "nombre del producto" }, "reason": "cliente pregunta si se va a agotar pronto" }
                    ],
                    "customer_dna": {
                        "loyalty": "NEW | RETURNING | PLATINUM",
                        "interests": ["intereses"],
                        "avg_ticket": "estimado",
                        "is_new": true/false
                    },
                    "should_close_session": boolean
                }

                REGLAS DE TOOLS:
                - Usa "get_store_policy" si el cliente pregunta por envíos, pagos, políticas o conceptos básicos de vapeo (Intento: POLICY_INQUIRY).
                - Usa "search_products" si el cliente busca productos específicos o recomendaciones (Intento: PRODUCT_SEARCH).
                - Usa "track_order" si el cliente pregunta por el estado de su pedido (Intento: ORDER_TRACKING).
                - Usa "get_inventory_outlook" si el cliente pregunta por disponibilidad futura o agotamiento (Intento: INVENTORY_OUTLOOK).
                - Si no necesitas herramientas, deja "tool_calls" como un array vacío [].
            `;

            const analystResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${ANALYST_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: analystPrompt }] }],
                    generation_config: { 
                        temperature: 0.1
                    }
                })
            });

            const analystResult = await analystResponse.json();
            const rawAnalystText = analystResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const geminiError = analystResult.error || (analystResult.candidates ? null : "No candidates returned");
            
            let analystReport: any = {};
            if (rawAnalystText) {
                try {
                    const cleanJson = rawAnalystText.replace(/```json/g, '').replace(/```/g, '').trim();
                    analystReport = JSON.parse(cleanJson);
                } catch (e) {
                    console.error("[CONCIERGE_CHAT] Analyst JSON parse failed:", e);
                    if (rawAnalystText.includes("POLICY_INQUIRY")) analystReport.intent = "POLICY_INQUIRY";
                    else if (rawAnalystText.includes("PRODUCT_SEARCH")) analystReport.intent = "PRODUCT_SEARCH";
                    else analystReport.intent = "UNKNOWN";
                }
            } else {
                analystReport.intent = "UNKNOWN";
            }

            // --- EXECUTION LAYER: Formal Tool Calling ---
            const toolCalls: ToolCall[] = analystReport.tool_calls || [];
            
            // Shared Embedding Logic (Reduce API calls)
            let sharedEmbedding: number[] | undefined = undefined;
            const needsEmbedding = toolCalls.some(c => ['get_store_policy', 'search_products'].includes(c.name));
            
            if (needsEmbedding && query) {
                try {
                    console.warn(`[customer-intelligence] Generating shared embedding for ${toolCalls.length} tools...`);
                    const embedRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model: 'models/gemini-embedding-2-preview',
                                content: { parts: [{ text: query }] },
                                outputDimensionality: 1536
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
            const toolResults: ToolResult[] = await executeTools(toolCalls, supabase, GEMINI_API_KEY!, sharedEmbedding);
            const totalToolLatency = Date.now() - startTools;

            // Process specific tool outputs for Sommelier context
            const policyOutput = toolResults.find(r => r.name === 'get_store_policy')?.output || 'No se consultaron políticas específicas.';
            const searchOutput = toolResults.find(r => r.name === 'search_products')?.output || 'No se realizó búsqueda de productos.';
            const trackOutput = toolResults.find(r => r.name === 'track_order')?.output || 'No se consultó el estado de ningún pedido.';
            const inventoryOutput = toolResults.find(r => r.name === 'get_inventory_outlook')?.output || 'No se consultó la proyección de inventario.';

            // Fallback config (needed for Sommelier context below)
            const { data: aiConfig } = await supabase.from('ai_configs').select('*').eq('key', 'vsm-cesarin').maybeSingle();
            const { data: aiRules } = await supabase.from('ai_rules').select('content').eq('is_enabled', true).order('priority', { ascending: false });

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

            const sommelierResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${SOMMELIER_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generation_config: { 
                        temperature: aiConfig?.temperature ? Number(aiConfig.temperature) : 0.7
                    }
                })
            });

            const sommelierResult = await sommelierResponse.json();
            const rawText = sommelierResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const aiData = JSON.parse(rawText.trim());

            // Final Debug Injection
            const knowledgeChunksCount = toolResults
                .filter(r => r.name === 'get_store_policy')
                .reduce((acc, r) => acc + ( (r as any).metadata?.chunks_found || 0), 0);

            aiData.debug = {
                detected_intent: analystReport.intent,
                tool_calls_requested: toolCalls.length,
                tools_executed: toolResults.filter(r => r.status === 'success').map(r => r.name),
                knowledge_chunks_count: knowledgeChunksCount,
                latency_ms: Date.now() - startTools,
                gemini_api_error: geminiError, // Surface errors for debugging
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
                }
            };

            // Analytics
            if (aiData.text) {
                supabase.from('ai_analytics').insert({
                    query: query,
                    detected_intent: analystReport.intent,
                    ai_logic_debug: aiData.debug
                }).then();
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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
        const errorMsg = `[Customer-Intelligence] Error: ${error.message} | Gemini Status: ${GEMINI_API_KEY ? 'Set' : 'Missing'}`;
        console.error(errorMsg);
        return new Response(JSON.stringify({ 
            version: "V3.4B-STABILIZED-2026-COMPLIANT",
            error: error.message,
            context: 'customer-intelligence',
            gemini_key_present: !!GEMINI_API_KEY,
            full_error: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
