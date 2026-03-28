import { describe, expect, it } from 'vitest';

import { buildCesarinConversationModePromptGuidance } from '../../../supabase/functions/customer-intelligence/conversation-modes';

describe('buildCesarinConversationModePromptGuidance', () => {
  it('pushes a direct recommendation mode when the turn is broad but memory is already strong', () => {
    const result = buildCesarinConversationModePromptGuidance({
      query: 'recomiendame algo para diario',
      history: [],
      preferenceSummary: {
        confirmed_likes: ['menta'],
        explicit_likes: [],
        weak_tendencies: [],
        rejected_preferences: ['dulce'],
        format_preferences: [],
        brand_affinity: [],
        budget_posture: 'cuida precio',
        intensity_posture: null,
        experience_posture: null,
      },
    });

    expect(result.mode).toBe('DIRECT_RECOMMEND');
    expect(result.guidance.toLowerCase()).toContain('reduce preguntas redundantes');
  });

  it('keeps broad exploration broad when memory is weak or absent', () => {
    const result = buildCesarinConversationModePromptGuidance({
      query: 'que tienes por ahi',
      history: [],
      preferenceSummary: null,
    });

    expect(result.mode).toBe('EXPLORE_LIGHT');
    expect(result.guidance).toContain('manten la exploracion ligera');
  });
});
