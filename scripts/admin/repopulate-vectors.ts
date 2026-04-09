import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GEMINI_API_VERSION,
  GEMINI_EMBEDDING_DIMENSIONALITY,
  GEMINI_EMBEDDING_MODEL,
} from '../../supabase/functions/_shared/gemini-api.ts';

type Scope = 'products' | 'knowledge' | 'both';
type RetryableFailureKind = 'http' | 'network' | 'timeout';

type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  status: string | null;
};

type KnowledgeRow = {
  id: string;
  title: string | null;
  content: string | null;
  source_id: string | null;
  is_active: boolean | null;
};

type EmbeddingInput = {
  title?: string;
  text: string;
  truncated: boolean;
};

type ScopeSummary = {
  scanned: number;
  attempted: number;
  succeeded: number;
  failed: number;
  truncated: number;
  remaining: number;
};

type ScriptConfig = {
  scope: Scope;
  dryRun: boolean;
  limit: number | null;
  paceMs: number;
  retryDelayMs: number;
  requestTimeoutMs: number;
  productTextLimit: number;
  knowledgeTextLimit: number;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const DEFAULT_SCOPE: Scope = 'both';
const DEFAULT_PACE_MS = 4500;
const DEFAULT_RETRY_DELAY_MS = 20000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_PRODUCT_TEXT_LIMIT = 1600;
const DEFAULT_KNOWLEDGE_TEXT_LIMIT = 3200;
const MAX_ATTEMPTS_PER_ROW = 2;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error(
    'Missing environment variables. Need SUPABASE URL, SUPABASE SERVICE ROLE KEY, and GEMINI API KEY.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseArgs(argv: string[]): ScriptConfig {
  let scope: Scope = DEFAULT_SCOPE;
  let dryRun = false;
  let limit: number | null = null;
  let paceMs = DEFAULT_PACE_MS;
  let retryDelayMs = DEFAULT_RETRY_DELAY_MS;
  let requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS;
  let productTextLimit = DEFAULT_PRODUCT_TEXT_LIMIT;
  let knowledgeTextLimit = DEFAULT_KNOWLEDGE_TEXT_LIMIT;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = argv[i + 1];

    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--scope' && value) {
      if (value !== 'products' && value !== 'knowledge' && value !== 'both') {
        throw new Error(`Invalid --scope value: ${value}`);
      }
      scope = value;
      i++;
      continue;
    }

    if (arg === '--limit' && value) {
      limit = parsePositiveInteger(value, '--limit');
      i++;
      continue;
    }

    if (arg === '--pace-ms' && value) {
      paceMs = parsePositiveInteger(value, '--pace-ms');
      i++;
      continue;
    }

    if (arg === '--retry-delay-ms' && value) {
      retryDelayMs = parsePositiveInteger(value, '--retry-delay-ms');
      i++;
      continue;
    }

    if (arg === '--request-timeout-ms' && value) {
      requestTimeoutMs = parsePositiveInteger(value, '--request-timeout-ms');
      i++;
      continue;
    }

    if (arg === '--product-text-limit' && value) {
      productTextLimit = parsePositiveInteger(value, '--product-text-limit');
      i++;
      continue;
    }

    if (arg === '--knowledge-text-limit' && value) {
      knowledgeTextLimit = parsePositiveInteger(value, '--knowledge-text-limit');
      i++;
      continue;
    }

    if (arg === '--help') {
      printHelpAndExit();
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    scope,
    dryRun,
    limit,
    paceMs,
    retryDelayMs,
    requestTimeoutMs,
    productTextLimit,
    knowledgeTextLimit,
  };
}

