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

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
if (!GEMINI_API_KEY) {
    console.error('[customer-intelligence] FATAL: GEMINI_API_KEY is not set in environment secrets.')
}
const MODEL = 'gemini-3.1-flash-lite-preview' // Correct ID for March 2026 Preview
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Neural Orchestration Constants
const ANALYST_MODEL = 'gemini-1.5-flash-lite';
const SOMMELIER_MODEL = 'gemini-1.5-pro';

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
                    "intent": "search | recommendation | info | chit_chat",
                    "doubts": ["lista de dudas percibidas (ej: precio, compatibilidad, stock)"],
                    "customer_dna": {
                        "loyalty": "NEW | RETURNING | PLATINUM",
                        "interests": ["intereses detectados"],
                        "avg_ticket": "estimado basado en intereses",
                        "is_new": true/false
                    },
                    "search_keywords": ["palabras clave para buscar en catálogo"],
                    "should_close_session": boolean (si el cliente se despide o termina la charla)
                }
            `;

            const analystResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ANALYST_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: analystPrompt }] }],
                    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });

            const analystResult = await analystResponse.json();
            const analystReport = JSON.parse(analystResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

            // --- ENGINE Context: Dynamic Data ---
            const { data: aiConfig } = await supabase.from('ai_configs').select('*').eq('key', 'vsm-cesarin').maybeSingle();
            const { data: aiRules } = await supabase.from('ai_rules').select('content').eq('is_enabled', true).order('priority', { ascending: false });
            
            // Search Products based on Analyst Keywords
            let relevantProducts = [];
            if (analystReport.search_keywords?.length > 0) {
                const searchTerms = analystReport.search_keywords.map((t: string) => `%${t}%`);
                const { data: matches } = await supabase
                    .from('products')
                    .select('id, name, price, compare_at_price, stock, description, short_description, tags, cover_image, slug, section, is_new, is_bestseller, ai_is_featured, ai_sales_note, categories(name)')
                    .eq('status', 'active')
                    .or(searchTerms.map((t: string) => `name.ilike.${t},tags.ilike.${t}`).join(','))
                    .limit(10);
                relevantProducts = matches || [];
            }

            // Fallback to Featured if needed
            if (relevantProducts.length < 3) {
                const { data: featured } = await supabase
                    .from('products')
                    .select('id, name, price, compare_at_price, stock, description, short_description, tags, cover_image, slug, section, is_new, is_bestseller, ai_is_featured, ai_sales_note, categories(name)')
                    .eq('status', 'active')
                    .eq('ai_is_featured', true)
                    .limit(5);
                relevantProducts = [...relevantProducts, ...(featured || [])];
            }

            // --- ENGINE 2: THE SOMMELIER (Creative & Empathetic Response) ---
            const sommelierPrompt = `
                IDENTIDAD: Eres ${aiConfig?.name || 'Cesarin'}. ${aiConfig?.voice_tone || SYSTEM_PERSONA}
                MENSJE INICIAL: ${aiConfig?.welcome_message || ''}
                MODO: ${aiConfig?.behavior_mode || 'vendedor'}
                
                REGLAS DE COMPORTAMIENTO:
                ${aiRules?.map((r: { content: string }) => `- ${r.content}`).join('\n') || ''}

                POLÍTICAS OPERATIVAS:
                ${VSM_OPERATIONAL_RULES}

                --- INFORME DEL ANALISTA ---
                ${JSON.stringify(analystReport)}

                PRODUCTOS DISPONIBLES:
                ${JSON.stringify(relevantProducts.map((p: { id: string, name: string, price: number, stock: number, ai_sales_note: string, slug: string }) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    stock: p.stock > 0 ? 'Disponible' : 'Agotado',
                    note: p.ai_sales_note,
                    slug: p.slug
                })))}

                CLIENTE: "${query || 'Audio Context'}"
                HISTORIAL: ${JSON.stringify(history?.slice(-6) || [])}
                
                ${RESPONSE_FORMAT_RULES.replace('NUMBER', whatsappNumber)}
            `;

            const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
            if (audio) {
                parts.push({ inline_data: { mime_type: mimeType || 'audio/webm', data: audio } });
            }
            parts.push({ text: sommelierPrompt });

            const sommelierResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${SOMMELIER_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: { 
                        temperature: aiConfig?.temperature ? Number(aiConfig.temperature) : 0.7,
                        responseMimeType: "application/json"
                    }
                })
            });

            const sommelierResult = await sommelierResponse.json();
            const rawText = sommelierResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const aiData = JSON.parse(rawText.trim());

            // Final Debug Injection
            aiData.debug = {
                should_close_session: analystReport.should_close_session || aiData.should_close_session || false,
                analyst_report: {
                    intent: analystReport.intent,
                    doubts: analystReport.doubts,
                    customer_dna: analystReport.customer_dna,
                    relevant_stock: relevantProducts.map((p: { name: string }) => p.name)
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                        temperature: 0.7,
                        responseMimeType: "application/json"
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
