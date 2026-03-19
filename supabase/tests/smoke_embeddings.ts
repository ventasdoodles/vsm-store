/**
 * VSM AI Validation — Provider & Model Smoke Test
 * 
 * Verifies that the embeddings-processor edge function is returning 
 * vectors that match the project's canonical dimensions and model.
 */
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { TEST_CONFIG } from './test_config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

async function runSmoke() {
    console.log('--- 🧪 SMOKE TEST: Embeddings Processor ---')
    console.log(`Target Model: ${TEST_CONFIG.EMBEDDING_MODEL}`)
    console.log(`Expected Dims: ${TEST_CONFIG.EMBEDDING_DIMENSIONS}\n`)

    const start = Date.now()
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/embeddings-processor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ text: 'Test query' })
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        const latency = Date.now() - start
        
        const receivedDims = data.embedding?.length || 0
        
        console.log(`✅ Status: 200 OK`)
        console.log(`✅ Latency: ${latency}ms`)
        console.log(`✅ Dimensions: ${receivedDims}`)

        if (receivedDims !== TEST_CONFIG.EMBEDDING_DIMENSIONS) {
            console.error(`\n❌ FAIL: Dimension mismatch! Received ${receivedDims}, expected ${TEST_CONFIG.EMBEDDING_DIMENSIONS}`)
            process.exit(1)
        }

        console.log('\n🌟 PASS: Embeddings provider is healthy and aligned.\n')
    } catch (err) {
        console.error(`\n❌ FAIL: ${err.message}`)
        process.exit(1)
    }
}

runSmoke()
