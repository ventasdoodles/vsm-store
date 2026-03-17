/**
 * knowledge-ingestor — Supabase Edge Function
 *
 * Handles chunking and embedding ingestion for the Cesarin OS Knowledge RAG
 * foundation (Phase 3.2B). Converts raw text or pre-chunked content into
 * vectorized rows in `store_knowledge`.
 *
 * Supported actions:
 *   - ingest_text   : Splits a raw document into semantic chunks, embeds each,
 *                     and inserts them into store_knowledge.
 *   - ingest_single : Embeds and inserts a single pre-chunked content block.
 *   - delete_source : Soft-deletes all chunks for a given source_id.
 *
 * Intentionally does NOT include:
 *   - reembed_all (deferred to Phase 3.3 maintenance tooling)
 *   - Automatic DB triggers (manual ingestion only in this phase)
 *
 * @requires GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * @author VSM Store / Antigravity
 * @version 1.0.0 (Phase 3.2B)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

if (!GEMINI_API_KEY) {
    console.error('[knowledge-ingestor] FATAL: GEMINI_API_KEY is not set.')
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

type KnowledgeCategory =
    | 'shipping'
    | 'payments'
    | 'vape_basics'
    | '420_basics'
    | 'policies'
    | 'faq'
    | 'onboarding'

type KnowledgeSourceType =
    | 'manual'
    | 'policy_doc'
    | 'ai_rules_migrated'

interface IngestSinglePayload {
    title: string
    content: string
    category: KnowledgeCategory
    source_type: KnowledgeSourceType
    source_id?: string
    metadata?: Record<string, unknown>
}

interface IngestTextPayload {
    title: string
    raw_text: string
    category: KnowledgeCategory
    source_type: KnowledgeSourceType
    source_id?: string
    source_filename?: string
    // Chunking params — optional, defaults apply
    target_chunk_size?: number    // Default: 1000 chars
    overlap_chars?: number        // Default: 100 chars
}

// ----------------------------------------------------------------------------
// CHUNKING LOGIC
// Markdown-aware, semantic-first splitting.
// Priority: Split on ## headers > paragraph breaks > size limit.
// ----------------------------------------------------------------------------

function chunkMarkdownText(
    text: string,
    targetSize = 1000,
    overlapChars = 100
): string[] {
    // Normalize line endings
    const normalized = text.replace(/\r\n/g, '\n').trim()

    // Step 1: Split on markdown H2 headers (##) or H3 (###) first
    // This preserves semantic groupings of a section as atomic units.
    const headerPattern = /(?=^#{2,3} )/m
    let sections = normalized.split(headerPattern).map(s => s.trim()).filter(Boolean)

    // If no headers, treat the whole text as one section
    if (sections.length === 0) sections = [normalized]

    const chunks: string[] = []

    for (const section of sections) {
        if (section.length <= targetSize) {
            // Section fits in one chunk — keep it semantically whole.
            // Small chunks are acceptable (requirement 4).
            chunks.push(section)
        } else {
            // Section too long — split on paragraph breaks
            const paragraphs = section.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
            let currentChunk = ''

            for (const para of paragraphs) {
                const candidate = currentChunk ? `${currentChunk}\n\n${para}` : para

                if (candidate.length <= targetSize) {
                    currentChunk = candidate
                } else {
                    // Save current chunk and start a new one with overlap
                    if (currentChunk) {
                        chunks.push(currentChunk)
                        // Overlap: carry the last N chars from the previous chunk
                        const overlap = currentChunk.slice(-overlapChars)
                        currentChunk = overlap ? `${overlap}\n\n${para}` : para
                    } else {
                        // Single paragraph exceeds limit — force-split on sentences
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

    return chunks.filter(c => c.length > 20) // drop tiny noise fragments
}

// ----------------------------------------------------------------------------
// EMBEDDING via Gemini text-embedding-004
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
            const errText = await res.text()
            console.error(`[knowledge-ingestor] Embedding API error: ${errText}`)
            return null
        }

        const result = await res.json()
        return result.embedding?.values ?? null
    } catch (err) {
        console.error('[knowledge-ingestor] Embedding generation failed:', err)
        return null
    }
}

// ----------------------------------------------------------------------------
// MAIN HANDLER
// ----------------------------------------------------------------------------

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { action } = body

        // -----------------------------------------------------------------------
        // ACTION: ingest_single
        // Embed + insert a single pre-prepared content chunk.
        // -----------------------------------------------------------------------
        if (action === 'ingest_single') {
            const payload = body as IngestSinglePayload & { action: string }

            if (!payload.title || !payload.content || !payload.category || !payload.source_type) {
                return errorResponse('ingest_single requires: title, content, category, source_type', 400)
            }

            console.log(`[knowledge-ingestor] ingest_single: "${payload.title}" (${payload.category})`)

            const embedding = await generateEmbedding(payload.content)

            if (!embedding) {
                return errorResponse('Failed to generate embedding — chunk was not saved.', 500)
            }

            const { data, error } = await supabase
                .from('store_knowledge')
                .insert({
                    title: payload.title,
                    content: payload.content,
                    embedding,
                    category: payload.category,
                    source_type: payload.source_type,
                    source_id: payload.source_id ?? null,
                    metadata: {
                        chunk_index: 0,
                        total_chunks: 1,
                        char_count: payload.content.length,
                        ...(payload.metadata ?? {})
                    },
                    is_active: true
                })
                .select('id, title, category')
                .single()

            if (error) throw error

            console.log(`[knowledge-ingestor] Inserted chunk: ${data.id}`)
            return jsonResponse({ success: true, chunk: data })
        }

        // -----------------------------------------------------------------------
        // ACTION: ingest_text
        // Chunk a raw document, embed each chunk, and insert all into store_knowledge.
        // Existing chunks for the same source_id are soft-deleted before inserting.
        // -----------------------------------------------------------------------
        if (action === 'ingest_text') {
            const payload = body as IngestTextPayload & { action: string }

            if (!payload.title || !payload.raw_text || !payload.category || !payload.source_type) {
                return errorResponse('ingest_text requires: title, raw_text, category, source_type', 400)
            }

            const targetSize = payload.target_chunk_size ?? 1000
            const overlap = payload.overlap_chars ?? 100
            const sourceId = payload.source_id ?? payload.source_filename ?? payload.title.toLowerCase().replace(/\s+/g, '-')

            console.log(`[knowledge-ingestor] ingest_text: "${payload.title}" → source_id: "${sourceId}"`)

            // Soft-delete previous version of this document (same source_id)
            await supabase
                .from('store_knowledge')
                .update({ is_active: false })
                .eq('source_id', sourceId)

            // Chunk the raw text
            const chunks = chunkMarkdownText(payload.raw_text, targetSize, overlap)
            console.log(`[knowledge-ingestor] Generated ${chunks.length} chunks`)

            const inserted: { id: string; title: string }[] = []
            const failed: { index: number; reason: string }[] = []

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i]
                const chunkTitle = chunks.length === 1
                    ? payload.title
                    : `${payload.title} (${i + 1}/${chunks.length})`

                const embedding = await generateEmbedding(chunk)

                if (!embedding) {
                    console.warn(`[knowledge-ingestor] Skipping chunk ${i} — embedding failed`)
                    failed.push({ index: i, reason: 'embedding_failed' })
                    continue
                }

                const { data, error } = await supabase
                    .from('store_knowledge')
                    .insert({
                        title: chunkTitle,
                        content: chunk,
                        embedding,
                        category: payload.category,
                        source_type: payload.source_type,
                        source_id: sourceId,
                        metadata: {
                            chunk_index: i,
                            total_chunks: chunks.length,
                            char_count: chunk.length,
                            overlap_chars: overlap,
                            source_filename: payload.source_filename ?? null
                        },
                        is_active: true
                    })
                    .select('id, title')
                    .single()

                if (error) {
                    console.error(`[knowledge-ingestor] Insert error chunk ${i}:`, error.message)
                    failed.push({ index: i, reason: error.message })
                } else {
                    inserted.push({ id: data.id, title: data.title })
                }
            }

            return jsonResponse({
                success: true,
                source_id: sourceId,
                total_chunks: chunks.length,
                inserted: inserted.length,
                failed: failed.length,
                details: { inserted, failed }
            })
        }

        // -----------------------------------------------------------------------
        // ACTION: delete_source
        // Soft-delete all chunks for a given source_id.
        // -----------------------------------------------------------------------
        if (action === 'delete_source') {
            const { source_id } = body

            if (!source_id) return errorResponse('delete_source requires source_id', 400)

            const { count, error } = await supabase
                .from('store_knowledge')
                .update({ is_active: false })
                .eq('source_id', source_id)

            if (error) throw error

            return jsonResponse({ success: true, deactivated: count })
        }

        return errorResponse(`Unsupported action: ${action}`, 400)

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('[knowledge-ingestor] Unhandled error:', message)
        return errorResponse(message, 500)
    }
})

// ----------------------------------------------------------------------------
// RESPONSE HELPERS
// ----------------------------------------------------------------------------

function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
}

function errorResponse(message: string, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
}
