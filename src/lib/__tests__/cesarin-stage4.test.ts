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
      modeHint: 'DIRECT_RECOMMEND',
    });

    expect(view.mode).toBe('DIRECT_RECOMMEND');
    expect(view.visibleProducts.map((product) => product.id)).toEqual(['mint', 'berry']);
    expect(view.message).toContain('yo arrancaria por Mint Fresh');
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
    expect(view.message).toContain('comparacion primero entre Option A y Option B');
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
    expect(view.message).toContain('no te reseteo todo');
  });

  it('lets the current turn override a mode hint when the user is clearly comparing', () => {
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
      modeHint: 'DIRECT_RECOMMEND',
    });

    expect(view.mode).toBe('GUIDED_COMPARE');
  });
});
