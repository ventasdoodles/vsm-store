/**
 * VSM Store — Knowledge Embedding Ingestion Script (Canonical 3072d)
 * 
 * Seeds ALL knowledge documents with 3072d embeddings using gemini-embedding-001 / v1.
 * - Processes in batches of BATCH_SIZE
 * - Resume/checkpoint via CLI arg: `--resume <source_id>` (skip documents before this source_id)
 * - Reports errors per record/batch with full context
 * - No dimension mixing: soft-deletes old chunks before re-inserting
 *
 * @requires GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { SEED_DOCUMENTS } from './seed_knowledge'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

// ── Constants ──────────────────────────────────────────────────────────────
const EMBEDDING_MODEL   = 'models/gemini-embedding-001'
const EMBEDDING_DIMS    = 3072
// NOTE: v1 endpoint returns 404/405 for gemini-embedding-001; v1beta is the stable route
// per Gemini API docs (embedding-001 is v1beta parity as of March 2026)
const API_ENDPOINT      = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`
const CHUNK_BATCH_SIZE  = 5  // chunks per document before pause
const RATE_LIMIT_MS     = 250 // ms between chunk requests

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables. Need VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ── Checkpoint from CLI ────────────────────────────────────────────────────
const resumeArg = process.argv.indexOf('--resume')
const resumeSourceId = resumeArg !== -1 ? process.argv[resumeArg + 1] : null

// ── Chunking Logic ─────────────────────────────────────────────────────────
function chunkMarkdownText(text: string, targetSize = 1000, overlapChars = 100): string[] {
    const normalized = text.replace(/\r\n/g, '\n').trim()
    const headerPattern = /(?=^#{2,3} )/m
    let sections = normalized.split(headerPattern).map(s => s.trim()).filter(Boolean)
    if (sections.length === 0) sections = [normalized]

    const chunks: string[] = []
    for (const section of sections) {
        if (section.length <= targetSize) {
            chunks.push(section)
        } else {
            const paragraphs = section.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
            let currentChunk = ''
            for (const para of paragraphs) {
                const candidate = currentChunk ? `${currentChunk}\n\n${para}` : para
                if (candidate.length <= targetSize) {
                    currentChunk = candidate
                } else {
                    if (currentChunk) {
                        chunks.push(currentChunk)
                        const overlap = currentChunk.slice(-overlapChars)
                        currentChunk = overlap ? `${overlap}\n\n${para}` : para
                    } else {
                        const sentences = para.match(/[^.!?]+[.!?]+\s*/g) || [para]
                        let sentChunk = ''
                        for (const sent of sentences) {
                            if ((sentChunk + sent).length <= targetSize) {
                                sentChunk += sent
                            } else {
                                if (sentChunk) chunks.push(sentChunk.trim())
                                sentChunk = sent
                            }
                        }
                        if (sentChunk) currentChunk = sentChunk.trim()
                    }
                }
            }
            if (currentChunk) chunks.push(currentChunk)
        }
    }
    return chunks.filter(c => c.length > 20)
}

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

// ── Coverage Audit ─────────────────────────────────────────────────────────
async function coverageAudit() {
    const { count: total } = await supabase
        .from('store_knowledge')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

    const { count: withEmbedding } = await supabase
        .from('store_knowledge')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('embedding', 'is', null)

    return { total: total ?? 0, withEmbedding: withEmbedding ?? 0 }
}

