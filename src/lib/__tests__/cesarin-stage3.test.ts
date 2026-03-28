import { describe, expect, it } from 'vitest';

import { rerankCesarinSuggestedProducts, type CesarinPreferenceSummary } from '../cesarin-stage3';

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

function makeProduct(overrides?: Partial<{
  id: string;
  name: string;
  price: number;
  ai_sales_note: string | null;
  description: string | null;
  display_price: string;
  specs: unknown;
}>) {
  return {
    id: 'prod-1',
    slug: 'prod-1',
    section: 'vape' as const,
    name: 'Base Product',
    price: 300,
    display_price: '$300',
    ai_sales_note: null,
    description: null,
    specs: null,
    ...overrides,
  };
}

describe('rerankCesarinSuggestedProducts', () => {
  it('biases recommendations toward remembered likes when the current turn stays broad', () => {
    const products = [
      makeProduct({ id: 'sweet', name: 'Dulce Blast', ai_sales_note: 'perfil dulce' }),
      makeProduct({ id: 'mint', name: 'Mint Fresh', ai_sales_note: 'menta fresca' }),
    ];

    const reranked = rerankCesarinSuggestedProducts({
      query: 'recomiendame algo para diario',
      products,
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
    });

    expect(reranked[0]?.id).toBe('mint');
  });

  it('pushes repeated rejected paths downward when the turn does not reactivate them', () => {
    const products = [
      makeProduct({ id: 'sweet', name: 'Sweet Rush', ai_sales_note: 'dulce intenso' }),
      makeProduct({ id: 'fresh', name: 'Fresh Ice', ai_sales_note: 'fresco mentolado' }),
    ];

    const reranked = rerankCesarinSuggestedProducts({
      query: 'busco algo rico',
      products,
      preferenceSummary: {
        ...baseSummary,
        rejected_preferences: ['dulce'],
      },
    });

    expect(reranked[0]?.id).toBe('fresh');
  });

  it('lets the current turn override stored memory when they conflict', () => {
    const products = [
      makeProduct({ id: 'sweet', name: 'Sweet Rush', ai_sales_note: 'dulce cremoso' }),
      makeProduct({ id: 'mint', name: 'Mint Fresh', ai_sales_note: 'menta fresca' }),
    ];

    const reranked = rerankCesarinSuggestedProducts({
      query: 'hoy si quiero algo dulce',
      products,
      preferenceSummary: {
        ...baseSummary,
        rejected_preferences: ['dulce'],
        confirmed_likes: ['menta'],
      },
    });

    expect(reranked[0]?.id).toBe('sweet');
  });

  it('uses budget posture conservatively when the turn does not set price already', () => {
    const products = [
      makeProduct({ id: 'premium', name: 'Premium Pod', price: 520, display_price: '$520' }),
      makeProduct({ id: 'budget', name: 'Entry Pod', price: 240, display_price: '$240' }),
    ];

    const reranked = rerankCesarinSuggestedProducts({
      query: 'quiero algo facil',
      products,
      preferenceSummary: {
        ...baseSummary,
        budget_posture: 'cuida precio',
      },
    });

    expect(reranked[0]?.id).toBe('budget');
  });

  it('degrades gracefully when memory is absent or too weak to matter', () => {
    const products = [
      makeProduct({ id: 'first', name: 'First Option' }),
      makeProduct({ id: 'second', name: 'Second Option' }),
    ];

    expect(
      rerankCesarinSuggestedProducts({
        query: 'algo tranqui',
        products,
        preferenceSummary: null,
      }).map((product) => product.id),
    ).toEqual(['first', 'second']);

    expect(
      rerankCesarinSuggestedProducts({
        query: 'algo tranqui',
        products,
        preferenceSummary: {
          ...baseSummary,
          weak_tendencies: ['algo que no matchea'],
        },
      }).map((product) => product.id),
    ).toEqual(['first', 'second']);
  });
});
