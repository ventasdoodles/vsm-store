/**
 * inventory-oracle — Supabase Edge Function
 * 
 * AI-powered inventory analysis and stock predictions using Google Gemini.
 * Analyzes product stock levels, sales velocity, and order history to generate
 * intelligent restock recommendations.
 * 
 * @model gemini-2.0-flash (via v1 REST API)
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-1.5-flash → gemini-2.0-flash (1.5 retired)
 * - 2026-03-15: Removed unsupported responseMimeType from generationConfig
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyDtOuubc6t5Bix8PpEzkjGOT3HDCbIWMOA'
const MODEL = 'gemini-2.5-flash-lite' // Efficiency Stack: 50% cheaper, native JSON support
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    console.log(`[inventory-oracle] Request received: ${req.method}`)

    try {
        const body = await req.json()
        const { productId, currentStock } = body
        console.log(`[inventory-oracle] Product: ${productId}, Stock: ${currentStock}`)

        if (!productId) {
            throw new Error('Product ID is required')
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Obtener datos históricos del producto
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: orders, error: dbError } = await supabase
            .from('orders')
            .select('items, created_at')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .not('status', 'eq', 'cancelado')
            .not('status', 'eq', 'cancelled')
        
        if (dbError) throw new Error(`Database Error: ${dbError.message}`)
        console.log(`[inventory-oracle] Orders found: ${orders?.length || 0}`)

        // 2. Preparar el prompt para Gemini
        const salesHistory = (orders || []).map(o => {
            const items = (o.items as any[]) || []
            const item = items.find(i => i.product_id === productId)
            return { date: o.created_at, quantity: item?.quantity || 0 }
        }).filter(h => h.quantity > 0)

        const totalSales = salesHistory.reduce((acc, item) => acc + item.quantity, 0)
        const avgDailySales = totalSales / 30

        console.log(`[inventory-oracle] Sales History: ${salesHistory.length} events, Total: ${totalSales}`)

        const prompt = `
            Eres "El Oráculo de Inventario" de VSM Store.
            Tu misión es predecir cuándo se agotará el stock de un producto basándote en su historial.
            
            DATOS ACTUALES:
            - Stock en almacén: ${currentStock} unidades.
            - Ventas totales últimos 30 días: ${totalSales} unidades.
            - Promedio ventas diarias: ${avgDailySales.toFixed(2)}.
            
            DATOS HISTÓRICOS:
            ${JSON.stringify(salesHistory)}
            
            INSTRUCCIONES:
            - Calcula cuántos días faltan para el agotamiento (daysUntilOut).
            - Genera un mensaje corto y persuasivo para el cliente (customerMessage).
            - Genera una recomendación técnica para el administrador (adminRecommendation).
            
            Responde estrictamente en JSON:
            {
                "daysUntilOut": number,
                "depletionDate": "ISO Date",
                "customerMessage": "string",
                "adminRecommendation": "string",
                "urgencyLevel": "low" | "medium" | "high" | "critical"
            }
        `

        // 3. Consultar a Gemini
        console.log('[inventory-oracle] Consulting Gemini v1...')
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7
                }
            })
        })

        if (!geminiRes.ok) {
            const errorDetail = await geminiRes.text();
            throw new Error(`Gemini API Error: ${geminiRes.status} ${errorDetail}`);
        }

        const geminiResult = await geminiRes.json()
        const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!rawText) {
            throw new Error('Gemini returned an empty response')
        }

        const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const oracleData = JSON.parse(jsonText);

        return new Response(JSON.stringify(oracleData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        const errorMsg = `[Inventory-Oracle] Error: ${error.message} | Gemini Status: ${GEMINI_API_KEY ? 'Set' : 'Missing'}`;
        console.error(errorMsg);
        return new Response(JSON.stringify({ 
            error: error.message,
            context: 'inventory-oracle',
            gemini_key_present: !!GEMINI_API_KEY,
            full_error: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
