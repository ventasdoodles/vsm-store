/**
 * llm-provider.ts
 *
 * Resilient Multi-provider LLM Adapter for VSM Store Edge Functions.
 * Hardened following Sol Pro Maniacal Audit & Claude Opus 5.5 Panoramic Architectural Dictamen.
 * 
 * Features:
 * - Primary: OpenRouter Chat Completions (openai/gpt-6-luna-pro)
 *   - Compatible with OpenAI Chat Completions protocol
 *   - Native prompt caching prefix support
 *   - reasoning_effort: 'low' for snappy concierge responses
 *   - Decoupled attempt timeouts (does NOT exhaust caller turn budget)
 *   - Streaming with pre-first-token fallback to Gemini
 *   - SSE frame decoding with proper split handling and trailing buffer flush
 *   - Upstream cancellation propagation (prevents token/cost leak on user disconnect)
 *   - Sync completion schema validation (rejects empty/truncated/non-JSON outputs)
 *   - Fast circuit breaker for 401/403/404 configuration errors
 * - Resilient Fallback: Google Gemini API (gemini-api.ts)
 *   - Guaranteed execution budget when OpenRouter fails, times out, or disconnects
 * - Isolated Embeddings:
 *   - Embeddings ALWAYS use geminiEmbedText with gemini-embedding-001 (768 dimensions)
 *     to preserve PostgreSQL pgvector index compatibility.
 */

import {
  geminiGenerateContent,
  geminiStreamGenerateContent,
  geminiEmbedText,
  GEMINI_EMBEDDING_MODEL,
  GEMINI_EMBEDDING_DIMENSIONALITY,
} from './gemini-api.ts';

export { geminiEmbedText, GEMINI_EMBEDDING_MODEL, GEMINI_EMBEDDING_DIMENSIONALITY };

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-6-luna-pro';

export type ProviderErrorKind =
  | 'config'          // 401/403/404: bad api key, unauthorized, model not found
  | 'invalid_request' // 400/422: unsupported params
  | 'transient'       // 408/429/5xx: rate limit or network issue
  | 'timeout'         // attempt timeout (NOT caller abort)
  | 'empty'           // empty completion or 0 deltas
  | 'malformed'       // invalid JSON or missing text field
  | 'truncated'       // finish_reason: length
  | 'upstream_error'  // SSE frame {"error": ...}
  | 'content_filter'; // finish_reason: content_filter

