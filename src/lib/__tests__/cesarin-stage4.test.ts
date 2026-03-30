import { describe, expect, it } from 'vitest';

import type { CesarinPreferenceSummary } from '../cesarin-stage3';
import { buildCesarinAdaptiveConversationView } from '../cesarin-stage4';

const baseSummary: CesarinPreferenceSummary = {
  confirmed_likes: [],
  explicit_likes: [],
  weak_tendencies: [],
  rejected_preferences: [],
  format_preferences: [],
  brand_affinity: [],
  budget_posture: null,
  intensity_posture: null,
  experience_posture: null,
};

function makeProduct(id: string, name: string) {
  return {
    id,
    slug: id,
    section: 'vape' as const,
    name,
  };
}

describe('buildCesarinAdaptiveConversationView', () => {
  it('keeps the direct path shorter when the signal is already strong', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'recomiendame algo para diario',
      history: [],
      products: [
        makeProduct('mint', 'Mint Fresh'),
        makeProduct('berry', 'Berry Chill'),
        makeProduct('classic', 'Classic Pod'),
      ],
      baseMessage: 'Te dejo unas opciones que si van contigo.',
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
        budget_posture: 'cuida precio',
      },
      matchStrategy: 'EXACT',
    });

    expect(view.mode).toBe('DIRECT_RECOMMEND');
    expect(view.visibleProducts.map((product) => product.id)).toEqual(['mint', 'berry']);
    expect(view.message).toBe('Te dejo unas opciones que si van contigo.');
  });

  it('keeps compare grounded when multiple options matter', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'entre esos dos cual conviene mas',
      history: [],
      products: [
        makeProduct('a', 'Option A'),
        makeProduct('b', 'Option B'),
        makeProduct('c', 'Option C'),
      ],
      baseMessage: 'Te dejo lo mas util.',
      preferenceSummary: baseSummary,
      matchStrategy: 'EXACT',
    });

    expect(view.mode).toBe('GUIDED_COMPARE');
    expect(view.visibleProducts.map((product) => product.id)).toEqual(['a', 'b']);
    expect(view.message).toBe('Te dejo lo mas util.');
  });

  it('handles hesitation without resetting or overpushing', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'no estoy seguro, cual me conviene',
      history: [],
      products: [
        makeProduct('steady', 'Steady Mint'),
        makeProduct('backup', 'Backup Pod'),
      ],
      baseMessage: 'Si hay por donde resolverlo.',
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'SEMANTIC',
    });

    expect(view.mode).toBe('SOFT_REASSURE');
    expect(view.visibleProducts.map((product) => product.id)).toEqual(['steady', 'backup']);
    expect(view.message).toBe('Si hay por donde resolverlo.');
  });

  it('keeps compare posture when the current turn is clearly comparing', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'entre esos cual sale mejor',
      history: [],
      products: [
        makeProduct('a', 'Option A'),
        makeProduct('b', 'Option B'),
      ],
      baseMessage: 'Ahi van dos.',
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'EXACT',
    });

    expect(view.mode).toBe('GUIDED_COMPARE');
  });

  it('keeps two viable options in compare mode when there is no strong reason to collapse early', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'recomiendame algo para diario',
      history: [],
      products: [
        makeProduct('a', 'Option A'),
        makeProduct('b', 'Option B'),
      ],
      baseMessage: 'Traes dos caminos viables.',
      preferenceSummary: baseSummary,
      matchStrategy: 'EXACT',
    });

    expect(view.mode).toBe('GUIDED_COMPARE');
  });

  it('uses model turn_analysis as primary signal when available (clarification → SOFT_REASSURE)', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'la neta no me convence del todo ese',
      history: [],
      products: [
        makeProduct('a', 'Option A'),
        makeProduct('b', 'Option B'),
      ],
      baseMessage: 'Entiendo la duda.',
      preferenceSummary: baseSummary,
      matchStrategy: 'EXACT',
      turnAnalysis: {
        primary_intent: 'PRODUCT_SEARCH',
        current_turn_decision: 'ASK_CLARIFYING_QUESTION',
      },
    });

    expect(view.mode).toBe('SOFT_REASSURE');
  });

  it('allows direct recommendation without forced EXPLORE_LIGHT when model does not clarify', () => {
    const view = buildCesarinAdaptiveConversationView({
      query: 'que me recomiendas para diario',
      history: [],
      products: [
        makeProduct('mint', 'Mint Fresh'),
      ],
      baseMessage: 'Este te va bien.',
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'EXACT',
      turnAnalysis: {
        primary_intent: 'PRODUCT_SEARCH',
        current_turn_decision: 'PRODUCT_SEARCH',
      },
    });

    expect(view.mode).toBe('DIRECT_RECOMMEND');
  });
});
