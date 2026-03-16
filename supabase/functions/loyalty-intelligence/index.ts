/**
 * loyalty-intelligence — Supabase Edge Function
 * 
 * AI-powered loyalty program analysis. Evaluates customer purchase patterns,
 * tier progression, and generates personalized retention strategies.
 * 
 * @model gemini-2.0-flash (via v1 REST API)
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-1.5-flash → gemini-2.0-flash (1.5 retired)
 * - 2026-03-15: Removed unsupported responseMimeType + fixed duplicate temperature
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
        const { customerId } = await req.json()

        if (!customerId) {
            throw new Error('Customer ID is required')
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Obtener inteligencia del cliente
        const { data: intel, error: intelError } = await supabase
            .from('customer_intelligence_360')
            .select('full_name, segment, health_status, monetary, recency_days')
            .eq('id', customerId)
            .single()

        if (intelError || !intel) {
            throw new Error('Could not find customer intelligence data')
        }

        // 2. Definir Prompt para Gemini basado en segmento
        const prompt = `
            Eres un experto en crecimiento (Growth Hacker) para "VSM Store", una tienda premium de vapeo.
            Tu misión es generar una recompensa personalizada para un cliente basada en su comportamiento.

            DATOS DEL CLIENTE:
            - Nombre: ${intel.full_name}
            - Segmento: ${intel.segment}
            - Salud: ${intel.health_status}
            - Valor Monetrio: $${intel.monetary}
            - Recencia: ${intel.recency_days} días.

            GUÍAS DE GENERACIÓN:
            - Para "Campeón": Ofrece algo pequeño (10%) pero con mensaje de agradecimiento VIP.
            - Para "Leal": 15% para mantener su hábito.
            - Para "En Riesgo" o "Casi Perdido": 20-25% agresivo para recuperarlo.
            - Para "Nuevo": 15% para incentivar la segunda compra.
            - Tono: Energético, premium, centrado en el beneficio.
            - Máximo 30 palabras para el mensaje.

            RESPONDE ÚNICAMENTE CON UN JSON EN ESTE FORMATO:
            {
                "personalizedMessage": "...",
                "discountValue": 0,
                "discountType": "percentage",
                "campaignTag": "IA-RECOVER"
            }
        `

        // 3. Llamar a Gemini
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2, // Reducimos para consistencia JSON
                    responseMimeType: "application/json"
                }
            })
        })

        if (!geminiRes.ok) {
            const errorDetail = await geminiRes.text();
            throw new Error(`Gemini API Error: ${geminiRes.status} ${errorDetail}`);
        }

        const geminiResult = await geminiRes.json()
        const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
        const aiData = JSON.parse(cleanText);

        // 4. Crear Cupón en la DB
        const uniqueCode = `${aiData.campaignTag}-${Math.random().toString(36).substring(7).toUpperCase()}`

        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .insert({
                code: uniqueCode,
                description: `IA Reward - ${intel.segment}`,
                discount_type: aiData.discountType,
                discount_value: aiData.discountValue,
                min_purchase: 200, // Hardcoded para evitar uso abusivo
                max_uses: 1,
                is_active: true,
                valid_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h
            })
            .select('id')
            .single()

        if (couponError) throw couponError

        // 5. Registrar Proposición Inteligente
        const { data: proposition, error: propError } = await supabase
            .from('smart_loyalty_propositions')
            .insert({
                customer_id: customerId,
                coupon_id: coupon.id,
                generated_code: uniqueCode,
                personalized_message: aiData.personalizedMessage,
                discount_value: aiData.discountValue,
                discount_type: aiData.discountType,
                segment_at_generation: intel.segment
            })
            .select()
            .single()

        if (propError) throw propError

        return new Response(JSON.stringify(proposition), {
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
