import { describe, expect, it } from 'vitest';

import { evaluateProductSearchFallbackTree } from '../product-search-capsule';
import type { InternalResolvedProduct } from '../../types/ai-capsule';

function makeProduct(overrides?: Partial<InternalResolvedProduct>): InternalResolvedProduct {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'waka-menta',
    section: 'vape',
    name: 'Waka Menta',
    display_price: '$299',
    raw_stock: 9,
    status_signal: 'IN_STOCK',
    commercial_flag: 'STANDARD',
    ai_sales_note: 'pega sabroso y fresco',
    description: 'Perfil fresco para todo el dia.',
    specs: {
      Sabor: 'Menta',
      Puffs: '6000',
    },
    ...overrides,
  };
}

describe('evaluateProductSearchFallbackTree', () => {
  it('asks one sharper ambiguity question instead of drifting across multiple axes', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo de menta',
        is_ambiguous: true,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct(),
        makeProduct({
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Waka Mango',
          slug: 'waka-mango',
          specs: {
            Sabor: 'Mango',
            Puffs: '8000',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('FEATURED_FALLBACK');
    expect(contract.customer_response_draft).toContain('desechable, pod, cartucho o algo 420');
    expect(contract.customer_response_draft).not.toContain('rango de precio');
    expect(contract.customer_response_draft).toContain('Para decidir mas rapido');
    expect(contract.customer_response_draft).toContain('Abre primero la que mas te haga sentido');
  });

  it('asks a sharper beginner-oriented narrowing question when the user signals starting intent', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'quiero algo para empezar',
        is_ambiguous: true,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [makeProduct()],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('FEATURED_FALLBACK');
    expect(contract.customer_response_draft).toContain('algo simple para empezar');
    expect(contract.customer_response_draft).not.toContain('me das mas detalles');
  });

  it('marks token rescue distinctly from embedding semantic recovery', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka somatch mb6000',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Waka Somatch Menta',
          ai_sales_note: null,
        }),
        makeProduct({
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Waka Somatch Mango',
          slug: 'waka-somatch-mango',
          ai_sales_note: 'mango mas dulce',
          specs: {
            Sabor: 'Mango',
            Puffs: '6000',
          },
        }),
      ],
      semantic_match_source: 'TOKEN_RECOVERY',
    });

    expect(contract.match_strategy).toBe('TOKEN_RECOVERY');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.customer_response_draft).toContain('No encontre "waka somatch mb6000" exactamente');
    expect(contract.customer_response_draft).toContain('si te late perfil menta');
    expect(contract.customer_response_draft).toContain('si prefieres perfil mango');
    expect(contract.customer_response_draft).toContain('no por proximidad semantica');
    expect(contract.customer_response_draft).toContain('agregarla al carrito');
  });

  it('keeps out-of-stock recovery commercially useful without overstating certainty', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          status_signal: 'OUT_OF_STOCK',
          raw_stock: 0,
        }),
      ],
      semantic_matches: [
        makeProduct({
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Waka Ice Mint',
          slug: 'waka-ice-mint',
        }),
      ],
      semantic_match_source: 'TOKEN_RECOVERY',
    });

    expect(contract.match_strategy).toBe('OUT_OF_STOCK_ALTERNATIVE');
    expect(contract.retrieval_source).toBe('TOKEN_RECOVERY');
    expect(contract.customer_response_draft).toContain('esta agotado');
    expect(contract.customer_response_draft).toContain('Te dejo opciones cercanas');
    expect(contract.customer_response_draft).toContain('agregarla al carrito');
  });

  it('contrasts semantic options so the customer can choose a path instead of getting a flat list', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo fresco para el dia',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Waka Menta',
          specs: {
            Sabor: 'Menta',
            Puffs: '6000',
          },
        }),
        makeProduct({
          id: '44444444-4444-4444-4444-444444444444',
          name: 'Waka Mango Ice',
          slug: 'waka-mango-ice',
          specs: {
            Sabor: 'Mango',
            Puffs: '8000',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.retrieval_source).toBe('EMBEDDING_SEMANTIC');
    expect(contract.customer_response_draft).toContain('Para decidir mas rapido');
    expect(contract.customer_response_draft).toContain('revisa Waka Menta');
    expect(contract.customer_response_draft).toContain('mira Waka Mango Ice');
    expect(contract.customer_response_draft).toContain('Abre primero la que mas te haga sentido');
  });

  it('avoids dead-end no-match phrasing and asks for the missing recovery detail', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka somatch mb6000',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.retrieval_source).toBe('NONE');
    expect(contract.customer_response_draft).toContain('No encontre "waka somatch mb6000" tal cual');
    expect(contract.customer_response_draft).toContain('marca, la serie');
  });
});
