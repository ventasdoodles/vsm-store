
import type { InternalResolvedProduct, InternalCapsuleContract } from '@/types/ai-capsule';
import { ProductSearchContext } from "./searchContext";
import { buildDecisionGuide, buildObjectionRecovery, ActionStrength, buildRecoveryCommitment, buildCheckoutReadiness, buildCartPrecision, buildSingleOptionConfidenceLine, buildRecoveryHandoffLine, parseDisplayPrice } from "./searchDecisions";
import { CapsulePromotionSignal, buildContract, buildHelpContract } from "./searchEvaluator";
import { extractSpecValue, extractSpecsFact } from "./searchFacts";
import { joinSentences, buildHandoffLine, normalizeSearchText, hasModelCue, hasAnyHint, FLAVOR_HINTS, DEVICE_HINTS, BUDGET_HINTS } from "./searchIntents";
import { buildPromotionYieldLine } from "./searchPromotions";

export type OutOfStockPivotReason = 'STOCK_ZERO' | 'VARIANT_UNAVAILABLE';

export function normalizeRecoveryText(value: string): string {
    return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function extractRecoveryTokens(value: string): string[] {
    return normalizeRecoveryText(value)
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

export function flattenSpecText(specs: unknown): string {
    if (!specs || typeof specs !== 'object') return '';
    return Object.entries(specs as Record<string, unknown>)
    .flatMap(([key, value]) => [key, String(value ?? '')])
    .join(' ');
}

export function buildProductRecoveryText(product: InternalResolvedProduct): string {
    return normalizeRecoveryText([
    product.name,
    product.ai_sales_note ?? '',
    product.description ?? '',
    flattenSpecText(product.specs),
    product.section ?? '',
    ].join(' '));
}

export function scoreOutOfStockAlternative(query: string, requestedProduct: InternalResolvedProduct, candidate: InternalResolvedProduct): number {
    let score = 0;
    if (candidate.section && requestedProduct.section && candidate.section === requestedProduct.section) {
    score += 4;
    }

    const requestedBrand = extractSpecValue(requestedProduct, 'Marca');
    const candidateBrand = extractSpecValue(candidate, 'Marca');
    if (requestedBrand && candidateBrand && normalizeRecoveryText(requestedBrand) === normalizeRecoveryText(candidateBrand)) {
    score += 6;
    }

    const requestedFlavor = extractSpecValue(requestedProduct, 'Sabor') ?? extractSpecValue(requestedProduct, 'Flavor');
    const candidateFlavor = extractSpecValue(candidate, 'Sabor') ?? extractSpecValue(candidate, 'Flavor');
    if (requestedFlavor && candidateFlavor && normalizeRecoveryText(requestedFlavor) === normalizeRecoveryText(candidateFlavor)) {
    score += 8;
    }

    const requestedModel = extractSpecValue(requestedProduct, 'Modelo');
    const candidateModel = extractSpecValue(candidate, 'Modelo');
    if (requestedModel && candidateModel && normalizeRecoveryText(requestedModel) === normalizeRecoveryText(candidateModel)) {
    score += 5;
    }

    const requestedType = extractSpecValue(requestedProduct, 'Tipo');
    const candidateType = extractSpecValue(candidate, 'Tipo');
    if (requestedType && candidateType && normalizeRecoveryText(requestedType) === normalizeRecoveryText(candidateType)) {
    score += 4;
    }

    const requestedText = buildProductRecoveryText(requestedProduct);
    const candidateText = buildProductRecoveryText(candidate);
    const requestedTokens = extractRecoveryTokens(requestedText);
    const candidateTokens = extractRecoveryTokens(candidateText);
    const tokenOverlap = requestedTokens.filter((token) => candidateTokens.includes(token)).length;
    score += tokenOverlap * 2;
    const queryTokens = extractRecoveryTokens(query);
    const queryOverlap = queryTokens.filter((token) => candidateText.includes(token)).length;
    score += queryOverlap * 2;
    const requestedVariantValue = requestedProduct.variant_truth?.requested_value?.trim();
    if (requestedVariantValue && candidateText.includes(normalizeRecoveryText(requestedVariantValue))) {
    score += 8;
    }

    return score;
}

export function rankOutOfStockAlternatives(query: string, requestedProduct: InternalResolvedProduct, candidates: InternalResolvedProduct[]): InternalResolvedProduct[] {
    return candidates
    .map((candidate) => ({
      candidate,
      score: scoreOutOfStockAlternative(query, requestedProduct, candidate),
    }))
    .filter(({ candidate, score }) => candidate.status_signal !== 'OUT_OF_STOCK' && score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.candidate.raw_stock !== left.candidate.raw_stock) {
        return right.candidate.raw_stock - left.candidate.raw_stock;
      }
      return left.candidate.name.localeCompare(right.candidate.name);
    })
    .map(({ candidate }) => candidate);
}

