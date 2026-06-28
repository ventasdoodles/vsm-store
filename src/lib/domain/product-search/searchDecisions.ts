
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import { extractSpecValue } from "./searchFacts";
import { normalizeSearchText, hasAnyHint, BUDGET_HINTS, WORTH_HINTS, HESITATION_HINTS, ALTERNATIVE_HINTS, DEVICE_HINTS, FLAVOR_HINTS, EFFECT_HINTS, BEGINNER_HINTS, CONVENIENCE_HINTS, EXPLORATION_HINTS } from "./searchIntents";
import { findCheaperAlternative, buildExplicitSupportReason } from "./searchRecovery";

export type DecisionCue = {
      axis: string;
      dedupeKey: string;
      text: string;
    };
export type DecisionGuideResult = {
      hasSupportedComparison: boolean;
      text: string;
      preferredProduct: InternalResolvedProduct;
      secondaryProduct: InternalResolvedProduct;
    };
export type ActionStrength = 'review_only' | 'review_then_cart';
export type ObjectionType = 'cheaper' | 'hesitation' | 'worth_it' | 'alternative';
export type RecoveryCommitmentResult = {
      line: string;
      actionStrength: ActionStrength;
      preferredProduct: InternalResolvedProduct;
      compareAgainst: InternalResolvedProduct | null;
    };
export type CheckoutReadinessResult = {
      line: string;
      handoff: string;
    };
export type CartPrecisionResult = {
      line: string;
      handoff: string;
    };
export type VariantReadinessResult = {
      line: string;
      handoff: string;
      confidence: number;
      suppressCartPrecision: boolean;
    };

export function normalizeDecisionText(value: string): string {
    return value.trim().replace(/[.]+$/g, '').toLowerCase();
}

export function buildSingleOptionConfidenceLine(mode: 'exact' | 'narrowed'): string {
    return mode === 'exact'
    ? 'Si ese era el que traias en mente, ya vas sobre una opcion clara para seguir.'
    : 'Si ese ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas.';
}

export function buildRecoveryHandoffLine(preferredProduct: InternalResolvedProduct, compareAgainst: InternalResolvedProduct | null, actionStrength: ActionStrength): string {
    if (compareAgainst) {
    return actionStrength === 'review_then_cart'
      ? `Abre primero la ficha de ${preferredProduct.name}; compara ${compareAgainst.name} solo si ese ultimo tradeoff todavia importa. Si al verla ya te cierra, agregalo al carrito.`
      : `Abre primero la ficha de ${preferredProduct.name}; compara ${compareAgainst.name} solo si ese ultimo tradeoff todavia importa.`;
    }

    return actionStrength === 'review_then_cart'
    ? `Abre primero la ficha de ${preferredProduct.name}; si al verla esa duda ya te queda resuelta, agregalo al carrito.`
    : `Abre primero la ficha de ${preferredProduct.name}; si al verla esa duda ya te queda resuelta, sigue con esa ruta.`;
}

export const CHECKOUT_READINESS_SPEC_CANDIDATES: Array<{
      key: string;
      toCondition: (value: string) => string;
    }> = [
      { key: 'Compatibilidad', toCondition: (value) => `esa compatibilidad ${normalizeDecisionText(value)} es la que necesitas` },
      { key: 'Compatible con', toCondition: (value) => `esa compatibilidad ${normalizeDecisionText(value)} es la que necesitas` },
      { key: 'Rosca', toCondition: (value) => `esa rosca ${normalizeDecisionText(value)} es la que necesitas` },
      { key: 'Sabor', toCondition: (value) => `el sabor ${normalizeDecisionText(value)} es el que quieres` },
      { key: 'Nicotina', toCondition: (value) => `la nicotina ${normalizeDecisionText(value)} es la que buscas` },
      { key: 'THC', toCondition: (value) => `la concentracion ${normalizeDecisionText(value)} es la que buscas` },
      { key: 'Presentacion', toCondition: (value) => `esa presentacion ${normalizeDecisionText(value)} te cuadra` },
      { key: 'Tamano', toCondition: (value) => `ese tamano ${normalizeDecisionText(value)} te cuadra` },
      { key: 'Contenido', toCondition: (value) => `ese contenido ${normalizeDecisionText(value)} te cuadra` },
      { key: 'Puffs', toCondition: (value) => `los ${normalizeDecisionText(value)} puffs te cuadran` },
      { key: 'Tipo', toCondition: (value) => `ese formato ${normalizeDecisionText(value)} es el que quieres` },
      { key: 'Modelo', toCondition: (value) => `ese modelo ${normalizeDecisionText(value)} es el que quieres` },
    ];
