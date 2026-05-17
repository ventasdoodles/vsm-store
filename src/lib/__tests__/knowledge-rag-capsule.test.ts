import { describe, expect, it } from 'vitest';

import { buildDegradedPolicyInquiryFallback } from '../../../supabase/functions/customer-intelligence/policy-degraded-fallback';
import { buildEmptyKnowledgeContract, evaluateKnowledgeRAGTree } from '../knowledge-rag-capsule';

describe('knowledge RAG capsule main message synthesis', () => {
  it('summarizes the top resolved chunk in the customer-visible hint', () => {
    const contract = evaluateKnowledgeRAGTree([
      {
        id: 'chunk-payments-1',
        source_id: 'politica-pagos-v2',
        title: 'Metodos de pago aceptados',
        category: 'payments',
        content: 'Se aceptan transferencia bancaria y deposito; el pedido avanza cuando se confirma el pago.',
        similarity: 0.7289,
      },
      {
        id: 'chunk-shipping-1',
        source_id: 'politica-envios-detallada-v1',
        title: 'Politica de envio DHL',
        category: 'shipping',
        content: 'El envio por DHL se cotiza antes de confirmar el pedido y se comparte con el cliente.',
        similarity: 0.7278,
      },
    ], false, 12);

    expect(contract.capsule_name).toBe('knowledge_rag_foundation');
    expect(contract.match_strategy).toBe('MODERATE_CONFIDENCE_MULTI_SOURCE');
    expect(contract.ui_render_hint).toContain('Metodos de pago aceptados');
    expect(contract.ui_render_hint).toContain('Se aceptan transferencia bancaria');
    expect(contract.resolved_chunks?.[0]).toMatchObject({
      id: 'chunk-payments-1',
      source_id: 'politica-pagos-v2',
      title: 'Metodos de pago aceptados',
      category: 'payments',
      content: expect.stringContaining('transferencia bancaria'),
    });
  });

  it('keeps the generic empty fallback when no useful chunks exist', () => {
    const contract = buildEmptyKnowledgeContract(9);

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.resolved_chunks).toEqual([]);
    expect(contract.ui_render_hint).toContain('base de datos oficial');
  });
});

