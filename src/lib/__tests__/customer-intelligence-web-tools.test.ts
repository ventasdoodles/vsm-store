import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeTools } from '../../../supabase/functions/customer-intelligence/tools';

describe('customer-intelligence native public web tools', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
      {},
      'test-key',
    );
    expect(results).toHaveLength(1);
    const result = results[0]!;
    expect(result).toBeDefined();

    expect(result!.name).toBe('public_web_search');
    expect(result!.status).toBe('success');
    expect(result!.output.length).toBeGreaterThan(10);
    expect(result!.metadata.sources).toHaveLength(2);
    expect(result!.metadata.queries).toEqual(['modelo lanzamiento oficial']);
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
      {},
      'test-key',
    );
    expect(results).toHaveLength(1);
    const result = results[0]!;
    expect(result).toBeDefined();

    expect(result!.name).toBe('public_url_context');
    expect(result!.status).toBe('success');
    expect(result!.output).toContain('lanzamiento');
    expect(result!.metadata.urls).toEqual([
      {
        retrieved_url: 'https://example.com/lanzamiento',
        status: 'URL_RETRIEVAL_STATUS_SUCCESS',
      },
    ]);
  });
});
