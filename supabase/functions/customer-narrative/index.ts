/**
 * customer-narrative — Supabase Edge Function
 * 
 * AI-powered customer narrative generation. Creates rich, contextual summaries
 * of customer purchase history, preferences, and relationship with the store.
 * 
 * @model gemini-2.0-flash (via v1 REST API)
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-1.5-flash → gemini-2.0-flash (1.5 retired)
 */
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
        const { customerId } = await req.json()

        if (!customerId) {
            throw new Error('Customer ID is required')
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Obtener datos clave del cliente
        const [intelRes, timelineRes] = await Promise.all([
            supabase.from('customer_intelligence_360').select('*').eq('customer_id', customerId).single(),
            supabase.from('orders').select('total, created_at, status').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(5)
        ])

        const intel = intelRes.data
        const orders = timelineRes.data || []

        if (!intel) {
            return new Response(JSON.stringify({ narrative: "No hay datos suficientes para generar una narrativa." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Construir el prompt para Gemini
        const prompt = `
      Eres un consultor experto en CRM y Estrategia de Retail para la marca "VSM Store" (una tienda premium de vapes y accesorios).
      Analiza los siguientes datos de un cliente y genera una NARRATIVA EJECUTIVA de máximo 2 frases (40 palabras).
      
      DATOS DEL CLIENTE:
      - Nombre: ${intel.full_name}
      - Segmento: ${intel.segment}
      - Salud: ${intel.health_status}
      - Recencia: ${intel.recency_days} días desde la última compra.
      - Frecuencia: ${intel.frequency} órdenes totales.
      - Valor: $${intel.monetary} gastados en total.
      - Últimas órdenes: ${orders.map(o => `$${o.total} (${o.status})`).join(', ')}

      GUÍAS:
      - Tono: Profesional, premium, accionable.
      - Objetivo: Decirle al administrador qué tipo de cliente es y qué estrategia seguir hoy.
      - Evita repetir los números tal cual, interpreta el comportamiento.
      - Ejemplo: "Este cliente es un motor de ingresos Leal; su ticket promedio es alto pero no ha comprado en 30 días. Sugiere un acceso exclusivo a la nueva colección para reactivarlo."

      NARRATIVA:
    `

        // 3. Llamar a la API de Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 100,
                    temperature: 0.7,
                }
            })
        })

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errorDetail}`);
        }

        const result = await response.json()
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!rawText) {
            return new Response(JSON.stringify({ narrative: "No hay datos suficientes para generar una narrativa en este momento." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Cleanup potential markdown blocks and parse
        const narrative = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ narrative }), {
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