export const CART_PRECISION_SPEC_CANDIDATES: Array<{
      key: string;
      toPrecisionTarget: (value: string) => string;
      confirmCue: string;
    }> = [
      { key: 'Sabor', toPrecisionTarget: (value) => `el sabor ${normalizeDecisionText(value)}`, confirmCue: 'ese sabor' },
      { key: 'Variante', toPrecisionTarget: (value) => `la variante ${normalizeDecisionText(value)}`, confirmCue: 'esa variante' },
      { key: 'Nicotina', toPrecisionTarget: (value) => `${normalizeDecisionText(value)} de nicotina`, confirmCue: 'esa nicotina' },
      { key: 'Presentacion', toPrecisionTarget: (value) => `la presentacion ${normalizeDecisionText(value)}`, confirmCue: 'esa presentacion' },
      { key: 'Tamano', toPrecisionTarget: (value) => `el tamano ${normalizeDecisionText(value)}`, confirmCue: 'ese tamano' },
      { key: 'Contenido', toPrecisionTarget: (value) => `el contenido ${normalizeDecisionText(value)}`, confirmCue: 'ese contenido' },
      { key: 'Modelo', toPrecisionTarget: (value) => `el modelo ${normalizeDecisionText(value)}`, confirmCue: 'ese modelo' },
      { key: 'Cantidad', toPrecisionTarget: (value) => `la cantidad ${normalizeDecisionText(value)}`, confirmCue: 'esa cantidad' },
    ];

