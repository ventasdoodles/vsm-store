import { describe, expect, it } from 'vitest';

import {
  buildCesarinNonHollowFallbackText,
  compactCesarinResponseText,
} from '../../../supabase/functions/customer-intelligence/persona';

describe('customer-intelligence persona fallbacks', () => {
  it('keeps the text guarantee fallback useful instead of generic filler', () => {
    const fallback = buildCesarinNonHollowFallbackText({
      query: 'tienen pods compatibles con mi equipo?',
      reason: 'empty_model_response',
    });

    expect(fallback).toContain('¡Ups! Me agarraste un poco en curva');
    expect(fallback).toContain('tienen pods compatibles con mi equipo?');
    expect(fallback).not.toMatch(/estoy aqui para ayudarte/i);
  });

  it('keeps empty-query fallback bounded to storefront help categories', () => {
    const fallback = buildCesarinNonHollowFallbackText();

    expect(fallback).toContain('producto');
    expect(fallback).toContain('envío');
    expect(fallback).toContain('pedido');
    expect(fallback).not.toMatch(/estoy aqui para ayudarte/i);
  });

  it('normalizes spaces in response text', () => {
    const compacted = compactCesarinResponseText(
      'Si quieres, te paso una opcion.   Te paso una opcion.'
    );

    expect(compacted).toBe('Si quieres, te paso una opcion. Te paso una opcion.');
  });
});
