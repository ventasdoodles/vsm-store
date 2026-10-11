import { executeKnowledgeCapsule } from '@/services/ai-capsule-orchestrator.service';
import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
import { logAITelemetry } from '../telemetry';
import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';

export const handleKnowledgeRagFoundation = async (
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
): Promise<ClientCapsuleDispatchResult | null> => {
    const {
        data,
        query,
        customerProfile,
        catalogGate,
        turnAnalysis,
        sourceContext,
        invokeStart,
        effectiveTelemetrySessionId,
    } = params;

    const capsuleContract = await executeKnowledgeCapsule(data.tool_args);
    const knowledgeText = capsuleContract.ui_render_hint ?? '';
    const prefixedKnowledgeMessage = mergeConversationalPrefix(
        knowledgeText,
        getEffectiveConversationalPrefix({
            message: knowledgeText,
            prefix: data.conversational_prefix,
            turnAnalysis,
            sourceContext,
        }),
        3,
    );

    if (!noWriteSmokeActive) {
        void logAITelemetry({
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
            zero_results: capsuleContract.match_strategy === 'NO_MATCH',
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
        }).catch((err) => console.error('[Telemetry] Failed to log knowledge RAG:', err));
    }

    (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
    (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
    if (noWriteSmokeActive) {
        (capsuleContract as Record<string, any>).no_write_smoke = data.no_write_smoke;
    }

    return {
        message: prefixedKnowledgeMessage,
        intent: 'info',
        turn_analysis: turnAnalysis,
        catalog_gate: catalogGate,
        source_context: sourceContext,
        capsule_contract: capsuleContract,
    };
};
