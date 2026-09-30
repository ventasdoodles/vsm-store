import { executeCartOperatorCapsule } from '@/services/ai-capsule-orchestrator.service';
import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
import { logAITelemetry } from '../telemetry';
import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';

export const handleCartOperator = async (
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
): Promise<ClientCapsuleDispatchResult | null> => {
    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
    
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
    if (!noWriteSmokeActive) void logAITelemetry({
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
};


