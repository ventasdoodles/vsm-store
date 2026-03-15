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
        const { name, description: currentDesc, action } = await req.json()

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

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
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
            
            if (!rawText) throw new Error('Gemini returned an empty response')

            const aiData = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim())

            return new Response(JSON.stringify(aiData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error: any) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
