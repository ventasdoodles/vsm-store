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
});
