import { describe, expect, it, vi } from 'vitest';

import {
  buildCustomerPreferencePromptSummary,
  collectCustomerPreferenceSignals,
  hasCustomerPreferenceSummary,
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

  it('does not inflate recency or hits for historical interests that were not observed in the current turn', async () => {
    const previousTimestamp = '2026-03-20T00:00:00.000Z';
    const double = buildSupabaseDouble({
      currentMemory: {
        detected_interests: ['menta'],
        interests_metadata: {
          menta: { hits: 2, last_at: previousTimestamp },
        },
      },
    });

    const result = await persistMemory(double.supabase, 'customer-recency', ['Mango']);
    const payload = double.state.upsertPayload as CustomerMemoryRow;

    expect(result.ok).toBe(true);
    expect(payload.detected_interests).toEqual(['menta', 'mango']);
    expect(payload.interests_metadata?.menta).toEqual({
      hits: 2,
      last_at: previousTimestamp,
    });
    expect(payload.interests_metadata?.mango?.hits).toBe(1);
    expect(payload.interests_metadata?.mango?.last_at).not.toBe(previousTimestamp);
  });

  it('persists explicit and weak preference signals with a compact summary for returning customers', async () => {
    const double = buildSupabaseDouble({
      currentMemory: {
        detected_interests: ['menta'],
        interests_metadata: {
          menta: { hits: 1, last_at: '2026-03-20T00:00:00.000Z' },
        },
      },
    });

    const preferenceSignals = collectCustomerPreferenceSignals({
      query: 'quiero algo suave y de menta',
      interests: ['menta'],
      analystSignals: [
        { category: 'budget', value: 'barato', evidence: 'inferred', label: 'cuida precio' },
      ],
    });

    const result = await persistMemory(double.supabase, 'customer-3', {
      interests: ['Menta'],
      preferenceSignals,
    });

    expect(result.ok).toBe(true);
    expect(result.preference_signal_count).toBeGreaterThanOrEqual(3);
    expect(result.preference_summary.explicit_likes).toContain('menta');
    expect(result.preference_summary.weak_tendencies).toContain('cuida precio');
    expect(result.preference_summary.intensity_posture).toBe('perfiles suaves');
    expect(hasCustomerPreferenceSummary(result.preference_summary)).toBe(true);
  });

  it('does not promote a single weak hint into hard truth and only confirms repeated support conservatively', async () => {
    const firstDouble = buildSupabaseDouble();
    const firstResult = await persistMemory(firstDouble.supabase, 'customer-4', {
      preferenceSignals: [
        { category: 'flavor', value: 'mango', evidence: 'inferred' },
      ],
    });

    expect(firstResult.preference_summary.weak_tendencies).toContain('mango');
    expect(firstResult.preference_summary.confirmed_likes).not.toContain('mango');

    const secondDouble = buildSupabaseDouble({
      currentMemory: firstDouble.state.upsertPayload as CustomerMemoryRow,
    });
    const secondResult = await persistMemory(secondDouble.supabase, 'customer-4', {
      preferenceSignals: [
        { category: 'flavor', value: 'mango', evidence: 'inferred' },
      ],
    });

    expect(secondResult.preference_summary.confirmed_likes).not.toContain('mango');

    const thirdDouble = buildSupabaseDouble({
      currentMemory: secondDouble.state.upsertPayload as CustomerMemoryRow,
    });
    const thirdResult = await persistMemory(thirdDouble.supabase, 'customer-4', {
      preferenceSignals: [
        { category: 'flavor', value: 'mango', evidence: 'inferred' },
      ],
    });

    expect(thirdResult.preference_summary.confirmed_likes).toContain('mango');
  });

  it('builds no prompt summary when memory is absent and stays compact when memory exists', () => {
    expect(buildCustomerPreferencePromptSummary(null)).toBeNull();

    const promptSummary = buildCustomerPreferencePromptSummary({
      confirmed_likes: ['menta'],
      explicit_likes: ['mango'],
      weak_tendencies: ['cuida precio'],
      rejected_preferences: ['dulce'],
      format_preferences: ['pod'],
      brand_affinity: [],
      budget_posture: 'cuida precio',
      intensity_posture: 'perfiles suaves',
      experience_posture: null,
    });

    expect(promptSummary).toContain('GUSTOS CONFIRMADOS: menta.');
    expect(promptSummary).toContain('EVITA O RECHAZO EXPLICITO: dulce.');
    expect(promptSummary).toContain('TENDENCIAS DEBILES');
    expect(promptSummary).not.toContain('undefined');
  });
});
