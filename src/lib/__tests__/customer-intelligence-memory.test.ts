import { describe, expect, it, vi } from 'vitest';

import {
  persistMemory,
  type CustomerMemoryRow,
  type MemorySupabaseClient,
} from '../../../supabase/functions/customer-intelligence/memory';

function buildSupabaseDouble(options?: {
  currentMemory?: CustomerMemoryRow | null;
  readError?: { message?: string } | null;
  writeError?: { message?: string } | null;
  deferredWrite?: boolean;
}) {
  const state = {
    upsertPayload: null as Record<string, unknown> | null,
  };

  let resolveWrite: ((value: { data: null; error: { message?: string } | null }) => void) | null = null;

  const maybeSingle = vi.fn(async () => ({
    data: options?.currentMemory ?? null,
    error: options?.readError ?? null,
  }));

  const upsert = vi.fn((payload: Record<string, unknown>) => {
    state.upsertPayload = payload;

    if (options?.deferredWrite) {
      return new Promise<{ data: null; error: { message?: string } | null }>((resolve) => {
        resolveWrite = resolve;
      });
    }

    return Promise.resolve({
      data: null,
      error: options?.writeError ?? null,
    });
  });

  const readBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle,
  };

  const writeBuilder = {
    upsert,
  };

  let fromCalls = 0;
  const supabase: MemorySupabaseClient = {
    from: vi.fn(() => {
      fromCalls += 1;
      return fromCalls === 1 ? (readBuilder as any) : (writeBuilder as any);
    }),
  };

  return {
    supabase,
    maybeSingle,
    upsert,
    state,
    resolveWrite: () => {
      if (!resolveWrite) throw new Error('resolveWrite called before deferred write was created');
      resolveWrite({ data: null, error: options?.writeError ?? null });
    },
  };
}

describe('persistMemory', () => {
  it('awaits the ai_customer_memory write before resolving', async () => {
    const double = buildSupabaseDouble({
      currentMemory: {
        detected_interests: ['menta'],
        interests_metadata: {
          menta: { hits: 2, last_at: '2026-03-20T00:00:00.000Z' },
        },
      },
      deferredWrite: true,
    });

    let settled = false;
    const promise = persistMemory(double.supabase, 'customer-1', ['Mango']);
    promise.finally(() => {
      settled = true;
    });

    await Promise.resolve();

    expect(double.upsert).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);

    double.resolveWrite();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
    expect(double.state.upsertPayload?.customer_id).toBe('customer-1');
    expect(double.state.upsertPayload?.detected_interests).toEqual(['menta', 'mango']);
  });

  it('truthfully reports a failed write instead of succeeding silently', async () => {
    const double = buildSupabaseDouble({
      currentMemory: {
        detected_interests: ['uva'],
        interests_metadata: {
          uva: { hits: 1, last_at: '2026-03-20T00:00:00.000Z' },
        },
      },
      writeError: { message: 'db write failed' },
    });

    const result = await persistMemory(double.supabase, 'customer-2', ['Sandia']);

    expect(double.upsert).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('db write failed');
    expect(result.merged_interests).toEqual(['uva', 'sandia']);
  });
});
