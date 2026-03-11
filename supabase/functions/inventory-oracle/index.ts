import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
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

    try {
        const { productId, currentStock } = await req.json()

        if (!productId) {
            throw new Error('Product ID is required')
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Obtener datos históricos del producto (Simulados o Reales)
        // Consultamos los últimos 30 días de pedidos para este producto
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity, created_at')
            .eq('product_id', productId)
            .gte('created_at', thirtyDaysAgo.toISOString())

        // 2. Preparar el prompt para Gemini
        const salesHistory = orderItems || []
        const totalSales = salesHistory.reduce((acc, item) => acc + item.quantity, 0)
        const avgDailySales = totalSales / 30

        const prompt = `
            Eres "El Oráculo de Inventario" de VSM Store.
            Tu misión es predecir cuándo se agotará el stock de un producto basándote en su historial.
            
            DATOS ACTUALES:
            - Stock en almacén: ${currentStock} unidades.
            - Ventas totales últimos 30 días: ${totalSales} unidades.
            - Promedio ventas diarias: ${avgDailySales.toFixed(2)}.
            
            DATOS HISTÓRICOS (JSON):
            ${JSON.stringify(salesHistory)}
            
            INSTRUCCIONES:
            - Calcula cuántos días faltan para el agotamiento (daysUntilOut).
            - Genera un mensaje de "Profecía" corto y persuasivo para el cliente (customerMessage).
            - Genera una "Recomendación" técnica para el administrador (adminRecommendation).
            
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
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        const geminiResult = await geminiRes.json()
        const oracleData = JSON.parse(geminiResult.candidates[0].content.parts[0].text)

        return new Response(JSON.stringify(oracleData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
