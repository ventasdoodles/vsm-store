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
    expect(contract.customer_response_draft).toContain('si te late perfil menta, Waka Menta ya es la salida mas clara para avanzar');
    expect(contract.customer_response_draft).toContain('compara Waka Mango solo si prefieres perfil mango');
    expect(contract.customer_response_draft).toContain('Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
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
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Waka Menta para revisarla bien');
  });

  it('reinforces an exact match with modest confidence instead of stopping at flat confirmation', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [makeProduct()],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.retrieval_source).toBe('DIRECT_EXACT');
    expect(contract.customer_response_draft).toContain('Aqui tienes exactamente lo que buscabas');
    expect(contract.customer_response_draft).toContain('ya vas sobre una opcion clara para seguir');
    expect(contract.customer_response_draft).toContain('Si lo que quieres llevar es el sabor menta, esta ya queda como la version mas precisa para carrito');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma ese sabor; si coincide, agrega esa version al carrito');
  });

  it('handles a late exact worth-it objection without resetting the path', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta vale la pena',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [makeProduct()],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toContain('Si la duda es si vale la pena, el punto mas claro aqui es este: pega sabroso y fresco');
    expect(contract.customer_response_draft).toContain('Si esa era la duda, Waka Menta ya queda bien posicionado para seguir con esta ficha');
    expect(contract.customer_response_draft).toContain('Si lo que quieres llevar es el sabor menta, esta ya queda como la version mas precisa para carrito');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma ese sabor; si coincide, agrega esa version al carrito');
  });

  it('yields a real flash-deal line on a price-sensitive exact turn without inventing extra urgency', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta vale la pena',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [makeProduct()],
      semantic_matches: [],
      semantic_match_source: 'NONE',
      promotion_signal: {
        kind: 'FLASH_DEAL',
        product_id: '11111111-1111-1111-1111-111111111111',
        product_name: 'Waka Menta',
        flash_price: 249,
        original_price: 299,
        savings_amount: 50,
        ends_at: '2026-04-05T00:00:00.000Z',
        informational_only: true,
      },
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toContain('Waka Menta trae flash deal real ahorita: baja de $299 a $249');
    expect(contract.customer_response_draft).not.toContain('aplico');
    expect(contract.promotion_signal).toEqual({
      kind: 'FLASH_DEAL',
      product_id: '11111111-1111-1111-1111-111111111111',
      product_name: 'Waka Menta',
      flash_price: 249,
      original_price: 299,
      savings_amount: 50,
      ends_at: '2026-04-05T00:00:00.000Z',
      informational_only: true,
    });
  });

  it('asks for the last decisive selector before sounding cart-precise', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          ai_sales_note: null,
          specs: {
            Nicotina: '5%',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toContain('Si lo que quieres llevar es 5% de nicotina, esta ya queda como la version mas precisa para carrito');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma esa nicotina; si coincide, agrega esa version al carrito');
  });

  it('answers a nicotine fact question directly from alias-backed specs instead of drifting into generic exact-match copy', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'que nicotina trae waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          specs: {
            'Concentración de nicotina': '5%',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toBe('Waka Menta viene con 5% de nicotina.');
    expect(contract.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'FACT',
      fact_family: 'Nicotina',
    });
    expect(contract.help_contract).toEqual({
      compare_supported: false,
      preferred_product_id: '11111111-1111-1111-1111-111111111111',
      secondary_product_id: null,
      action_strength: 'review_only',
    });
    expect(contract.customer_response_draft).not.toContain('Aqui tienes exactamente lo que buscabas');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('answers a flavor fact question directly from flavor aliases', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'que sabor es waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          specs: {
            Flavor: 'Menta Helada',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toBe('El sabor de Waka Menta es menta helada.');
    expect(contract.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'FACT',
      fact_family: 'Sabor',
    });
    expect(contract.help_contract).toEqual({
      compare_supported: false,
      preferred_product_id: '11111111-1111-1111-1111-111111111111',
      secondary_product_id: null,
      action_strength: 'review_only',
    });
    expect(contract.customer_response_draft).not.toContain('Abre la ficha');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('answers a version fact question directly from model-version aliases', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'que version es caliburn g3',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Caliburn G3',
          slug: 'caliburn-g3',
          specs: {
            'Versión': 'G3 Pro',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toBe('La version de Caliburn G3 es G3 Pro.');
    expect(contract.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'FACT',
      fact_family: 'Modelo',
    });
    expect(contract.help_contract).toEqual({
      compare_supported: false,
      preferred_product_id: '33333333-3333-3333-3333-333333333333',
      secondary_product_id: null,
      action_strength: 'review_only',
    });
    expect(contract.customer_response_draft).not.toContain('Aqui tienes exactamente lo que buscabas');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('answers a compatibility fact question directly when that supported spec is present', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka pod compatible con que',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          name: 'Waka Pod',
          slug: 'waka-pod',
          specs: {
            'Compatible con': 'cartuchos Waka X',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toBe('La ficha de Waka Pod indica compatibilidad con cartuchos Waka X.');
    expect(contract.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'FACT',
      fact_family: 'Compatibilidad',
    });
    expect(contract.help_contract).toEqual({
      compare_supported: false,
      preferred_product_id: '11111111-1111-1111-1111-111111111111',
      secondary_product_id: null,
      action_strength: 'review_only',
    });
    expect(contract.customer_response_draft).not.toContain('Waka Pod es compatible con');
    expect(contract.customer_response_draft).not.toContain('Abre la ficha');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('stays honest when compatibility is asked but the supported spec is missing', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta compatible con que',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          specs: {
            Sabor: 'Menta',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toBe(
      'No veo una compatibilidad exacta cargada para Waka Menta. Mejor revisa la ficha antes de tomarlo como dato exacto.',
    );
    expect(contract.truth_signals).toEqual({
      direct_answer_complete: true,
      direct_answer_kind: 'HONEST_MISSING_FACT',
      fact_family: 'Compatibilidad',
    });
    expect(contract.help_contract).toEqual({
      compare_supported: false,
      preferred_product_id: '11111111-1111-1111-1111-111111111111',
      secondary_product_id: null,
      action_strength: 'review_only',
    });
    expect(contract.customer_response_draft).not.toContain('compatible con');
    expect(contract.customer_response_draft).not.toContain('Aqui tienes exactamente lo que buscabas');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('does not add checkout-readiness to a true single exact path without a qualifying selector or recovery support', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          ai_sales_note: null,
          specs: {
            Cepa: 'Blue Dream',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).not.toContain('practicamente listo para compra');
    expect(contract.customer_response_draft).not.toContain('Abre la ficha y confirma');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
    expect(contract.customer_response_draft).not.toContain('agrega esa version al carrito');
    expect(contract.customer_response_draft).toContain('Abre la ficha para confirmarlo; si ya es el que quieres, agregalo al carrito');
  });

  it('keeps broad tipo-only exact support at readiness level instead of promoting cart precision', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          ai_sales_note: null,
          specs: {
            Tipo: 'Desechable',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toContain('Si ese formato desechable es el que quieres, este ya queda practicamente listo para compra');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma solo ese detalle; si te cuadra, agregalo al carrito');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
    expect(contract.customer_response_draft).not.toContain('agrega esa version al carrito');
  });

  it('pivots a missing variant to in-stock siblings instead of staying on the parent product', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka pod rojo',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          name: 'Waka Pod Rojo',
          slug: 'waka-pod-rojo',
          variant_truth: {
            requested_variant_intent: true,
            requested_attribute: 'color',
            requested_value: 'rojo',
            availability: 'missing',
            matched_variant_id: null,
            matched_variant_label: 'rojo',
            active_variant_count: 2,
            available_variant_count: 1,
          },
        }),
      ],
      semantic_matches: [
        makeProduct({
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Waka Pod Azul',
          slug: 'waka-pod-azul',
          ai_sales_note: 'mismo formato en otro color',
          specs: {
            Sabor: 'Azul',
            Marca: 'Waka',
          },
        }),
        makeProduct({
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Blue Dream Cartucho',
          slug: 'blue-dream-cartucho',
          ai_sales_note: 'otra ruta menos parecida',
          specs: {
            Tipo: 'Cartucho',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('OUT_OF_STOCK_ALTERNATIVE');
    expect(contract.search_confidence).toBeCloseTo(0.75, 2);
    expect(contract.customer_response_draft).toContain('La variante pedida rojo esta agotada');
    expect(contract.customer_response_draft).toContain('alternativas azul y waka en existencia');
    expect(contract.customer_response_draft).toContain('Te dejo opciones cercanas para que no se te cierre la compra');
    expect(contract.customer_response_draft).toContain('Waka Pod Azul');
    expect(contract.resolved_products?.[0]?.name).toBe('Waka Pod Azul');
    expect(contract.resolved_products?.every((product) => product.status_signal !== 'OUT_OF_STOCK')).toBe(true);
  });

  it('degrades honestly when a missing variant has no grounded substitute', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka pod rojo',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          name: 'Waka Pod Rojo',
          slug: 'waka-pod-rojo',
          variant_truth: {
            requested_variant_intent: true,
            requested_attribute: 'color',
            requested_value: 'rojo',
            availability: 'missing',
            matched_variant_id: null,
            matched_variant_label: 'rojo',
            active_variant_count: 2,
            available_variant_count: 1,
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.customer_response_draft).toContain('El producto existe, pero la variante pedida rojo no esta disponible ahorita.');
    expect(contract.customer_response_draft).toContain('Si me das sabor, intensidad o marca, te regreso opciones mucho mas utiles.');
    expect(contract.resolved_products).toHaveLength(0);
  });

  it('keeps exact multi-match responses neutral instead of implying one clear option', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct(),
        makeProduct({
          id: '12121212-1212-1212-1212-121212121212',
          name: 'Waka Mango',
          slug: 'waka-mango',
          ai_sales_note: 'mango mas dulce',
          specs: {
            Sabor: 'Mango',
            Puffs: '8000',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.retrieval_source).toBe('DIRECT_EXACT');
    expect(contract.customer_response_draft).toContain('Encontre varias coincidencias exactas para "waka"');
    expect(contract.customer_response_draft).not.toContain('ya vas sobre una opcion clara para seguir');
    expect(contract.customer_response_draft).not.toContain('Abre la ficha para confirmarlo');
    expect(contract.customer_response_draft).toContain('Empieza por la ficha que mas te haga sentido; si todavia te queda una duda puntual, revisa la otra');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
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
    expect(contract.customer_response_draft).toContain('si te late perfil menta, Waka Somatch Menta ya es la salida mas clara para avanzar');
    expect(contract.customer_response_draft).toContain('compara Waka Somatch Mango solo si prefieres perfil mango');
    expect(contract.customer_response_draft).toContain('no por proximidad semantica');
    expect(contract.customer_response_draft).toContain('Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real');
    expect(contract.customer_response_draft).toContain('Si la primera ya es la que quieres, agregala al carrito');
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
    expect(contract.customer_response_draft).not.toContain('temporalmente agotado');
    expect(contract.customer_response_draft).toContain('Si ese ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas');
    expect(contract.customer_response_draft).toContain('Si lo que quieres llevar es el sabor menta, esta ya queda como la version mas precisa para carrito');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma ese sabor; si coincide, agrega esa version al carrito');
  });

  it('turns a supported out-of-stock worth-it recovery into a commitment-ready next step', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka menta vale la pena',
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
          id: 'dededede-dede-dede-dede-dededededede',
          name: 'Waka Ice Mint',
          slug: 'waka-ice-mint',
        }),
      ],
      semantic_match_source: 'TOKEN_RECOVERY',
    });

    expect(contract.match_strategy).toBe('OUT_OF_STOCK_ALTERNATIVE');
    expect(contract.customer_response_draft).toContain('Si la duda es si vale la pena, el punto mas claro aqui es este: pega sabroso y fresco');
    expect(contract.customer_response_draft).toContain('Si esa era la duda, Waka Ice Mint ya queda bien posicionado para seguir con esta ficha');
    expect(contract.customer_response_draft).toContain('Si lo que quieres llevar es el sabor menta, esta ya queda como la version mas precisa para carrito');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma ese sabor; si coincide, agrega esa version al carrito');
  });

  it('keeps checkout-readiness on a strong post-recovery path even without a qualifying selector when recovery support is explicit', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'waka vale la pena',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          specs: {
            Cepa: 'Blue Dream',
          },
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.customer_response_draft).toContain('Si la duda es si vale la pena, el punto mas claro aqui es este: pega sabroso y fresco');
    expect(contract.customer_response_draft).toContain('Si esa era la duda, Waka Menta ya queda bien posicionado para seguir con esta ficha');
    expect(contract.customer_response_draft).toContain('Si ese ya era el ultimo punto que necesitabas resolver, este ya queda practicamente listo para compra');
    expect(contract.customer_response_draft).toContain('Abre la ficha y si ese punto ya te cierra, agregalo al carrito');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
    expect(contract.customer_response_draft).not.toContain('agrega esa version al carrito');
  });

  it('keeps tipo-only out-of-stock fallback at readiness level instead of promoting cart precision', () => {
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
          id: '67676767-6767-6767-6767-676767676767',
          name: 'Waka Desechable',
          slug: 'waka-desechable',
          ai_sales_note: null,
          specs: {
            Tipo: 'Desechable',
          },
        }),
      ],
      semantic_match_source: 'TOKEN_RECOVERY',
    });

    expect(contract.match_strategy).toBe('OUT_OF_STOCK_ALTERNATIVE');
    expect(contract.customer_response_draft).toContain('Si ese formato desechable es el que quieres, este ya queda practicamente listo para compra');
    expect(contract.customer_response_draft).toContain('Abre la ficha y confirma solo ese detalle; si te cuadra, agregalo al carrito');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
    expect(contract.customer_response_draft).not.toContain('agrega esa version al carrito');
  });

  it('keeps single semantic fallback at review-only when support is weak', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo cercano',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Opcion Cercana',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: null,
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.customer_response_draft).toContain('Si ese ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas');
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Opcion Cercana para revisarla bien');
    expect(contract.customer_response_draft).not.toContain('practicamente listo para compra');
    expect(contract.customer_response_draft).not.toContain('agregalo al carrito');
  });

  it('keeps single out-of-stock fallback at review-only when support is weak', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'producto agotado',
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
          id: 'abababab-abab-abab-abab-abababababab',
          name: 'Alternativa Cercana',
          slug: 'alternativa-cercana',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: null,
        }),
      ],
      semantic_match_source: 'TOKEN_RECOVERY',
    });

    expect(contract.match_strategy).toBe('OUT_OF_STOCK_ALTERNATIVE');
    expect(contract.customer_response_draft).toContain('Si ese ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas');
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Alternativa Cercana para revisarla bien');
    expect(contract.customer_response_draft).not.toContain('practicamente listo para compra');
    expect(contract.customer_response_draft).not.toContain('agregalo al carrito');
  });

  it('keeps out-of-stock objection recovery local when fallback support is weak', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'producto agotado mmm no se',
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
          id: 'acacacac-acac-acac-acac-acacacacacac',
          name: 'Alternativa Cercana',
          slug: 'alternativa-cercana',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: null,
        }),
      ],
      semantic_match_source: 'TOKEN_RECOVERY',
    });

    expect(contract.match_strategy).toBe('OUT_OF_STOCK_ALTERNATIVE');
    expect(contract.customer_response_draft).toContain('Si la duda sigue abierta, mejor quedate en esta ficha antes de moverte a otra cosa');
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Alternativa Cercana para revisarla bien');
    expect(contract.customer_response_draft).not.toContain('agregalo al carrito');
  });

  it('recovers a cheaper objection with one nearby alternative instead of reopening the funnel', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'algo fresco pero mas barato',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Waka Menta',
          display_price: '$349',
          specs: {
            Sabor: 'Menta',
            Puffs: '6000',
          },
        }),
        makeProduct({
          id: '43434343-4343-4343-4343-434343434343',
          name: 'Waka Mango',
          slug: 'waka-mango',
          display_price: '$249',
          specs: {
            Sabor: 'Mango',
            Puffs: '8000',
          },
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.customer_response_draft).toContain('compara solo Waka Mango');
    expect(contract.customer_response_draft).toContain('Waka Mango ya queda como una salida mas accesible y bien posicionada dentro de estas opciones');
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Waka Mango; compara Waka Menta solo si ese ultimo tradeoff todavia importa');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('offers only one nearby alternative when the objection is to open another path late', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'quiero otra opcion',
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
          id: '45454545-4545-4545-4545-454545454545',
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
    expect(contract.customer_response_draft).toContain('Si quieres abrir otra via, compara solo Waka Mango Ice; no hace falta abrir mas ramas');
    expect(contract.customer_response_draft).toContain('Si esa era la ultima comparacion que te faltaba, quedate solo entre Waka Menta y Waka Mango Ice; Waka Menta queda mejor parado para lo que pediste');
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Waka Menta; compara Waka Mango Ice solo si ese ultimo tradeoff todavia importa');
    expect(contract.customer_response_draft).not.toContain('practicamente listo para compra');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
    expect(contract.customer_response_draft).not.toContain('version mas precisa para carrito');
  });

  it('keeps hesitation recovery local when support is weak', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'mmm no se',
        is_ambiguous: false,
        requires_semantic_expansion: true,
      },
      exact_matches: [],
      semantic_matches: [
        makeProduct({
          name: 'Opcion Cercana',
          ai_sales_note: null,
          description: 'Vape disponible.',
          specs: null,
        }),
      ],
      semantic_match_source: 'EMBEDDING_SEMANTIC',
    });

    expect(contract.match_strategy).toBe('SEMANTIC');
    expect(contract.customer_response_draft).toContain('Si la duda sigue abierta, mejor quedate en esta ficha antes de moverte a otra cosa');
    expect(contract.customer_response_draft).toContain('Abre primero la ficha de Opcion Cercana para revisarla bien');
    expect(contract.customer_response_draft).not.toContain('ya queda bien posicionado para seguir con esta ficha');
    expect(contract.customer_response_draft).not.toContain('agregalo al carrito');
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
    expect(contract.customer_response_draft).toContain('si te late perfil menta, Waka Menta ya es la salida mas clara para avanzar');
    expect(contract.customer_response_draft).toContain('compara Waka Mango Ice solo si prefieres perfil mango');
    expect(contract.help_contract).toEqual({
      compare_supported: true,
      preferred_product_id: '11111111-1111-1111-1111-111111111111',
      secondary_product_id: '44444444-4444-4444-4444-444444444444',
      action_strength: 'review_then_cart',
    });
    expect(contract.customer_response_draft).toContain('Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real');
    expect(contract.customer_response_draft).not.toContain('practicamente listo para compra');
    expect(contract.customer_response_draft).toContain('Si la primera ya es la que quieres, agregala al carrito');
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
    expect(contract.customer_response_draft).toContain('si te late perfil menta, Waka Menta ya es la salida mas clara para avanzar');
    expect(contract.customer_response_draft).toContain('compara Waka Mango solo si prefieres perfil mango');
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
    expect(contract.customer_response_draft).toContain('Si una ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas');
    expect(contract.help_contract).toEqual({
      compare_supported: false,
      preferred_product_id: '11111111-1111-1111-1111-111111111111',
      secondary_product_id: '66666666-6666-6666-6666-666666666666',
      action_strength: 'review_only',
    });
    expect(contract.customer_response_draft).toContain('Empieza por la ficha que mas te haga sentido; si todavia te queda una duda puntual, revisa la otra');
    expect(contract.customer_response_draft).not.toContain('si te late');
    expect(contract.customer_response_draft).not.toContain('si prefieres');
    expect(contract.customer_response_draft).not.toContain('salida mas clara para avanzar');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
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

    expect(contract.customer_response_draft).toContain('si te late perfil menta, Waka Menta ya es la salida mas clara para avanzar');
    expect(contract.customer_response_draft).toContain('compara Waka Mango solo si prefieres perfil mango');
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
    expect(contract.customer_response_draft).toContain('Si una ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas');
    expect(contract.customer_response_draft).not.toContain('si te late');
    expect(contract.customer_response_draft).not.toContain('si prefieres');
    expect(contract.customer_response_draft).not.toContain('empieza por');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
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
    expect(contract.customer_response_draft).toContain('Empieza por la ficha que mas te haga sentido; si todavia te queda una duda puntual, revisa la otra');
    expect(contract.customer_response_draft).not.toContain('agregala al carrito');
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

  it('answers a direct promotion question with real coupon truth instead of inventing a product match', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'tienen alguna promo ahorita',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [],
      semantic_matches: [],
      semantic_match_source: 'NONE',
      promotion_signal: {
        kind: 'COUPON',
        code: 'VSM10',
        description: 'Promo publica',
        discount_type: 'percentage',
        discount_value: 10,
        min_purchase: 500,
        valid_until: '2026-04-05T00:00:00.000Z',
        informational_only: true,
        eligibility_note: 'La elegibilidad final depende del checkout.',
      },
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.customer_response_draft).toContain('cupon publico VSM10');
    expect(contract.customer_response_draft).toContain('10% de descuento desde $500 de compra');
    expect(contract.customer_response_draft).toContain('Yo no te lo aplico desde aqui');
    expect(contract.customer_response_draft).not.toContain('No encontre "tienen alguna promo ahorita"');
  });

  it('uses authenticated reorder truth for a replenishment turn instead of pretending the query was a normal catalog search', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'lo de siempre',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [
        makeProduct({
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Pods Mango',
          slug: 'pods-mango',
        }),
      ],
      semantic_matches: [],
      semantic_match_source: 'NONE',
      replenishment_signal: {
        kind: 'READY',
        source_order_id: '99999999-9999-9999-9999-999999999999',
        source_order_created_at: '2026-04-01T00:00:00.000Z',
        source_phrase: 'LO_DE_SIEMPRE',
        primary_product: {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Pods Mango',
          slug: 'pods-mango',
          section: 'vape',
        },
        variant_id: '33333333-3333-3333-3333-333333333333',
        variant_label: 'Mango 5%',
        quantity: 2,
        requested_quantity: 2,
        blocked_item_count: 0,
        partial_quantity: false,
        action_mode: 'ADD_TO_CART',
        blocked_reason_detail: null,
      },
    });

    expect(contract.match_strategy).toBe('EXACT');
    expect(contract.retrieval_source).toBe('AUTHENTICATED_REORDER');
    expect(contract.customer_response_draft).toContain('Revise tu historial real');
    expect(contract.customer_response_draft).toContain('Pods Mango (Mango 5%)');
    expect(contract.customer_response_draft).toContain('repetir x2');
    expect(contract.customer_response_draft).toContain('volver a meter al carrito');
  });

  it('stays honest when replenishment intent is explicit but no reorderable history is grounded', () => {
    const contract = evaluateProductSearchFallbackTree({
      tool_args: {
        query: 'lo mismo',
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
      exact_matches: [],
      semantic_matches: [],
      semantic_match_source: 'NONE',
    });

    expect(contract.match_strategy).toBe('NO_MATCH');
    expect(contract.retrieval_source).toBe('AUTHENTICATED_REORDER');
    expect(contract.customer_response_draft).toContain('No veo una compra reciente reordenable');
    expect(contract.customer_response_draft).toContain('catalogo actual');
  });
});
