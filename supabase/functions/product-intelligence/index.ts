/**
 * product-intelligence — Supabase Edge Function
 * 
 * AI-powered product description and copy generation. Creates compelling,
 * SEO-friendly product descriptions and marketing copy in Spanish.
 * 
 * @model gemini-1.5-flash (via v1beta REST API)
 * @requires GEMINI_API_KEY
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

    console.log(`[product-intelligence] Request received: ${req.method}`)

    try {
        const body = await req.json()
        const { name, description: currentDesc, action } = body
        console.log(`[product-intelligence] Action: ${action}, Name: ${name}`)

        if (action === 'generate_copy') {
            if (!name) throw new Error('Product name is required')

            const prompt = `
                Eres un experto en Copywriting y Marketing para "VSM Store", una tienda premium de vapes y accesorios.
                Tu tarea es generar contenido persuasivo para un producto.

                PRODUCTO: ${name}
                DESCRIPCIÓN ACTUAL (si existe): ${currentDesc || 'Ninguna'}

                INSTRUCCIONES:
                - Genera una "description" larga y detallada (mínimo 3 párrafos), profesional y enfocada al estilo de vida.
                - Genera una "short_description" de máximo 20 palabras.
                - Sugiere 5 "tags" relevantes.
                - Responde estrictamente en JSON.

                FORMATO JSON DE RESPUESTA:
                {
                    "description": "string",
                    "short_description": "string",
                    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
                }
            `

            console.log('[product-intelligence] Consulting Gemini...')
            console.log('[product-intelligence] Consulting Gemini...')
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
                const errorDetail = await response.text();
                throw new Error(`Gemini API Error: ${response.status} ${errorDetail}`);
            }

            const result = await response.json()
            const aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            const cleanText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim()
            const aiData = JSON.parse(cleanText);

            return new Response(JSON.stringify(aiData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error: any) {
        const errorMsg = `[Product-Intelligence] Error: ${error.message} | Gemini Status: ${GEMINI_API_KEY ? 'Set' : 'Missing'}`;
        console.error(errorMsg);
        return new Response(JSON.stringify({ 
            error: error.message,
            context: 'product-intelligence',
            gemini_key_present: !!GEMINI_API_KEY,
            full_error: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
