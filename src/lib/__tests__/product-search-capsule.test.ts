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
    expect(contract.customer_response_draft).toContain('Para elegir sin darle demasiadas vueltas');
    expect(contract.customer_response_draft).toContain('si te late perfil menta, mira Waka Menta');
    expect(contract.customer_response_draft).toContain('si prefieres perfil mango, compara Waka Mango');
    expect(contract.customer_response_draft).toContain('Abre la opcion que mejor te encaje; si quieres confirmarlo, compara la otra');
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
    expect(contract.customer_response_draft).toContain('Abre primero Waka Menta');
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
    expect(contract.customer_response_draft).toContain('si te late perfil menta, mira Waka Somatch Menta');
    expect(contract.customer_response_draft).toContain('si prefieres perfil mango, compara Waka Somatch Mango');
    expect(contract.customer_response_draft).toContain('no por proximidad semantica');
    expect(contract.customer_response_draft).toContain('Abre la opcion que mejor te encaje; si quieres confirmarlo, compara la otra');
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
    expect(contract.customer_response_draft).toContain('Abre primero Waka Ice Mint');
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
    expect(contract.customer_response_draft).toContain('Para elegir sin darle demasiadas vueltas');
    expect(contract.customer_response_draft).toContain('si te late perfil menta, mira Waka Menta');
    expect(contract.customer_response_draft).toContain('si prefieres perfil mango, compara Waka Mango Ice');
    expect(contract.customer_response_draft).toContain('Abre la opcion que mejor te encaje; si quieres confirmarlo, compara la otra');
  });

  it('surfaces a third option only when it opens a genuinely different supported path', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'quiero comparar opciones',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Waka Menta',
          specs: {
            Sabor: 'Menta',
            Tipo: 'Desechable',
            Puffs: '6000',
          },
        }),
        makeProduct({
          id: '44444444-4444-4444-4444-444444444444',
          name: 'Waka Mango',
          slug: 'waka-mango',
          specs: {
            Sabor: 'Mango',
            Tipo: 'Desechable',
            Puffs: '8000',
          },
        }),
        makeProduct({
          id: '55555555-5555-5555-5555-555555555555',
          name: 'Blue Dream Cartucho',
          slug: 'blue-dream-cartucho',
          ai_sales_note: null,
          description: 'Cartucho con blue dream.',
          specs: {
            Tipo: 'Cartucho',
            Cepa: 'Blue Dream',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.customer_response_draft).toContain('si te late perfil menta, mira Waka Menta');
    expect(contract.customer_response_draft).toContain('si prefieres perfil mango, compara Waka Mango');
    expect(contract.customer_response_draft).toContain('Deja Blue Dream Cartucho solo si quieres formato cartucho');
  });

  it('keeps the comparison modest when supported differences are weak', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo parecido',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Waka Menta',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: {
            Puffs: '6000',
          },
        }),
        makeProduct({
          id: '66666666-6666-6666-6666-666666666666',
          name: 'Waka Ice Mint',
          slug: 'waka-ice-mint',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: {
            Puffs: '6000',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.customer_response_draft).toContain('mira Waka Menta y Waka Ice Mint como opciones cercanas antes de abrir mas fichas');
    expect(contract.customer_response_draft).not.toContain('si te late');
    expect(contract.customer_response_draft).not.toContain('si prefieres');
    expect(contract.customer_response_draft).not.toContain('validar la diferencia');
  });

  it('keeps a third flavor-only option hidden when it does not open a new path', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'quiero comparar sabores',
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
          id: '77777777-7777-7777-7777-777777777777',
          name: 'Waka Mango',
          slug: 'waka-mango',
          specs: {
            Sabor: 'Mango',
            Puffs: '6000',
          },
        }),
        makeProduct({
          id: '88888888-8888-8888-8888-888888888888',
          name: 'Waka Uva',
          slug: 'waka-uva',
          specs: {
            Sabor: 'Uva',
            Puffs: '6000',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.customer_response_draft).toContain('si te late perfil menta, mira Waka Menta');
    expect(contract.customer_response_draft).toContain('si prefieres perfil mango, compara Waka Mango');
    expect(contract.customer_response_draft).not.toContain('Waka Uva');
  });

  it('does not let soft-only cues create choice hierarchy', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo rico',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Opcion A',
          ai_sales_note: 'fresco y suave',
          description: 'Perfil fresco y suave.',
          specs: null,
        }),
        makeProduct({
          id: '99999999-9999-9999-9999-999999999999',
          name: 'Opcion B',
          slug: 'opcion-b',
          ai_sales_note: 'mas dulce',
          description: 'Perfil mas dulce.',
          specs: null,
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.customer_response_draft).toContain('mira Opcion A y Opcion B como opciones cercanas antes de abrir mas fichas');
    expect(contract.customer_response_draft).not.toContain('si te late');
    expect(contract.customer_response_draft).not.toContain('si prefieres');
    expect(contract.customer_response_draft).not.toContain('empieza por');
  });

  it('does not create start-here steering from array order when support is weak', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo cercano',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Primera Opcion',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: {
            Puffs: '6000',
          },
        }),
        makeProduct({
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          name: 'Segunda Opcion',
          slug: 'segunda-opcion',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: {
            Puffs: '6000',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.customer_response_draft).toContain('mira Primera Opcion y Segunda Opcion como opciones cercanas antes de abrir mas fichas');
    expect(contract.customer_response_draft).not.toContain('empieza por Primera Opcion');
    expect(contract.customer_response_draft).toContain('Abre la ficha que mas te interese; si quieres revisar otra opcion, compara la otra');
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
