import { LucideIcon } from 'lucide-react';

export type BehaviorMode = 'vendedor' | 'informativo' | 'soporte';

export interface AIConfig {
    id: string;
    name: string;
    voice_tone: string;
    behavior_mode: BehaviorMode;
    welcome_message: string;
    temperature: number;
    top_p: number;
    updated_at?: string;
}

export interface AIRule {
    id: string;
    category: 'personalidad' | 'logistica' | 'ventas' | 'integralidad' | string;
    content: string;
    is_enabled: boolean;
    config_id?: string;
    priority?: number;
}

export interface LearningItem {
    id?: string;
    query: string;
    detected_intent: string | null;
    frustration_detected: boolean;
    created_at: string;
}

export interface SimulationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface SimulationSessionTurnRecord {
    id: string;
    query: string;
    response: string;
    created_at: string;
    interaction_id: string | null;
    ai_logic_debug: Record<string, unknown> | null;
    session_closed: boolean;
}

export interface SimulationDebug {
    intent?: string;
    confidence?: number;
    should_close_session?: boolean;
    frustration?: boolean;
    analyst_report?: {
        intent: string;
        doubts: string[];
        customer_dna: {
            loyalty: string;
            interests: string[];
            avg_ticket: string;
            is_new: boolean;
        };
        relevant_stock: string[];
    };
    sommelier_report?: {
        rules_applied: string[];
        tone_correction: boolean;
        creative_layer: string;
    };
}

export interface SimulationSessionMetadata {
    last_intent?: string;
    frustration_detected?: boolean;
    debug?: SimulationDebug;
    last_interaction_id?: string;
    turns?: SimulationSessionTurnRecord[];
}

export interface SimulationSession {
    id: string;
    history: SimulationMessage[];
    metadata: SimulationSessionMetadata;
    is_active: boolean;
    created_at: string;
    expires_at: string;
}

export type PremiumLabModeIdentity = 'storefront-equivalent' | 'admin-simulated' | 'replay';
export type PremiumLabSessionStatus = 'draft' | 'active' | 'closed' | 'archived';
export type PremiumLabExecutionKind = 'storefront_runtime' | 'lab_simulation' | 'replay_snapshot';
export type PremiumLabCommentScope = 'session' | 'turn';
export type PremiumLabTurnReviewSource = 'linked_ai_evaluation' | 'lab_review';
export type PremiumLabCaseDraftLinkKind = 'derived_case_draft' | 'linked_case_draft';
export type PremiumLabImprovementLinkKind = 'improvement_item' | 'intervention_signal' | 'intervention_recommendation';

export interface PremiumLabArtifactTraceSnapshot {
    evidence_kind: 'authoritative_runtime' | 'partial_runtime' | 'simulated';
    evidence_label: string;
    evidence_short_label: string;
    analyst_intent: string | null;
    final_intent: string | null;
    routing_path: string | null;
    route_kind: 'capsule' | 'non_capsule' | 'unknown';
    route_label: string;
    routed_capsule: string | null;
    execution_status: string | null;
    degraded_reason: string | null;
    retrieval_source: string | null;
    match_strategy: string | null;
    offered_products: Array<{ id: string; name: string; slug: string }>;
}

export interface PremiumLabArtifactSnapshot {
    captured_at: string;
    mode_identity: PremiumLabModeIdentity;
    execution_kind: PremiumLabExecutionKind;
    runtime_interaction_id: string | null;
    replay_source_turn_id: string | null;
    replay_source_interaction_id: string | null;
    trace: PremiumLabArtifactTraceSnapshot;
}

