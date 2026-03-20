import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const res = await fetch(`${API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text }] },
                outputDimensionality: 3072
            })
        })
        const result = await res.json()
        return result.embedding?.values ?? null
    } catch (err) {
        return null
    }
}

const TEST_CASES = [
    { query: 'quiero dejar de fumar', expected_source: 'guia-dejar-fumar-v1' },
    { query: 'aceptan tarjeta de credito', expected_source: 'politica-pagos-v2' },
    { query: 'envio a domicilio xalapa costo', expected_source: 'politica-envios-detallada-v1' },
    { query: 'mejor kit de inicio para empezar', expected_source: 'guia-starter-kits-v1' },
    { query: 'donde puedo recoger mi pedido', expected_source: 'info-ubicacion-xalapa-v1' }
]

async function validate() {
    console.log('--- 🧪 WAVE 188: Semantic Gap Validation ---\n')
    let passed = 0

    for (const test of TEST_CASES) {
        process.stdout.write(`Testing: "${test.query}"... `)
        const vector = await generateEmbedding(test.query)
        
        if (!vector) {
            console.log('❌ (Embedding failed)')
            continue
        }

        const { data: matches, error } = await supabase.rpc('match_knowledge', {
            query_embedding: vector,
            match_threshold: 0.3,
            match_count: 3
        })

        if (error || !matches || matches.length === 0) {
            console.log('❌ (No matches found)')
            continue
        }

        const matchedSourceIds = matches.map((m: any) => m.source_id)
        if (matchedSourceIds.includes(test.expected_source)) {
            console.log(`✅ MATCH! (Top match: ${matches[0].source_id}, score: ${matches[0].similarity.toFixed(4)})`)
            passed++
        } else {
            console.log(`❌ FAIL (Matches: ${matchedSourceIds.join(', ')})`)
        }
    }

    console.log(`\n📊 Results: ${passed}/${TEST_CASES.length} passed.`)
    if (passed === TEST_CASES.length) {
        console.log('🎉 Wave 188 Knowledge Gaps are successfully closed!')
    } else {
        process.exit(1)
    }
}

validate().catch(console.error)
