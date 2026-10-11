// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  classifyStatus,
  isBreakerOpen,
  tripBreaker,
  resetBreaker,
  validateCompletion,
  createAttemptSignal,
  openRouterDeltas,
  ProviderError,
  generateLlmCompletion,
  streamLlmCompletion,
} from '../../../supabase/functions/_shared/llm-provider';

describe('llm-provider resilience & error classification', () => {
  beforeEach(() => {
    resetBreaker();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetBreaker();
  });

  describe('classifyStatus & circuit breaker', () => {
    it('classifies 401, 403, and 404 as config errors and trips circuit breaker', () => {
      expect(classifyStatus(401)).toBe('config');
      expect(classifyStatus(403)).toBe('config');
      expect(classifyStatus(404)).toBe('config');

      expect(isBreakerOpen()).toBe(false);
      tripBreaker('config');
      expect(isBreakerOpen()).toBe(true);
    });

    it('classifies 400 and 422 as invalid_request errors and trips circuit breaker', () => {
      expect(classifyStatus(400)).toBe('invalid_request');
      expect(classifyStatus(422)).toBe('invalid_request');

      tripBreaker('invalid_request');
      expect(isBreakerOpen()).toBe(true);
    });

    it('classifies 429 and 500 as transient errors without tripping breaker', () => {
      expect(classifyStatus(429)).toBe('transient');
      expect(classifyStatus(500)).toBe('transient');
      expect(classifyStatus(503)).toBe('transient');

      tripBreaker('transient');
      expect(isBreakerOpen()).toBe(false);
    });
  });

  describe('createAttemptSignal timeout decoupling', () => {
    it('aborts on its own timeout without parent aborting', async () => {
      const parent = new AbortController();
      const attempt = createAttemptSignal(parent.signal, 50);

      expect(attempt.signal.aborted).toBe(false);
      expect(attempt.isParentAbort()).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 70));

      expect(attempt.signal.aborted).toBe(true);
      expect(attempt.isParentAbort()).toBe(false);
      attempt.cleanup();
    });

    it('propagates parent abort immediately if parent cancels', () => {
      const parent = new AbortController();
      const attempt = createAttemptSignal(parent.signal, 5000);

      expect(attempt.signal.aborted).toBe(false);
      parent.abort('User navigated away');

      expect(attempt.signal.aborted).toBe(true);
      expect(attempt.isParentAbort()).toBe(true);
      attempt.cleanup();
    });
  });

  describe('validateCompletion', () => {
    it('accepts valid non-empty JSON with text field', () => {
      const raw = validateCompletion({
        choices: [
          {
            message: {
              content: JSON.stringify({ text: 'Hola, te ayudo con gusto.', intent: 'greeting' }),
            },
          },
        ],
      });
      expect(JSON.parse(raw).text).toBe('Hola, te ayudo con gusto.');
    });

    it('throws ProviderError for truncated finish_reason: length', () => {
      expect(() => {
        validateCompletion({
          choices: [
            {
              finish_reason: 'length',
              message: { content: '{"text": "incomp' },
            },
          ],
        });
      }).toThrowError(ProviderError);
    });

    it('throws ProviderError for content_filter', () => {
      expect(() => {
        validateCompletion({
          choices: [
            {
              finish_reason: 'content_filter',
              message: { content: '' },
            },
          ],
        });
      }).toThrowError(ProviderError);
    });

    it('throws ProviderError for empty content or missing text', () => {
      expect(() => {
        validateCompletion({
          choices: [{ message: { content: '' } }],
        });
      }).toThrowError(ProviderError);

      expect(() => {
        validateCompletion({
          choices: [{ message: { content: '{"other": 123}' } }],
        });
      }).toThrowError(ProviderError);
    });
  });

  describe('sseData generator & delta parser', () => {
    it('handles chunk splitting across newlines, filters comments, and flushes tail', async () => {
      const encoder = new TextEncoder();
      const chunks = [
        encoder.encode(': keepalive comment\ndata: {"choices":[{"delta":{"content":"Hola '),
        encoder.encode('"}}]}\n\ndata: {"choices":[{"delta":{"content":"amigo"}}]}\n\n'),
        encoder.encode('data: [DONE]'), // no trailing \n\n
      ];

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });

      const deltas: string[] = [];
      for await (const delta of openRouterDeltas(stream)) {
        deltas.push(delta);
      }

      expect(deltas.join('')).toBe('Hola amigo');
    });

    it('throws ProviderError when an upstream error frame is received', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"error":{"message":"Rate limit exceeded"}}\n\n'));
          controller.close();
        },
      });

      await expect(async () => {
        for await (const _ of openRouterDeltas(stream)) {}
      }).rejects.toThrowError('Rate limit exceeded');
    });

    it('throws ProviderError when stream closes without emitting any deltas or terminal frame', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(': comment only\n\n'));
          controller.close();
        },
      });

      await expect(async () => {
        for await (const _ of openRouterDeltas(stream)) {}
      }).rejects.toThrowError(ProviderError);
    });
  });

  describe('generateLlmCompletion fallback execution', () => {
    it('falls back to Gemini when OpenRouter fails with error', async () => {
      const origKey = process.env.OPENROUTER_API_KEY;
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

      try {
        globalThis.fetch = vi.fn().mockImplementation((url: string | URL) => {
          const urlStr = String(url);
          if (urlStr.includes('openrouter.ai')) {
            // OpenRouter fails with 500
            return Promise.resolve(new Response('Internal Server Error', { status: 500 }));
          }
          // Gemini succeeds
          return Promise.resolve(
            new Response(
              JSON.stringify({
                candidates: [{ content: { parts: [{ text: '{"text": "Respuesta desde Gemini"}' }] } }],
                usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
              }),
              { status: 200 }
            )
          );
        });

        const result = await generateLlmCompletion({
          systemPrompt: 'System',
          userPrompt: 'User',
          geminiFallback: {
            apiKey: 'test-gemini-key',
            model: 'gemini-2.5-flash',
            body: {},
          },
        });

        expect(result.telemetry.provider).toBe('gemini');
        expect(result.rawText).toContain('Respuesta desde Gemini');
      } finally {
        if (origKey !== undefined) {
          process.env.OPENROUTER_API_KEY = origKey;
        } else {
          delete process.env.OPENROUTER_API_KEY;
        }
      }
    });

    it('returns OpenRouter completion directly when OpenRouter succeeds', async () => {
      const origKey = process.env.OPENROUTER_API_KEY;
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

      try {
        globalThis.fetch = vi.fn().mockImplementation(() => {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                model: 'openai/gpt-6-luna-pro',
                choices: [
                  {
                    message: {
                      content: JSON.stringify({ text: 'Respuesta desde Luna Pro', intent: 'search' }),
                    },
                    finish_reason: 'stop',
                  },
                ],
                usage: { prompt_tokens: 15, completion_tokens: 25, total_tokens: 40 },
              }),
              { status: 200 }
            )
          );
        });

        const result = await generateLlmCompletion({
          systemPrompt: 'System',
          userPrompt: 'User',
          geminiFallback: {
            apiKey: 'test-gemini-key',
            model: 'gemini-2.5-flash',
            body: {},
          },
        });

        expect(result.telemetry.provider).toBe('openrouter');
        expect(result.rawText).toContain('Respuesta desde Luna Pro');
      } finally {
        if (origKey !== undefined) {
          process.env.OPENROUTER_API_KEY = origKey;
        } else {
          delete process.env.OPENROUTER_API_KEY;
        }
      }
    });
  });

  describe('streamLlmCompletion fallback execution', () => {
    it('falls back to Gemini stream when OpenRouter fails pre-first-token', async () => {
      const origKey = process.env.OPENROUTER_API_KEY;
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

      try {
        globalThis.fetch = vi.fn().mockImplementation((url: string | URL) => {
          const urlStr = String(url);
          if (urlStr.includes('openrouter.ai')) {
            // OpenRouter fails before returning stream
            return Promise.resolve(new Response('Upstream error', { status: 502 }));
          }

          const encoder = new TextEncoder();
          const mockGeminiStream = new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(encoder.encode('data: {"candidates":[{"content":{"parts":[{"text":"Gemini Stream"}]}}]}\n\n'));
              controller.close();
            },
          });

          return Promise.resolve(
            new Response(mockGeminiStream, {
              status: 200,
              headers: { 'Content-Type': 'text/event-stream' },
            })
          );
        });

        const res = await streamLlmCompletion({
          systemPrompt: 'System',
          userPrompt: 'User',
          geminiFallback: {
            apiKey: 'test-gemini-key',
            model: 'gemini-2.5-flash',
            body: {},
          },
        });

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('text/event-stream');
      } finally {
        if (origKey !== undefined) {
          process.env.OPENROUTER_API_KEY = origKey;
        } else {
          delete process.env.OPENROUTER_API_KEY;
        }
      }
    });
  });
});
