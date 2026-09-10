import {
    getEffectiveConversationalPrefix,
    mergeConversationalPrefix,
} from '@/lib/cesarin-text-utils';
import {
    resolveAITelemetryContract,
    shouldClientLogAITelemetry,
} from '@/lib/ai-telemetry-contract';
import type { Product } from '@/types/product';
import type { CustomerProfile } from '@/types/customer';
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import {
    buildConciergeCatalogGate,
    extractCustomerIntelligenceNoWriteSmokeMetadata,
    extractTelemetryNextStepTruth,
    getFallbackTurnAnalysis,
    normalizeServerCatalogGate,
    normalizeSourceContext,
    normalizeTurnAnalysis,
} from './helpers';
import { logAITelemetry } from './telemetry';
import type {
    ConciergeCatalogGate,
    ConciergeMessage,
    ConciergeSourceContext,
    ConciergeTurnAnalysis,
} from './types';
import { executeConciergeRemoteChat } from './remote-client';
import { dispatchClientCapsule } from './capsule-dispatcher';

export async function chat(
    query: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    customerProfile?: CustomerProfile,
    audio?: string,
    mimeType?: string,
    cesarinSessionId?: string | null,
    options?: { noWriteSmoke?: boolean; onChunk?: (text: string) => void },
): Promise<{
    message: string;
    suggestedProducts?: (Product | InternalResolvedProduct)[];
    intent?: ConciergeMessage['intent'];
    turn_analysis?: ConciergeTurnAnalysis;
    catalog_gate?: ConciergeCatalogGate;
    source_context?: ConciergeSourceContext;
    action?: ConciergeMessage['action'];
    capsule_contract?: Record<string, any>;
}> {
    const invokeStart = Date.now();
    const effectiveTelemetrySessionId = cesarinSessionId ?? null;

    try {
        const data = await executeConciergeRemoteChat({
            query,
            history,
            customerProfile,
            audio,
            mimeType,
            cesarinSessionId: effectiveTelemetrySessionId,
            options,
        });

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
            const capsuleResult = await dispatchClientCapsule({
                data,
                query,
                history,
                customerProfile,
                catalogGate,
                turnAnalysis,
                sourceContext,
                invokeStart,
                effectiveTelemetrySessionId,
            });
            if (capsuleResult) {
                return capsuleResult;
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
        if (!options?.noWriteSmoke && shouldClientLogAITelemetry(telemetryContract)) void logAITelemetry({
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
