/**
 * llm-provider.ts
 *
 * Multi-provider LLM Adapter for VSM Store Edge Functions.
 * 
 * Supports:
 * - Primary: OpenRouter Chat Completions (openai/gpt-6-luna-pro)
 *   - Compatible with OpenAI Chat Completions protocol
 *   - Native prompt caching prefix support
 *   - reasoning_effort: 'low' for snappy concierge responses
 *   - Streaming SSE transformation into unified format
 * - Resilient Fallback: Google Gemini API (gemini-api.ts)
 *   - Automatically activates if OPENROUTER_API_KEY is missing or on 4xx/5xx/network errors
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

/**
 * Returns true if an OpenRouter API key is configured in the environment.
 */
export function isOpenRouterConfigured(): boolean {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * Resolves the active model to request from OpenRouter.
 */
export function getOpenRouterModel(): string {
  return Deno.env.get('CONCIERGE_LLM_MODEL')?.trim() || DEFAULT_OPENROUTER_MODEL;
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
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')?.trim();

  if (openRouterKey) {
    const model = getOpenRouterModel();
    const messages: LlmChatMessage[] = [
      { role: 'system', content: options.systemPrompt },
      ...(options.history || []).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: options.userPrompt },
    ];

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
        signal: options.signal,
      });

      if (openRouterRes.ok) {
        const result = await openRouterRes.json();
        const rawContent = result.choices?.[0]?.message?.content || '{}';
        const cachedTokens = result.usage?.prompt_tokens_details?.cached_tokens ?? 0;
        const latencyMs = Date.now() - startTime;

        // Wrap in Gemini-compatible candidate shape for downstream consumers
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
      }

      console.warn(JSON.stringify({
        event: 'openrouter_fallback_trigger',
        status: openRouterRes.status,
        message: 'OpenRouter non-OK response, falling back to Gemini',
        timestamp: new Date().toISOString(),
      }));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      console.warn(JSON.stringify({
        event: 'openrouter_network_fallback',
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
 * Returns a Response whose body is an SSE stream emitting Gemini-compatible candidate chunks
 * so the downstream reader handles incremental "text" events without changes.
 */
export async function streamLlmCompletion(
  options: LlmCompletionOptions,
): Promise<Response> {
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')?.trim();

  if (openRouterKey) {
    const model = getOpenRouterModel();
    const messages: LlmChatMessage[] = [
      { role: 'system', content: options.systemPrompt },
      ...(options.history || []).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: options.userPrompt },
    ];

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
        signal: options.signal,
      });

      if (openRouterStreamRes.ok && openRouterStreamRes.body) {
        // Transform OpenRouter SSE chunks into Gemini-candidate SSE chunks
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        const reader = openRouterStreamRes.body.getReader();
        const decoder = new TextDecoder();

        (async () => {
          let buffer = '';
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                if (trimmed === 'data: [DONE]') continue;

                try {
                  const dataStr = trimmed.slice(5).trim();
                  const parsed = JSON.parse(dataStr);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (typeof delta === 'string') {
                    // Emit Gemini-compatible SSE line
                    const geminiCompatChunk = {
                      candidates: [
                        {
                          content: {
                            parts: [{ text: delta }],
                          },
                        },
                      ],
                    };
                    await writer.write(
                      encoder.encode(`data: ${JSON.stringify(geminiCompatChunk)}\n\n`),
                    );
                  }
                } catch {
                  // Non-JSON line or keep-alive; ignore
                }
              }
            }
            await writer.close();
          } catch (err) {
            await writer.abort(err);
          }
        })();

        return new Response(readable, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'X-VSM-LLM-Provider': 'openrouter',
            'X-VSM-LLM-Model': model,
          },
        });
      }

      console.warn(JSON.stringify({
        event: 'openrouter_stream_fallback',
        status: openRouterStreamRes.status,
        message: 'OpenRouter stream non-OK response, falling back to Gemini',
        timestamp: new Date().toISOString(),
      }));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      console.warn(JSON.stringify({
        event: 'openrouter_stream_network_fallback',
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
