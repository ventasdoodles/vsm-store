/**
 * bundle-intelligence — Supabase Edge Function
 * 
 * AI-powered product bundle suggestions. Analyzes cart contents and product
 * catalog to recommend complementary product bundles with creative names.
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
const MODEL = 'gemini-2.5-flash-lite'
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
        const { product, cartTotal } = await req.json()

        if (!product) {
            throw new Error('Product data is required')
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Obtener una recomendación compatible del motor de lógica existente
        // En una Edge Function no podemos importar @/lib/upsell-logic directamente fácilmente
        // así que simulamos o consultamos la DB para productos de categorías compatibles.
        
        const { data: categories } = await supabase
            .from('categories')
            .select('slug, id')
            .eq('id', product.category_id)
            .single()

        // Reglas directas para la demo/IA (matchean upsell-logic.ts)
        const COMPATIBILITY: Record<string, string[]> = {
            'mods': ['liquidos', 'coils'],
            'atomizadores': ['liquidos', 'coils'],
            'liquidos': ['coils', 'mods'],
            'vaporizers': ['accesorios-420'],
            'fumables': ['accesorios-420'],
        }

        const compatibleSlugs = COMPATIBILITY[categories?.slug || ''] || ['liquidos', 'accesorios-vape']

        // 2. Buscar un producto compatible que esté en stock
        const { data: suggestions } = await supabase
            .from('products')
            .select('id, name, price, cover_image, category_id')
            .in('category_id', (await supabase.from('categories').select('id').in('slug', compatibleSlugs)).data?.map(c => c.id) || [])
            .neq('id', product.id)
            .gt('stock', 0)
            .limit(1)

        if (!suggestions || suggestions.length === 0) {
            return new Response(JSON.stringify({ error: 'No bundles available' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const suggestedProduct = suggestions[0]

        // 3. Consultar a Gemini para el nombre creativo del Bundle
        const prompt = `
            Eres un experto en marketing para "VSM Store".
            Genera un nombre corto y épico (máximo 4 palabras) para un bundle que incluye:
            1. ${product.name}
            2. ${suggestedProduct.name}
            
            Ejemplos: "Kit de Nubes Eternas", "El Combo del Alquimista", "Duo de Poder Abisal".
            Responde solo con el nombre en un JSON: {"bundleName": "..."}
        `

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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

        if (!geminiRes.ok) {
            const err = await geminiRes.json();
            throw new Error(err.error?.message || 'Error from Google API (bundle-intelligence)');
        }

        const geminiResult = await geminiRes.json()
        const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
        const aiData = JSON.parse(cleanText)

        // 4. Generar cupón dinámico para el bundle (15% descuento)
        const bundleCouponCode = `BUNDLE-${Math.random().toString(36).substring(7).toUpperCase()}`
        
        await supabase.from('coupons').insert({
            code: bundleCouponCode,
            description: `Auto-Bundle: ${aiData.bundleName}`,
            discount_type: 'percentage',
            discount_value: 15,
            min_purchase: (product.price + suggestedProduct.price) * 0.8,
            max_uses: 1,
            is_active: true,
            valid_until: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
        })

        return new Response(JSON.stringify({
            bundleName: aiData.bundleName,
            suggestedProduct,
            couponCode: bundleCouponCode,
            discountPercentage: 15
        }), {
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