export function parseDisplayPrice(product: InternalResolvedProduct): number | null {
    const numeric = Number(product.display_price.replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function detectObjectionType(query: string): ObjectionType | null {
    const normalized = normalizeSearchText(query);
    if (hasAnyHint(normalized, BUDGET_HINTS)) return 'cheaper';
    if (hasAnyHint(normalized, WORTH_HINTS)) return 'worth_it';
    if (hasAnyHint(normalized, HESITATION_HINTS)) return 'hesitation';
    if (hasAnyHint(normalized, ALTERNATIVE_HINTS)) return 'alternative';
    return null;
}

export function buildObjectionRecovery(query: string, products: InternalResolvedProduct[], hasSupportedComparison: boolean, supportReason: string | null): { line: string; actionStrength: ActionStrength } | null {
    const objectionType = detectObjectionType(query);
    const current = products[0];
    if (!objectionType || !current) return null;
    const nearby = products.find((product) => product.id !== current.id) ?? null;
    const cheaperAlternative = findCheaperAlternative(products, current);
    switch (objectionType) {
    case 'cheaper':
      if (cheaperAlternative) {
        return {
          line: `Si lo que te frena es el precio, compara solo ${cheaperAlternative.name}; dentro de estas opciones es la salida mas accesible sin abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si lo que te frena es el precio, mejor revisa esta ficha primero y valida ese punto antes de cambiar de camino.',
        actionStrength: 'review_only',
      };

    case 'hesitation':
      if (supportReason) {
        return {
          line: `Si no te convence del todo, el punto mas claro aqui es este: ${supportReason}.`,
          actionStrength: 'review_only',
        };
      }

      if (hasSupportedComparison && nearby) {
        return {
          line: `Si la duda es fina, quedate solo entre esta opcion y ${nearby.name}; no hace falta abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si la duda sigue abierta, mejor quedate en esta ficha antes de moverte a otra cosa.',
        actionStrength: 'review_only',
      };

    case 'worth_it':
      if (supportReason) {
        return {
          line: `Si la duda es si vale la pena, el punto mas claro aqui es este: ${supportReason}.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si esa duda sigue viva, mejor revisa esta ficha con calma antes de decidir.',
        actionStrength: 'review_only',
      };

    case 'alternative':
      if (cheaperAlternative) {
        return {
          line: `Si quieres abrir otra via, compara solo ${cheaperAlternative.name}; es la alternativa cercana que cambia el precio sin abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      if (hasSupportedComparison && nearby) {
        return {
          line: `Si quieres abrir otra via, compara solo ${nearby.name}; no hace falta abrir mas ramas.`,
          actionStrength: 'review_only',
        };
      }

      return {
        line: 'Si quieres abrir otra via, mejor quedate en esta ficha y revisa solo una alternativa cercana si todavia te hace falta.',
        actionStrength: 'review_only',
      };
    }
}

export function buildRecoveryCommitment(query: string, products: InternalResolvedProduct[], hasSupportedComparison: boolean, defaultActionStrength: ActionStrength): RecoveryCommitmentResult | null {
    const objectionType = detectObjectionType(query);
    const current = products[0];
    if (!objectionType || !current) return null;
    const nearby = products.find((product) => product.id !== current.id) ?? null;
    const currentSupport = buildExplicitSupportReason(current);
    const cheaperAlternative = findCheaperAlternative(products, current);
    const cheaperSupport = cheaperAlternative ? buildExplicitSupportReason(cheaperAlternative) : null;
    switch (objectionType) {
    case 'cheaper':
      if (cheaperAlternative && (cheaperSupport || hasSupportedComparison)) {
        return {
          line: `Si ese era el freno, ${cheaperAlternative.name} ya queda como una salida mas accesible y bien posicionada dentro de estas opciones.`,
          actionStrength: 'review_only',
          preferredProduct: cheaperAlternative,
          compareAgainst: current,
        };
      }

      if (currentSupport && defaultActionStrength === 'review_then_cart') {
        return {
          line: `Si ese era el freno y no necesitas bajar mas, ${current.name} sigue bien parado dentro de esta ruta.`,
          actionStrength: 'review_then_cart',
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      return null;

    case 'hesitation':
      if (hasSupportedComparison && nearby) {
        return {
          line: `Si esa era la ultima duda real, ${current.name} queda mejor parado para lo que pediste; compara ${nearby.name} solo si ese matiz todavia importa.`,
          actionStrength: 'review_only',
          preferredProduct: current,
          compareAgainst: nearby,
        };
      }

      if (currentSupport) {
        return {
          line: `Si esa era la ultima duda, ${current.name} ya queda bien posicionado para seguir con esta ficha.`,
          actionStrength: defaultActionStrength,
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      return null;

    case 'worth_it':
      if (currentSupport) {
        return {
          line: `Si esa era la duda, ${current.name} ya queda bien posicionado para seguir con esta ficha.`,
          actionStrength: defaultActionStrength,
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      if (hasSupportedComparison && nearby) {
        return {
          line: `Si esa era la duda de cierre, ${current.name} queda mejor parado para lo que pediste; compara ${nearby.name} solo si ese tradeoff sigue pesando.`,
          actionStrength: 'review_only',
          preferredProduct: current,
          compareAgainst: nearby,
        };
      }

      return null;

    case 'alternative':
      if (hasSupportedComparison && nearby) {
        return {
          line: `Si esa era la ultima comparacion que te faltaba, quedate solo entre ${current.name} y ${nearby.name}; ${current.name} queda mejor parado para lo que pediste.`,
          actionStrength: 'review_only',
          preferredProduct: current,
          compareAgainst: nearby,
        };
      }

      if (currentSupport) {
        return {
          line: `Si esa era la ultima alternativa que te faltaba revisar, ${current.name} ya queda bien posicionado para seguir con esta ficha.`,
          actionStrength: defaultActionStrength,
          preferredProduct: current,
          compareAgainst: null,
        };
      }

      return null;
    }
}

export function buildCheckoutReadiness(product: InternalResolvedProduct, actionStrength: ActionStrength, compareAgainst: InternalResolvedProduct | null, hasSupportBackedRecovery = false): CheckoutReadinessResult | null {
    if (actionStrength !== 'review_then_cart' || compareAgainst) return null;
    const variantReadiness = buildVariantReadiness(product);
    if (variantReadiness) {
    return {
      line: variantReadiness.line,
      handoff: variantReadiness.handoff,
    };
    }

    for (const candidate of CHECKOUT_READINESS_SPEC_CANDIDATES) {
    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    return {
      line: `Si ${candidate.toCondition(value)}, este ya queda practicamente listo para compra.`,
      handoff: 'Abre la ficha y confirma solo ese detalle; si te cuadra, agregalo al carrito.',
    };
    }

    if (!hasSupportBackedRecovery) return null;
    return {
    line: 'Si ese ya era el ultimo punto que necesitabas resolver, este ya queda practicamente listo para compra.',
    handoff: 'Abre la ficha y si ese punto ya te cierra, agregalo al carrito.',
    };
}

export function buildVariantReadiness(product: InternalResolvedProduct): VariantReadinessResult | null {
    const variantTruth = product.variant_truth;
    if (!variantTruth?.requested_variant_intent) return null;
    const label = variantTruth.matched_variant_label?.trim() || variantTruth.requested_value?.trim() || null;
    switch (variantTruth.availability) {
    case 'available':
      return {
        line: label
          ? `La variante pedida ${label} si esta disponible y con stock.`
          : 'La variante pedida si esta disponible y con stock.',
        handoff: label
          ? `Abre la ficha y confirma ${label}; si coincide, agrega esa version al carrito.`
          : 'Abre la ficha y confirma ese selector; si coincide, agrega esa version al carrito.',
        confidence: 0.95,
        suppressCartPrecision: false,
      };
    case 'missing':
      return {
        line: label
          ? `El producto existe, pero la variante pedida ${label} no esta disponible ahorita.`
          : 'El producto existe, pero la variante pedida no esta disponible ahorita.',
        handoff: 'Abre la ficha para revisar otra variante vigente antes de agregar.',
        confidence: 0.72,
        suppressCartPrecision: true,
      };
    case 'ambiguous':
      return {
        line: 'La linea existe, pero la variante exacta todavia no queda confirmada. Mejor abre la ficha para escoger la variante vigente.',
        handoff: 'Abre la ficha y revisa el selector antes de avanzar.',
        confidence: 0.76,
        suppressCartPrecision: true,
      };
    case 'unsupported':
    default:
      return {
        line: 'La linea existe, pero no veo confirmada esa variante exacta en el catalogo. Mejor revisa la ficha antes de tomarla como cierre.',
        handoff: 'Abre la ficha y confirma si hay una variante vigente que si encaje.',
        confidence: 0.68,
        suppressCartPrecision: true,
      };
    }
}

export function buildCartPrecision(product: InternalResolvedProduct, checkoutReadiness: CheckoutReadinessResult | null, actionStrength: ActionStrength, compareAgainst: InternalResolvedProduct | null): CartPrecisionResult | null {
    if (!checkoutReadiness || actionStrength !== 'review_then_cart' || compareAgainst) return null;
    const variantTruth = buildVariantReadiness(product);
    if (variantTruth?.suppressCartPrecision) return null;
    if (variantTruth?.line && variantTruth.confidence >= 0.9) {
    const label = product.variant_truth?.matched_variant_label?.trim() || product.variant_truth?.requested_value?.trim() || null;
    return {
      line: label
        ? `Si lo que quieres llevar es ${label}, esta ya queda como la version mas precisa para carrito.`
        : 'Si lo que quieres llevar es esa variante exacta, esta ya queda como la version mas precisa para carrito.',
      handoff: label
        ? `Abre la ficha y confirma ${label}; si coincide, agrega esa version al carrito.`
        : 'Abre la ficha y confirma esa variante; si coincide, agrega esa version al carrito.',
    };
    }

    for (const candidate of CART_PRECISION_SPEC_CANDIDATES) {
    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    return {
      line: `Si lo que quieres llevar es ${candidate.toPrecisionTarget(value)}, esta ya queda como la version mas precisa para carrito.`,
      handoff: `Abre la ficha y confirma ${candidate.confirmCue}; si coincide, agrega esa version al carrito.`,
    };
    }

    return null;
}

export const DECISION_SPEC_CANDIDATES: Array<{
      key: string;
      toCue: (value: string) => string;
    }> = [
      { key: 'Sabor', toCue: (value) => `perfil ${normalizeDecisionText(value)}` },
      { key: 'Tipo', toCue: (value) => `formato ${normalizeDecisionText(value)}` },
      { key: 'Modelo', toCue: (value) => `linea ${normalizeDecisionText(value)}` },
      { key: 'Cepa', toCue: (value) => `cepa ${normalizeDecisionText(value)}` },
      { key: 'Nicotina', toCue: (value) => `${normalizeDecisionText(value)} de nicotina` },
      { key: 'THC', toCue: (value) => `${normalizeDecisionText(value)} de thc` },
      { key: 'Puffs', toCue: (value) => `${normalizeDecisionText(value)} puffs` },
      { key: 'Marca', toCue: (value) => `marca ${normalizeDecisionText(value)}` },
    ];

export function getDifferentiatingSpecKeys(products: InternalResolvedProduct[]): Set<string> {
    const differentiatingKeys = new Set<string>();
    for (const candidate of DECISION_SPEC_CANDIDATES) {
    const values = products
      .map((product) => extractSpecValue(product, candidate.key))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => normalizeDecisionText(value));

    if (new Set(values).size > 1) {
      differentiatingKeys.add(candidate.key);
    }
    }

    return differentiatingKeys;
}

export function buildProductDecisionCues(product: InternalResolvedProduct, differentiatingKeys: Set<string>): DecisionCue[] {
    const cues: DecisionCue[] = [];
    for (const candidate of DECISION_SPEC_CANDIDATES) {
    if (!differentiatingKeys.has(candidate.key)) continue;

    const value = extractSpecValue(product, candidate.key);
    if (!value) continue;

    const normalizedValue = normalizeDecisionText(value);
    if (!normalizedValue) continue;

    cues.push({
      axis: candidate.key,
      dedupeKey: `spec:${candidate.key}:${normalizedValue}`,
      text: candidate.toCue(value),
    });
    }

    return cues;
}

export function pickDecisionCue(cues: DecisionCue[], usedKeys: Set<string>): DecisionCue | null {
    return cues.find((cue) => !usedKeys.has(cue.dedupeKey)) ?? null;
}

export function buildDecisionGuide(products: InternalResolvedProduct[]): DecisionGuideResult | null {
    const comparableProducts = products.slice(0, 3);
    const first = comparableProducts[0];
    const second = comparableProducts[1];
    if (!first || !second) return null;
    const differentiatingKeys = getDifferentiatingSpecKeys(comparableProducts);
    const firstCues = buildProductDecisionCues(first, differentiatingKeys);
    const secondCues = buildProductDecisionCues(second, differentiatingKeys);
    const third = comparableProducts[2];
    const thirdCues = third ? buildProductDecisionCues(third, differentiatingKeys) : [];
    const usedKeys = new Set<string>();
    const firstCue = pickDecisionCue(firstCues, usedKeys);
    if (firstCue) usedKeys.add(firstCue.dedupeKey);
    const secondCue = pickDecisionCue(secondCues, usedKeys);
    if (secondCue) usedKeys.add(secondCue.dedupeKey);
    const usedAxes = new Set<string>();
    if (firstCue) usedAxes.add(firstCue.axis);
    if (secondCue) usedAxes.add(secondCue.axis);
    const thirdCue = third
            ? thirdCues.find((cue) => !usedKeys.has(cue.dedupeKey) && !usedAxes.has(cue.axis)) ?? null
            : null;
    if (firstCue && secondCue) {
    const thirdLine = third && thirdCue
      ? ` Deja ${third.name} solo si quieres ${thirdCue.text}.`
      : '';

    return {
      hasSupportedComparison: true,
      preferredProduct: first,
      secondaryProduct: second,
      text: `Para elegir sin darle demasiadas vueltas: si te late ${firstCue.text}, ${first.name} ya es la salida mas clara para avanzar; compara ${second.name} solo si prefieres ${secondCue.text}.${thirdLine}`,
    };
    }

    return {
    hasSupportedComparison: false,
    preferredProduct: first,
    secondaryProduct: second,
    text: `Para elegir sin darle demasiadas vueltas: mira ${first.name} y ${second.name} como opciones cercanas antes de abrir mas fichas. Si una ya te hace sentido, es razonable seguir con esa ficha sin abrir mas vueltas.`,
    };
}

export function buildAmbiguityQuestion(query: string): string {
    const normalized = normalizeSearchText(query);
    const hasDevice = hasAnyHint(normalized, DEVICE_HINTS);
    const hasFlavor = hasAnyHint(normalized, FLAVOR_HINTS);
    const hasBudget = hasAnyHint(normalized, BUDGET_HINTS);
    const hasEffect = hasAnyHint(normalized, EFFECT_HINTS);
    const isBeginner = hasAnyHint(normalized, BEGINNER_HINTS);
    const wantsConvenience = hasAnyHint(normalized, CONVENIENCE_HINTS);
    const isExploratory = hasAnyHint(normalized, EXPLORATION_HINTS);
    if (!hasDevice) {
    if (isBeginner || wantsConvenience) {
      return 'Para cerrartelo bien, quieres algo simple para empezar, tipo desechable, o prefieres pod/cartucho?';
    }

    if (hasFlavor || hasEffect || isExploratory) {
      return 'Para aterrizarlo rapido, te mueves mas por desechable, pod, cartucho o algo 420?';
    }

    return 'Que formato te queda mejor ahorita: desechable, pod, cartucho o algo 420?';
    }

    if (!hasFlavor) {
    return hasEffect
      ? 'Para afinarlo, te late mas algo fresco, frutal, dulce o mas serio tipo tabaco?'
      : 'Que perfil te llama mas ahorita: fresco, frutal, dulce o algo mas serio tipo tabaco?';
    }

    if (!hasEffect) {
    return 'Para no abrirte de mas, lo quieres mas suave y facil de llevar o con una pegada mas marcada?';
    }

    if (!hasBudget) {
    return 'Para cerrarte la siguiente ronda, te lo busco en algo accesible o te enseño opciones un poco mas arriba?';
    }

    return 'Que te pesa mas para cerrarlo: sabor, intensidad o facilidad de uso?';
}