function parsePositiveInteger(raw: string, label: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

function printHelpAndExit(): never {
  console.log(`
Usage:
  npx tsx scripts/admin/repopulate-vectors.ts [options]

Options:
  --dry-run                    Show pending counts without writing embeddings
  --scope products|knowledge|both
  --limit N                    Process at most N pending rows per scope
  --pace-ms N                  Fixed wait after each processed row (default: ${DEFAULT_PACE_MS})
  --retry-delay-ms N           Cooldown before a single retryable row retry (default: ${DEFAULT_RETRY_DELAY_MS})
  --request-timeout-ms N       Timeout per Gemini request (default: ${DEFAULT_REQUEST_TIMEOUT_MS})
  --product-text-limit N       Max chars for product embedding input (default: ${DEFAULT_PRODUCT_TEXT_LIMIT})
  --knowledge-text-limit N     Max chars for knowledge embedding input (default: ${DEFAULT_KNOWLEDGE_TEXT_LIMIT})
  --help
`);
  process.exit(0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function truncateText(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }
  return { text: text.slice(0, maxChars).trim(), truncated: true };
}

function buildProductEmbeddingInput(row: ProductRow, maxChars: number): EmbeddingInput {
  const name = normalizeText(row.name);
  const description = normalizeText(row.description);
  const base = [name, description].filter(Boolean).join('\n\n').trim();

  if (!base) {
    throw new Error('Product row has no usable text');
  }

  const truncated = truncateText(base, maxChars);
  return {
    title: name || undefined,
    text: truncated.text,
    truncated: truncated.truncated,
  };
}

function buildKnowledgeEmbeddingInput(row: KnowledgeRow, maxChars: number): EmbeddingInput {
  const title = normalizeText(row.title);
  const content = normalizeText(row.content);
  const base = [title, content].filter(Boolean).join('\n\n').trim();

  if (!base) {
    throw new Error('Knowledge row has no usable text');
  }

  const truncated = truncateText(base, maxChars);
  return {
    title: title || row.source_id || undefined,
    text: truncated.text,
    truncated: truncated.truncated,
  };
}

async function parseGeminiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error?.message || `Gemini HTTP ${response.status}`;
  } catch {
    return (await response.text()) || `Gemini HTTP ${response.status}`;
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as { name?: string }).name === 'AbortError');
}

