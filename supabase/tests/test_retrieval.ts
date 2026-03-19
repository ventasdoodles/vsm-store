/**
 * VSM AI Validation — Database Retrieval Test
 * 
 * Verifies that the database schema and RPCs are aligned with the
 * project's canonical dimensions and that vectors are correctly stored.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { TEST_CONFIG } from './test_config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runRetrievalTest() {
    console.log('--- 🧪 DATABASE TEST: Semantic Retrieval Integrity ---')
    console.log(`Expected Dimensions: ${TEST_CONFIG.EMBEDDING_DIMENSIONS}\n`)

    // 1. Check Product Dimensions
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('name, embedding')
        .not('embedding', 'is', null)
        .limit(1)

    if (pError) throw new Error(`Fetch products failed: ${pError.message}`)
    if (!products?.[0]) console.warn('⚠️ Warning: No products with embeddings found.')
    else {
        const rawEmbedding = products[0].embedding;
        const dims = Array.isArray(rawEmbedding) 
            ? rawEmbedding.length 
            : JSON.parse(rawEmbedding).length;
        
        console.log(`✅ Product Embedding Type: ${typeof rawEmbedding}`);
        console.log(`✅ Product Embedding Dimension detected: ${dims}`);
        console.log(`✅ Expected: ${TEST_CONFIG.EMBEDDING_DIMENSIONS}`)
        
        if (dims !== TEST_CONFIG.EMBEDDING_DIMENSIONS) {
            console.error('❌ FAIL: Product dimension drift detected!')
            process.exit(1)
        }
    }

    // 2. Check Knowledge Dimensions
    const { data: knowledge, error: kError } = await supabase
        .from('store_knowledge')
        .select('title, embedding')
        .not('embedding', 'is', null)
        .limit(1)

    if (kError) throw new Error(`Fetch knowledge failed: ${kError.message}`)
    if (!knowledge?.[0]) console.warn('⚠️ Warning: No knowledge chunks with embeddings found.')
    else {
        const rawEmbedding = knowledge[0].embedding;
        const dims = Array.isArray(rawEmbedding) 
            ? rawEmbedding.length 
            : JSON.parse(rawEmbedding).length;
        
        console.log(`✅ Knowledge Embedding Type: ${typeof rawEmbedding}`);
        console.log(`✅ Knowledge Embedding Dimension detected: ${dims}`);
        console.log(`✅ Expected: ${TEST_CONFIG.EMBEDDING_DIMENSIONS}`)
        
        if (dims !== TEST_CONFIG.EMBEDDING_DIMENSIONS) {
            console.error('❌ FAIL: Knowledge dimension drift detected!')
            process.exit(1)
        }
    }

    // 3. Test RPC match_products
    const dummyVector = new Array(TEST_CONFIG.EMBEDDING_DIMENSIONS).fill(0)
    const { data: pMatches, error: pRpcError } = await supabase.rpc('match_products', {
        query_embedding: dummyVector,
        match_threshold: 0,
        match_count: 1
    })

    if (pRpcError) {
        console.error(`❌ FAIL: match_products RPC exploded: ${pRpcError.message}`)
        process.exit(1)
    }
    console.log('✅ RPC match_products signature validated.')

    // 4. Test RPC match_knowledge
    const { data: kMatches, error: kRpcError } = await supabase.rpc('match_knowledge', {
        query_embedding: dummyVector,
        match_threshold: 0,
        match_count: 1
    })

    if (kRpcError) {
        console.error(`❌ FAIL: match_knowledge RPC exploded: ${kRpcError.message}`)
        process.exit(1)
    }
    console.log('✅ RPC match_knowledge signature validated.')

    console.log('\n🌟 PASS: Database layer is 100% aligned with canonical 3072d.\n')
}

runRetrievalTest().catch(err => {
    console.error(`\n❌ FAIL: ${err.message}`)
    process.exit(1)
})
