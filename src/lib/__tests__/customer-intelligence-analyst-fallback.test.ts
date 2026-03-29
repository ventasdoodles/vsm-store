import { describe, expect, it } from 'vitest';

import { buildNeutralAnalystFallbackReport } from '../../../supabase/functions/customer-intelligence/analyst-fallback';

describe('customer-intelligence analyst degradation fallback', () => {
  it('stays neutral and does not coerce product search when the analyst degrades', () => {
    const fallback = buildNeutralAnalystFallbackReport();

    expect(fallback.intent).toBe('UNKNOWN');
    expect(fallback.primary_intent).toBe('UNKNOWN');
    expect(fallback.secondary_intents).toEqual([]);
    expect(fallback.turn_priority).toBe('UNCLEAR_FIRST');
    expect(fallback.turn_decision).toBe('ASK_CLARIFYING_QUESTION');
    expect(fallback.tool_calls).toEqual([]);
    expect(fallback.customer_dna).toEqual({
      interests: [],
      preference_signals: [],
    });
    expect(fallback.fallback_reason).toBe('ANALYST_DEGRADED');
  });
});