async function fetchEmbeddingWithTimeout(input: {
  apiKey: string;
  text: string;
  title?: string;
  taskType: 'RETRIEVAL_DOCUMENT';
  timeoutMs: number;
}): Promise<number[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${input.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBEDDING_MODEL}`,
          content: { parts: [{ text: input.text }] },
          title: input.title,
          taskType: input.taskType,
          outputDimensionality: GEMINI_EMBEDDING_DIMENSIONALITY,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const message = await parseGeminiError(response);
      const error = new Error(message) as Error & { retryable?: boolean; status?: number; failureKind?: RetryableFailureKind };
      error.retryable = isRetryableStatus(response.status);
      error.status = response.status;
      error.failureKind = 'http';
      throw error;
    }

    const result = await response.json();
    const embedding = result?.embedding?.values;

    if (!Array.isArray(embedding) || embedding.length !== GEMINI_EMBEDDING_DIMENSIONALITY) {
      throw new Error(
        `Gemini embedding dimension mismatch: expected ${GEMINI_EMBEDDING_DIMENSIONALITY}, got ${Array.isArray(embedding) ? embedding.length : 'none'}`,
      );
    }

    if (embedding.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
      throw new Error('Gemini embedding response included non-numeric values');
    }

    return embedding as number[];
  } catch (error) {
    if (isAbortError(error)) {
      const abortError = new Error(`Embedding request timed out after ${input.timeoutMs}ms`) as Error & {
        retryable?: boolean;
        failureKind?: RetryableFailureKind;
      };
      abortError.name = 'AbortError';
      abortError.retryable = true;
      abortError.failureKind = 'timeout';
      throw abortError;
    }

    if (error instanceof Error) {
      const typedError = error as Error & { retryable?: boolean; failureKind?: RetryableFailureKind };
      typedError.retryable = typedError.retryable ?? true;
      typedError.failureKind = typedError.failureKind ?? 'network';
      throw typedError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function embedRowWithMinimalRetry(input: {
  apiKey: string;
  text: string;
  title?: string;
  timeoutMs: number;
  retryDelayMs: number;
  rowLabel: string;
}): Promise<number[]> {
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS_PER_ROW) {
    try {
      return await fetchEmbeddingWithTimeout({
        apiKey: input.apiKey,
        text: input.text,
        title: input.title,
        taskType: 'RETRIEVAL_DOCUMENT',
        timeoutMs: input.timeoutMs,
      });
    } catch (error) {
      attempt++;
      const typedError = error as Error & { retryable?: boolean; status?: number };

      if (!typedError.retryable || attempt >= MAX_ATTEMPTS_PER_ROW) {
        throw error;
      }

      const reason =
        typedError.status === 429
          ? '429'
          : typedError.status
            ? `HTTP ${typedError.status}`
            : typedError.name === 'AbortError'
              ? 'timeout'
              : 'network';

      console.warn(
        `[retry] ${input.rowLabel} failed with ${reason}. Cooling down ${input.retryDelayMs}ms before final retry (${attempt}/${MAX_ATTEMPTS_PER_ROW - 1}).`,
      );
      await sleep(input.retryDelayMs);
    }
  }

  throw new Error(`Unexpected retry loop exit for ${input.rowLabel}`);
}

async function fetchPendingProducts(limit: number | null): Promise<ProductRow[]> {
  let query = supabase
    .from('products')
    .select('id, name, description, status')
    .eq('status', 'active')
    .is('embedding', null)
    .order('id', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

async function fetchPendingKnowledge(limit: number | null): Promise<KnowledgeRow[]> {
  let query = supabase
    .from('store_knowledge')
    .select('id, title, content, source_id, is_active')
    .eq('is_active', true)
    .is('embedding', null)
    .order('id', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as KnowledgeRow[];
}

async function countRemainingProducts(): Promise<number> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('embedding', null);

  if (error) throw error;
  return count ?? 0;
}

async function countRemainingKnowledge(): Promise<number> {
  const { count, error } = await supabase
    .from('store_knowledge')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .is('embedding', null);

  if (error) throw error;
  return count ?? 0;
}

function createEmptySummary(scanned: number): ScopeSummary {
  return {
    scanned,
    attempted: 0,
    succeeded: 0,
    failed: 0,
    truncated: 0,
    remaining: scanned,
  };
}

async function processProducts(config: ScriptConfig): Promise<ScopeSummary> {
  const rows = await fetchPendingProducts(config.limit);
  const summary = createEmptySummary(rows.length);

  console.log(`\n[products] pending active rows with null embedding: ${rows.length}`);
  if (rows.length === 0 || config.dryRun) {
    summary.remaining = await countRemainingProducts();
    return summary;
  }

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const label = row.name || row.id;
    console.log(`\n[products ${index + 1}/${rows.length}] ${label}`);

    try {
      const embeddingInput = buildProductEmbeddingInput(row, config.productTextLimit);
      summary.attempted++;
      if (embeddingInput.truncated) {
        summary.truncated++;
        console.warn(`  truncated input to ${config.productTextLimit} chars`);
      }

      const embedding = await embedRowWithMinimalRetry({
        apiKey: GEMINI_API_KEY!,
        text: embeddingInput.text,
        title: embeddingInput.title,
        timeoutMs: config.requestTimeoutMs,
        retryDelayMs: config.retryDelayMs,
        rowLabel: `product:${row.id}`,
      });

      const { error } = await supabase
        .from('products')
        .update({ embedding })
        .eq('id', row.id);

      if (error) {
        throw error;
      }

      summary.succeeded++;
      console.log(`  ok (${embedding.length}d)`);
    } catch (error) {
      summary.failed++;
      console.error(`  failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    await sleep(config.paceMs);
  }

  summary.remaining = await countRemainingProducts();
  return summary;
}

