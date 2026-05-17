import { describe, expect, it } from 'vitest';

import { buildDegradedPolicyInquiryFallback } from '../../../supabase/functions/customer-intelligence/policy-degraded-fallback';

describe('customer-intelligence degraded policy fallback', () => {
  it('uses trusted payment truth for card questions when policy retrieval is unavailable', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: 'aceptan pago con tarjeta?',
      policyOutput: 'No se encontraron politicas especificas.',
      policyMatchCount: 0,
    });

    expect(fallback.strategy).toBe('trusted_rule_payment');
    expect(fallback.text).toBe('Por ahora manejamos solo transferencia o deposito bancario.');
  });

  it('uses a bounded store-hours limitation instead of the generic degraded line', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: 'a que hora abren hoy?',
      policyOutput: 'No se encontraron politicas especificas.',
      policyMatchCount: 0,
    });

    expect(fallback.strategy).toBe('store_hours_limit');
    expect(fallback.text).toContain('horario exacto');
    expect(fallback.text).toContain('WhatsApp');
    expect(fallback.text).not.toContain('se me cruzaron los cables');
  });

  it('prefers grounded policy context when the shipping answer is already available', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: 'hacen envios a todo mexico?',
      policyOutput: '[Envios] Hacemos envios por DHL Express a sucursal en todo Mexico.',
      policyMatchCount: 1,
    });

    expect(fallback.strategy).toBe('policy_context');
    expect(fallback.text).toContain('DHL Express');
    expect(fallback.text).toContain('Mexico');
  });

  it('qualifies unsupported next-day home delivery guarantees even with shipping policy context', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: 'me garantizas entrega manana a domicilio?',
      policyOutput: [
        '[Envios] Hacemos envios por DHL ocurre a sucursal en todo Mexico.',
        '[Costos] El costo del envio varia por peso y destino; se confirma antes de cerrar el pedido.',
      ].join('\n'),
      policyMatchCount: 2,
    });

    expect(fallback.strategy).toBe('unsupported_shipping_promise_limit');
    expect(fallback.text).toContain('No puedo confirmar');
    expect(fallback.text).toContain('entrega manana garantizada');
    expect(fallback.text).toContain('entrega a domicilio');
    expect(fallback.text).toContain('DHL ocurre');
    expect(fallback.text).toContain('sucursal');
    expect(fallback.text).toContain('tiempos y costos se confirman');
    expect(fallback.text).not.toMatch(/si\s+.*domicilio/i);
    expect(fallback.text).not.toMatch(/garantizamos/i);
    expect(fallback.text).not.toMatch(/entrega ma[ñn]ana a domicilio confirmada/i);
  });
});
