import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { SEED_DOCUMENTS } from './seed_knowledge'

export const EMBEDDING_MODEL = 'models/gemini-embedding-001'
export const EMBEDDING_DIMS = 768
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent'
const CHUNK_BATCH_SIZE = 5
const RATE_LIMIT_MS = 250

export type SeedDocument = (typeof SEED_DOCUMENTS)[number]

type LogSink = Pick<Console, 'error' | 'log' | 'warn'>

type QueryResult<T = unknown> = {
  count?: number | null
  data?: T | null
  error?: { message?: string } | null
}

type QueryChain<T = unknown> = PromiseLike<QueryResult<T>> & {
  eq: (column: string, value: unknown) => QueryChain<T>
  not: (column: string, operator: string, value: unknown) => QueryChain<T>
  select: (columns?: string, options?: Record<string, unknown>) => QueryChain<T>
}

type TableBuilder<T = unknown> = {
  insert: (value: unknown) => QueryChain<T>
  select: (columns?: string, options?: Record<string, unknown>) => QueryChain<T>
  update: (value: unknown) => QueryChain<T>
}

export type SeedSupabaseClient = {
  from: (table: string) => TableBuilder
}

export type SeedRunnerDeps = {
  generateEmbedding: (text: string) => Promise<number[] | null>
  logger?: LogSink
  sleep?: (ms: number) => Promise<void>
  supabase: SeedSupabaseClient
}

type StoreKnowledgeInsert = {
  category: string
  content: string
  embedding: number[]
  is_active: boolean
  metadata: {
    chunk_index: number
    char_count: number
    embedding_dims: number
    embedding_model: string
    api_version: string
    overlap_chars: number
    source_filename: string
    total_chunks: number
  }
  source_id: string
  source_type: string
  title: string
}

export type SeedRunResult = {
  activeWithEmbedding: number
  activeRows: number
  docsFailed: number
  docsOk: number
  errors: string[]
  processedDocs: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function safeMessage(error: { message?: string } | null | undefined) {
  return error?.message ?? 'Unknown Supabase error'
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function parseResumeSourceId(argv = process.argv) {
  const resumeArg = argv.find((arg) => arg.startsWith('--resume='))
  if (resumeArg) {
    return resumeArg.split('=')[1]?.trim() || null
  }

  const resumeIndex = argv.indexOf('--resume')
  return resumeIndex >= 0 ? argv[resumeIndex + 1]?.trim() || null : null
}

function parseSourceIds(argv = process.argv) {
  const sourcesArg = argv.find((arg) => arg.startsWith('--sources='))
  const rawSources = sourcesArg?.split('=')[1] ?? null

  if (rawSources !== null) {
    return rawSources
      .split(',')
      .map((sourceId) => sourceId.trim())
      .filter(Boolean)
  }

  const sourcesIndex = argv.indexOf('--sources')
  const indexedSources = sourcesIndex >= 0 ? argv[sourcesIndex + 1] : null

  if (!indexedSources) {
    return null
  }

  return indexedSources
    .split(',')
    .map((sourceId) => sourceId.trim())
    .filter(Boolean)
}

function assertRequiredEnv() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  const geminiApiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

  if (!supabaseUrl || !serviceRoleKey || !geminiApiKey) {
    console.error('Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY, VITE_GEMINI_API_KEY')
    process.exit(1)
  }

  return { geminiApiKey, serviceRoleKey, supabaseUrl }
}

export function chunkMarkdownText(text: string, targetSize = 1000, overlapChars = 100): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const headerPattern = /(?=^#{2,3} )/m
  let sections = normalized
    .split(headerPattern)
    .map((section) => section.trim())
    .filter(Boolean)

  if (sections.length === 0) {
    sections = [normalized]
  }

  const chunks: string[] = []

  for (const section of sections) {
    if (section.length <= targetSize) {
      chunks.push(section)
      continue
    }

    const paragraphs = section
      .split(/\n\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    let buffer = ''

    for (const paragraph of paragraphs) {
      const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph
      if (candidate.length <= targetSize) {
        buffer = candidate
      } else {
        if (buffer) {
          chunks.push(buffer)
          const overlap = buffer.slice(-overlapChars)
          buffer = overlap ? `${overlap}\n\n${paragraph}` : paragraph
        } else {
          const sentences = paragraph.match(/[^.!?]+[.!?]+\s*/g) || [paragraph]
          let sentenceBuffer = ''

          for (const sentence of sentences) {
            if ((sentenceBuffer + sentence).length <= targetSize) {
              sentenceBuffer += sentence
            } else {
              if (sentenceBuffer) {
                chunks.push(sentenceBuffer.trim())
              }
              sentenceBuffer = sentence
            }
          }

          if (sentenceBuffer) {
            buffer = sentenceBuffer.trim()
          }
        }
      }
    }

    if (buffer) chunks.push(buffer)
  }

  return chunks.filter((chunk) => chunk.length > 20)
}

export async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMS,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`Gemini embedding error ${response.status}: ${body.slice(0, 500)}`)
      return null
    }

    const json = (await response.json()) as { embedding?: { values?: number[] } }
    const values = json.embedding?.values

    if (!Array.isArray(values) || values.length !== EMBEDDING_DIMS) {
      console.error(`Unexpected embedding dimensions: ${values?.length ?? 'missing'} (expected ${EMBEDDING_DIMS})`)
      return null
    }

    return values
  } catch (error) {
    console.error('Failed to generate embedding', error)
    return null
  }
}