describe('scoped RAG answer-quality harness', () => {
  const paymentChunk = {
    id: 'chunk-payments-1',
    source_id: 'politica-pagos-v2',
    title: 'Metodos de pago aceptados',
    category: 'payments',
    content: 'Solo aceptamos pago por transferencia o deposito bancario. No manejamos pago con tarjeta.',
    similarity: 0.86,
  };

  const shippingScopeChunk = {
    id: 'chunk-shipping-scope-1',
    source_id: 'politica-envios-ocurre-v1',
    title: 'Envios por DHL ocurre',
    category: 'shipping',
    content: 'Hacemos envios a todo Mexico por DHL ocurre a sucursal, no a domicilio.',
    similarity: 0.84,
  };

  const shippingCostChunk = {
    id: 'chunk-shipping-cost-1',
    source_id: 'politica-envios-costos-v1',
    title: 'Costos de envio DHL',
    category: 'shipping',
    content: 'El costo del envio por DHL varia segun peso y destino; se calcula antes de confirmar el pedido.',
    similarity: 0.83,
  };

  const assertNoHallucinatedPaymentOrShippingClaim = (text: string) => {
    expect(text).not.toMatch(/aceptamos tarjeta/i);
    expect(text).not.toMatch(/pago con tarjeta disponible/i);
    expect(text).not.toMatch(/envio a domicilio/i);
    expect(text).not.toMatch(/envio gratis/i);
    expect(text).not.toMatch(/entrega manana garantizada/i);
    expect(text).not.toMatch(/entrega ma[ñn]ana garantizada/i);
  };

  it('grounds payment-method answers without inventing card payment support', () => {
    const contract = evaluateKnowledgeRAGTree([paymentChunk], false, 10);

    expect(contract.capsule_name).toBe('knowledge_rag_foundation');
    expect(contract.execution_status).toBe('SUCCESS');
    expect(contract.match_strategy).toBe('HIGH_CONFIDENCE_POLICY_MATCH');
    expect(contract.ui_render_hint).toContain('Metodos de pago aceptados');
    expect(contract.ui_render_hint).toContain('transferencia');
    expect(contract.ui_render_hint).toContain('deposito');
    expect(contract.resolved_chunks).toHaveLength(1);
    expect(contract.resolved_chunks?.[0]).toMatchObject({
      id: 'chunk-payments-1',
      category: 'payments',
      content: expect.stringContaining('transferencia'),
    });
    assertNoHallucinatedPaymentOrShippingClaim(contract.ui_render_hint);
  });

  it('grounds shipping scope answers to DHL ocurre instead of domicilio', () => {
    const contract = evaluateKnowledgeRAGTree([shippingScopeChunk], false, 11);

    expect(contract.match_strategy).toBe('HIGH_CONFIDENCE_POLICY_MATCH');
    expect(contract.ui_render_hint).toContain('Envios por DHL ocurre');
    expect(contract.ui_render_hint).toContain('DHL ocurre');
    expect(contract.ui_render_hint).toContain('no a domicilio');
    expect(contract.resolved_chunks?.[0]).toMatchObject({
      id: 'chunk-shipping-scope-1',
      category: 'shipping',
      content: expect.stringContaining('no a domicilio'),
    });
    expect(contract.ui_render_hint).not.toMatch(/si\s+a domicilio/i);
    expect(contract.ui_render_hint).not.toMatch(/entrega a domicilio/i);
  });

  it('grounds shipping-cost answers without inventing a fixed DHL price', () => {
    const contract = evaluateKnowledgeRAGTree([shippingCostChunk], false, 12);

    expect(contract.match_strategy).toBe('HIGH_CONFIDENCE_POLICY_MATCH');
    expect(contract.ui_render_hint).toContain('Costos de envio DHL');
    expect(contract.ui_render_hint).toContain('varia segun peso y destino');
    expect(contract.resolved_chunks?.[0]).toMatchObject({
      id: 'chunk-shipping-cost-1',
      category: 'shipping',
    });
    expect(contract.ui_render_hint).not.toMatch(/\$ ?\d+/);
    expect(contract.ui_render_hint).not.toMatch(/costo fijo/i);
  });

  it('summarizes combined payment and shipping support from multiple chunks', () => {
    const contract = evaluateKnowledgeRAGTree([
      { ...paymentChunk, similarity: 0.74 },
      { ...shippingScopeChunk, similarity: 0.73 },
      { ...shippingCostChunk, similarity: 0.72 },
    ], true, 13);

    expect(contract.match_strategy).toBe('MODERATE_CONFIDENCE_MULTI_SOURCE');
    expect(contract.ui_render_hint).toContain('Metodos de pago aceptados');
    expect(contract.ui_render_hint).toContain('transferencia');
    expect(contract.resolved_chunks).toHaveLength(3);
    expect(contract.resolved_chunks?.map((chunk) => chunk.category)).toEqual(['payments', 'shipping', 'shipping']);
    assertNoHallucinatedPaymentOrShippingClaim(contract.ui_render_hint);
  });

  it('uses a bounded store-hours limitation when policy support is absent', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: '¿A qué hora abren hoy?',
      policyOutput: 'No se encontraron politicas especificas.',
      policyMatchCount: 0,
    });

    expect(fallback.strategy).toBe('store_hours_limit');
    expect(fallback.text).toContain('horario exacto');
    expect(fallback.text).toContain('WhatsApp');
    expect(fallback.text).not.toContain('abierto hoy');
    expect(fallback.text).not.toContain('cerramos a');
  });

  it('refuses unsupported delivery guarantees instead of promising next-day domicilio', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: '¿Me garantizas entrega mañana a domicilio?',
      policyOutput: 'No se encontraron politicas especificas.',
      policyMatchCount: 0,
    });

    expect(fallback.strategy).toBe('generic_policy_limit');
    expect(fallback.text).toContain('no traigo esa politica confirmada');
    expect(fallback.text).toContain('WhatsApp');
    expect(fallback.text).not.toMatch(/garant/i);
    expect(fallback.text).not.toMatch(/domicilio/i);
    expect(fallback.text).not.toMatch(/ma[ñn]ana/i);
  });
});
