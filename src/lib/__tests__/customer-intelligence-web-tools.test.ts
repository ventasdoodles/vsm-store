import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeTools } from '../../../supabase/functions/customer-intelligence/tools';
import { shouldSuppressCesarinConversationalPrefix } from '../../../supabase/functions/customer-intelligence/response-shaping';

describe('customer-intelligence native public web tools', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createInventorySupabaseMock(input: {
    product: { name: string; stock: number };
    oracle?: { daysUntilOut: number; depletionDate?: string; urgencyLevel: string };
    oracleError?: unknown;
  }) {
    const invoke = vi.fn(async (fn: string) => {
      if (fn !== 'inventory-oracle') {
        return { data: null, error: new Error(`unexpected function ${fn}`) };
      }

      if (input.oracleError) {
        return { data: null, error: input.oracleError };
      }

      return { data: input.oracle ?? null, error: null };
    });

    return {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({ data: input.product, error: null })),
          })),
        })),
      })),
      functions: { invoke },
    };
  }

  it('executes public_web_search in a bounded way and keeps sources compact', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: 'El modelo sigue anunciado por la marca. Hay menciones publicas de lanzamiento este ano. Conviene verificar disponibilidad por region.',
            }],
          },
          groundingMetadata: {
            webSearchQueries: ['modelo lanzamiento oficial'],
            groundingChunks: [
              { web: { title: 'Marca oficial', uri: 'https://example.com/oficial' } },
              { web: { title: 'Ficha tecnica', uri: 'https://example.com/specs' } },
            ],
          },
        }],
      }),
    });

    const results = await executeTools(
      [{ name: 'public_web_search', args: { query: 'ese modelo ya salio este ano oficialmente?' } }],
      {} as any,
      'test-key',
    );
    expect(results).toHaveLength(1);
    const result = results[0]!;
    expect(result).toBeDefined();

    expect(result!.name).toBe('public_web_search');
    expect(result!.status).toBe('success');
    expect(result!.output.length).toBeGreaterThan(10);
    expect(result!.metadata!.sources).toHaveLength(2);
    expect(result!.metadata!.queries).toEqual(['modelo lanzamiento oficial']);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v1beta/models/gemini-2.5-flash:generateContent'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-goog-api-key': 'test-key',
        }),
      }),
    );
  });

  it('executes public_url_context only from explicit public URLs and returns retrieval metadata', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: 'La pagina describe el lanzamiento y menciona disponibilidad general. No confirma stock interno de la tienda.',
            }],
          },
          urlContextMetadata: {
            urlMetadata: [
              {
                retrievedUrl: 'https://example.com/lanzamiento',
                urlRetrievalStatus: 'URL_RETRIEVAL_STATUS_SUCCESS',
              },
            ],
          },
        }],
      }),
    });

    const results = await executeTools(
      [{
        name: 'public_url_context',
        args: {
          query: 'resumeme esta pagina',
          urls: ['https://example.com/lanzamiento'],
        },
      }],
      {} as any,
      'test-key',
    );
    expect(results).toHaveLength(1);
    const result = results[0]!;
    expect(result).toBeDefined();

    expect(result!.name).toBe('public_url_context');
    expect(result!.status).toBe('success');
    expect(result!.output).toContain('lanzamiento');
    expect(result!.metadata!.urls).toEqual([
      {
        retrieved_url: 'https://example.com/lanzamiento',
        status: 'URL_RETRIEVAL_STATUS_SUCCESS',
      },
    ]);
  });

  it('states current availability first and keeps outlook secondary on inventory outlook turns', async () => {
    const supabase = createInventorySupabaseMock({
      product: { name: 'Caliburn G3', stock: 4 },
      oracle: { daysUntilOut: 6, depletionDate: '2026-04-06', urgencyLevel: 'medium' },
    });

    const results = await executeTools(
      [{ name: 'get_inventory_outlook', args: { product_id: 'prod-1' } }],
      supabase as any,
      'test-key',
    );

    const result = results[0]!;
    expect(result.name).toBe('get_inventory_outlook');
    expect(result.status).toBe('success');
    expect(result.output).toContain('DISPONIBILIDAD_ACTUAL: DISPONIBLE');
    expect(result.output).toContain('OUTLOOK_ESTIMADO: 6 dias restantes');
    expect(result.output).toContain('NOTA: La proyeccion es secundaria a la disponibilidad actual y puede cambiar.');
    expect(result.output.indexOf('DISPONIBILIDAD_ACTUAL: DISPONIBLE')).toBeLessThan(
      result.output.indexOf('OUTLOOK_ESTIMADO: 6 dias restantes'),
    );
  });

  it('keeps oos availability truth first and avoids unsupported future-return implication', async () => {
    const supabase = createInventorySupabaseMock({
      product: { name: 'Caliburn G3', stock: 0 },
      oracle: { daysUntilOut: 3, depletionDate: '2026-04-03', urgencyLevel: 'high' },
    });

    const results = await executeTools(
      [{ name: 'get_inventory_outlook', args: { product_id: 'prod-1' } }],
      supabase as any,
      'test-key',
    );

    const result = results[0]!;
    expect(result.output).toContain('DISPONIBILIDAD_ACTUAL: AGOTADO');
    expect(result.output).toContain('OUTLOOK_ESTIMADO: No disponible mientras siga agotado.');
    expect(result.output).toContain('NOTA: No hay base aqui para prometer regreso o restock.');
    expect(result.output).not.toContain('temporalmente');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('suppresses stale conversational prefixes on grounded PUBLIC_INFO turns with source context', () => {
    const shouldSuppress = shouldSuppressCesarinConversationalPrefix({
      prefix: 'La ultima vez veniamos viendo pods, pero no asumo que sigas en eso.',
      text: 'Segun contexto publico, ese lanzamiento si aparece anunciado.',
      primaryIntent: 'PUBLIC_INFO',
      currentTurnDecision: 'DIRECT_ANSWER',
      hasPublicSourceContext: true,
    });

    expect(shouldSuppress).toBe(true);
  });
});
