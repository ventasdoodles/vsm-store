import { describe, expect, it } from 'vitest';

import { buildCesarinCommercialMemoryPromptGuidance } from '../../../supabase/functions/customer-intelligence/commercial-memory';

describe('buildCesarinCommercialMemoryPromptGuidance', () => {
  it('turns strong memory into tighter commercial guidance for broad recommendation turns', () => {
    const guidance = buildCesarinCommercialMemoryPromptGuidance(
      {
        confirmed_likes: ['menta'],
        explicit_likes: ['mango'],
        weak_tendencies: ['cuida precio'],
        rejected_preferences: ['dulce'],
        format_preferences: ['pod'],
        brand_affinity: ['waka'],
        budget_posture: 'cuida precio',
        intensity_posture: 'perfiles suaves',
        experience_posture: 'algo sencillo',
      },
      'recomiendame algo para diario',
    );

    expect(guidance).toContain('reduce preguntas redundantes');
    expect(guidance).toContain('gustos confirmados');
    expect(guidance).toContain('Respeta la postura de presupuesto');
    expect(guidance).toContain('recovery aproximado');
  });

  it('keeps current-turn preference above prior rejection when they conflict', () => {
    const guidance = buildCesarinCommercialMemoryPromptGuidance(
      {
        confirmed_likes: [],
        explicit_likes: [],
        weak_tendencies: [],
        rejected_preferences: ['dulce'],
        format_preferences: [],
        brand_affinity: [],
        budget_posture: null,
        intensity_posture: null,
        experience_posture: null,
      },
      'hoy si quiero algo dulce',
    );

    expect(guidance).toContain('gana lo de hoy');
    expect(guidance).not.toContain('Evita insistir en caminos que ya rechazo');
  });
});
