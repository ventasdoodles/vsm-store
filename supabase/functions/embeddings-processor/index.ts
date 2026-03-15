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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: {
                    parts: [{ text }]
                }
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Gemini Embedding Error: ${error}`)
        }

        const result = await response.json()
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
