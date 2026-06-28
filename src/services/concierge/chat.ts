import { supabase } from '@/lib/supabase';

import { executeAuthenticatedLoyaltyStatusCapsule, executeAuthenticatedOrderTrackingCapsule, executeAuthenticatedWarrantyTriageCapsule, executeCartOperatorCapsule, executeKnowledgeCapsule, executeProductSearchCapsule, executeStorefrontBudgetRescueCapsule, executeStorefrontCheckoutReadinessCapsule, executeStorefrontCompatibilityCheckCapsule, executeStorefrontInventoryOutlookCapsule, executeStorefrontKittingBasketCapsule } from '@/services/ai-capsule-orchestrator.service';

import { isPilotActive } from '@/lib/pilot-activation';

import { buildCesarinHumanizedSearchMessage } from '@/lib/cesarin-stage1';

import { rerankCesarinSuggestedProducts } from '@/lib/cesarin-stage3';

import { buildCesarinAdaptiveConversationView } from '@/lib/cesarin-stage4';

import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';

import { resolveCesarinTurnCommercialJudgment } from '@/lib/cesarin-commercial-judgment';

import {
    compactCesarinCopy,
    getEffectiveConversationalPrefix,
    isMeaningfullyDistinct,
    mergeConversationalPrefix
} from '@/lib/cesarin-text-utils';

import {
    resolveAITelemetryContract,
    shouldClientLogAITelemetry,
} from '@/lib/ai-telemetry-contract';

import {
    buildCustomerIntelligenceNoWriteSmokeRequestFields,
    isCustomerIntelligenceNoWriteSmokeActive
} from '@/lib/customer-intelligence-no-write-smoke';

import { CustomerIntelligenceRequestSchema } from '@/lib/contracts/ai-edge-contract';

import { getProductsByIds } from '@/services/products.service';

import { resolveStorefrontAttachmentOffers } from '@/services/storefront-attachments.service';

import type { Product } from '@/types/product';

import type { CustomerProfile } from '@/types/customer';

import type { InternalResolvedProduct } from '@/types/ai-capsule';
import { attachCustomerIntelligenceNoWriteSmokeMetadata, buildConciergeCatalogGate, deriveCheckoutBridgeAction, deriveOrderTrackingBridgeAction, extractCustomerIntelligenceNoWriteSmokeMetadata, extractTelemetryNextStepTruth, getFallbackTurnAnalysis, isSearchLeadingIntent, normalizeServerCatalogGate, normalizeSourceContext, normalizeTurnAnalysis, resolveGroundedProductSearchMessage } from "./helpers";
import { logAITelemetry } from "./telemetry";
import { ConciergeCatalogGate, ConciergeMessage, ConciergeProductSearchMemoryContext, ConciergeSourceContext, ConciergeTurnAnalysis } from "./types";