export function buildOutOfStockPivotDraft(input: {
      requestedProduct: InternalResolvedProduct;
      alternativeProduct: InternalResolvedProduct;
      reason: OutOfStockPivotReason;
      requestedVariantLabel?: string | null;
    }): string {
    const requestedSpecs = extractSpecsFact(input.requestedProduct);
    const alternativeSpecs = extractSpecsFact(input.alternativeProduct);
    const alternativeNote = input.alternativeProduct.ai_sales_note;
    const variantLabel = input.requestedVariantLabel?.trim()
            || input.requestedProduct.variant_truth?.matched_variant_label?.trim()
            || input.requestedProduct.variant_truth?.requested_value?.trim()
            || null;
    let draft = input.reason === 'VARIANT_UNAVAILABLE'
            ? variantLabel
              ? `El producto existe, pero la variante pedida ${variantLabel} no esta disponible ahorita, pero te seleccione alternativas reales que si estan en existencia.`
              : 'El producto existe, pero la variante pedida no esta disponible ahorita, pero te seleccione alternativas reales que si estan en existencia.'
            : 'El producto exacto que buscas esta agotado en este momento, pero te seleccione alternativas reales que si estan en existencia.';
    if (requestedSpecs && alternativeSpecs) {
    draft = input.reason === 'VARIANT_UNAVAILABLE'
      ? `La variante pedida ${variantLabel ?? 'que buscabas'} esta agotada, pero encontre alternativas ${alternativeSpecs} en existencia.`
      : `El producto exacto que buscas ${requestedSpecs} esta agotado, pero encontre alternativas ${alternativeSpecs} en existencia.`;
    } else if (alternativeSpecs) {
    draft = input.reason === 'VARIANT_UNAVAILABLE'
      ? `La variante pedida ${variantLabel ?? 'que buscabas'} no esta disponible, pero encontre alternativas ${alternativeSpecs} en existencia.`
      : 'El producto exacto que buscas esta agotado, pero encontre alternativas en existencia.';
    } else if (alternativeNote) {
    draft = input.reason === 'VARIANT_UNAVAILABLE'
      ? `La variante pedida ${variantLabel ?? 'que buscabas'} no esta disponible, pero encontre una alternativa disponible: ${alternativeNote}.`
      : `El producto exacto que buscas esta agotado, pero encontre una alternativa disponible: ${alternativeNote}.`;
    }

    return draft;
}

export function buildOutOfStockAlternativeContract(input: {
      query: string;
      requestedProduct: InternalResolvedProduct;
      alternatives: InternalResolvedProduct[];
      reason: OutOfStockPivotReason;
      semanticMatchSource: ProductSearchContext['semantic_match_source'];
      promotionSignal?: CapsulePromotionSignal | null;
      requestedVariantLabel?: string | null;
    }): InternalCapsuleContract | null {
    const viableAlternatives = input.alternatives.filter((product) => product.status_signal !== 'OUT_OF_STOCK');
    if (viableAlternatives.length === 0) return null;
    const topAlternative = viableAlternatives[0];
    if (!topAlternative) return null;
    const decisionGuide = buildDecisionGuide(viableAlternatives.slice(0, 4));
    const alternativeSpecs = extractSpecsFact(topAlternative);
    const alternativeNote = topAlternative.ai_sales_note;
    const oosAlternativeDraft = buildOutOfStockPivotDraft({
            requestedProduct: input.requestedProduct,
            alternativeProduct: topAlternative,
            reason: input.reason,
            requestedVariantLabel: input.requestedVariantLabel,
          });
    const oosObjectionRecovery = buildObjectionRecovery(
            input.query,
            viableAlternatives.slice(0, 4),
            decisionGuide?.hasSupportedComparison ?? false,
            buildExplicitSupportReason(topAlternative),
          );
    const oosActionStrength: ActionStrength = (viableAlternatives.length === 1 && Boolean(alternativeSpecs || alternativeNote))
            || decisionGuide?.hasSupportedComparison
            ? 'review_then_cart'
            : 'review_only';
    const oosRecoveryCommitment = oosObjectionRecovery
            ? buildRecoveryCommitment(
              input.query,
              viableAlternatives.slice(0, 4),
              decisionGuide?.hasSupportedComparison ?? false,
              oosActionStrength,
            )
            : null;
    const oosHasSupportBackedRecovery = Boolean(
            oosRecoveryCommitment
            && oosRecoveryCommitment.compareAgainst === null
            && oosRecoveryCommitment.actionStrength === 'review_then_cart',
          );
    const oosPromotionLine = buildPromotionYieldLine({
            query: input.query,
            signal: input.promotionSignal ?? null,
            primaryProduct: oosRecoveryCommitment?.preferredProduct ?? topAlternative,
            variantReady: true,
            allowCouponSignal: true,
          });
    const oosCheckoutReadiness = buildCheckoutReadiness(
            oosRecoveryCommitment?.preferredProduct ?? topAlternative,
            oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
            oosRecoveryCommitment?.compareAgainst ?? (viableAlternatives.length > 1 ? viableAlternatives[1] ?? null : null),
            oosHasSupportBackedRecovery,
          );
    const oosCartPrecision = buildCartPrecision(
            oosRecoveryCommitment?.preferredProduct ?? topAlternative,
            oosCheckoutReadiness,
            oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
            oosRecoveryCommitment?.compareAgainst ?? (viableAlternatives.length > 1 ? viableAlternatives[1] ?? null : null),
          );
    return buildContract(
    'SUCCESS',
    'OUT_OF_STOCK_ALTERNATIVE',
    joinSentences(
      oosAlternativeDraft,
      'Te dejo opciones cercanas para que no se te cierre la compra.',
      decisionGuide?.text,
      viableAlternatives.length === 1 && !oosObjectionRecovery ? buildSingleOptionConfidenceLine('narrowed') : null,
      oosObjectionRecovery?.line,
      oosPromotionLine ?? null,
      oosRecoveryCommitment?.line,
      oosCartPrecision?.line ?? oosCheckoutReadiness?.line,
      oosCartPrecision?.handoff ?? oosCheckoutReadiness?.handoff ?? (oosRecoveryCommitment
        ? buildRecoveryHandoffLine(
          oosRecoveryCommitment.preferredProduct,
          oosRecoveryCommitment.compareAgainst,
          oosRecoveryCommitment.actionStrength,
        )
        : buildHandoffLine(
          'options',
          viableAlternatives.slice(0, 4),
          decisionGuide?.hasSupportedComparison ?? false,
          oosObjectionRecovery?.actionStrength ?? oosActionStrength,
        )),
    ),
    0.75,
    viableAlternatives.slice(0, 4),
    undefined,
    `Requested item/variant unavailable. Safe fallback provided via ${input.semanticMatchSource}.`,
    input.reason === 'STOCK_ZERO' ? [input.requestedProduct] : [],
    input.semanticMatchSource ?? 'NONE',
    undefined,
    buildHelpContract({
      compareSupported: decisionGuide?.hasSupportedComparison ?? false,
      preferredProduct: oosRecoveryCommitment?.preferredProduct ?? decisionGuide?.preferredProduct ?? topAlternative,
      secondaryProduct: oosRecoveryCommitment?.compareAgainst ?? decisionGuide?.secondaryProduct ?? null,
      actionStrength: oosRecoveryCommitment?.actionStrength ?? (oosObjectionRecovery?.actionStrength ?? oosActionStrength),
    }),
    input.promotionSignal ?? undefined,
    );
}