export class ProviderError extends Error {
  constructor(
    public kind: ProviderErrorKind,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export function classifyStatus(status: number): ProviderErrorKind {
  if (status === 401 || status === 403 || status === 404) return 'config';
  if (status === 400 || status === 422) return 'invalid_request';
  return 'transient';
}

// ── In-Memory Circuit Breaker for Edge Function Isolate ──
const breaker = { openUntil: 0 };
export const isBreakerOpen = () => Date.now() < breaker.openUntil;
export function tripBreaker(kind: ProviderErrorKind) {
  if (kind === 'config' || kind === 'invalid_request') {
    breaker.openUntil = Date.now() + 5 * 60_000; // 5 min cooldown
  }
}
export function resetBreaker() {
  breaker.openUntil = 0;
}

export interface LlmChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  signal?: AbortSignal;
  primaryAttemptTimeoutMs?: number; // timeout for OpenRouter attempt, defaults to 8000ms
  geminiFallback: {
    apiKey: string;
    model: string;
    body: Record<string, unknown>;
  };
}

export interface LlmProviderTelemetryMetadata {
  provider: 'openrouter' | 'gemini';
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cached_tokens?: number;
  cache_hit?: boolean;
  latency_ms: number;
}

function getEnv(key: string): string | undefined {
  const denoGlobal = (globalThis as unknown as { Deno?: { env?: { get: (k: string) => string | undefined } } }).Deno;
  if (denoGlobal?.env?.get) {
    return denoGlobal.env.get(key);
  }
  const nodeEnv = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  if (nodeEnv) {
    return nodeEnv[key];
  }
  return undefined;
}

/**
 * Returns true if an OpenRouter API key is configured in the environment.
 */
export function isOpenRouterConfigured(): boolean {
  const key = getEnv('OPENROUTER_API_KEY');
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * Resolves the active model to request from OpenRouter.
 */
export function getOpenRouterModel(): string {
  return getEnv('CONCIERGE_LLM_MODEL')?.trim() || DEFAULT_OPENROUTER_MODEL;
}

/**
 * Creates an attempt signal with an isolated timeout, decoupling the primary attempt
 * from the parent caller abort signal.
 */
export function createAttemptSignal(
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void; isParentAbort: () => boolean } {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new ProviderError('timeout', `Attempt timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  const onParentAbort = () => {
    controller.abort(parentSignal?.reason);
  };

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort(parentSignal.reason);
    } else {
      parentSignal.addEventListener('abort', onParentAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (parentSignal) {
        parentSignal.removeEventListener('abort', onParentAbort);
      }
    },
    isParentAbort: () => Boolean(parentSignal?.aborted),
  };
}

/**
 * Validates a non-streaming OpenRouter response JSON.
 * Throws ProviderError if truncated, empty, malformed, or missing valid text.
 */
export function validateCompletion(result: any): string {
  const choice = result?.choices?.[0];
  if (choice?.finish_reason === 'length') {
    throw new ProviderError('truncated', 'Generation exceeded max tokens');
  }
  if (choice?.finish_reason === 'content_filter') {
    throw new ProviderError('content_filter', 'Filtered by upstream provider');
  }

  const content = choice?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new ProviderError('empty', 'Empty content returned by provider');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderError('malformed', 'Content is not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ProviderError('malformed', 'Content is not a JSON object');
  }

  const text = parsed.text || parsed.message;
  if (typeof text !== 'string' || !text.trim()) {
    throw new ProviderError('malformed', 'JSON response missing valid text field');
  }

  return content;
}

/**
 * Robust async generator yielding SSE event data strings from a ReadableStream.
 * Correctly handles split frames, multi-line events, comments, and flushes trailing buffer.
 * Automatically propagates cancellation to upstream reader when consumer exits.
 */
export async function* sseData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let idx: number;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const event = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const data = event
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trimStart())
          .join('\n');
        if (data) yield data;
      }
    }

    // Flush tail buffer if stream ended without trailing double newline
    const tail = buf
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trimStart())
      .join('\n');
    if (tail) yield tail;
  } finally {
    await reader.cancel().catch(() => {});
  }
}

/**
 * Async generator yielding content deltas from an OpenRouter SSE stream.
 * Detects upstream errors, content filtering, and truncation.
 */
export async function* openRouterDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  let sawDone = false;
  let finishReason: string | null = null;

  for await (const data of sseData(body)) {
    if (data === '[DONE]') {
      sawDone = true;
      break;
    }

    let frame: any;
    try {
      frame = JSON.parse(data);
    } catch {
      throw new ProviderError('malformed', 'SSE frame is not valid JSON');
    }

    if (frame.error) {
      throw new ProviderError('upstream_error', frame.error.message || 'Upstream stream error');
    }

    const choice = frame.choices?.[0];
    if (choice?.finish_reason) {
      finishReason = choice.finish_reason;
    }

    const delta = choice?.delta?.content;
    if (typeof delta === 'string' && delta.length > 0) {
      yield delta;
    }
  }

  if (finishReason === 'length') {
    throw new ProviderError('truncated', 'Max tokens reached');
  }
  if (finishReason === 'content_filter') {
    throw new ProviderError('content_filter', 'Filtered by upstream provider');
  }
  if (!sawDone && !finishReason) {
    throw new ProviderError('truncated', 'Stream closed without terminal frame');
  }
}

/**
 * Executes a non-streaming LLM completion with automatic fallback to Gemini.
 */
export async function generateLlmCompletion(
  options: LlmCompletionOptions,
): Promise<{
  response: Response;
  data: Record<string, unknown>;
  rawText: string;
  telemetry: LlmProviderTelemetryMetadata;
}> {
  const startTime = Date.now();
  const openRouterKey = getEnv('OPENROUTER_API_KEY')?.trim();
  const primaryTimeoutMs = options.primaryAttemptTimeoutMs ?? 8000;

  if (openRouterKey && !isBreakerOpen()) {
    const model = getOpenRouterModel();
    const messages: LlmChatMessage[] = [
      { role: 'system', content: options.systemPrompt },
      ...(options.history || []).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: options.userPrompt },
    ];

    const attempt = createAttemptSignal(options.signal, primaryTimeoutMs);
    try {
      const openRouterRes = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://vsmstore.com',
          'X-Title': 'VSM Store Concierge Cesarin',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.4,
          response_format: { type: 'json_object' },
          reasoning_effort: options.reasoningEffort ?? 'low',
        }),
        signal: attempt.signal,
      });

      if (!openRouterRes.ok) {
        const kind = classifyStatus(openRouterRes.status);
        tripBreaker(kind);
        throw new ProviderError(kind, `HTTP ${openRouterRes.status}`, openRouterRes.status);
      }

      const result = await openRouterRes.json();
      const rawContent = validateCompletion(result);
      attempt.cleanup();

      const cachedTokens = result.usage?.prompt_tokens_details?.cached_tokens ?? 0;
      const latencyMs = Date.now() - startTime;

      const normalizedData: Record<string, unknown> = {
        candidates: [
          {
            content: {
              parts: [{ text: rawContent }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: result.usage?.prompt_tokens ?? 0,
          candidatesTokenCount: result.usage?.completion_tokens ?? 0,
          totalTokenCount: result.usage?.total_tokens ?? 0,
          cachedContentTokenCount: cachedTokens,
        },
        provider: 'openrouter',
        model: result.model || model,
      };

      return {
        response: openRouterRes,
        data: normalizedData,
        rawText: rawContent,
        telemetry: {
          provider: 'openrouter',
          model: result.model || model,
          prompt_tokens: result.usage?.prompt_tokens,
          completion_tokens: result.usage?.completion_tokens,
          total_tokens: result.usage?.total_tokens,
          cached_tokens: cachedTokens,
          cache_hit: cachedTokens > 0,
          latency_ms: latencyMs,
        },
      };
    } catch (err: unknown) {
      attempt.cleanup();
      if (attempt.isParentAbort()) {
        throw err;
      }
      console.warn(JSON.stringify({
        event: 'openrouter_generate_fallback',
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }));
    }
  }

  // ═══ FALLBACK: GOOGLE GEMINI ═══
  const geminiRes = await geminiGenerateContent({
    apiKey: options.geminiFallback.apiKey,
    model: options.geminiFallback.model,
    body: options.geminiFallback.body as any,
    signal: options.signal,
  });

  const latencyMs = Date.now() - startTime;
  let geminiData: Record<string, unknown> = {};
  let rawText = '{}';

  if (geminiRes.ok) {
    geminiData = await geminiRes.json();
    rawText = (geminiData as any)?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  }

  return {
    response: geminiRes,
    data: geminiData,
    rawText,
    telemetry: {
      provider: 'gemini',
      model: options.geminiFallback.model,
      prompt_tokens: (geminiData as any)?.usageMetadata?.promptTokenCount,
      completion_tokens: (geminiData as any)?.usageMetadata?.candidatesTokenCount,
      total_tokens: (geminiData as any)?.usageMetadata?.totalTokenCount,
      cached_tokens: (geminiData as any)?.usageMetadata?.cachedContentTokenCount ?? 0,
      cache_hit: ((geminiData as any)?.usageMetadata?.cachedContentTokenCount ?? 0) > 0,
      latency_ms: latencyMs,
    },
  };
}

/**
 * Executes a streaming LLM completion with automatic fallback to Gemini.
 * Uses pre-first-token commitment: if OpenRouter disconnects, errors, or fails to emit
 * valid content deltas, it cleanly falls back to Gemini before the client stream is locked.
 */
export async function streamLlmCompletion(
  options: LlmCompletionOptions,
): Promise<Response> {
  const openRouterKey = getEnv('OPENROUTER_API_KEY')?.trim();
  const primaryTimeoutMs = options.primaryAttemptTimeoutMs ?? 8000;

  if (openRouterKey && !isBreakerOpen()) {
    const model = getOpenRouterModel();
    const messages: LlmChatMessage[] = [
      { role: 'system', content: options.systemPrompt },
      ...(options.history || []).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: options.userPrompt },
    ];

    const attempt = createAttemptSignal(options.signal, primaryTimeoutMs);
    try {
      const openRouterStreamRes = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://vsmstore.com',
          'X-Title': 'VSM Store Concierge Cesarin',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.4,
          response_format: { type: 'json_object' },
          reasoning_effort: options.reasoningEffort ?? 'low',
          stream: true,
        }),
        signal: attempt.signal,
      });

      if (!openRouterStreamRes.ok || !openRouterStreamRes.body) {
        const kind = classifyStatus(openRouterStreamRes.status);
        tripBreaker(kind);
        throw new ProviderError(kind, `HTTP ${openRouterStreamRes.status}`, openRouterStreamRes.status);
      }

      // Read until first valid delta before committing to OpenRouter
      const deltaIterator = openRouterDeltas(openRouterStreamRes.body)[Symbol.asyncIterator]();
      const firstChunk = await deltaIterator.next();

      if (firstChunk.done || typeof firstChunk.value !== 'string' || firstChunk.value.length === 0) {
        throw new ProviderError('empty', 'OpenRouter stream completed without emitting content deltas');
      }

      attempt.cleanup();

      // ═══ FIRST TOKEN RECEIVED: WE ARE COMMITTED TO OPENROUTER ═══
      const encoder = new TextEncoder();
      const toGeminiSseChunk = (text: string) => {
        const chunkObj = {
          candidates: [
            {
              content: {
                parts: [{ text }],
              },
            },
          ],
        };
        return encoder.encode(`data: ${JSON.stringify(chunkObj)}\n\n`);
      };

      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(toGeminiSseChunk(firstChunk.value));
        },
        async pull(controller) {
          try {
            const { value, done } = await deltaIterator.next();
            if (done) {
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
              return;
            }
            controller.enqueue(toGeminiSseChunk(value));
          } catch (err: unknown) {
            console.error('[OpenRouter Stream Error after first token]:', err);
            controller.close();
          }
        },
        async cancel() {
          await deltaIterator.return?.(undefined);
        },
      });

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'X-VSM-LLM-Provider': 'openrouter',
          'X-VSM-LLM-Model': model,
        },
      });
    } catch (err: unknown) {
      attempt.cleanup();
      if (attempt.isParentAbort()) {
        throw err;
      }
      console.warn(JSON.stringify({
        event: 'openrouter_stream_fallback',
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }));
    }
  }

  // ═══ FALLBACK: GOOGLE GEMINI SSE ═══
  return geminiStreamGenerateContent({
    apiKey: options.geminiFallback.apiKey,
    model: options.geminiFallback.model,
    body: options.geminiFallback.body as any,
    signal: options.signal,
  });
}
