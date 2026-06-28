
import type { InternalResolvedProduct, InternalCapsuleContract } from '@/types/ai-capsule';
import { ProductSearchContext } from "./searchContext";
import { ActionStrength, buildObjectionRecovery, buildRecoveryCommitment, buildVariantReadiness, buildCheckoutReadiness, buildCartPrecision, buildSingleOptionConfidenceLine, buildRecoveryHandoffLine, buildAmbiguityQuestion, buildDecisionGuide } from "./searchDecisions";
import { ConcreteFactResolution, resolveConcreteFactAnswer, extractSpecsFact, extractDescriptionContext } from "./searchFacts";
import { joinSentences, buildHandoffLine } from "./searchIntents";
import { isPromotionQuestion, buildPromotionYieldLine, buildPromotionOnlyResponse } from "./searchPromotions";
import { buildRecoveryQuestion, rankOutOfStockAlternatives, buildOutOfStockAlternativeContract, buildExplicitSupportReason, buildSemanticRefinementLine } from "./searchRecovery";
import { isReplenishmentIntent, buildUnavailableReplenishmentDraft, buildReplenishmentDraft, buildReplenishmentHandoff, buildMissingReplenishmentDraft } from "./searchReplenishment";

export type CapsuleTruthSignals = NonNullable<InternalCapsuleContract['truth_signals']>;
export type CapsuleHelpContract = NonNullable<InternalCapsuleContract['help_contract']>;
export type CapsulePromotionSignal = NonNullable<InternalCapsuleContract['promotion_signal']>;
export type CapsuleReplenishmentSignal = NonNullable<InternalCapsuleContract['replenishment_signal']>;

export function buildTruthSignals(input: {
      factResolution?: ConcreteFactResolution | null;
    }): CapsuleTruthSignals | undefined {
    if (!input.factResolution) return undefined;
    return {
    direct_answer_complete: true,
    direct_answer_kind: input.factResolution.directAnswerKind,
    fact_family: input.factResolution.request.family,
    };
}

export function buildHelpContract(input: {
      compareSupported?: boolean;
      preferredProduct?: InternalResolvedProduct | null;
      secondaryProduct?: InternalResolvedProduct | null;
      actionStrength?: ActionStrength;
      directAnswerComplete?: boolean;
    }): CapsuleHelpContract | undefined {
    const hasMeaningfulSignal = Boolean(
            input.compareSupported
            || input.preferredProduct
            || input.secondaryProduct
            || input.actionStrength
            || input.directAnswerComplete,
          );
    if (!hasMeaningfulSignal) return undefined;
    return {
    compare_supported: input.compareSupported ?? false,
    preferred_product_id: input.preferredProduct?.id ?? null,
    secondary_product_id: input.secondaryProduct?.id ?? null,
    action_strength: input.actionStrength,
    };
}

/**
 * FALLBACK TREE IMPLEMENTATION (PURE)
 * Evaluates the context and returns the strictly enforced capsule contract.
 * Zero side-effects, zero UI coupling.
 */
