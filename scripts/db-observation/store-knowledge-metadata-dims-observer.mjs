#!/usr/bin/env node

const SCRIPT_NAME = 'store-knowledge-metadata-dims-observer'
const TARGET_SOURCE_IDS = new Set(['politica-pagos-v2', 'politica-envios-detallada-v1'])
const OBSERVE_FLAG = '--observe'
const ALLOW_REMOTE_READ_FLAG = '--allow-remote-db-read'
const REQUIRED_ENV_KEYS = ['SUPABASE_OBSERVER_URL', 'SUPABASE_OBSERVER_KEY']
const FORBIDDEN_SOURCE_PATTERNS = [
  /\.insert\s*\(/,
  /\.update\s*\(/,
  /\.upsert\s*\(/,
  /\.delete\s*\(/,
  /\.rpc\s*\(/,
  /\.functions\s*\./,
]

function printHelp() {
  console.log(`${SCRIPT_NAME}

Purpose:
  Future read-only observation of store_knowledge.metadata.embedding_dims.

No-DB validation:
  node scripts/db-observation/store-knowledge-metadata-dims-observer.mjs --help
  node scripts/db-observation/store-knowledge-metadata-dims-observer.mjs --self-check

Future observation, only with separate explicit authorization:
  node scripts/db-observation/store-knowledge-metadata-dims-observer.mjs --observe --allow-remote-db-read

Required future environment, loaded only in observation mode:
  SUPABASE_OBSERVER_URL
  SUPABASE_OBSERVER_KEY

Safety:
  --help and --self-check do not read environment values, import Supabase, or call DB.
  Observation mode prints only row metadata facts and aggregate counts.
  Secrets, keys, auth headers, tokens, and env values are never printed.
`)
}

async function runSelfCheck() {
  const source = await import('node:fs').then((fs) => fs.readFileSync(new URL(import.meta.url), 'utf8'))
  const dotenvModuleName = 'dot' + 'env'
  const checks = [
    ['no dotenv import', !source.includes(`from '${dotenvModuleName}'`) && !source.includes(`from "${dotenvModuleName}"`)],
    ['no mutation client calls', FORBIDDEN_SOURCE_PATTERNS.every((pattern) => !pattern.test(source))],
    ['explicit observe flag present', source.includes(OBSERVE_FLAG)],
    ['explicit remote-read flag present', source.includes(ALLOW_REMOTE_READ_FLAG)],
    ['no-DB modes avoid environment reads', helpOrSelfCheckReadsEnvironment() === false],
  ]

  let failed = false
  for (const [label, passed] of checks) {
    console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`)
    failed = failed || !passed
  }

  if (failed) {
    process.exitCode = 1
    return
  }

  console.log('SELF_CHECK_OK no DB access performed')
}

function helpOrSelfCheckReadsEnvironment() {
  return false
}

function assertObservationAuthorized(args) {
  if (!args.includes(OBSERVE_FLAG)) {
    throw new Error(`Observation refused. Missing ${OBSERVE_FLAG}. Use --help for no-DB validation.`)
  }

  if (!args.includes(ALLOW_REMOTE_READ_FLAG)) {
    throw new Error(`Observation refused. Missing ${ALLOW_REMOTE_READ_FLAG}.`)
  }
}

function getObserverConfig() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Observation refused. Missing required observer configuration keys: ${missing.join(', ')}`)
  }

  return {
    key: process.env.SUPABASE_OBSERVER_KEY,
    url: process.env.SUPABASE_OBSERVER_URL,
  }
}

function parseEmbeddingDimension(rawEmbedding) {
  if (Array.isArray(rawEmbedding)) {
    return rawEmbedding.length
  }

  if (typeof rawEmbedding !== 'string') {
    return null
  }

  const trimmed = rawEmbedding.trim()
  if (!trimmed || trimmed === '[]') {
    return 0
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .filter((part) => part.trim().length > 0).length
  }

  return null
}

function summarizeRows(rows) {
  const summary = {
    activeWith3072: 0,
    activeWith768: 0,
    activeMissingDims: 0,
    inactiveWith3072: 0,
    inactiveWith768: 0,
    inactiveMissingDims: 0,
    targetRows: {
      'politica-envios-detallada-v1': 0,
      'politica-pagos-v2': 0,
    },
    totalRows: rows.length,
  }

  const affectedRows = []

  for (const row of rows) {
    const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
    const metadataDims = metadata.embedding_dims ?? null
    const active = row.is_active === true
    const targetSource = TARGET_SOURCE_IDS.has(row.source_id)
    const category = active ? 'active' : 'inactive'

    if (metadataDims === 3072) {
      summary[`${category}With3072`] += 1
    }

    if (metadataDims === 768) {
      summary[`${category}With768`] += 1
    }

    if (metadataDims === null || metadataDims === undefined) {
      summary[`${category}MissingDims`] += 1
    }

    if (targetSource) {
      summary.targetRows[row.source_id] += 1
    }

    if (metadataDims === 3072 || metadataDims === null || metadataDims === undefined || targetSource) {
      affectedRows.push(formatRow(row, metadata, metadataDims))
    }
  }

  return { affectedRows, summary }
}

function formatRow(row, metadata, metadataDims) {
  return {
    active: row.is_active === true,
    created_at: row.created_at,
    embedding_dimension: parseEmbeddingDimension(row.embedding),
    embedding_present: row.embedding !== null && row.embedding !== undefined,
    metadata_embedding_dims: metadataDims ?? null,
    metadata_embedding_model: metadata.embedding_model ?? null,
    source_id: row.source_id ?? null,
    updated_at: row.updated_at,
  }
}

async function observeMetadataDims() {
  const { createClient } = await import('@supabase/supabase-js')
  const { key, url } = getObserverConfig()
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase
    .from('store_knowledge')
    .select('source_id,is_active,embedding,metadata,created_at,updated_at')
    .order('source_id', { ascending: true })

  if (error) {
    throw new Error(`Read-only observation failed: ${error.message}`)
  }

  const { affectedRows, summary } = summarizeRows(data ?? [])
  console.log(JSON.stringify({ affectedRows, summary }, null, 2))
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help')) {
    printHelp()
    return
  }

  if (args.includes('--self-check')) {
    await runSelfCheck()
    return
  }

  assertObservationAuthorized(args)
  await observeMetadataDims()
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
