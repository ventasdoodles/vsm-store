/**
 * VSM Store — Product Embedding Ingestion Script (Canonical 3072d)
 * 
 * Seeds ALL products with 768d embeddings using gemini-embedding-001 / v1beta.
 * - Processes in batches of BATCH_SIZE
 * - Resume/checkpoint via CLI arg: `--resume N` (skip first N products)
 * - Reports errors per record with full context
 * - No dimension mixing: always overwrites all records
 *
 * @requires GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

// ── Constants ──────────────────────────────────────────────────────────────
const EMBEDDING_MODEL   = 'models/gemini-embedding-001'
const EMBEDDING_DIMS    = 768
// NOTE: v1 endpoint returns 404/405 for gemini-embedding-001; v1beta is the stable route
const API_ENDPOINT      = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`
const BATCH_SIZE        = 10
const RATE_LIMIT_MS     = 200 // ms between requests

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables. Need VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ── Checkpoint from CLI ────────────────────────────────────────────────────
const resumeArg = process.argv.indexOf('--resume')
const resumeOffset = resumeArg !== -1 ? parseInt(process.argv[resumeArg + 1] || '0', 10) : 0

// ── Embedding Generator ────────────────────────────────────────────────────
async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const res = await fetch(`${API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                content: { parts: [{ text }] },
                outputDimensionality: EMBEDDING_DIMS
            })
        })
        if (!res.ok) {
            const errBody = await res.text()
            console.error(`   ⚠️  Gemini API Error: ${res.status} — ${errBody}`)
            return null
        }
        const result = await res.json()
        const values: number[] = result.embedding?.values ?? null
        if (values && values.length !== EMBEDDING_DIMS) {
            console.error(`   ⚠️  Dimension mismatch! Got ${values.length}d, expected ${EMBEDDING_DIMS}d`)
            return null
        }
        return values
    } catch (err) {
        console.error(`   ⚠️  Network error: ${(err as Error).message}`)
        return null
    }
}

// ── Main Runner ────────────────────────────────────────────────────────────
async function run() {
    console.log('🚀 Product Embedding Population (Canonical 768d)')
    console.log(`   Model:    ${EMBEDDING_MODEL}`)
    console.log(`   API:      v1/${EMBEDDING_DIMS}d`)
    console.log(`   Endpoint: ${API_ENDPOINT}`)
    if (resumeOffset > 0) console.log(`   Resuming: skipping first ${resumeOffset} records.\n`)

    // Fetch universe of active products
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name, description, status')
        .eq('status', 'active')
        .order('created_at', { ascending: true })

    if (fetchError) { console.error('❌ Error fetching products:', fetchError.message); return }
    if (!products?.length) { console.log('✅ No active products found.'); return }

    const universe = products.slice(resumeOffset)
    console.log(`📦 Universe: ${products.length} active products.`)
    console.log(`   Processing: ${universe.length} (offset: ${resumeOffset}).\n`)

    let ok = 0, failed = 0, dimErrors = 0
    const errors: { id: string; name: string; reason: string }[] = []

    // Batch processing
    for (let b = 0; b < universe.length; b += BATCH_SIZE) {
        const batch = universe.slice(b, b + BATCH_SIZE)
        const batchNum = Math.floor(b / BATCH_SIZE) + 1
        const totalBatches = Math.ceil(universe.length / BATCH_SIZE)
        console.log(`\n📦 Batch ${batchNum}/${totalBatches} (records ${resumeOffset + b + 1}–${resumeOffset + b + batch.length})`)

        for (const p of batch) {
            const textToEmbed = `${p.name} ${p.description || ''}`.trim().slice(0, 1500)
            process.stdout.write(`   [${resumeOffset + b + universe.indexOf(p) + 1}] ${p.name}... `)

            const embedding = await generateEmbedding(textToEmbed)
            if (!embedding) {
                console.log('❌')
                failed++
                errors.push({ id: p.id, name: p.name, reason: 'Embedding generation failed' })
                continue
            }

            const { error: updateError } = await supabase
                .from('products')
                .update({ embedding })
                .eq('id', p.id)

            if (updateError) {
                console.log(`❌ DB Error: ${updateError.message}`)
                failed++
                errors.push({ id: p.id, name: p.name, reason: updateError.message })
            } else {
                console.log(`✅ (${embedding.length}d)`)
                ok++
            }
            await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
        }
        console.log(`   ✔ Batch ${batchNum} done.`)
    }

    // Summary
    console.log('\n══════════════════════════════════════════════')
    console.log(`✅ Success:  ${ok}/${universe.length}`)
    console.log(`❌ Failed:   ${failed}/${universe.length}`)
    if (dimErrors > 0) console.log(`⚠️  Dim errors: ${dimErrors}`)
    if (errors.length > 0) {
        console.log('\n   Error Details:')
        for (const e of errors) console.log(`   • [${e.id}] "${e.name}": ${e.reason}`)
    }
    console.log('══════════════════════════════════════════════')

    // Final coverage check
    const { data: coverage } = await supabase
        .from('products')
        .select('id, name')
        .eq('status', 'active')
        .is('embedding', null)
    
    if (coverage && coverage.length > 0) {
        console.warn(`\n⚠️  Coverage gap: ${coverage.length} active products still missing embedding.`)
        for (const p of coverage) console.warn(`   • ${p.name} (${p.id})`)
        console.warn(`   ➜ Re-run with: npx tsx supabase/seeds/seed_products.ts --resume ${ok}`)
    } else {
        console.log('\n🎉 100% coverage achieved for active products!')
    }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1) })