export function findCheaperAlternative(products: InternalResolvedProduct[], anchor: InternalResolvedProduct): InternalResolvedProduct | null {
    const anchorPrice = parseDisplayPrice(anchor);
    if (anchorPrice === null) return null;
    return products.find((product) => {
    if (product.id === anchor.id) return false;
    const price = parseDisplayPrice(product);
    return price !== null && price < anchorPrice;
    }) ?? null;
}

export function buildExplicitSupportReason(product: InternalResolvedProduct): string | null {
    const note = product.ai_sales_note?.trim().replace(/[.]+$/g, '');
    if (note) return note;
    const specsFact = extractSpecsFact(product);
    return specsFact ? `viene ${specsFact}` : null;
}

export function buildRecoveryQuestion(query: string): string {
    const normalized = normalizeSearchText(query);
    if (hasModelCue(normalized)) {
    return 'Si recuerdas la marca, la serie o aunque sea otra variante cercana, te aterrizo opciones reales de esa misma linea.';
    }

    if (hasAnyHint(normalized, FLAVOR_HINTS) && !hasAnyHint(normalized, DEVICE_HINTS)) {
    return 'Si me dices si lo quieres desechable, pod, cartucho o algo 420, te cierro la busqueda mucho mas rapido.';
    }

    if (hasAnyHint(normalized, DEVICE_HINTS) && !hasAnyHint(normalized, FLAVOR_HINTS)) {
    return 'Si me das sabor, intensidad o marca, te regreso opciones mucho mas utiles.';
    }

    if (hasAnyHint(normalized, BUDGET_HINTS)) {
    return 'Si ademas me dices marca, sabor o tipo de dispositivo, te propongo opciones reales dentro de ese rango.';
    }

    return 'Si me das marca, sabor, tipo de dispositivo o modelo cercano, te regreso opciones reales sin dejarte en un callejon sin salida.';
}

export function buildSemanticRefinementLine(query: string, source: ProductSearchContext['semantic_match_source']): string {
    const normalized = normalizeSearchText(query);
    if (source === 'TOKEN_RECOVERY') {
    if (hasModelCue(normalized)) {
      return 'Estas opciones salieron por coincidencias de nombre o serie, no por proximidad semantica. Si buscabas otra variante puntual, dímela y la aterrizamos.';
    }

    return 'Estas opciones salieron por coincidencias de nombre o termino, no por proximidad semantica. Si me das una marca, sabor o modelo mas cerrado, te afino la siguiente ronda.';
    }

    if (hasModelCue(normalized)) {
    return 'Si buscabas otra variante o sabor de esa misma linea, dimelo y te la afino.';
    }

    if (!hasAnyHint(normalized, FLAVOR_HINTS) || !hasAnyHint(normalized, DEVICE_HINTS)) {
    return 'Si me confirmas marca, sabor o tipo de dispositivo, te afino la siguiente ronda.';
    }

    return 'Si querias otra variante puntual, dime el detalle y la aterrizamos.';
}