export async function chat(query: string, history: { role: 'user' | 'assistant', content: string }[], customerProfile?: CustomerProfile, audio?: string, mimeType?: string, cesarinSessionId?: string | null, options?: { noWriteSmoke?: boolean; onChunk?: (text: string) => void }): Promise<{
        message: string;
        suggestedProducts?: (Product | InternalResolvedProduct)[];
        intent?: ConciergeMessage['intent'];
        turn_analysis?: ConciergeTurnAnalysis;
        catalog_gate?: ConciergeCatalogGate;
        source_context?: ConciergeSourceContext;
        action?: ConciergeMessage['action'];
        capsule_contract?: Record<string, any>; // Exposing it structurally as requested
    }> {
        const invokeStart = Date.now();
        const effectiveTelemetrySessionId = cesarinSessionId ?? null;
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
            const requestBody = { 
                action: 'concierge_chat', 
                query,
                history,
                audio,
                mimeType,
                cesarin_session_id: effectiveTelemetrySessionId,
                customerContext: customerProfile ? {
                    id: customerProfile.id,
                    name: customerProfile.full_name,
                    preferences: customerProfile.ai_preferences,
                    ia_context: customerProfile.ia_context,
                    last_interactions: customerProfile.last_interactions
                } : null,
                is_pilot: isPilotActive(),
                stream: !!options?.onChunk,
                ...(options?.noWriteSmoke ? buildCustomerIntelligenceNoWriteSmokeRequestFields() : {}),
            };

            // === CONTRACT ENFORCEMENT: Schema-First Validation ===
            // This prevents the frontend from sending broken shapes to the Edge Function.
            const validatedRequestBody = CustomerIntelligenceRequestSchema.parse(requestBody);

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-intelligence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(validatedRequestBody)
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => 'Unknown error');
                const error = new Error(`HTTP error! status: ${res.status} body: ${errText}`);
                
                try {
                    const errJson = JSON.parse(errText);
                    if (errJson && errJson.no_write_smoke) {
                        attachCustomerIntelligenceNoWriteSmokeMetadata(error, errJson.no_write_smoke);
                    }
                } catch (_e) {
                    // Not JSON, ignore
                }
                
                throw error;
            }

            let data: Record<string, any> = {};
            if (options?.onChunk && res.headers.get('Content-Type')?.includes('text/event-stream')) {
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();
                let finalMetadata = null;

                if (reader) {
                    let buffer = '';
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line?.startsWith('event: text')) {
                                const dataLine = lines[i+1];
                                if (dataLine && dataLine.startsWith('data: ')) {
                                    try {
                                        const newText = JSON.parse(dataLine.slice(6));
                                        options.onChunk(newText);
                                    } catch (_e) {
                                        // ignore parse errors on partial stream chunks
                                    }
                                }
                            } else if (line?.startsWith('event: metadata')) {
                                const dataLine = lines[i+1];
                                if (dataLine && dataLine.startsWith('data: ')) {
                                    try {
                                        finalMetadata = JSON.parse(dataLine.slice(6));
                                    } catch (_e) {
                                        // ignore parse errors on partial metadata
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (finalMetadata) {
                    data = finalMetadata;
                } else {
                    throw new Error('Stream finished without metadata');
                }
            } else {
                data = await res.json();
            }

            // Note: The rest of the function maps 'data' to the response format.
            const error = null;

            if (error) {
                throw attachCustomerIntelligenceNoWriteSmokeMetadata(error, data?.no_write_smoke);
            }

            const turnAnalysis = normalizeTurnAnalysis(
                data.turn_analysis
                    ?? data.turn_profile
                    ?? data.debug?.turn_analysis
                    ?? data.debug?.current_turn_analysis
                    ?? data.debug?.turn_profile
                    ?? data.debug?.guardrail_telemetry?.turn_profile,
                getFallbackTurnAnalysis({
                    intent: data.intent ?? null,
                    routed_capsule: data.routed_capsule ?? null,
                    capsule_name: data.capsule_name ?? null,
                }),
            );
            const derivedCatalogGate = buildConciergeCatalogGate({
                query,
                turnAnalysis,
                intent: data.intent ?? null,
                assistantMessage: data.message ?? data.text ?? null,
                capsuleContract: data.capsule_contract ?? null,
            });
            const catalogGate = normalizeServerCatalogGate(
                data.catalog_gate
                    ?? data.debug?.catalog_gate
                    ?? data.debug?.guardrail_telemetry?.catalog_gate,
                derivedCatalogGate,
            );
            const sourceContext = normalizeSourceContext(
                data.source_context
                    ?? data.debug?.source_context
                    ?? data.debug?.external_context,
            );
            
            // --- AI/LLM ROUTING: CLOUD TO CLIENT CAPSULE DELEGATION ---
            if (data.requires_client_capsule) {
                if (data.capsule_name === 'product_search_integrity') {
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

                    void logAITelemetry({
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
                }

                if (data.capsule_name === 'storefront_kitting_basket') {
                    const capsuleContract = await executeStorefrontKittingBasketCapsule(data.tool_args);
                    const kitProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const shouldShowCatalogSurfaces = catalogGate.is_open;
                    const visibleProducts = shouldShowCatalogSurfaces ? kitProducts : [];
                    const commercialMove = capsuleContract.match_strategy === 'FULL_KIT'
                        ? 'ADD_READY'
                        : capsuleContract.match_strategy === 'PARTIAL_KIT'
                            ? 'REVIEW_ONE'
                            : 'KEEP_EXPLORING';
                    const kitTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'KIT_ASSEMBLY',
                        turn_focus: 'kitting',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: capsuleContract.match_strategy === 'FULL_KIT'
                            ? 'READY_TO_CLOSE'
                            : capsuleContract.match_strategy === 'PARTIAL_KIT'
                                ? 'SOFT_REASSURE'
                                : 'EXPLORE_LIGHT',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(kitProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: kitTurnAnalysis,
                        commercialMove,
                    });
                    const compactBaseMessage = compactCesarinCopy(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        2,
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
                    const compactNextStepView = shouldShowCatalogSurfaces
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
                    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
                    (capsuleContract as Record<string, any>).turn_analysis = kitTurnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'search',
                        routed_capsule: 'storefront_kitting_basket',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.match_strategy !== 'FULL_KIT',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: shouldShowCatalogSurfaces && visibleProducts.length > 0,
                        product_card_count: shouldShowCatalogSurfaces ? visibleProducts.length : 0,
                        zero_results: !shouldShowCatalogSurfaces || visibleProducts.length === 0,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: kitTurnAnalysis.primary_intent,
                        turn_secondary_intents: kitTurnAnalysis.secondary_intents,
                        turn_priority: kitTurnAnalysis.turn_priority,
                        current_turn_decision: kitTurnAnalysis.current_turn_decision,
                        turn_focus: kitTurnAnalysis.turn_focus ?? null,
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
                            turnAnalysis: kitTurnAnalysis,
                            sourceContext,
                        }),
                        shouldShowCatalogSurfaces ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', shouldShowCatalogSurfaces ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'recommendation',
                        turn_analysis: kitTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'storefront_budget_rescue') {
                    const capsuleContract = await executeStorefrontBudgetRescueCapsule(data.tool_args);
                    const cheaperProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const shouldShowCatalogSurfaces = catalogGate.is_open;
                    const visibleProducts = shouldShowCatalogSurfaces ? cheaperProducts : [];
                    const commercialMove = capsuleContract.match_strategy === 'CHEAPER_ALTERNATIVE_FOUND'
                        ? visibleProducts.length >= 2
                            ? 'COMPARE_TWO'
                            : 'REVIEW_ONE'
                        : capsuleContract.match_strategy === 'PROMO_ALREADY_BEST_VALUE'
                            || capsuleContract.match_strategy === 'REVIEW_CURRENT_OPTION'
                            ? 'REVIEW_ONE'
                            : 'KEEP_EXPLORING';
                    const budgetTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'BUDGET_RESCUE',
                        turn_focus: 'budget',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN'
                            ? 'EXPLORE_LIGHT'
                            : 'SOFT_REASSURE',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(cheaperProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: budgetTurnAnalysis,
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
                    const compactNextStepView = visibleProducts.length > 0
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
                    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
                    (capsuleContract as Record<string, any>).turn_analysis = budgetTurnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'recommendation',
                        routed_capsule: 'storefront_budget_rescue',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: visibleProducts.length > 0,
                        product_card_count: visibleProducts.length,
                        zero_results: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: budgetTurnAnalysis.primary_intent,
                        turn_secondary_intents: budgetTurnAnalysis.secondary_intents,
                        turn_priority: budgetTurnAnalysis.turn_priority,
                        current_turn_decision: budgetTurnAnalysis.current_turn_decision,
                        turn_focus: budgetTurnAnalysis.turn_focus ?? null,
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
                            turnAnalysis: budgetTurnAnalysis,
                            sourceContext,
                        }),
                        visibleProducts.length > 0 ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'recommendation',
                        turn_analysis: budgetTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'storefront_compatibility_check') {
                    const capsuleContract = await executeStorefrontCompatibilityCheckCapsule(data.tool_args);
                    const compatibilityProducts = capsuleContract.resolved_products?.length
                        ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
                            .catch(() => [])
                        : [];
                    const visibleProducts = compatibilityProducts;
                    const commercialMove = capsuleContract.match_strategy === 'COMPATIBLE'
                        ? visibleProducts.length >= 2
                            ? 'COMPARE_TWO'
                            : 'REVIEW_ONE'
                        : capsuleContract.match_strategy === 'REVIEW_PRODUCT'
                            ? visibleProducts.length >= 2
                                ? 'COMPARE_TWO'
                                : 'REVIEW_ONE'
                            : 'KEEP_EXPLORING';
                    const compatibilityTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        commercial_move: commercialMove,
                        primary_intent: 'COMPATIBILITY_CHECK',
                        turn_focus: 'compatibility',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const adaptiveConversation = buildCesarinActionableNextStepView({
                        query,
                        history,
                        preferenceSummary: null,
                        matchStrategy: null,
                        adaptiveMode: visibleProducts.length >= 2 ? 'GUIDED_COMPARE' : 'SOFT_REASSURE',
                        visibleProducts,
                        enrichedProductsById: Object.fromEntries(compatibilityProducts.map((product) => [product.id, product])),
                        baseMessage: capsuleContract.customer_response_draft ?? '',
                        turnAnalysis: compatibilityTurnAnalysis,
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
                    const compactNextStepView = visibleProducts.length > 0
                        && adaptiveConversation.nextStep.renderHint === 'SHOW'
                        && (renderableNextStepGuidance || hasMaterialNextStepAction)
                        ? {
                            ...adaptiveConversation.nextStep,
                            guidance: renderableNextStepGuidance,
                        }
                        : undefined;
                    (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
                    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
                    (capsuleContract as Record<string, any>).turn_analysis = compatibilityTurnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;

                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'storefront_compatibility_check',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: visibleProducts.length > 0,
                        product_card_count: visibleProducts.length,
                        zero_results: capsuleContract.match_strategy === 'NO_GROUNDED_MATCH'
                            || capsuleContract.match_strategy === 'NEEDS_MORE_CONTEXT',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: compatibilityTurnAnalysis.primary_intent,
                        turn_secondary_intents: compatibilityTurnAnalysis.secondary_intents,
                        turn_priority: compatibilityTurnAnalysis.turn_priority,
                        current_turn_decision: compatibilityTurnAnalysis.current_turn_decision,
                        turn_focus: compatibilityTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
                        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });

                    const finalMessage = mergeConversationalPrefix(
                        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                        getEffectiveConversationalPrefix({
                            message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: compatibilityTurnAnalysis,
                            sourceContext,
                        }),
                        visibleProducts.length > 0 ? 2 : 3,
                    );

                    return {
                        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
                        suggestedProducts: visibleProducts,
                        intent: 'info',
                        turn_analysis: compatibilityTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'knowledge_rag_foundation') {
                    const capsuleContract = await executeKnowledgeCapsule(data.tool_args);
                    const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(data.no_write_smoke);
                    const prefixedKnowledgeMessage = mergeConversationalPrefix(
                        capsuleContract.ui_render_hint ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.ui_render_hint ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    if (!noWriteSmokeActive) void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.ui_render_hint ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'knowledge_rag_foundation',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.match_strategy === 'LOW_CONFIDENCE_FALLBACK' || capsuleContract.match_strategy === 'NO_MATCH',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: false,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                    });
                    (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
                    if (noWriteSmokeActive) {
                        (capsuleContract as Record<string, any>).no_write_smoke = data.no_write_smoke;
                    }
                    return {
                        message: prefixedKnowledgeMessage || capsuleContract.ui_render_hint,
                        intent: 'info', 
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract
                    };
                }

                if (data.capsule_name === 'storefront_inventory_outlook') {
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

                    void logAITelemetry({
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
                }

                if (data.capsule_name === 'authenticated_order_tracking') {
                    const capsuleContract = await executeAuthenticatedOrderTrackingCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const action = deriveOrderTrackingBridgeAction(capsuleContract.order_tracking_signal);
                    const prefixedTrackingMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'support',
                        routed_capsule: 'authenticated_order_tracking',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.order_tracking_signal.kind !== 'FOUND',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: Boolean(action),
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
                    return {
                        message: prefixedTrackingMessage || capsuleContract.customer_response_draft,
                        intent: 'support',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        action,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'authenticated_warranty_triage') {
                    const capsuleContract = await executeAuthenticatedWarrantyTriageCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const prefixedWarrantyMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'support',
                        routed_capsule: 'authenticated_warranty_triage',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.warranty_triage_signal.kind === 'NO_RELEVANT_ORDER'
                            || capsuleContract.warranty_triage_signal.kind === 'AUTH_REQUIRED',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
                    return {
                        message: prefixedWarrantyMessage || capsuleContract.customer_response_draft,
                        intent: 'support',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'authenticated_loyalty_status') {
                    const capsuleContract = await executeAuthenticatedLoyaltyStatusCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const prefixedLoyaltyMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'info',
                        routed_capsule: 'authenticated_loyalty_status',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.loyalty_status_signal.kind === 'AUTH_REQUIRED'
                            || capsuleContract.loyalty_status_signal.kind === 'NO_LOYALTY_DATA',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
                    return {
                        message: prefixedLoyaltyMessage || capsuleContract.customer_response_draft,
                        intent: 'info',
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'storefront_checkout_readiness') {
                    const capsuleContract = await executeStorefrontCheckoutReadinessCapsule(data.tool_args, {
                        customerId: customerProfile?.id ?? null,
                    });
                    const action = deriveCheckoutBridgeAction(capsuleContract.checkout_readiness_signal);
                    const checkoutTurnAnalysis: ConciergeTurnAnalysis = {
                        ...turnAnalysis,
                        primary_intent: 'CHECKOUT_READINESS',
                        turn_focus: 'checkout',
                        current_turn_decision: 'USE_CAPABILITY',
                    };
                    const prefixedCheckoutMessage = mergeConversationalPrefix(
                        capsuleContract.customer_response_draft ?? '',
                        getEffectiveConversationalPrefix({
                            message: capsuleContract.customer_response_draft ?? '',
                            prefix: data.conversational_prefix,
                            turnAnalysis: checkoutTurnAnalysis,
                            sourceContext,
                        }),
                        3,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: capsuleContract.customer_response_draft ?? null,
                        detected_intent: 'support',
                        routed_capsule: 'storefront_checkout_readiness',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: capsuleContract.checkout_readiness_signal.kind !== 'READY_TO_CHECKOUT'
                            && capsuleContract.checkout_readiness_signal.kind !== 'PAYMENT_METHOD_INFO'
                            && capsuleContract.checkout_readiness_signal.kind !== 'SHIPPING_INFO_AVAILABLE',
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: checkoutTurnAnalysis.primary_intent,
                        turn_secondary_intents: checkoutTurnAnalysis.secondary_intents,
                        turn_priority: checkoutTurnAnalysis.turn_priority,
                        current_turn_decision: checkoutTurnAnalysis.current_turn_decision,
                        turn_focus: checkoutTurnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: Boolean(action),
                        source_context_present: Boolean(sourceContext),
                        retrieval_source: capsuleContract.retrieval_source ?? null,
                    });
                    (capsuleContract as Record<string, any>).turn_analysis = checkoutTurnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
                    return {
                        message: prefixedCheckoutMessage || capsuleContract.customer_response_draft,
                        intent: 'support',
                        turn_analysis: checkoutTurnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        action,
                        capsule_contract: capsuleContract,
                    };
                }

                if (data.capsule_name === 'cart_operator') {
                    const capsuleContract = await executeCartOperatorCapsule(data.tool_args);
                    const prefixedCartMessage = mergeConversationalPrefix(
                        'Actualizando tu carrito...',
                        getEffectiveConversationalPrefix({
                            message: 'Actualizando tu carrito...',
                            prefix: data.conversational_prefix,
                            turnAnalysis,
                            sourceContext,
                        }),
                        2,
                    );
                    void logAITelemetry({
                        session_id: effectiveTelemetrySessionId,
                        customer_id: customerProfile?.id ?? null,
                        query,
                        response_text: null,
                        detected_intent: 'cart_operation',
                        routed_capsule: 'cart_operator',
                        requires_client_capsule: true,
                        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
                        fallback_used: false,
                        response_latency_ms: Date.now() - invokeStart,
                        has_product_cards: false,
                        product_card_count: 0,
                        zero_results: false,
                        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
                        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
                        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
                        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
                        capsule_execution_status: capsuleContract.execution_status ?? null,
                        capsule_match_strategy: capsuleContract.match_strategy ?? null,
                        routing_path: data.debug?.routing_path ?? null,
                        turn_primary_intent: turnAnalysis.primary_intent,
                        turn_secondary_intents: turnAnalysis.secondary_intents,
                        turn_priority: turnAnalysis.turn_priority,
                        current_turn_decision: turnAnalysis.current_turn_decision,
                        turn_focus: turnAnalysis.turn_focus ?? null,
                        catalog_gate_open: catalogGate.is_open,
                        catalog_gate_reason: catalogGate.reason,
                        next_step_family: null,
                        assist_action_present: false,
                        source_context_present: Boolean(sourceContext),
                    });
                    (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
                    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
                    return {
                        // The UI renderer will intercept this message using ui_render_mode later
                        message: prefixedCartMessage,
                        intent: 'search', 
                        turn_analysis: turnAnalysis,
                        catalog_gate: catalogGate,
                        source_context: sourceContext,
                        capsule_contract: capsuleContract
                    };
                }
            }

            // Generic path: no capsule required, OR requires_client_capsule=true but capsule_name unrecognized (UNKNOWN_CAPSULE)
            const unknownCapsule = data.requires_client_capsule === true;
            const genericProducts = data.products ?? [];
            const genericNextStepTelemetry = extractTelemetryNextStepTruth(
                data.capsule_contract?.next_step_view ?? data.next_step_view ?? null,
            );
            const telemetryContract = resolveAITelemetryContract({
                telemetry_contract: data.telemetry_contract,
                server_telemetry_logged: data.server_telemetry_logged,
                requires_client_capsule: data.requires_client_capsule,
            });
            const genericMessage = mergeConversationalPrefix(
                data.message || data.text || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                getEffectiveConversationalPrefix({
                    message: data.message || data.text || "Lo siento, tuve un problema procesando tu mensaje. ¿En qué puedo ayudarte?",
                    prefix: data.conversational_prefix,
                    turnAnalysis,
                    sourceContext,
                }),
                catalogGate.is_open ? 2 : 3,
            );
            // Prefer the explicit edge/client ownership contract when present.
            if (shouldClientLogAITelemetry(telemetryContract)) void logAITelemetry({
                session_id: effectiveTelemetrySessionId,
                customer_id: customerProfile?.id ?? null,
                query,
                response_text: data.text ?? data.message ?? null,
                detected_intent: data.intent ?? null,
                routed_capsule: unknownCapsule ? (data.capsule_name ?? null) : null,
                requires_client_capsule: data.requires_client_capsule ?? false,
                capsule_match_success: false,
                fallback_used: true,
                response_latency_ms: Date.now() - invokeStart,
                has_product_cards: catalogGate.is_open && genericProducts.length > 0,
                product_card_count: catalogGate.is_open ? genericProducts.length : 0,
                zero_results: !catalogGate.is_open || genericProducts.length === 0,
                error_type: unknownCapsule ? 'UNKNOWN_CAPSULE' : null,
                turn_primary_intent: turnAnalysis.primary_intent,
                turn_secondary_intents: turnAnalysis.secondary_intents,
                turn_priority: turnAnalysis.turn_priority,
                current_turn_decision: turnAnalysis.current_turn_decision,
                turn_focus: turnAnalysis.turn_focus ?? null,
                catalog_gate_open: catalogGate.is_open,
                catalog_gate_reason: catalogGate.reason,
                next_step_family: genericNextStepTelemetry.next_step_family,
                assist_action_present: genericNextStepTelemetry.assist_action_present,
                source_context_present: Boolean(sourceContext),
                retrieval_source: null,
            });
            return {
                message: genericMessage,
                suggestedProducts: catalogGate.is_open ? data.products : [],
                intent: data.intent,
                turn_analysis: turnAnalysis,
                catalog_gate: catalogGate,
                source_context: sourceContext,
                action: data.action,
                capsule_contract: data.routed_capsule ? { capsule_name: data.routed_capsule, turn_analysis: turnAnalysis, catalog_gate: catalogGate } : { turn_analysis: turnAnalysis, catalog_gate: catalogGate }
            };
        } catch (error) {
            console.error('Concierge Chat Error:', error);
            const _errMsg = error instanceof Error ? error.message : String(error);
            const _errType: 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' =
                _errMsg === 'REQUEST_TIMEOUT' ? 'TIMEOUT'
                : (_errMsg.includes('429') || _errMsg.includes('RESOURCE_EXHAUSTED') || _errMsg.includes('quota')) ? 'QUOTA'
                : 'EDGE_ERROR';
            const errorNoWriteSmoke = extractCustomerIntelligenceNoWriteSmokeMetadata(error);
            if (!options?.noWriteSmoke && !errorNoWriteSmoke) {
                void logAITelemetry({
                    session_id: effectiveTelemetrySessionId,
                    customer_id: customerProfile?.id ?? null,
                    query,
                    response_text: null,
                    detected_intent: null,
                    routed_capsule: null,
                    requires_client_capsule: false,
                    capsule_match_success: false,
                    fallback_used: true,
                    response_latency_ms: Date.now() - invokeStart,
                    has_product_cards: false,
                    product_card_count: 0,
                    zero_results: false,
                    error_type: _errType,
                    catalog_gate_open: null,
                    catalog_gate_reason: null,
                    next_step_family: null,
                    assist_action_present: false,
                    source_context_present: false,
                    retrieval_source: null,
                });
            }
            // SLICE 2D: Re-throw error so the hook can classify it and render explicit Retry UI
            throw error;
        }
    }
