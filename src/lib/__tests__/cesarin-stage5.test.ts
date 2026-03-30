import { describe, expect, it } from 'vitest';

import type { CesarinPreferenceSummary } from '../cesarin-stage3';
import { buildCesarinActionableNextStepView } from '../cesarin-stage5';

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

function makeFullProduct(id: string, name: string, variantValues?: string[]) {
  return {
    id,
    slug: id,
    section: 'vape' as const,
    name,
    description: null,
    short_description: null,
    price: 250,
    compare_at_price: null,
    stock: 10,
    sku: null,
    category_id: 'cat-1',
    tags: [],
    status: 'active' as const,
    images: [],
    cover_image: null,
    is_featured: false,
    is_featured_until: null,
    is_new: false,
    is_new_until: null,
    is_bestseller: false,
    is_bestseller_until: null,
    is_active: true,
    created_at: '2026-03-28T00:00:00.000Z',
    updated_at: '2026-03-28T00:00:00.000Z',
    specs: {},
    badges: [],
    ai_is_featured: false,
    ai_sales_note: null,
    ai_exclude: false,
    variants: variantValues
      ? variantValues.map((value, index) => ({
          id: `${id}-variant-${index}`,
          product_id: id,
          sku: null,
          price: null,
          stock: 10,
          images: [],
          is_active: true,
          options: [
            {
              variant_id: `${id}-variant-${index}`,
              attribute_value_id: `${id}-value-${index}`,
              attribute_name: 'Sabor',
              attribute_value: {
                id: `${id}-value-${index}`,
                attribute_id: 'attr-sabor',
                value,
              },
            },
          ],
        }))
      : [],
  };
}

describe('buildCesarinActionableNextStepView', () => {
  it('turns a strong-fit direct path into a cleaner single-option action shape', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'recomiendame algo para diario',
      history: [],
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'EXACT',
      adaptiveMode: 'READY_TO_CLOSE',
      visibleProducts: [makeProduct('mint', 'Mint Fresh')],
      enrichedProductsById: {
        mint: makeFullProduct('mint', 'Mint Fresh'),
      },
      baseMessage: 'Te dejo una opcion bien amarrada.',
    });

    expect(result.family).toBe('ADD_READY');
    expect(result.nextStep.primaryAction?.kind).toBe('ADD_TO_CART');
    expect(result.message).toBe('Te dejo una opcion bien amarrada.');
    expect(result.nextStep.guidance).toBe('Ya esta bastante claro por Mint Fresh; si ya te cerro, agregarlo es el paso natural.');
    expect(result.nextStep.primaryAction?.label).toBe('Agregar Mint Fresh');
  });

  it('keeps compare cases honest instead of forcing a premature close', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'entre esos dos cual conviene mas',
      history: [],
      preferenceSummary: baseSummary,
      matchStrategy: 'EXACT',
      adaptiveMode: 'GUIDED_COMPARE',
      visibleProducts: [
        makeProduct('a', 'Option A'),
        makeProduct('b', 'Option B'),
      ],
      enrichedProductsById: {},
      baseMessage: 'Traes dos caminos viables.',
    });

    expect(result.family).toBe('COMPARE_TWO');
    expect(result.nextStep.secondaryAction?.kind).toBe('OPEN_PDP');
    expect(result.nextStep.guidance).toBe('Ahorita Option A y Option B siguen viables; comparalos antes de decidir.');
  });

  it('asks only for the missing material selector when one strong product still needs it', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'me late ese waka',
      history: [],
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'EXACT',
      adaptiveMode: 'DIRECT_RECOMMEND',
      visibleProducts: [makeProduct('waka', 'Waka Pod')],
      enrichedProductsById: {
        waka: makeFullProduct('waka', 'Waka Pod', ['Menta', 'Mango']),
      },
      baseMessage: 'Ya te ubique un candidato fuerte.',
    });

    expect(result.family).toBe('SELECTOR_NEEDED');
    expect(result.nextStep.missingSelector).toBe('sabor');
    expect(result.message).toBe('Ya te ubique un candidato fuerte.');
    expect(result.nextStep.guidance).toBe('Waka Pod ya pinta bien; antes de moverlo solo falta definir sabor.');
  });

  it('keeps weak exploratory cases away from fake add-ready language', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'que tienes por ahi',
      history: [],
      preferenceSummary: null,
      matchStrategy: 'SEMANTIC',
      adaptiveMode: 'EXPLORE_LIGHT',
      visibleProducts: [
        makeProduct('a', 'Option A'),
        makeProduct('b', 'Option B'),
      ],
      enrichedProductsById: {},
      baseMessage: 'Te dejo unas cercanas.',
    });

    expect(result.family).toBe('KEEP_EXPLORING');
    expect(result.message).toBe('Te dejo unas cercanas.');
    expect(result.nextStep.guidance).toBe('Todavia no te cierro una sola; aqui conviene seguir afinando un poco mas.');
  });

  it('lets the current turn block stale confidence even if posture was closing-biased', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'quiero ver opciones primero',
      history: [],
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'EXACT',
      adaptiveMode: 'READY_TO_CLOSE',
      visibleProducts: [makeProduct('mint', 'Mint Fresh')],
      enrichedProductsById: {
        mint: makeFullProduct('mint', 'Mint Fresh'),
      },
      baseMessage: 'Traes una buena opcion.',
    });

    expect(result.family).toBe('KEEP_EXPLORING');
  });

  it('keeps weak single-candidate support in review mode instead of sounding action-ready', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'creo que ese podria ser',
      history: [],
      preferenceSummary: baseSummary,
      matchStrategy: 'SEMANTIC',
      adaptiveMode: 'SOFT_REASSURE',
      visibleProducts: [makeProduct('mint', 'Mint Fresh')],
      enrichedProductsById: {
        mint: makeFullProduct('mint', 'Mint Fresh'),
      },
      baseMessage: 'Puede ir por ahi.',
    });

    expect(result.family).toBe('REVIEW_ONE');
    expect(result.nextStep.guidance).toBe('Mint Fresh es la pista mas util por ahora, pero primero revisalo y si no te cierra seguimos.');
    expect(result.nextStep.primaryAction?.label).toBe('Revisar Mint Fresh');
  });

  it('keeps two viable direct-recommend products in compare mode before action-ready', () => {
    const result = buildCesarinActionableNextStepView({
      query: 'recomiendame algo para diario',
      history: [],
      preferenceSummary: {
        ...baseSummary,
        confirmed_likes: ['menta'],
      },
      matchStrategy: 'EXACT',
      adaptiveMode: 'DIRECT_RECOMMEND',
      visibleProducts: [
        makeProduct('mint', 'Mint Fresh'),
        makeProduct('berry', 'Berry Chill'),
      ],
      enrichedProductsById: {
        mint: makeFullProduct('mint', 'Mint Fresh'),
        berry: makeFullProduct('berry', 'Berry Chill'),
      },
      baseMessage: 'Traes dos opciones bien paradas.',
    });

    expect(result.family).toBe('COMPARE_TWO');
    expect(result.nextStep.primaryAction?.label).toBe('Revisar Mint Fresh');
    expect(result.nextStep.secondaryAction?.label).toBe('Revisar Berry Chill');
  });
});
