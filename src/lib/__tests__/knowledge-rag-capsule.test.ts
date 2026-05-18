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

  it('qualifies unsupported delivery guarantees when shipping policy support is present', () => {
    const fallback = buildDegradedPolicyInquiryFallback({
      query: 'Â¿Me garantizas entrega maÃ±ana a domicilio?',
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
    expect(fallback.text).not.toMatch(/confirmada/i);
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

  const unsupportedDeliveryGuaranteeChunks = [
    {
      ...shippingScopeChunk,
      similarity: 0.78,
    },
    {
      ...shippingCostChunk,
      similarity: 0.77,
    },
  ];

  const unsupportedDeliveryTimingOnlyChunks = [
    {
      id: 'chunk-shipping-cutoff-1',
      source_id: 'politica-envios-corte-v1',
      title: 'Corte de envios DHL',
      category: 'shipping',
      content: 'Pedidos pagados antes de las 5:00 PM salen el mismo dia habil por DHL. La entrega se estima en 1-3 dias habiles segun cobertura y operacion.',
      similarity: 0.78,
    },
    {
      id: 'chunk-shipping-estimate-1',
      source_id: 'politica-envios-estimados-v1',
      title: 'Tiempos estimados de envio',
      category: 'shipping',
      content: 'Los tiempos de entrega son estimados y dependen de confirmacion de pago, destino, cobertura y operacion de paqueteria.',
      similarity: 0.77,
    },
    {
      id: 'chunk-local-delivery-1',
      source_id: 'politica-entrega-local-v1',
      title: 'Entrega local y costos',
      category: 'shipping',
      content: 'En Xalapa puede existir entrega local con costo y horario por confirmar antes de cerrar el pedido.',
      similarity: 0.76,
    },
  ];

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

  it.each([
    '¿Me garantizas entrega mañana a domicilio?',
    '¿Garantizan entrega mañana?',
    '¿Me llega mañana seguro a mi casa?',
  ])('qualifies unsupported delivery guarantees in the successful RAG path: %s', (query) => {
    const contract = evaluateKnowledgeRAGTree(
      unsupportedDeliveryGuaranteeChunks,
      false,
      14,
      query,
    );

    expect(contract.execution_status).toBe('SUCCESS');
    expect(contract.match_strategy).toBe('MODERATE_CONFIDENCE_MULTI_SOURCE');
    expect(contract.ui_render_hint).toContain('No puedo confirmar');
    expect(contract.ui_render_hint).toContain('garantia de entrega manana');
    expect(contract.ui_render_hint).toContain('entrega a domicilio');
    expect(contract.ui_render_hint).toContain('DHL ocurre');
    expect(contract.ui_render_hint).toContain('sucursal');
    expect(contract.ui_render_hint).toContain('tiempos y costos se confirman');
    expect(contract.resolved_chunks).toHaveLength(2);
    expect(contract.resolved_chunks?.map((chunk) => chunk.category)).toEqual(['shipping', 'shipping']);
    expect(contract.ui_render_hint).not.toMatch(/si\s+.*domicilio/i);
    expect(contract.ui_render_hint).not.toMatch(/garantizamos/i);
    expect(contract.ui_render_hint).not.toMatch(/entrega ma[ñn]ana a domicilio confirmada/i);
  });

  it('qualifies unsupported delivery guarantees when retrieval only has timing estimates', () => {
    const contract = evaluateKnowledgeRAGTree(
      unsupportedDeliveryTimingOnlyChunks,
      false,
      14,
      'me garantizas entrega manana a domicilio?',
    );

    expect(contract.execution_status).toBe('SUCCESS');
    expect(contract.match_strategy).toBe('MODERATE_CONFIDENCE_MULTI_SOURCE');
    expect(contract.ui_render_hint).toContain('No puedo confirmar');
    expect(contract.ui_render_hint).toContain('garantia de entrega manana');
    expect(contract.ui_render_hint).toContain('entrega a domicilio');
    expect(contract.ui_render_hint).toContain('DHL');
    expect(contract.ui_render_hint).toContain('tiempos estimados');
    expect(contract.ui_render_hint).toContain('sujetos a pago');
    expect(contract.ui_render_hint).toContain('cobertura');
    expect(contract.ui_render_hint).toContain('tiempos y costos se confirman');
    expect(contract.ui_render_hint).not.toContain('DHL ocurre');
    expect(contract.ui_render_hint).not.toContain('sucursal');
    expect(contract.resolved_chunks).toHaveLength(3);
    expect(contract.resolved_chunks?.map((chunk) => chunk.category)).toEqual(['shipping', 'shipping', 'shipping']);
    expect(contract.ui_render_hint).not.toMatch(/si\s+.*domicilio/i);
    expect(contract.ui_render_hint).not.toMatch(/garantizamos/i);
    expect(contract.ui_render_hint).not.toMatch(/entrega ma[Ã±n]ana a domicilio confirmada/i);
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
