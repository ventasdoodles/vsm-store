import { describe, expect, it } from 'vitest';

import { buildSoftContinuityContext } from '../../../supabase/functions/customer-intelligence/soft-continuity';

describe('customer-intelligence soft continuity', () => {
  it('builds a soft reopen hint from recent session history without forcing continuity', () => {
    const continuity = buildSoftContinuityContext({
      query: 'y cual me conviene mas?',
      history: [
        { role: 'user', content: 'busco un pod de menta que no salga tan caro' },
        { role: 'assistant', content: 'Traigo varias opciones de pod de menta.' },
      ],
      customerContext: null,
      customerMemory: null,
    });

    expect(continuity.source).toBe('recent_history');
    expect(continuity.recent_topic).toContain('pod de menta');
    expect(continuity.previous_lane).toBe('PRODUCT_SEARCH');
    expect(continuity.should_offer_soft_reopen).toBe(true);
    expect(continuity.prompt_block).toContain('CONTINUIDAD RECIENTE DE SESION');
    expect(continuity.prompt_block).toContain('frase corta y humilde');
  });

  it('keeps current-turn sovereignty when authenticated continuity points to a different lane', () => {
    const continuity = buildSoftContinuityContext({
      query: 'y el envio como va?',
      history: [],
      customerContext: {
        ia_context: {
          last_query: 'quiero algo frutal para diario',
          last_intent: 'PRODUCT_SEARCH',
          updated_at: '2026-03-29T10:00:00.000Z',
        },
      },
      customerMemory: {
        last_interaction_at: '2026-03-29T10:00:00.000Z',
      },
    });

    expect(continuity.source).toBe('authenticated_context');
    expect(continuity.previous_lane).toBe('PRODUCT_SEARCH');
    expect(continuity.current_lane).toBe('POLICY_INQUIRY');
    expect(continuity.topic_shift).toBe(true);
    expect(continuity.should_offer_soft_reopen).toBe(false);
    expect(continuity.prompt_block).toContain('el turno actual manda');
  });

  it('returns no continuity context for a new turn without usable history or authenticated context', () => {
    const continuity = buildSoftContinuityContext({
      query: 'hola',
      history: [],
      customerContext: null,
      customerMemory: null,
    });

    expect(continuity.source).toBe('none');
    expect(continuity.recent_topic).toBeNull();
    expect(continuity.prompt_block).toBeNull();
  });
});
