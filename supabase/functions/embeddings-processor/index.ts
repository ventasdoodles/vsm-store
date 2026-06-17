import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
    GEMINI_EMBEDDING_DIMENSIONALITY,
    geminiEmbedText,
} from '../_shared/gemini-api.ts'

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

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured')
        }

        const embedding = await geminiEmbedText({
            apiKey: GEMINI_API_KEY,
            text,
            taskType: 'RETRIEVAL_QUERY',
            outputDimensionality: GEMINI_EMBEDDING_DIMENSIONALITY,
        })

        return new Response(JSON.stringify({ embedding }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: unknown) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
