import { executeStorefrontInventoryOutlookCapsule } from '@/services/ai-capsule-orchestrator.service';
import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
import { compactCesarinCopy, getEffectiveConversationalPrefix, isMeaningfullyDistinct, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
import { getProductsByIds } from '@/services/products.service';
import { extractTelemetryNextStepTruth } from '../helpers';
import { logAITelemetry } from '../telemetry';
import type { ConciergeTurnAnalysis } from '../types';
import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';

export const handleStorefrontInventoryOutlook = async (
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
): Promise<ClientCapsuleDispatchResult | null> => {
    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
    
    const capsuleContract = await executeStorefrontInventoryOutlookCapsule(data.tool_args);
    const inventoryProducts = capsuleContract.resolved_products?.length
        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
            .catch(() => [])
        : [];
    const visibleProducts = inventoryProducts;
    const supportsReview = capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_ONLINE'
        || capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_OMNICHANNEL';
    const commercialMove = supportsReview ? 'REVIEW_ONE' : 'KEEP_EXPLORING';
    const inventoryTurnAnalysis: ConciergeTurnAnalysis = {
        ...turnAnalysis,
        commercial_move: commercialMove,
        primary_intent: 'INVENTORY_OUTLOOK',
        turn_focus: 'inventory',
        current_turn_decision: 'USE_CAPABILITY',
    };
    const adaptiveConversation = buildCesarinActionableNextStepView({
        query,
        history,
        preferenceSummary: null,
        matchStrategy: null,
        adaptiveMode: supportsReview
            ? 'SOFT_REASSURE'
            : capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED'
                ? 'SOFT_REASSURE'
                : 'EXPLORE_LIGHT',
        visibleProducts,
        enrichedProductsById: Object.fromEntries(inventoryProducts.map((product) => [product.id, product])),
        baseMessage: capsuleContract.customer_response_draft ?? '',
        turnAnalysis: inventoryTurnAnalysis,
        commercialMove,
    });
    const compactBaseMessage = compactCesarinCopy(
        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
        visibleProducts.length > 0 ? 2 : 3,
    );
    const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
    const renderableNextStepGuidance = compactNextStepGuidance
        && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance)
        ? compactNextStepGuidance
        : undefined;
    const hasMaterialNextStepAction = Boolean(
        adaptiveConversation.nextStep.primaryAction
        || adaptiveConversation.nextStep.secondaryAction
        || adaptiveConversation.nextStep.assistAction,
    );
    const shouldShowNextStep = visibleProducts.length > 0
        && (supportsReview || capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED');
    const compactNextStepView = shouldShowNextStep
        && adaptiveConversation.nextStep.renderHint === 'SHOW'
        && (renderableNextStepGuidance || hasMaterialNextStepAction)
        ? {
            ...adaptiveConversation.nextStep,
            guidance: renderableNextStepGuidance,
        }
        : undefined;
    (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
    (capsuleContract as Record<string, any>).turn_analysis = inventoryTurnAnalysis;
    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;

    if (!noWriteSmokeActive) void logAITelemetry({
        session_id: effectiveTelemetrySessionId,
        customer_id: customerProfile?.id ?? null,
        query,
        response_text: capsuleContract.customer_response_draft ?? null,
        detected_intent: 'info',
        routed_capsule: 'storefront_inventory_outlook',
        requires_client_capsule: true,
        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
        response_latency_ms: Date.now() - invokeStart,
        has_product_cards: visibleProducts.length > 0,
        product_card_count: visibleProducts.length,
        zero_results: capsuleContract.inventory_outlook_signal.kind === 'PRODUCT_NOT_FOUND',
        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
        capsule_execution_status: capsuleContract.execution_status ?? null,
        capsule_match_strategy: capsuleContract.match_strategy ?? null,
        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
        routing_path: data.debug?.routing_path ?? null,
        turn_primary_intent: inventoryTurnAnalysis.primary_intent,
        turn_secondary_intents: inventoryTurnAnalysis.secondary_intents,
        turn_priority: inventoryTurnAnalysis.turn_priority,
        current_turn_decision: inventoryTurnAnalysis.current_turn_decision,
        turn_focus: inventoryTurnAnalysis.turn_focus ?? null,
        catalog_gate_open: catalogGate.is_open,
        catalog_gate_reason: catalogGate.reason,
        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
        source_context_present: Boolean(sourceContext),
        retrieval_source: capsuleContract.retrieval_source ?? null,
    });

    const finalMessage = mergeConversationalPrefix(
        adaptiveConversation.message || capsuleContract.customer_response_draft,
        getEffectiveConversationalPrefix({
            message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
            prefix: data.conversational_prefix,
            turnAnalysis: inventoryTurnAnalysis,
            sourceContext,
        }),
        visibleProducts.length > 0 ? 2 : 3,
    );

    return {
        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
        suggestedProducts: visibleProducts,
        intent: 'info',
        turn_analysis: inventoryTurnAnalysis,
        catalog_gate: catalogGate,
        source_context: sourceContext,
        capsule_contract: capsuleContract,
    };
};


