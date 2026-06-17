import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { invokeGeminiTextModel } from '../shared/gemini-utils.ts';
import { corsHeaders } from '../shared/cors.ts';

const AUXILIARY_MODEL = Deno.env.get('AUXILIARY_MODEL') || 'gemini-2.5-flash';

export async function handleParseAdminIntent(query: string, _GEMINI_API_KEY: string) {
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

export async function handleGenerateSupplierCopy(body: Record<string, unknown>, _GEMINI_API_KEY: string) {
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

export async function handleGenerateWhatsappCopy(body: Record<string, unknown>, supabase: SupabaseClient, _GEMINI_API_KEY: string) {
    const { customerId, context } = body;
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

export async function handleGenerateProactiveInsights(supabase: SupabaseClient, _GEMINI_API_KEY: string) {
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
