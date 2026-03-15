/**
 * voice-intelligence — Supabase Edge Function
 * 
 * AI-powered voice/text input processing. Converts natural language queries
 * into structured search queries for the product catalog.
 * 
 * @model gemini-2.0-flash (via v1 REST API)
 * @requires GEMINI_API_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-1.5-flash → gemini-2.0-flash (1.5 retired)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    let transcript = '';
    try {
        const body = await req.json()
        transcript = body.transcript

        if (!transcript) {
            throw new Error('Transcript is required')
        }

        // 1. Consultar a Gemini para extraer la intención de búsqueda
        const prompt = `
            Eres el asistente inteligente de "VSM Store", una tienda premium de vapes y accesorios.
            Tu tarea es convertir una frase hablada por un usuario en una consulta de búsqueda (keywords) eficiente.
            
            Reglas:
            - Extrae solo las palabras clave más relevantes (producto, sabor, marca).
            - Elimina palabras de relleno como "buscame", "quiero", "tienes", "por favor".
            - Si el usuario pide un sabor (ej: mango, menta), asegúrate de incluirlo.
            - Si el usuario menciona "barato" o "oferta", prioriza los términos de búsqueda que podrían llevar a eso.
            
            Frase del usuario: "${transcript}"
            
            Responde estrictamente con un JSON: {"searchQuery": "palabras clave", "isComplex": boolean}
        `

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 }
            })
        })

        if (!geminiRes.ok) {
            const error = await geminiRes.text();
            throw new Error(`Gemini API Error: ${error}`);
        }

        const geminiResult = await geminiRes.json()
        const aiData = JSON.parse(geminiResult.candidates[0].content.parts[0].text)

        return new Response(JSON.stringify({
            original: transcript,
            searchQuery: aiData.searchQuery,
            isComplex: aiData.isComplex
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error(`[Voice-Intelligence] Error: ${error.message}`);
        // Fallback: si falla la IA, devolvemos el texto original para no romper la experiencia
        return new Response(JSON.stringify({ 
            error: error.message,
            searchQuery: transcript,
            isComplex: false,
            gemini_key_present: !!GEMINI_API_KEY
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Devolvemos 200 para que el frontend maneje el fallback suavemente
        })
    }
})
