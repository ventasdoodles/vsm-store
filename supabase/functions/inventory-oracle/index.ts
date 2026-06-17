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

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
if (!GEMINI_API_KEY) {
    console.error('[inventory-oracle] FATAL: GEMINI_API_KEY is not set in environment secrets.')
}
const MODEL = 'gemini-2.5-flash'
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

        // 2. Preparar datos deterministicamente (Sin LLM para evitar rate limits)
        const salesHistory = (orders || []).map(o => {
            const items = (o.items as any[]) || []
            const item = items.find(i => i.product_id === productId)
            return { date: o.created_at, quantity: item?.quantity || 0 }
        }).filter(h => h.quantity > 0)

        const totalSales = salesHistory.reduce((acc, item) => acc + item.quantity, 0)
        const avgDailySales = totalSales / 30 || 0.1 // Prevent division by zero

        console.log(`[inventory-oracle] Sales History: ${salesHistory.length} events, Total: ${totalSales}`)

        // 3. Calculos Deterministicos
        const daysUntilOut = Math.floor(currentStock / avgDailySales)
        const depletionDate = new Date(Date.now() + daysUntilOut * 24 * 60 * 60 * 1000).toISOString()
        
        let urgencyLevel = "low";
        if (daysUntilOut < 7) urgencyLevel = "critical";
        else if (daysUntilOut < 15) urgencyLevel = "high";
        else if (daysUntilOut < 30) urgencyLevel = "medium";

        let customerMessage = "Stock estable.";
        if (urgencyLevel === "critical") customerMessage = "¡Últimas unidades! Se agotará muy pronto.";
        else if (urgencyLevel === "high") customerMessage = "Inventario bajando rápido, te sugerimos apartarlo.";
        else if (urgencyLevel === "medium") customerMessage = "Aún hay stock, pero tiene buena demanda.";

        let adminRecommendation = "Mantener monitoreo.";
        if (urgencyLevel === "critical") adminRecommendation = "URGENTE: Solicitar resurtido inmediato.";
        else if (urgencyLevel === "high") adminRecommendation = "Planear resurtido para la próxima semana.";

        const oracleData = {
            daysUntilOut,
            depletionDate,
            customerMessage,
            adminRecommendation,
            urgencyLevel
        }

        return new Response(JSON.stringify(oracleData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: unknown) {
        const errObj = error instanceof Error ? error : new Error(String(error));
        console.error(`[Inventory-Oracle] Error: ${errObj.message}`);
        return new Response(JSON.stringify({ 
            error: errObj.message,
            context: 'inventory-oracle'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
