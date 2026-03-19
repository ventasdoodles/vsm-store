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

    try {
        const { text } = await req.json()

        if (!text) {
            throw new Error('Text is required for embeddings')
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: {
                    parts: [{ text }]
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Error Response:', errorText)
            throw new Error(`Gemini Embedding Error: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        
        if (!result.embedding || !result.embedding.values) {
            console.error('Unexpected Gemini Response Structure:', JSON.stringify(result))
            throw new Error('Unexpected response structure from Gemini Embedding API')
        }

        const embedding = result.embedding.values

        return new Response(JSON.stringify({ embedding }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
