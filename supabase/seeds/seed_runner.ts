/**
 * VSM Store — Alternative Knowledge Ingestion Script
 * 
 * Since Docker is not running locally to deploy the edge function,
 * this script runs the exact same chunking and embedding logic LOCALLY,
 * and directly inserts the rows into the `store_knowledge` table.
 *
 * @requires GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { SEED_DOCUMENTS } from './seed_knowledge'
import path from 'path'
import { fileURLToPath } from 'url'

// Get env from .env at root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables in .env.')
    console.error('Ensure VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY are set.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ----------------------------------------------------------------------------
// CHUNKING LOGIC (Copied from edge function)
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// EMBEDDING (Copied from edge function)
// ----------------------------------------------------------------------------
async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'models/text-embedding-004',
                    content: { parts: [{ text }] }
                })
            }
        )

        if (!res.ok) {
            console.error(`Gemini API error: ${await res.text()}`)
            return null
        }
        const result = await res.json()
        return result.embedding?.values ?? null
    } catch (err) {
        console.error('Embedding generation failed:', err)
        return null
    }
}

// ----------------------------------------------------------------------------
// RUNNER
// ----------------------------------------------------------------------------
async function run() {
    console.log('🚀 Ingesting Knowledge Base...\n')

    for (const doc of SEED_DOCUMENTS) {
        console.log(`\n📄 Processing: ${doc.title} (${doc.source_id})`)

        // 1. Soft delete old chunks
        await supabase.from('store_knowledge').update({ is_active: false }).eq('source_id', doc.source_id)

        // 2. Chunk text
        const chunks = chunkMarkdownText(doc.raw_text, 1000, 100)
        console.log(`   ✂️  Split into ${chunks.length} chunks.`)

        let insertedCount = 0

        // 3. Process each chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i]
            const chunkTitle = chunks.length === 1 ? doc.title : `${doc.title} (${i + 1}/${chunks.length})`

            process.stdout.write(`   🧠 Generating embedding for chunk ${i + 1}... `)
            const embedding = await generateEmbedding(chunkText)

            if (!embedding) {
                console.log('❌ Failed')
                continue
            }
            console.log('✅ Done')

            const { error } = await supabase.from('store_knowledge').insert({
                title: chunkTitle,
                content: chunkText,
                embedding,
                category: doc.category,
                source_type: doc.source_type,
                source_id: doc.source_id,
                metadata: {
                    chunk_index: i,
                    total_chunks: chunks.length,
                    char_count: chunkText.length,
                    overlap_chars: 100,
                    source_filename: doc.source_filename
                },
                is_active: true
            })

            if (error) {
                console.error(`   ❌ DB Insert Error: ${error.message}`)
            } else {
                insertedCount++
            }
        }

        console.log(`✅ Completed ${doc.title}. Inserted ${insertedCount}/${chunks.length} chunks.`)
    }

    console.log('\n🎉 Knowledge Ingestion Finished.')
}

run().catch(console.error)
