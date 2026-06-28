import { supabase } from '@/lib/supabase';
















import { ConciergeTurnPriority } from "./types";

export async function logAITelemetry(fields: {
    session_id?: string | null;
    customer_id: string | null;
    query: string;
    response_text: string | null;
    detected_intent: string | null;
    routed_capsule: string | null;
    requires_client_capsule: boolean;
    capsule_match_success: boolean;
    fallback_used: boolean;
    response_latency_ms: number;
    has_product_cards: boolean;
    product_card_count: number;
    zero_results: boolean;
    error_type: 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' | 'UNKNOWN_CAPSULE' | null;
    offered_products?: Array<{ id: string; name: string; slug: string }>;
    analyst_intent?: string | null;
    guardrail_overrides?: string[];
    injected_tools?: string[];
    capsule_execution_status?: string | null;
    capsule_match_strategy?: string | null;
    capsule_retrieval_source?: string | null;
    routing_path?: 'pre_routed' | 'fallback_handled' | null;
    turn_primary_intent?: string | null;
    turn_secondary_intents?: string[];
    turn_priority?: ConciergeTurnPriority;
    current_turn_decision?: string | null;
    turn_focus?: string | null;
    catalog_gate_open?: boolean | null;
    catalog_gate_reason?: string | null;
    next_step_family?: string | null;
    assist_action_present?: boolean;
    source_context_present?: boolean;
    retrieval_source?: string | null;
}): Promise<void> {
    try {
        await supabase.from('ai_analytics').insert({
            session_id: fields.session_id ?? null,
            customer_id: fields.customer_id,
            query: fields.query,
            response_text: fields.response_text,
            detected_intent: fields.detected_intent,
            primary_intent: fields.turn_primary_intent ?? null,
            current_turn_decision: fields.current_turn_decision ?? null,
            turn_focus: fields.turn_focus ?? null,
            catalog_gate_open: fields.catalog_gate_open ?? null,
            catalog_gate_reason: fields.catalog_gate_reason ?? null,
            next_step_family: fields.next_step_family ?? null,
            assist_action_present: fields.assist_action_present ?? false,
            source_context_present: fields.source_context_present ?? false,
            retrieval_source: fields.retrieval_source ?? fields.capsule_retrieval_source ?? null,
            ai_logic_debug: {
                is_simulation: false,
                detected_intent: fields.detected_intent,
                sommelier_routed_capsule: fields.routed_capsule,
                requires_client_capsule: fields.requires_client_capsule,
                routing_path: fields.routing_path ?? null,
                semantic_match_success: fields.capsule_match_success,
                fallback_used: fields.fallback_used,
                latency_ms: fields.response_latency_ms,
                has_product_cards: fields.has_product_cards,
                product_card_count: fields.product_card_count,
                zero_results: fields.zero_results,
                error_type: fields.error_type,
                cart_action_detected: fields.routed_capsule === 'cart_operator',
                offered_products: fields.offered_products ?? [],
                analyst_intent: fields.analyst_intent ?? null,
                guardrail_overrides: fields.guardrail_overrides ?? [],
                injected_tools: fields.injected_tools ?? [],
                capsule_execution_status: fields.capsule_execution_status ?? null,
                capsule_match_strategy: fields.capsule_match_strategy ?? null,
                primary_intent: fields.turn_primary_intent ?? null,
                capsule_retrieval_source: fields.capsule_retrieval_source ?? null,
                retrieval_source: fields.retrieval_source ?? fields.capsule_retrieval_source ?? null,
                turn_primary_intent: fields.turn_primary_intent ?? null,
                turn_secondary_intents: fields.turn_secondary_intents ?? [],
                turn_priority: fields.turn_priority ?? null,
                current_turn_decision: fields.current_turn_decision ?? null,
                turn_focus: fields.turn_focus ?? null,
                catalog_gate_open: fields.catalog_gate_open ?? null,
                catalog_gate_reason: fields.catalog_gate_reason ?? null,
                next_step_family: fields.next_step_family ?? null,
                assist_action_present: fields.assist_action_present ?? false,
                source_context_present: fields.source_context_present ?? false,
            }
        });
    } catch {
        // silent — telemetry must never block or affect user response
    }
}