export function evaluateProductSearchFallbackTree(context: ProductSearchContext): InternalCapsuleContract {
    const {
            tool_args,
            exact_matches,
            semantic_matches,
            infrastructure_error,
            semantic_match_source = 'NONE',
            promotion_signal,
            replenishment_signal,
          } = context;
    if (infrastructure_error) {
    return buildContract(
      'DEGRADED',
      'NO_MATCH',
      'Estoy teniendo problemas intermitentes para sincronizar con el catalogo. Dame un momento y vuelve a intentar.',
      0.0,
      [],
      infrastructure_error,
      `Degraded by infrastructure: ${infrastructure_error}`,
      undefined,
      'NONE',
    );
    }

    const exactInStock = exact_matches.filter((product) => product.status_signal !== 'OUT_OF_STOCK');
    const semanticInStock = semantic_matches.filter((product) => product.status_signal !== 'OUT_OF_STOCK');
    const exhaustedExact = exact_matches.filter((product) => product.status_signal === 'OUT_OF_STOCK');
    const explicitPromotionQuestion = isPromotionQuestion(tool_args.query);
    const explicitReplenishmentIntent = isReplenishmentIntent(tool_args.query);
    if (explicitReplenishmentIntent) {
    if (replenishment_signal?.kind === 'UNAVAILABLE') {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        buildUnavailableReplenishmentDraft(replenishment_signal),
        0.35,
        [],
        undefined,
        'Authenticated replenishment intent detected, but the recent item no longer revalidates against current catalog truth.',
        [],
        'AUTHENTICATED_REORDER',
        undefined,
        undefined,
        promotion_signal,
        replenishment_signal,
      );
    }

    const replenishmentPrimary = replenishment_signal?.primary_product
      ? exactInStock.find((product) => product.id === replenishment_signal.primary_product?.id) ?? exact_matches.find((product) => product.id === replenishment_signal.primary_product?.id) ?? null
      : null;

    if (replenishment_signal && replenishmentPrimary) {
      const replenishmentPromotionLine = buildPromotionYieldLine({
        query: tool_args.query,
        signal: promotion_signal ?? null,
        primaryProduct: replenishmentPrimary,
        variantReady: true,
        allowCouponSignal: true,
      });

      return buildContract(
        'SUCCESS',
        'EXACT',
        joinSentences(
          buildReplenishmentDraft(replenishment_signal),
          replenishmentPromotionLine,
          buildReplenishmentHandoff(replenishment_signal),
        ),
        replenishment_signal.kind === 'READY' ? 0.98 : 0.84,
        [replenishmentPrimary],
        undefined,
        'Authenticated replenishment signal grounded on recent order history and current catalog truth.',
        [],
        'AUTHENTICATED_REORDER',
        undefined,
        buildHelpContract({
          preferredProduct: replenishmentPrimary,
          actionStrength: replenishment_signal.action_mode === 'ADD_TO_CART' ? 'review_then_cart' : 'review_only',
        }),
        promotion_signal,
        replenishment_signal,
      );
    }

    return buildContract(
      'SUCCESS',
      'NO_MATCH',
      buildMissingReplenishmentDraft(tool_args.query),
      0.2,
      [],
      undefined,
      'Replenishment intent detected, but no authenticated reorderable history could be grounded.',
      [],
      'AUTHENTICATED_REORDER',
      undefined,
      undefined,
      promotion_signal,
      replenishment_signal,
    );
    }

    if (exactInStock.length > 0) {
    const topProduct = exactInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, [], undefined, undefined, undefined, 'NONE');
    }

    const exactFactResolution = exactInStock.length === 1
      ? resolveConcreteFactAnswer(tool_args.query, topProduct)
      : null;
    if (exactFactResolution) {
      return buildContract(
        'SUCCESS',
        'EXACT',
        exactFactResolution.answer,
        0.95,
        exactInStock.slice(0, 1),
        undefined,
        'Direct exact fact answer grounded on supported product specs.',
        [],
        'DIRECT_EXACT',
        buildTruthSignals({ factResolution: exactFactResolution }),
        buildHelpContract({
          preferredProduct: topProduct,
          actionStrength: 'review_only',
          directAnswerComplete: true,
        }),
        promotion_signal,
      );
    }

    if (exactInStock.length > 1) {
      return buildContract(
        'SUCCESS',
        'EXACT',
        joinSentences(
          `Encontre varias coincidencias exactas para "${tool_args.query}".`,
          'Te dejo esas opciones para que revises la que mejor te encaje sin abrir mas ramas.',
          buildHandoffLine('options', exactInStock.slice(0, 4), false, 'review_only'),
        ),
        0.95,
        exactInStock.slice(0, 4),
        undefined,
        'Multiple exact matches found and kept neutral to avoid single-option overstatement.',
        [],
        'DIRECT_EXACT',
        undefined,
        buildHelpContract({
          preferredProduct: exactInStock[0] ?? null,
          secondaryProduct: exactInStock[1] ?? null,
          actionStrength: 'review_only',
        }),
        promotion_signal,
      );
    }

    const requestedVariantLabel = topProduct.variant_truth?.matched_variant_label?.trim()
      || topProduct.variant_truth?.requested_value?.trim()
      || null;
    const requestedVariantUnavailable = Boolean(
      topProduct.variant_truth?.requested_variant_intent
      && topProduct.variant_truth?.availability !== 'available',
    );
    if (requestedVariantUnavailable) {
      const rankedAlternatives = rankOutOfStockAlternatives(
        tool_args.query,
        topProduct,
        [...exactInStock.slice(1), ...semanticInStock],
      );
      const variantPivotContract = buildOutOfStockAlternativeContract({
        query: tool_args.query,
        requestedProduct: topProduct,
        alternatives: rankedAlternatives,
        reason: 'VARIANT_UNAVAILABLE',
        semanticMatchSource: semantic_match_source,
        promotionSignal: promotion_signal ?? null,
      });

      if (variantPivotContract) {
        return variantPivotContract;
      }

      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        joinSentences(
          requestedVariantLabel
            ? `El producto existe, pero la variante pedida ${requestedVariantLabel} no esta disponible ahorita.`
            : 'El producto existe, pero la variante pedida no esta disponible ahorita.',
          buildRecoveryQuestion(tool_args.query),
        ),
        0.2,
        [],
        undefined,
        'Requested variant unavailable and no grounded substitutes passed the similarity floor.',
        [],
        semantic_match_source,
        undefined,
        undefined,
        promotion_signal,
      );
    }

    const topNote = topProduct.ai_sales_note;
    const topSpecs = extractSpecsFact(topProduct);
    const exactObjectionRecovery = buildObjectionRecovery(
      tool_args.query,
      exactInStock.slice(0, 2),
      false,
      buildExplicitSupportReason(topProduct),
    );
      const exactRecoveryCommitment = exactObjectionRecovery
        ? buildRecoveryCommitment(tool_args.query, exactInStock.slice(0, 2), false, 'review_then_cart')
        : null;
      const exactHasSupportBackedRecovery = Boolean(
        exactRecoveryCommitment
        && exactRecoveryCommitment.compareAgainst === null
        && exactRecoveryCommitment.actionStrength === 'review_then_cart',
      );
      const exactVariantReadiness = buildVariantReadiness(exactRecoveryCommitment?.preferredProduct ?? topProduct);
      const exactPromotionLine = buildPromotionYieldLine({
        query: tool_args.query,
        signal: promotion_signal ?? null,
        primaryProduct: exactRecoveryCommitment?.preferredProduct ?? topProduct,
        variantReady: (exactVariantReadiness?.confidence ?? 1) >= 0.9,
        allowCouponSignal: true,
      });
      const exactCheckoutReadiness = buildCheckoutReadiness(
        exactRecoveryCommitment?.preferredProduct ?? topProduct,
        exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
        exactRecoveryCommitment?.compareAgainst ?? null,
        exactHasSupportBackedRecovery,
      );
      const exactCartPrecision = buildCartPrecision(
        exactRecoveryCommitment?.preferredProduct ?? topProduct,
        exactCheckoutReadiness,
        exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
        exactRecoveryCommitment?.compareAgainst ?? null,
      );

      let exactDraft = exactVariantReadiness?.line ?? 'Aqui tienes exactamente lo que buscabas.';
      if (!exactVariantReadiness || exactVariantReadiness.confidence >= 0.9) {
        if (topNote) {
          exactDraft = exactVariantReadiness
            ? `${exactVariantReadiness.line} ${topNote}`
            : `Aqui tienes exactamente lo que buscabas. ${topNote}`;
        } else if (topSpecs) {
          exactDraft = exactVariantReadiness
            ? `${exactVariantReadiness.line} Viene ${topSpecs}.`
            : `Aqui tienes exactamente lo que buscabas. Viene ${topSpecs}.`;
        }
      }

      const exactConfidenceLine = exactVariantReadiness && exactVariantReadiness.confidence < 0.9
        ? null
        : (exactObjectionRecovery?.line ?? buildSingleOptionConfidenceLine('exact'));

      return buildContract(
        'SUCCESS',
        'EXACT',
        joinSentences(
          exactDraft,
          exactConfidenceLine,
          explicitPromotionQuestion && !exactPromotionLine && !promotion_signal
            ? 'Ahorita no veo una promo activa validada para ese producto.'
            : exactPromotionLine,
          exactRecoveryCommitment?.line,
          exactCartPrecision?.line ?? exactCheckoutReadiness?.line,
          exactCartPrecision?.handoff ?? exactCheckoutReadiness?.handoff ?? (exactRecoveryCommitment
            ? buildRecoveryHandoffLine(
              exactRecoveryCommitment.preferredProduct,
              exactRecoveryCommitment.compareAgainst,
              exactRecoveryCommitment.actionStrength,
            )
            : buildHandoffLine(
              'single',
              exactInStock.slice(0, 1),
              false,
              exactObjectionRecovery?.actionStrength ?? 'review_then_cart',
            )),
        ),
        exactVariantReadiness?.confidence ?? 0.95,
        exactInStock.slice(0, 4),
        undefined,
        'Exact match found and in stock.',
        [],
        'DIRECT_EXACT',
        undefined,
        buildHelpContract({
          compareSupported: Boolean(exactRecoveryCommitment?.compareAgainst),
          preferredProduct: exactRecoveryCommitment?.preferredProduct ?? topProduct,
          secondaryProduct: exactRecoveryCommitment?.compareAgainst ?? null,
          actionStrength: exactRecoveryCommitment?.actionStrength ?? (exactObjectionRecovery?.actionStrength ?? 'review_then_cart'),
        }),
        promotion_signal,
      );
    }

    if (exact_matches.length > 0 && exactInStock.length === 0) {
    const exhaustedProduct = exhaustedExact[0] ?? exact_matches[0] ?? null;
    const rankedAlternatives = exhaustedProduct
      ? rankOutOfStockAlternatives(tool_args.query, exhaustedProduct, semanticInStock)
      : [];
    const oosContract = exhaustedProduct
      ? buildOutOfStockAlternativeContract({
        query: tool_args.query,
        requestedProduct: exhaustedProduct,
        alternatives: rankedAlternatives,
        reason: 'STOCK_ZERO',
        semanticMatchSource: semantic_match_source,
        promotionSignal: promotion_signal ?? null,
      })
      : null;

    if (oosContract) {
      return oosContract;
    }

    return buildContract(
      'SUCCESS',
      'NO_MATCH',
      joinSentences(
        'El producto exacto que buscas ya no esta disponible con una alternativa cercana lo bastante clara para prometerte sustituto.',
        buildRecoveryQuestion(tool_args.query),
      ),
      0.15,
      [],
      undefined,
      'Requested item unavailable and no grounded substitutes passed the similarity floor.',
      exhaustedExact,
      semantic_match_source,
      undefined,
      undefined,
      promotion_signal,
    );
    }

    if (tool_args.is_ambiguous) {
    const featuredProducts = semanticInStock.slice(0, 4);
    if (featuredProducts.length === 0) {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        explicitPromotionQuestion
          ? (buildPromotionOnlyResponse(promotion_signal ?? null) ?? buildRecoveryQuestion(tool_args.query))
          : joinSentences(
              `Revise el catalogo pero no logre encontrar una salida clara para "${tool_args.query}".`,
              buildRecoveryQuestion(tool_args.query),
            ),
        explicitPromotionQuestion ? 0.45 : 0.1,
        [],
        undefined,
        'Ambiguity flag active but zero semantic matches found. Degraded honestly instead of showing fake confidence.',
        [],
        'NONE',
        undefined,
        undefined,
        promotion_signal,
      );
    }

    const topFeaturedProduct = featuredProducts[0];
    if (!topFeaturedProduct) {
      return buildContract(
        'SUCCESS',
        'NO_MATCH',
        joinSentences(
          `Revise el catalogo pero no logre encontrar una salida clara para "${tool_args.query}".`,
          buildRecoveryQuestion(tool_args.query),
        ),
        0.1,
        [],
        undefined,
        'Ambiguity fallback exhausted after guard.',
        [],
        'NONE',
      );
    }

    const topFeaturedSpecs = extractSpecsFact(topFeaturedProduct);
    const ambiguityQuestion = buildAmbiguityQuestion(tool_args.query);
    const decisionGuide = buildDecisionGuide(featuredProducts);

    let ambiguityDraft = joinSentences(
      'Veo varias opciones que podrian encajar.',
      ambiguityQuestion || 'Para afinar la recomendacion, dime marca, sabor o tipo de dispositivo.',
      decisionGuide?.text || 'Te dejo solo las opciones mas utiles para que elijas un camino claro.',
      buildHandoffLine('options', featuredProducts, decisionGuide?.hasSupportedComparison ?? false, 'review_only'),
    );

    if (topFeaturedSpecs) {
      ambiguityDraft = joinSentences(
        `Veo varias opciones que podrian encajar, incluyendo algunas ${topFeaturedSpecs}.`,
        ambiguityQuestion || 'Para afinar la recomendacion, dime marca, sabor o tipo de dispositivo.',
        decisionGuide?.text || 'Te dejo solo las opciones mas utiles para que elijas un camino claro.',
        buildHandoffLine('options', featuredProducts, decisionGuide?.hasSupportedComparison ?? false, 'review_only'),
      );
    }

    return buildContract(
      'SUCCESS',
      'FEATURED_FALLBACK',
      ambiguityDraft,
      0.4,
      featuredProducts,
      undefined,
      'Ambiguity flag active. Prompting user for clarification.',
      [],
      semantic_match_source,
      undefined,
      buildHelpContract({
        compareSupported: decisionGuide?.hasSupportedComparison ?? false,
        preferredProduct: decisionGuide?.preferredProduct ?? topFeaturedProduct,
        secondaryProduct: decisionGuide?.secondaryProduct ?? featuredProducts[1] ?? null,
        actionStrength: 'review_only',
      }),
    );
    }

    if (semanticInStock.length > 0) {
    const topProduct = semanticInStock[0];
    if (!topProduct) {
      return buildContract('SUCCESS', 'NO_MATCH', buildRecoveryQuestion(tool_args.query), 0.1, [], undefined, undefined, undefined, 'NONE');
    }
    const topSpecsFact = extractSpecsFact(topProduct);
    const topNote = topProduct.ai_sales_note;
    const topDescription = extractDescriptionContext(topProduct);
    const semanticDecisionGuide = buildDecisionGuide(semanticInStock.slice(0, 3));
    const semanticHasExplicitSupport = Boolean(topSpecsFact || topNote);
    const semanticObjectionRecovery = buildObjectionRecovery(
      tool_args.query,
      semanticInStock.slice(0, 3),
      semanticDecisionGuide?.hasSupportedComparison ?? false,
      buildExplicitSupportReason(topProduct),
    );
    const semanticActionStrength = (semanticInStock.length === 1 && semanticHasExplicitSupport) || semanticDecisionGuide?.hasSupportedComparison
      ? 'review_then_cart'
      : 'review_only';
    const semanticRecoveryCommitment = semanticObjectionRecovery
      ? buildRecoveryCommitment(
        tool_args.query,
        semanticInStock.slice(0, 3),
        semanticDecisionGuide?.hasSupportedComparison ?? false,
        semanticActionStrength,
      )
      : null;
    const semanticHasSupportBackedRecovery = Boolean(
      semanticRecoveryCommitment
      && semanticRecoveryCommitment.compareAgainst === null
      && semanticRecoveryCommitment.actionStrength === 'review_then_cart',
    );
    const semanticVariantReadiness = buildVariantReadiness(semanticRecoveryCommitment?.preferredProduct ?? topProduct);
    const semanticPromotionLine = buildPromotionYieldLine({
      query: tool_args.query,
      signal: promotion_signal ?? null,
      primaryProduct: semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      variantReady: (semanticVariantReadiness?.confidence ?? 1) >= 0.9,
      allowCouponSignal: true,
    });
    const semanticCheckoutReadiness = buildCheckoutReadiness(
      semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      semanticRecoveryCommitment?.compareAgainst ?? (semanticInStock.length > 1 ? semanticInStock[1] ?? null : null),
      semanticHasSupportBackedRecovery,
    );
    const semanticCartPrecision = buildCartPrecision(
      semanticRecoveryCommitment?.preferredProduct ?? topProduct,
      semanticCheckoutReadiness,
      semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      semanticRecoveryCommitment?.compareAgainst ?? (semanticInStock.length > 1 ? semanticInStock[1] ?? null : null),
    );

    let semanticDraft = semanticVariantReadiness?.line ?? `No encontre "${tool_args.query}" exacto, pero estas opciones del catalogo son las mas cercanas.`;
    if (!semanticVariantReadiness || semanticVariantReadiness.confidence >= 0.9) {
      if (topSpecsFact) {
        semanticDraft = semanticVariantReadiness
          ? `${semanticVariantReadiness.line} ${topProduct.name} ${topSpecsFact} podria ser de lo mas cercano a lo que buscas.`
          : `No encontre "${tool_args.query}" exactamente, pero ${topProduct.name} ${topSpecsFact} podria ser de lo mas cercano a lo que buscas.`;
      } else if (topNote) {
        semanticDraft = semanticVariantReadiness
          ? `${semanticVariantReadiness.line} ${topProduct.name} (${topNote}) podria encajar con lo que buscas.`
          : `No encontre un producto con ese nombre exacto, pero ${topProduct.name} (${topNote}) podria encajar con lo que buscas.`;
      } else if (topDescription) {
        semanticDraft = semanticVariantReadiness
          ? `${semanticVariantReadiness.line} ${topProduct.name} (${topDescription}) podria encajar con lo que buscas.`
          : `No encontre un producto con ese nombre exacto, pero ${topProduct.name} (${topDescription}) podria encajar con lo que buscas.`;
      }
    }

    const semanticConfidenceLine = semanticVariantReadiness && semanticVariantReadiness.confidence < 0.9
      ? null
      : (semanticInStock.length === 1 && !semanticObjectionRecovery ? buildSingleOptionConfidenceLine('narrowed') : null);

    return buildContract(
      'SUCCESS',
      semantic_match_source === 'TOKEN_RECOVERY' ? 'TOKEN_RECOVERY' : 'SEMANTIC',
      joinSentences(
        semanticDraft,
        semanticDecisionGuide?.text,
        semanticConfidenceLine,
        semanticObjectionRecovery?.line,
        explicitPromotionQuestion && !semanticPromotionLine && !promotion_signal
          ? 'Ahorita no veo una promo activa validada para estas opciones.'
          : semanticPromotionLine,
        semanticRecoveryCommitment?.line,
        semanticCartPrecision?.line ?? semanticCheckoutReadiness?.line,
        buildSemanticRefinementLine(tool_args.query, semantic_match_source),
        semanticCartPrecision?.handoff ?? semanticCheckoutReadiness?.handoff ?? (semanticRecoveryCommitment
          ? buildRecoveryHandoffLine(
            semanticRecoveryCommitment.preferredProduct,
            semanticRecoveryCommitment.compareAgainst,
            semanticRecoveryCommitment.actionStrength,
          )
          : buildHandoffLine(
            'options',
            semanticInStock.slice(0, 3),
            semanticDecisionGuide?.hasSupportedComparison ?? false,
            semanticObjectionRecovery?.actionStrength ?? semanticActionStrength,
          )),
      ),
      semanticVariantReadiness?.confidence ?? 0.6,
      semanticInStock.slice(0, 3),
      undefined,
      semantic_match_source === 'TOKEN_RECOVERY'
        ? 'Token recovery approximation with sharper follow-up and storefront handoff.'
        : 'Semantic approximation with sharper follow-up and storefront handoff.',
      [],
      semantic_match_source,
      undefined,
      buildHelpContract({
        compareSupported: semanticDecisionGuide?.hasSupportedComparison ?? false,
        preferredProduct: semanticRecoveryCommitment?.preferredProduct ?? semanticDecisionGuide?.preferredProduct ?? topProduct,
        secondaryProduct: semanticRecoveryCommitment?.compareAgainst ?? semanticDecisionGuide?.secondaryProduct ?? null,
        actionStrength: semanticRecoveryCommitment?.actionStrength ?? (semanticObjectionRecovery?.actionStrength ?? semanticActionStrength),
      }),
      promotion_signal,
    );
    }

    return buildContract(
    'SUCCESS',
    'NO_MATCH',
    explicitPromotionQuestion
      ? (buildPromotionOnlyResponse(promotion_signal ?? null) ?? buildRecoveryQuestion(tool_args.query))
      : joinSentences(
          `No encontre "${tool_args.query}" tal cual en el catalogo.`,
          buildRecoveryQuestion(tool_args.query),
        ),
    explicitPromotionQuestion ? 0.45 : 0.1,
    [],
    undefined,
    'Exhausted all search vectors. Empty result set.',
    [],
    'NONE',
    undefined,
    undefined,
    promotion_signal,
    );
}

export function buildContract(status: InternalCapsuleContract['execution_status'], strategy: InternalCapsuleContract['match_strategy'], draft: string, confidence: number, products: InternalResolvedProduct[], degradedReason?: InternalCapsuleContract['degraded_reason'], reasoning?: string, exhaustedExact?: InternalResolvedProduct[], retrievalSource: InternalCapsuleContract['retrieval_source'] = 'NONE', truthSignals?: CapsuleTruthSignals, helpContract?: CapsuleHelpContract, promotionSignal?: CapsulePromotionSignal, replenishmentSignal?: CapsuleReplenishmentSignal): InternalCapsuleContract {
    return {
    capsule_name: 'product_search_integrity',
    capsule_version: '1.0.0',
    execution_status: status,
    match_strategy: strategy,
    customer_response_draft: draft,
    search_confidence: confidence,
    latency_ms: 0,
    degraded_reason: degradedReason,
    truth_signals: truthSignals,
    help_contract: helpContract,
    promotion_signal: promotionSignal,
    replenishment_signal: replenishmentSignal,
    resolved_products: products,
    capsule_reasoning: reasoning,
    exhausted_exact_matches: exhaustedExact,
    retrieval_source: retrievalSource,
    };
}