// ── Main Runner ────────────────────────────────────────────────────────────
async function run() {
    console.log('🚀 Knowledge Embedding Ingestion (Canonical 3072d)')
    console.log(`   Model:    ${EMBEDDING_MODEL}`)
    console.log(`   API:      v1/${EMBEDDING_DIMS}d`)
    console.log(`   Endpoint: ${API_ENDPOINT}`)
    console.log(`   Docs:     ${SEED_DOCUMENTS.length}`)
    if (resumeSourceId) console.log(`   Resuming: from source_id "${resumeSourceId}"`)

    const preAudit = await coverageAudit()
    console.log(`\n📊 Pre-seed coverage: ${preAudit.withEmbedding}/${preAudit.total} active chunks\n`)

    let skipping = !!resumeSourceId
    let docsOk = 0, docsFailed = 0
    const docErrors: { source_id: string; chunk: number; reason: string }[] = []

    for (const doc of SEED_DOCUMENTS) {
        // Checkpoint: skip until we reach resume source_id
        if (skipping) {
            if (doc.source_id === resumeSourceId) skipping = false
            else { console.log(`⏭️  Skipping ${doc.source_id}`); continue }
        }

        console.log(`\n📄 Processing: "${doc.title}" (${doc.source_id})`)

        // 1. Soft delete old active chunks (prevent vector mixing)
        const { error: softDeleteError } = await supabase
            .from('store_knowledge')
            .update({ is_active: false })
            .eq('source_id', doc.source_id)
            .eq('is_active', true)
        
        if (softDeleteError) {
            console.error(`   ❌ Soft-delete failed: ${softDeleteError.message}`)
            docsFailed++
            docErrors.push({ source_id: doc.source_id, chunk: -1, reason: softDeleteError.message })
            continue
        }
        console.log(`   🗑️  Old chunks soft-deleted.`)

        // 2. Chunk text
        const chunks = chunkMarkdownText(doc.raw_text, 1000, 100)
        console.log(`   ✂️  Split into ${chunks.length} chunks.`)

        let insertedCount = 0
        let failedChunks = 0

        // 3. Process in batches
        for (let b = 0; b < chunks.length; b += CHUNK_BATCH_SIZE) {
            const batchChunks = chunks.slice(b, b + CHUNK_BATCH_SIZE)
            console.log(`   📦 Chunk batch ${Math.floor(b / CHUNK_BATCH_SIZE) + 1}/${Math.ceil(chunks.length / CHUNK_BATCH_SIZE)} (chunks ${b + 1}–${b + batchChunks.length})`)

            for (let i = 0; i < batchChunks.length; i++) {
                const chunkText = batchChunks[i]
                const chunkIndex = b + i
                const chunkTitle = chunks.length === 1 ? doc.title : `${doc.title} (${chunkIndex + 1}/${chunks.length})`

                process.stdout.write(`      🧠 Chunk ${chunkIndex + 1}... `)
                const embedding = await generateEmbedding(chunkText)

                if (!embedding) {
                    console.log('❌')
                    failedChunks++
                    docErrors.push({ source_id: doc.source_id, chunk: chunkIndex, reason: 'Embedding generation failed' })
                    continue
                }

                const { error: insertError } = await supabase.from('store_knowledge').insert({
                    title: chunkTitle,
                    content: chunkText,
                    embedding,
                    category: doc.category,
                    source_type: doc.source_type,
                    source_id: doc.source_id,
                    metadata: {
                        chunk_index: chunkIndex,
                        total_chunks: chunks.length,
                        char_count: chunkText.length,
                        overlap_chars: 100,
                        source_filename: doc.source_filename,
                        embedding_model: EMBEDDING_MODEL,
                        embedding_dims: EMBEDDING_DIMS,
                        api_version: 'v1'
                    },
                    is_active: true
                })

                if (insertError) {
                    console.log(`❌ DB: ${insertError.message}`)
                    failedChunks++
                    docErrors.push({ source_id: doc.source_id, chunk: chunkIndex, reason: insertError.message })
                } else {
                    console.log(`✅ (${embedding.length}d)`)
                    insertedCount++
                }
                await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
            }
        }

        console.log(`   ✔ "${doc.title}": ${insertedCount}/${chunks.length} chunks inserted, ${failedChunks} failed.`)
        if (failedChunks > 0) docsFailed++
        else docsOk++
    }

    // Final Coverage Audit
    const postAudit = await coverageAudit()
    const coveragePct = postAudit.total > 0 ? ((postAudit.withEmbedding / postAudit.total) * 100).toFixed(1) : '0.0'

    console.log('\n══════════════════════════════════════════════════════')
    console.log(`📊 Coverage: ${postAudit.withEmbedding}/${postAudit.total} active chunks (${coveragePct}%)`)
    console.log(`✅ Docs OK:  ${docsOk}/${SEED_DOCUMENTS.length}`)
    console.log(`❌ Docs w/errors: ${docsFailed}`)
    if (docErrors.length > 0) {
        console.log('\n   Error Details:')
        for (const e of docErrors) console.log(`   • [${e.source_id}] chunk ${e.chunk}: ${e.reason}`)
        console.log(`\n   ➜ To resume from last failed doc, run with: --resume <source_id>`)
    }
    if (coveragePct === '100.0') {
        console.log('\n🎉 100% coverage achieved for active knowledge chunks!')
    } else {
        console.warn(`\n⚠️  Coverage incomplete (${coveragePct}%). Check errors above.`)
    }
    console.log('══════════════════════════════════════════════════════')
}

run().catch(err => { console.error('Fatal:', err); process.exit(1) })
