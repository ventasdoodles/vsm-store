import { executeProductSearchCapsule } from '@/services/ai-capsule-orchestrator.service';
import { buildCesarinHumanizedSearchMessage } from '@/lib/cesarin-stage1';
import { rerankCesarinSuggestedProducts } from '@/lib/cesarin-stage3';
import { buildCesarinAdaptiveConversationView } from '@/lib/cesarin-stage4';
import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
import { resolveCesarinTurnCommercialJudgment } from '@/lib/cesarin-commercial-judgment';
import { compactCesarinCopy, getEffectiveConversationalPrefix, isMeaningfullyDistinct, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
import { getProductsByIds } from '@/services/products.service';
import { resolveStorefrontAttachmentOffers } from '@/services/storefront-attachments.service';
import type { Product } from '@/types/product';
import { extractTelemetryNextStepTruth, isSearchLeadingIntent, resolveGroundedProductSearchMessage } from '../helpers';
import { logAITelemetry } from '../telemetry';
import type { ConciergeProductSearchMemoryContext, ConciergeTurnAnalysis } from '../types';
import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';

export const handleProductSearchIntegrity = async (
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
): Promise<ClientCapsuleDispatchResult | null> => {
    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
    
    const capsuleContract = await executeProductSearchCapsule(data.tool_args, {
        customerId: customerProfile?.id ?? null,
    });
    const preferenceSummary = (data.memory_context as ConciergeProductSearchMemoryContext | null | undefined)?.preference_summary ?? null;
    const rerankedProducts = rerankCesarinSuggestedProducts({
        query,
        products: capsuleContract.resolved_products ?? [],
        preferenceSummary,
    });
    const commercialJudgment = resolveCesarinTurnCommercialJudgment({
        query,
        history,
        preferenceSummary,
        matchStrategy: capsuleContract.match_strategy,
        visibleProductCount: rerankedProducts.length,
        turnAnalysis,
    });
    const commercialTurnAnalysis: ConciergeTurnAnalysis = {
        ...turnAnalysis,
        commercial_move: commercialJudgment.move,
    };
    const adaptiveConversation = buildCesarinAdaptiveConversationView({
        query,
        history,
        products: rerankedProducts,
        baseMessage: capsuleContract.customer_response_draft ?? '',
        preferenceSummary,
        matchStrategy: capsuleContract.match_strategy,
        turnAnalysis: commercialTurnAnalysis,
    });
    const shouldShowCatalogSurfaces = catalogGate.is_open;
    const shouldAttemptAttachmentLookup = shouldShowCatalogSurfaces
        && adaptiveConversation.visibleProducts.length > 0
        && commercialJudgment.supportLevel === 'strong'
        && !commercialJudgment.approximate
        && !commercialJudgment.currentTurnCompare
        && !commercialJudgment.currentTurnExplore
        && (commercialJudgment.move === 'ADD_READY' || commercialJudgment.move === 'REVIEW_ONE');
    const attachmentOffer = shouldAttemptAttachmentLookup
        ? await resolveStorefrontAttachmentOffers([adaptiveConversation.visibleProducts[0]!.id])
            .then((offers) => offers[0] ?? null)
            .catch(() => null)
        : null;
    const enrichedVisibleProductsById = adaptiveConversation.visibleProducts.length > 0
        ? await getProductsByIds(adaptiveConversation.visibleProducts.map((product) => product.id))
            .then((products) => Object.fromEntries(products.map((product) => [product.id, product])))
            .catch(() => ({} as Record<string, Product>))
        : {};
    const actionableConversation = buildCesarinActionableNextStepView({
        query,
        history,
        preferenceSummary,
        matchStrategy: capsuleContract.match_strategy,
        adaptiveMode: adaptiveConversation.mode,
        visibleProducts: adaptiveConversation.visibleProducts,
        enrichedProductsById: enrichedVisibleProductsById,
        baseMessage: adaptiveConversation.message,
        turnAnalysis: commercialTurnAnalysis,
        commercialMove: commercialJudgment.move,
        capsuleTruthSignals: (capsuleContract as Record<string, any>).truth_signals ?? null,
        capsuleHelpContract: (capsuleContract as Record<string, any>).help_contract ?? null,
        capsuleAttachmentOffer: attachmentOffer,
        capsuleReplenishmentSignal: (capsuleContract as Record<string, any>).replenishment_signal ?? null,
    });

    if (shouldShowCatalogSurfaces && rerankedProducts.length > 0) {
        capsuleContract.resolved_products = actionableConversation.visibleProducts;
    } else {
        capsuleContract.resolved_products = [];
    }
    capsuleContract.attachment_offer = attachmentOffer ?? undefined;
    const productSearchMessageSeed = actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft || '';
    const compactBaseMessage = compactCesarinCopy(productSearchMessageSeed, 2);
    const compactNextStepGuidance = compactCesarinCopy(actionableConversation.nextStep.guidance, 1);
    const renderableNextStepGuidance = compactNextStepGuidance
        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance)
        ? compactNextStepGuidance
        : undefined;
    const hasMaterialNextStepAction = Boolean(
        actionableConversation.nextStep.primaryAction
        || actionableConversation.nextStep.secondaryAction
        || actionableConversation.nextStep.assistAction,
    );
    const compactNextStepView = shouldShowCatalogSurfaces
        && actionableConversation.nextStep.renderHint === 'SHOW'
        && (renderableNextStepGuidance || hasMaterialNextStepAction)
        ? {
            ...actionableConversation.nextStep,
            guidance: renderableNextStepGuidance,
        }
        : undefined;
    const telemetryNextStep = extractTelemetryNextStepTruth(compactNextStepView);
    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
    (capsuleContract as Record<string, any>).turn_analysis = commercialTurnAnalysis;
    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;

    if (!noWriteSmokeActive) void logAITelemetry({
        session_id: effectiveTelemetrySessionId,
        customer_id: customerProfile?.id ?? null,
        query,
        response_text: capsuleContract.customer_response_draft ?? null,
        detected_intent: 'search',
        routed_capsule: 'product_search_integrity',
        requires_client_capsule: true,
        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
        fallback_used: capsuleContract.match_strategy === 'FEATURED_FALLBACK' || capsuleContract.match_strategy === 'NO_MATCH',
        response_latency_ms: Date.now() - invokeStart,
        has_product_cards: shouldShowCatalogSurfaces && (capsuleContract.resolved_products?.length ?? 0) > 0,
        product_card_count: shouldShowCatalogSurfaces ? capsuleContract.resolved_products?.length ?? 0 : 0,
        zero_results: !shouldShowCatalogSurfaces || (capsuleContract.resolved_products?.length ?? 0) === 0,
        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
        offered_products: capsuleContract.resolved_products?.map(p => ({ id: p.id, name: p.name, slug: p.slug })) ?? [],
        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
        capsule_execution_status: capsuleContract.execution_status ?? null,
        capsule_match_strategy: capsuleContract.match_strategy ?? null,
        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
        routing_path: data.debug?.routing_path ?? null,
        turn_primary_intent: commercialTurnAnalysis.primary_intent,
        turn_secondary_intents: commercialTurnAnalysis.secondary_intents,
        turn_priority: commercialTurnAnalysis.turn_priority,
        current_turn_decision: commercialTurnAnalysis.current_turn_decision,
        turn_focus: commercialTurnAnalysis.turn_focus ?? null,
        catalog_gate_open: catalogGate.is_open,
        catalog_gate_reason: catalogGate.reason,
        next_step_family: telemetryNextStep.next_step_family,
        assist_action_present: telemetryNextStep.assist_action_present,
        source_context_present: Boolean(sourceContext),
        retrieval_source: capsuleContract.retrieval_source ?? null,
    });

    const effectiveProductSearchPrefix = getEffectiveConversationalPrefix({
        message: productSearchMessageSeed,
        prefix: data.conversational_prefix,
        turnAnalysis: commercialTurnAnalysis,
        sourceContext,
    });
    const suppressWeakNextStepOnlyMessage = !compactNextStepView
        && !hasMaterialNextStepAction
        && compactNextStepGuidance.length > 0
        && effectiveProductSearchPrefix !== null
        && !isMeaningfullyDistinct(productSearchMessageSeed, compactNextStepGuidance);
    const finalMessage = mergeConversationalPrefix(
        suppressWeakNextStepOnlyMessage ? '' : productSearchMessageSeed,
        effectiveProductSearchPrefix,
        8,
    );

    const humanizedMessage = shouldShowCatalogSurfaces && isSearchLeadingIntent(turnAnalysis.primary_intent)
        ? buildCesarinHumanizedSearchMessage({
            query,
            baseMessage: finalMessage,
            matchStrategy: capsuleContract.match_strategy,
            suggestedProducts: capsuleContract.resolved_products,
        })
        : finalMessage;
    const conciseMessage = resolveGroundedProductSearchMessage({
        capsuleDraft: capsuleContract.customer_response_draft,
        candidateMessage: humanizedMessage || finalMessage,
        products: capsuleContract.resolved_products,
        shouldShowCatalogSurfaces,
        executionStatus: capsuleContract.execution_status,
        truthSignals: (capsuleContract as Record<string, any>).truth_signals ?? null,
        maxSentences: 8,
    });

    return {
        message: conciseMessage,
        suggestedProducts: shouldShowCatalogSurfaces ? (capsuleContract.resolved_products || []) : [],
        intent: 'search',
        turn_analysis: commercialTurnAnalysis,
        catalog_gate: catalogGate,
        source_context: sourceContext,
        capsule_contract: capsuleContract
    };
};