async function coverageAudit(supabase: SeedSupabaseClient) {
  const totalActive = (await supabase
    .from('store_knowledge')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)) as QueryResult

  const activeWithEmbedding = (await supabase
    .from('store_knowledge')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('embedding', 'is', null)) as QueryResult

  if (totalActive.error) {
    throw new Error(`Failed to audit active store_knowledge rows: ${safeMessage(totalActive.error)}`)
  }

  if (activeWithEmbedding.error) {
    throw new Error(`Failed to audit embedded store_knowledge rows: ${safeMessage(activeWithEmbedding.error)}`)
  }

  const total = totalActive.count ?? 0
  const withEmbedding = activeWithEmbedding.count ?? 0
  const coveragePct = total > 0 ? ((withEmbedding / total) * 100).toFixed(1) : '0.0'

  return { coveragePct, total, withEmbedding }
}

function buildKnowledgeRows(doc: SeedDocument, chunks: string[], embeddings: number[][]): StoreKnowledgeInsert[] {
  return chunks.map((chunk, index) => {
    const embedding = embeddings[index]

    if (!embedding) {
      throw new Error(`${doc.source_id} chunk ${index + 1}/${chunks.length}: embedding missing before insert`)
    }

    return {
      category: doc.category,
      content: chunk,
      embedding,
      is_active: true,
      metadata: {
        api_version: 'v1',
        char_count: chunk.length,
        chunk_index: index,
        embedding_dims: EMBEDDING_DIMS,
        embedding_model: EMBEDDING_MODEL,
        overlap_chars: 100,
        source_filename: doc.source_filename,
        total_chunks: chunks.length,
      },
      source_id: doc.source_id,
      source_type: doc.source_type,
      title: chunks.length === 1 ? doc.title : `${doc.title} (${index + 1}/${chunks.length})`,
    }
  })
}

async function prepareReplacementRows(doc: SeedDocument, deps: Required<Pick<SeedRunnerDeps, 'generateEmbedding' | 'logger' | 'sleep'>>) {
  const chunks = chunkMarkdownText(doc.raw_text)
  const embeddings: number[][] = []
  const errors: string[] = []

  for (let index = 0; index < chunks.length; index += CHUNK_BATCH_SIZE) {
    const batch = chunks.slice(index, index + CHUNK_BATCH_SIZE)
    deps.logger.log(`  Generating embeddings for chunks ${index + 1}-${index + batch.length} of ${chunks.length}`)

    for (let offset = 0; offset < batch.length; offset += 1) {
      const chunkIndex = index + offset
      const chunk = batch[offset]

      if (!chunk) {
        errors.push(`${doc.source_id} chunk ${chunkIndex + 1}/${chunks.length}: chunk text missing`)
        continue
      }

      const embedding = await deps.generateEmbedding(chunk)

      if (!embedding) {
        errors.push(`${doc.source_id} chunk ${chunkIndex + 1}/${chunks.length}: embedding generation failed`)
        continue
      }

      embeddings[chunkIndex] = embedding
    }

    await deps.sleep(RATE_LIMIT_MS)
  }

  if (errors.length > 0 || embeddings.length !== chunks.length || embeddings.some((embedding) => !embedding)) {
    return { errors, rows: [] as StoreKnowledgeInsert[] }
  }

  return { errors, rows: buildKnowledgeRows(doc, chunks, embeddings) }
}

