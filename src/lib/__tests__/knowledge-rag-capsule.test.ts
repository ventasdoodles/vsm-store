import { describe, expect, it } from 'vitest';

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