async function processKnowledge(config: ScriptConfig): Promise<ScopeSummary> {
  const rows = await fetchPendingKnowledge(config.limit);
  const summary = createEmptySummary(rows.length);

  console.log(`\n[store_knowledge] pending active rows with null embedding: ${rows.length}`);
  if (rows.length === 0 || config.dryRun) {
    summary.remaining = await countRemainingKnowledge();
    return summary;
  }

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const label = row.title || row.source_id || row.id;
    console.log(`\n[store_knowledge ${index + 1}/${rows.length}] ${label}`);

    try {
      const embeddingInput = buildKnowledgeEmbeddingInput(row, config.knowledgeTextLimit);
      summary.attempted++;
      if (embeddingInput.truncated) {
        summary.truncated++;
        console.warn(`  truncated input to ${config.knowledgeTextLimit} chars`);
      }

      const embedding = await embedRowWithMinimalRetry({
        apiKey: GEMINI_API_KEY!,
        text: embeddingInput.text,
        title: embeddingInput.title,
        timeoutMs: config.requestTimeoutMs,
        retryDelayMs: config.retryDelayMs,
        rowLabel: `knowledge:${row.id}`,
      });

      const { error } = await supabase
        .from('store_knowledge')
        .update({ embedding })
        .eq('id', row.id);

      if (error) {
        throw error;
      }

      summary.succeeded++;
      console.log(`  ok (${embedding.length}d)`);
    } catch (error) {
      summary.failed++;
      console.error(`  failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    await sleep(config.paceMs);
  }

  summary.remaining = await countRemainingKnowledge();
  return summary;
}

function logSummary(
  label: string,
  summary: ScopeSummary,
) {
  console.log(`\n[summary:${label}]`);
  console.log(`  scanned:   ${summary.scanned}`);
  console.log(`  attempted: ${summary.attempted}`);
  console.log(`  succeeded: ${summary.succeeded}`);
  console.log(`  failed:    ${summary.failed}`);
  console.log(`  truncated: ${summary.truncated}`);
  console.log(`  remaining null rows: ${summary.remaining}`);
}

async function run(): Promise<void> {
  const config = parseArgs(process.argv.slice(2));
  const projectHost = new URL(SUPABASE_URL!).host;

  console.log('Vector repopulation admin script');
  console.log(`  project:            ${projectHost}`);
  console.log(`  scope:              ${config.scope}`);
  console.log(`  dry_run:            ${config.dryRun}`);
  console.log(`  pace_ms:            ${config.paceMs}`);
  console.log(`  retry_delay_ms:     ${config.retryDelayMs}`);
  console.log(`  request_timeout_ms: ${config.requestTimeoutMs}`);
  console.log(`  embedding_model:    ${GEMINI_EMBEDDING_MODEL}`);
  console.log(`  embedding_dims:     ${GEMINI_EMBEDDING_DIMENSIONALITY}`);
  if (config.limit) {
    console.log(`  per_scope_limit:    ${config.limit}`);
  }

  const productSummary =
    config.scope === 'knowledge' ? createEmptySummary(0) : await processProducts(config);
  const knowledgeSummary =
    config.scope === 'products' ? createEmptySummary(0) : await processKnowledge(config);

  logSummary('products', productSummary);
  logSummary('store_knowledge', knowledgeSummary);

  const totalSummary: ScopeSummary = {
    scanned: productSummary.scanned + knowledgeSummary.scanned,
    attempted: productSummary.attempted + knowledgeSummary.attempted,
    succeeded: productSummary.succeeded + knowledgeSummary.succeeded,
    failed: productSummary.failed + knowledgeSummary.failed,
    truncated: productSummary.truncated + knowledgeSummary.truncated,
    remaining: productSummary.remaining + knowledgeSummary.remaining,
  };

  logSummary('total', totalSummary);

  if (config.dryRun) {
    console.log('\nDry-run only. No embeddings were written.');
  } else if (totalSummary.remaining === 0) {
    console.log('\nAll active null embeddings are now hydrated.');
  } else {
    console.log('\nRe-run the same command later. The script is resumable because it only targets rows where embedding is still null.');
  }
}

run().catch((error) => {
  console.error(`Fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