async function insertReplacementRows(supabase: SeedSupabaseClient, rows: StoreKnowledgeInsert[]) {
  const result = (await supabase.from('store_knowledge').insert(rows).select('id')) as QueryResult<Array<{ id?: string }>>

  if (result.error) {
    return { error: safeMessage(result.error), insertedIds: [] as string[] }
  }

  const insertedIds = (result.data ?? []).map((row) => row.id).filter((id): id is string => Boolean(id))

  if (insertedIds.length !== rows.length) {
    return {
      error: `Inserted ${rows.length} rows but received ${insertedIds.length} inserted row ids; leaving previous active rows untouched`,
      insertedIds,
    }
  }

  return { error: null, insertedIds }
}

async function deactivatePreviousRows(supabase: SeedSupabaseClient, sourceId: string, insertedIds: string[]) {
  let query = supabase
    .from('store_knowledge')
    .update({ is_active: false })
    .eq('source_id', sourceId)
    .eq('is_active', true)

  if (insertedIds.length > 0) {
    query = query.not('id', 'in', `(${insertedIds.join(',')})`)
  }

  const result = (await query) as QueryResult

  if (result.error) {
    return safeMessage(result.error)
  }

  return null
}

export async function runSeed(options: {
  deps: SeedRunnerDeps
  docs?: readonly SeedDocument[]
  resumeSourceId?: string | null
  sourceIds?: readonly string[] | null
}): Promise<SeedRunResult> {
  const availableDocs = options.docs ?? SEED_DOCUMENTS
  const requestedSourceIds = options.sourceIds?.map((sourceId) => sourceId.trim()).filter(Boolean) ?? null
  const requestedSourceIdSet = requestedSourceIds ? new Set(requestedSourceIds) : null
  const docs = requestedSourceIdSet
    ? availableDocs.filter((doc) => requestedSourceIdSet.has(doc.source_id))
    : availableDocs
  const logger = options.deps.logger ?? console
  const deps = {
    generateEmbedding: options.deps.generateEmbedding,
    logger,
    sleep: options.deps.sleep ?? sleep,
  }

  logger.log('Starting store knowledge seed runner')
  logger.log(`Documents available: ${availableDocs.length}`)
  if (requestedSourceIds) {
    logger.log(`Source allowlist: ${requestedSourceIds.join(', ')}`)
  }
  logger.log(`Embedding model: ${EMBEDDING_MODEL} (${EMBEDDING_DIMS}d)`)

  const preAudit = await coverageAudit(options.deps.supabase)
  logger.log(`Pre-run active coverage: ${preAudit.withEmbedding}/${preAudit.total} active rows have embeddings (${preAudit.coveragePct}%)`)

  let docsOk = 0
  let docsFailed = 0
  let processedDocs = 0
  const errors: string[] = []
  let resumeReached = !options.resumeSourceId

  if (requestedSourceIds) {
    const availableSourceIds = new Set(availableDocs.map((doc) => doc.source_id))
    const missingSourceIds = requestedSourceIds.filter((sourceId) => !availableSourceIds.has(sourceId))

    if (missingSourceIds.length > 0) {
      errors.push(`Unknown source_id in allowlist: ${missingSourceIds.join(', ')}`)
    }
  }

  for (const doc of docs) {
    if (errors.length > 0) {
      break
    }

    if (!resumeReached && doc.source_id !== options.resumeSourceId) {
      logger.log(`Skipping ${doc.source_id} until resume point ${options.resumeSourceId}`)
      continue
    }

    resumeReached = true
    processedDocs += 1
    logger.log(`\nProcessing ${doc.source_id}: ${doc.title}`)

    const prepared = await prepareReplacementRows(doc, deps)

    if (prepared.errors.length > 0 || prepared.rows.length === 0) {
      docsFailed += 1
      errors.push(...prepared.errors)
      if (prepared.rows.length === 0 && prepared.errors.length === 0) {
        errors.push(`${doc.source_id}: no replacement rows prepared`)
      }
      logger.warn(`  Skipping activation for ${doc.source_id}; previous active rows remain untouched`)
      continue
    }

    const inserted = await insertReplacementRows(options.deps.supabase, prepared.rows)

    if (inserted.error) {
      docsFailed += 1
      errors.push(`${doc.source_id}: ${inserted.error}`)
      logger.error(`  Insert failed for ${doc.source_id}; previous active rows remain untouched`)
      continue
    }

    const deactivationError = await deactivatePreviousRows(options.deps.supabase, doc.source_id, inserted.insertedIds)

    if (deactivationError) {
      docsFailed += 1
      errors.push(`${doc.source_id}: failed to deactivate previous rows after replacement insert: ${deactivationError}`)
      logger.error(`  Replacement rows inserted for ${doc.source_id}, but previous rows could not be deactivated`)
      continue
    }

    docsOk += 1
    logger.log(`  Inserted ${prepared.rows.length} active replacement chunks and deactivated previous rows for ${doc.source_id}`)
  }

  if (processedDocs === 0) {
    errors.push(
      options.resumeSourceId
        ? `No seed documents processed; resume source_id not found: ${options.resumeSourceId}`
        : requestedSourceIds
          ? `No seed documents processed for source allowlist: ${requestedSourceIds.join(', ')}`
          : 'No seed documents processed',
    )
  }

  const postAudit = await coverageAudit(options.deps.supabase)
  logger.log('\nSeed summary')
  logger.log(`Documents processed: ${processedDocs}`)
  logger.log(`Documents ok: ${docsOk}`)
  logger.log(`Documents failed: ${docsFailed}`)
  logger.log(`Active rows: ${postAudit.total}`)
  logger.log(`Active rows with embeddings: ${postAudit.withEmbedding}`)
  logger.log(`Embedding coverage: ${postAudit.coveragePct}%`)

  const failed =
    errors.length > 0 ||
    docsFailed > 0 ||
    processedDocs === 0 ||
    docsOk !== processedDocs ||
    postAudit.total === 0 ||
    postAudit.withEmbedding !== postAudit.total

  if (failed) {
    for (const error of errors) {
      logger.error(`  ERROR: ${error}`)
    }

    throw new Error(
      `Knowledge seed failed safety checks: docs_ok=${docsOk}, docs_failed=${docsFailed}, active_with_embedding=${postAudit.withEmbedding}/${postAudit.total}`,
    )
  }

  return {
    activeRows: postAudit.total,
    activeWithEmbedding: postAudit.withEmbedding,
    docsFailed,
    docsOk,
    errors,
    processedDocs,
  }
}

function isDirectRun() {
  const entry = process.argv[1]
  return Boolean(entry && path.resolve(entry) === __filename)
}

async function main() {
  dotenv.config({ path: path.join(__dirname, '../../.env') })

  const { geminiApiKey, serviceRoleKey, supabaseUrl } = assertRequiredEnv()
  const supabase = createClient(supabaseUrl, serviceRoleKey) as unknown as SeedSupabaseClient

  await runSeed({
    deps: {
      generateEmbedding: (text) => generateEmbedding(text, geminiApiKey),
      supabase,
    },
    resumeSourceId: parseResumeSourceId(),
    sourceIds: parseSourceIds(),
  })
}

if (isDirectRun()) {
  main().catch((error) => {
    console.error('Fatal seed runner error:', error)
    process.exit(1)
  })
}