export interface PremiumLabSession {
    id: string;
    mode_identity: PremiumLabModeIdentity;
    status: PremiumLabSessionStatus;
    title: string | null;
    description: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface PremiumLabTurn {
    id: string;
    session_id: string;
    turn_number: number;
    mode_identity: PremiumLabModeIdentity;
    execution_kind: PremiumLabExecutionKind;
    prompt_query: string;
    history_snapshot: SimulationMessage[];
    history_message_count: number;
    assistant_answer_snapshot: string;
    artifact_snapshot: PremiumLabArtifactSnapshot;
    evidence_summary: string | null;
    runtime_interaction_id: string | null;
    replay_source_turn_id: string | null;
    replay_source_interaction_id: string | null;
    created_by: string | null;
    created_at: string;
}

export interface PremiumLabComment {
    id: string;
    scope: PremiumLabCommentScope;
    session_id: string | null;
    turn_id: string | null;
    body: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface PremiumLabTurnReview {
    id: string;
    turn_id: string;
    review_source: PremiumLabTurnReviewSource;
    ai_evaluation_id: string | null;
    score: number | null;
    primary_tag: string | null;
    secondary_tags: string[];
    severity: 'low' | 'medium' | 'high' | 'critical' | null;
    expected_outcome: string | null;
    comment: string | null;
    reviewer_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface PremiumLabCaseDraftLink {
    id: string;
    turn_id: string;
    case_draft_id: string;
    link_kind: PremiumLabCaseDraftLinkKind;
    created_by: string | null;
    created_at: string;
}

export interface PremiumLabImprovementLink {
    id: string;
    turn_id: string;
    link_kind: PremiumLabImprovementLinkKind;
    improvement_item_id: string | null;
    intervention_signal_id: string | null;
    intervention_recommendation_id: string | null;
    created_by: string | null;
    created_at: string;
}

// ── B2 Pass 1: Reusable Private Case Draft ────────────────────────────────────

export type CaseDraftSourceType = 'review_drawer' | 'qa_simulation';
export type CaseDraftReadinessStatus = 'draft' | 'needs_expected_outcome' | 'ready';

export interface PrivateCaseDraft {
    id: string;
    source_type: CaseDraftSourceType;
    source_ref_id: string;
    source_session_id: string | null;
    source_interaction_id: string | null;
    input: string;
    observed_response: string | null;
    evaluation_summary: string | null;
    expected_outcome: string | null;
    route_or_capsule: string | null;
    detected_intent: string | null;
    evaluation_score: number | null;
    failure_reason: string | null;
    readiness_status: CaseDraftReadinessStatus;
    created_at: string;
    updated_at: string;
}

export interface MemoryTrace {
    read_attempted: boolean;
    row_found: boolean;
    context_injected: boolean;
    interests_count: number;
    skipped_reason: 'no_id' | 'no_row' | 'empty_interests' | 'not_useful_for_turn' | 'read_error' | null;
}

export interface SimulationResult {
    scenario_id: string;
    scenario_type?: string;
    user_input?: string;
    score: number;
    passed: boolean;
    status: string;
    detected_intent: string;
    response: string;
    latency_ms: number;
    knowledge_chunks: number;
    tools_called: string[];
    reasons: string[];
    capsule_name?: string;
    fallback_used?: boolean;
    product_cards_count?: number;
    frustration_detected?: boolean;
    validation_hints?: string[];
    dimension_scores?: Record<string, number>;
    memory_trace?: MemoryTrace;
    judge_eval?: {
        tone_score: number;
        grounding_score: number;
        hallucination_detected: boolean;
        comment: string;
        judged_at: string;
        judge_model: string;
    };
}

export interface SimulationReport {
    id: string;
    timestamp: string;
    total: number;
    passed: number;
    failed: number;
    results: SimulationResult[];
}

export interface NavTab {
    id: 'persona' | 'knowledge' | 'rules' | 'analytics' | 'simulator' | 'learning' | 'interventions' | 'quality' | 'pilot' | 'improvements' | 'concepts' | 'casos';
    label: string;
    icon: LucideIcon;
}

export interface ProductAIInfo {
    id: string;
    name: string;
    ai_is_featured: boolean;
    ai_sales_note: string | null;
    ai_exclude: boolean;
    cover_image?: string;
}

// ========================================
// LEARNING INTERVENTION WORKFLOW TYPES
// ========================================

export type InterventionSignalType = 'enrichment_gap' | 'compatibility_miss' | 'escalation_theme';
export type InterventionType = 'enrichment' | 'compatibility' | 'escalation_playbook';
export type OperatorDecision = 'pending' | 'approved' | 'rejected' | 'deferred';
export type ExecutionStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type Confidence = 'high' | 'medium' | 'low';

export interface InterventionSignal {
    id: string;
    signal_type: InterventionSignalType;
    product_id?: string;
    category?: string;
    evidence_count: number;
    evidence_window_days: number;
    confidence: Confidence;
    signal_detail: Record<string, unknown>; // varies by signal_type
    created_at: string;
    first_occurrence_at: string;
    last_occurrence_at: string;
    status: 'pending' | 'acknowledged' | 'closed';
}

export interface InterventionDiagnosis {
    root_cause: string;
    reasoning: string;
    effort_hours: number;
    estimated_impact: 'high' | 'medium' | 'low';
    implementation_notes?: string;
}

export interface InterventionRecommendation {
    id: string;
    signal_id: string;
    intervention_type: InterventionType;
    rank: number;
    diagnosis: InterventionDiagnosis;
    operator_decision: OperatorDecision;
    operator_id?: string;
    operator_notes?: string;
    operator_decision_at?: string;
    execution_status: ExecutionStatus;
    executed_at?: string;
    validation_date?: string;
    signal_reduction_percent?: number;
    created_at: string;
    updated_at: string;
}
