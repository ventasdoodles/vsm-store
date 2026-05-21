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

    expect(fallback).toContain('No pude cerrar esa respuesta con suficiente certeza');
    expect(fallback).toContain('tienen pods compatibles con mi equipo?');
    expect(fallback).toContain('verdad disponible');
    expect(fallback).not.toMatch(/estoy aqui para ayudarte/i);
    expect(fallback).not.toMatch(/que necesitas/i);
  });

  it('keeps empty-query fallback bounded to storefront help categories', () => {
    const fallback = buildCesarinNonHollowFallbackText();

    expect(fallback).toContain('producto');
    expect(fallback).toContain('envio');
    expect(fallback).toContain('pago');
    expect(fallback).toContain('pedido');
    expect(fallback).not.toMatch(/estoy aqui para ayudarte/i);
  });

  it('still compacts repetitive response text without adding a reflex CTA', () => {
    const compacted = compactCesarinResponseText(
      'Si quieres, te paso una opcion. Te paso una opcion. Si necesitas te muestro mas opciones.',
    );

    expect(compacted).toBe('te paso una opcion');
    expect(compacted).not.toContain('Si necesitas');
  });
});
