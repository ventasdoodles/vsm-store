import { describe, expect, it } from 'vitest';

import { compactCesarinResponseText } from '../../../supabase/functions/customer-intelligence/persona.ts';
import { buildClarificationFirstFallbackText } from '../../../supabase/functions/customer-intelligence/response-shaping.ts';

describe('compactCesarinResponseText', () => {
  it('collapses repeated recommendations and strips a soft closing tail', () => {
    const result = compactCesarinResponseText(
      'Te paso dos opciones. Te paso dos opciones. Si quieres, te paso otra mas.'
    );

    expect(result).toBe('Te paso dos opciones');
  });

  it('keeps one concise clarification question and removes duplicates', () => {
    const result = compactCesarinResponseText(
      'Me falta el modelo exacto. Me dices el modelo? Me dices el modelo?'
    );

    expect(result).toBe('Me falta el modelo exacto. Me dices el modelo?');
  });
});

describe('buildClarificationFirstFallbackText', () => {
  it('repairs thin clarification-first product search copy with one useful narrowing question', () => {
    const result = buildClarificationFirstFallbackText({
      text: '¡Claro!',
      query: 'recomiendame algo barato',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      toolCallCount: 0,
      hasProductSurfaces: false,
    });

    expect(result).not.toBe('¡Claro!');
    expect(result.length).toBeGreaterThan(40);
    expect(result).toContain('?');
    expect(result).toMatch(/econ[oó]mico|calidad|sabor|presentaci[oó]n/i);
  });

  it('keeps catalog-closed clarification repair scoped to skipped no-tool product search turns', () => {
    const original = '¡Claro!';

    expect(buildClarificationFirstFallbackText({
      text: original,
      query: 'recomiendame algo barato',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      toolCallCount: 1,
      hasProductSurfaces: false,
    })).toBe(original);

    expect(buildClarificationFirstFallbackText({
      text: original,
      query: 'recomiendame algo barato',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'search_leading',
      toolCallCount: 0,
      hasProductSurfaces: false,
    })).toBe(original);
  });
});
