import { describe, expect, it } from 'vitest';

import { compactCesarinResponseText } from '../../../supabase/functions/customer-intelligence/persona.ts';
import { buildClarificationFirstFallbackText, guardClarificationFirstFinalText } from '../../../supabase/functions/customer-intelligence/response-shaping.ts';

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

describe('guardClarificationFirstFinalText', () => {
  it('repairs bare acknowledgement final text for closed-catalog clarification-first product turns', () => {
    const result = guardClarificationFirstFinalText({
      text: '\u00a1Claro!',
      query: 'cual me conviene para uso diario',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    });

    expect(result).not.toBe('\u00a1Claro!');
    expect(result).toContain('?');
    expect(result.length).toBeGreaterThan(40);
  });

  it('keeps useful clarification questions unchanged on the same closed-catalog path', () => {
    const original = 'Claro. Para recomendarte bien, ¿buscas algo desechable o un equipo recargable?';

    expect(guardClarificationFirstFinalText({
      text: original,
      query: 'algo bueno y economico',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe(original);
  });

  it('does not apply outside clarification-first product clarification turns', () => {
    const original = '\u00a1Claro!';

    expect(guardClarificationFirstFinalText({
      text: original,
      query: 'hola',
      primaryIntent: 'CHIT_CHAT',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe(original);
  });

  it('does not apply when catalog is open or product surfaces exist', () => {
    const original = '\u00a1Claro!';

    expect(guardClarificationFirstFinalText({
      text: original,
      query: 'tienes sabor uva',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: true,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe(original);

    expect(guardClarificationFirstFinalText({
      text: original,
      query: 'tienes sabor uva',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 1,
      hasProductSurfaces: true,
    })).toBe(original);
  });

  it('uses human recovery copy for cut-message micro inputs without opening catalog surfaces', () => {
    for (const query of ['q', 'qu', 'que', '?', 'mmm']) {
      expect(guardClarificationFirstFinalText({
        text: 'No entendi bien tu mensaje.',
        query,
        primaryIntent: 'UNKNOWN',
        currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
        catalogGateReason: 'clarification_first',
        catalogGateOpen: false,
        toolCallCount: 0,
        productCardCount: 0,
        hasProductSurfaces: false,
      })).toBe('Parece que se te cort\u00f3 el mensaje, \u00bfqu\u00e9 quer\u00edas decirme?');
    }
  });

  it('asks a useful product or flavor clarification for incomplete tienes turns', () => {
    expect(guardClarificationFirstFinalText({
      text: '\u00a1Claro!',
      query: 'tienes',
      primaryIntent: 'PRODUCT_SEARCH',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe('S\u00ed, \u00bfqu\u00e9 producto o sabor est\u00e1s buscando?');
  });

  it('keeps no se as guided help instead of cut-message copy', () => {
    expect(guardClarificationFirstFinalText({
      text: 'Claro.',
      query: 'no s\u00e9',
      primaryIntent: 'UNKNOWN',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe('No pasa nada. \u00bfQuieres que te oriente por equipo, l\u00edquido o algo econ\u00f3mico para empezar?');
  });

  it('does not turn greetings or help requests into cut-message copy', () => {
    const greeting = 'Hola. \u00bfEn qu\u00e9 te ayudo?';
    const help = 'Claro. Dime si quieres ayuda con productos, pedidos o pagos.';

    expect(guardClarificationFirstFinalText({
      text: greeting,
      query: 'hola',
      primaryIntent: 'CHIT_CHAT',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe(greeting);

    expect(guardClarificationFirstFinalText({
      text: help,
      query: 'ayuda',
      primaryIntent: 'UNKNOWN',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe(help);
  });

  it('keeps micro recovery disabled for tool or product-surface turns', () => {
    const original = 'Estoy revisando opciones.';

    expect(guardClarificationFirstFinalText({
      text: original,
      query: 'qu',
      primaryIntent: 'UNKNOWN',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 1,
      productCardCount: 0,
      hasProductSurfaces: false,
    })).toBe(original);

    expect(guardClarificationFirstFinalText({
      text: original,
      query: 'qu',
      primaryIntent: 'UNKNOWN',
      currentTurnDecision: 'ASK_CLARIFYING_QUESTION',
      catalogGateReason: 'clarification_first',
      catalogGateOpen: false,
      toolCallCount: 0,
      productCardCount: 1,
      hasProductSurfaces: true,
    })).toBe(original);
  });
});
