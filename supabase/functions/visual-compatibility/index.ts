import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
if (!GEMINI_API_KEY) {
    console.error('[visual-compatibility] FATAL: GEMINI_API_KEY is not set in environment secrets.')
}
const MODEL = 'gemini-2.5-flash' // Best model for multimodal tasks
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
        const { imageBase64, mimeType = 'image/jpeg' } = await req.json()

        if (!imageBase64) {
            throw new Error('imageBase64 data is required')
        }

        // 1. Preguntar a Gemini Vision qué equipo/repuesto es
        const prompt = `
            Eres un experto mundial en hardware de vapeo (mods, pods, atomizadores, resistencias).
            Analiza esta imagen y determina la marca y modelo exacto del dispositivo o componente.
            Si no es de vapeo o 420, recházalo gentilmente.
            Responde SOLO con un JSON válido usando esta estructura exacta, sin markdown de bloques de código:
            {
                "identified": boolean,
                "brand": "string o null",
                "model": "string o null",
                "confidence": "high|medium|low",
                "recommended_search_tags": ["string"],
                "reasoning": "Breve explicación técnica de por qué crees que es este equipo",
                "is_vape_related": boolean
            }
        `

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
                            }
                        }
                    ]
                }],
                generationConfig: { 
                    temperature: 0.1,
                    responseMimeType: 'application/json'
                }
            })
        })

        if (!geminiRes.ok) {
            const err = await geminiRes.json();
            throw new Error(err.error?.message || 'Error from Google API (visual-compatibility)');
        }

        const geminiResult = await geminiRes.json()
        const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const aiData = JSON.parse(rawText)

        if (!aiData.is_vape_related || !aiData.identified) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: aiData.reasoning || 'No pude identificar un producto de vapeo en la imagen.' 
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Buscar repuestos compatibles en Supabase
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        
        // Búsqueda de productos activos
        const { data: products, error: dbError } = await supabase
            .from('products')
            .select('id, name, slug, price, cover_image, category_id, stock')
            .eq('is_active', true)
            .or(`name.ilike.%${aiData.model}%,short_description.ilike.%${aiData.model}%,tags.cs.{"${aiData.model}"}`)
            .limit(6)

        if (dbError) {
            console.error('[visual-compatibility] DB Error:', dbError)
        }

        return new Response(JSON.stringify({
            success: true,
            analysis: aiData,
            suggestedProducts: products || []
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: unknown) {
        const errObj = error instanceof Error ? error : new Error(String(error));
        console.error('[visual-compatibility] Handler Error:', errObj)
        return new Response(JSON.stringify({ error: errObj.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
