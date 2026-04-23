import { supabase } from '@/lib/supabase';
import type {
    PremiumLabArtifactSnapshot,
    PremiumLabArtifactTraceSnapshot,
    PremiumLabCaseDraftLink,
    PremiumLabCaseDraftLinkKind,
    PremiumLabComment,
    PremiumLabCommentScope,
    PremiumLabExecutionKind,
    PremiumLabImprovementLink,
    PremiumLabImprovementLinkKind,
    PremiumLabModeIdentity,
    PremiumLabSession,
    PremiumLabSessionStatus,
    PremiumLabTurn,
    PremiumLabTurnReview,
    PremiumLabTurnReviewSource,
    SimulationMessage,
} from '@/types/cesarin';
import {
    buildAdminDecisionTraceView,
    type AdminDecisionTraceEvidenceKind,
    type AdminDecisionTraceView,
} from './admin-decision-trace.service';

export interface CreatePremiumLabSessionInput {
    mode_identity: PremiumLabModeIdentity;
    status?: PremiumLabSessionStatus;
    title?: string | null;
    description?: string | null;
    created_by?: string | null;
}

export interface BuildPremiumLabTurnArtifactInput {
    mode_identity: PremiumLabModeIdentity;
    assistant_answer_snapshot: string;
    runtime_interaction_id?: string | null;
    replay_source_turn_id?: string | null;
    replay_source_interaction_id?: string | null;
    ai_logic_debug?: Record<string, unknown> | null;
}

export interface CreatePremiumLabTurnInput extends BuildPremiumLabTurnArtifactInput {
    session_id: string;
    turn_number: number;
    prompt_query: string;
    history_snapshot: SimulationMessage[];
    created_by?: string | null;
}

export interface SavePremiumLabTurnReviewInput {
    turn_id: string;
    review_source: PremiumLabTurnReviewSource;
    ai_evaluation_id?: string | null;
    score?: number | null;
    primary_tag?: string | null;
    secondary_tags?: string[];
    severity?: PremiumLabTurnReview['severity'];
    expected_outcome?: string | null;
    comment?: string | null;
    reviewer_id?: string | null;
}

export interface CreatePremiumLabCommentInput {
    scope: PremiumLabCommentScope;
    session_id?: string | null;
    turn_id?: string | null;
    body: string;
    created_by?: string | null;
}

export interface CreatePremiumLabCaseDraftLinkInput {
    turn_id: string;
    case_draft_id: string;
    link_kind?: PremiumLabCaseDraftLinkKind;
    created_by?: string | null;
}

export interface CreatePremiumLabImprovementLinkInput {
    turn_id: string;
    link_kind: PremiumLabImprovementLinkKind;
    improvement_item_id?: string | null;
    intervention_signal_id?: string | null;
    intervention_recommendation_id?: string | null;
    created_by?: string | null;
}

export interface PremiumLabSessionBundle {
    session: PremiumLabSession;
    turns: PremiumLabTurn[];
    reviews_by_turn_id: Record<string, PremiumLabTurnReview>;
    session_comments: PremiumLabComment[];
    turn_comments_by_turn_id: Record<string, PremiumLabComment[]>;
    case_draft_links_by_turn_id: Record<string, PremiumLabCaseDraftLink[]>;
    improvement_links_by_turn_id: Record<string, PremiumLabImprovementLink[]>;
}

function sanitizeHistorySnapshot(history: SimulationMessage[]): SimulationMessage[] {
    return history
        .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
        .map((entry) => ({
            role: entry.role,
            content: String(entry.content ?? ''),
        }));
}

function executionKindFromMode(modeIdentity: PremiumLabModeIdentity): PremiumLabExecutionKind {
    switch (modeIdentity) {
        case 'storefront-equivalent':
            return 'storefront_runtime';
        case 'admin-simulated':
            return 'lab_simulation';
        case 'replay':
            return 'replay_snapshot';
    }
}

function forcedEvidenceKindFromMode(
    modeIdentity: PremiumLabModeIdentity,
): AdminDecisionTraceEvidenceKind | null {
    switch (modeIdentity) {
        case 'storefront-equivalent':
            return null;
        case 'admin-simulated':
            return 'simulated';
        case 'replay':
            return 'partial_runtime';
    }
}

function toArtifactTraceSnapshot(trace: AdminDecisionTraceView): PremiumLabArtifactTraceSnapshot {
    return {
        evidence_kind: trace.evidenceKind,
        evidence_label: trace.evidenceLabel,
        evidence_short_label: trace.evidenceShortLabel,
        analyst_intent: trace.analystIntent,
        final_intent: trace.finalIntent,
        routing_path: trace.routingPath,
        route_kind: trace.routeKind,
        route_label: trace.routeLabel,
        routed_capsule: trace.routedCapsule,
        execution_status: trace.executionStatus,
        degraded_reason: trace.degradedReason,
        retrieval_source: trace.retrievalSource,
        match_strategy: trace.matchStrategy,
        offered_products: trace.offeredProducts,
    };
}

function buildEvidenceSummary(input: {
    mode_identity: PremiumLabModeIdentity;
    runtime_interaction_id: string | null;
    replay_source_turn_id: string | null;
    replay_source_interaction_id: string | null;
    trace: AdminDecisionTraceView;
}): string {
    switch (input.mode_identity) {
        case 'storefront-equivalent':
            return input.runtime_interaction_id
                ? `Storefront-equivalent turn linked to ai_analytics ${input.runtime_interaction_id}; lab persistence reuses the real runtime interaction instead of duplicating telemetry ownership.`
                : 'Storefront-equivalent turn persisted without a runtime linkage. This should not happen.';
        case 'admin-simulated':
            return 'Admin-simulated turn persisted as lab-only evidence. It does not claim live storefront runtime truth.';
        case 'replay':
            return input.replay_source_turn_id
                ? `Replay artifact persisted from premium lab turn ${input.replay_source_turn_id}; trace remains inspection-only and not a new runtime execution.`
                : `Replay artifact persisted from ai_analytics ${input.replay_source_interaction_id}; trace remains inspection-only and not a new storefront-equivalent run.`;
    }
}

function assertValidTurnInput(input: CreatePremiumLabTurnInput) {
    if (input.turn_number <= 0) {
        throw new Error('turn_number must be positive');
    }

    if (input.mode_identity === 'storefront-equivalent' && !input.runtime_interaction_id) {
        throw new Error('storefront-equivalent turns require runtime_interaction_id');
    }

    if (input.mode_identity === 'admin-simulated' && input.runtime_interaction_id) {
        throw new Error('admin-simulated turns cannot claim runtime_interaction_id');
    }

    if (
        input.mode_identity === 'replay'
        && !input.replay_source_turn_id
        && !input.replay_source_interaction_id
    ) {
        throw new Error('replay turns require replay_source_turn_id or replay_source_interaction_id');
    }
}

export function buildPremiumLabArtifactSnapshot(
    input: BuildPremiumLabTurnArtifactInput,
): PremiumLabArtifactSnapshot {
    const trace = buildAdminDecisionTraceView({
        responseText: input.assistant_answer_snapshot,
        aiLogicDebug: input.ai_logic_debug ?? null,
        forceEvidenceKind: forcedEvidenceKindFromMode(input.mode_identity),
    });

    return {
        captured_at: new Date().toISOString(),
        mode_identity: input.mode_identity,
        execution_kind: executionKindFromMode(input.mode_identity),
        runtime_interaction_id: input.runtime_interaction_id ?? null,
        replay_source_turn_id: input.replay_source_turn_id ?? null,
        replay_source_interaction_id: input.replay_source_interaction_id ?? null,
        trace: toArtifactTraceSnapshot(trace),
    };
}

export async function createPremiumLabSession(
    input: CreatePremiumLabSessionInput,
): Promise<PremiumLabSession> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_sessions')
        .insert({
            mode_identity: input.mode_identity,
            status: input.status ?? 'draft',
            title: input.title ?? null,
            description: input.description ?? null,
            created_by: input.created_by ?? null,
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as PremiumLabSession;
}

export async function updatePremiumLabSessionStatus(
    sessionId: string,
    status: PremiumLabSessionStatus,
): Promise<void> {
    const { error } = await supabase
        .from('cesarin_premium_lab_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

    if (error) throw error;
}

export async function getPremiumLabSession(sessionId: string): Promise<PremiumLabSession | null> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

    if (error) throw error;
    return (data as PremiumLabSession | null) ?? null;
}

export async function listPremiumLabSessions(limit = 50): Promise<PremiumLabSession[]> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data ?? []) as PremiumLabSession[];
}

export async function createPremiumLabTurn(
    input: CreatePremiumLabTurnInput,
): Promise<PremiumLabTurn> {
    assertValidTurnInput(input);

    const historySnapshot = sanitizeHistorySnapshot(input.history_snapshot);
    const artifactSnapshot = buildPremiumLabArtifactSnapshot(input);
    const evidenceSummary = buildEvidenceSummary({
        mode_identity: input.mode_identity,
        runtime_interaction_id: input.runtime_interaction_id ?? null,
        replay_source_turn_id: input.replay_source_turn_id ?? null,
        replay_source_interaction_id: input.replay_source_interaction_id ?? null,
        trace: buildAdminDecisionTraceView({
            responseText: input.assistant_answer_snapshot,
            aiLogicDebug: input.ai_logic_debug ?? null,
            forceEvidenceKind: forcedEvidenceKindFromMode(input.mode_identity),
        }),
    });

    const { data, error } = await supabase
        .from('cesarin_premium_lab_turns')
        .insert({
            session_id: input.session_id,
            turn_number: input.turn_number,
            mode_identity: input.mode_identity,
            execution_kind: artifactSnapshot.execution_kind,
            prompt_query: input.prompt_query,
            history_snapshot: historySnapshot,
            history_message_count: historySnapshot.length,
            assistant_answer_snapshot: input.assistant_answer_snapshot,
            artifact_snapshot: artifactSnapshot,
            evidence_summary: evidenceSummary,
            runtime_interaction_id: input.runtime_interaction_id ?? null,
            replay_source_turn_id: input.replay_source_turn_id ?? null,
            replay_source_interaction_id: input.replay_source_interaction_id ?? null,
            created_by: input.created_by ?? null,
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as PremiumLabTurn;
}

export async function getPremiumLabTurns(sessionId: string): Promise<PremiumLabTurn[]> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_turns')
        .select('*')
        .eq('session_id', sessionId)
        .order('turn_number', { ascending: true });

    if (error) throw error;
    return (data ?? []) as PremiumLabTurn[];
}

export async function savePremiumLabTurnReview(
    input: SavePremiumLabTurnReviewInput,
): Promise<PremiumLabTurnReview> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_turn_reviews')
        .upsert({
            turn_id: input.turn_id,
            review_source: input.review_source,
            ai_evaluation_id: input.ai_evaluation_id ?? null,
            score: input.score ?? null,
            primary_tag: input.primary_tag ?? null,
            secondary_tags: input.secondary_tags ?? [],
            severity: input.severity ?? null,
            expected_outcome: input.expected_outcome ?? null,
            comment: input.comment ?? null,
            reviewer_id: input.reviewer_id ?? null,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'turn_id' })
        .select('*')
        .single();

    if (error) throw error;
    return data as PremiumLabTurnReview;
}

export async function getPremiumLabTurnReviews(
    turnIds: string[],
): Promise<Record<string, PremiumLabTurnReview>> {
    if (turnIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_premium_lab_turn_reviews')
        .select('*')
        .in('turn_id', turnIds);

    if (error) throw error;

    const map: Record<string, PremiumLabTurnReview> = {};
    for (const row of data ?? []) {
        map[(row as PremiumLabTurnReview).turn_id] = row as PremiumLabTurnReview;
    }
    return map;
}

export async function createPremiumLabComment(
    input: CreatePremiumLabCommentInput,
): Promise<PremiumLabComment> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_comments')
        .insert({
            scope: input.scope,
            session_id: input.scope === 'session' ? (input.session_id ?? null) : null,
            turn_id: input.scope === 'turn' ? (input.turn_id ?? null) : null,
            body: input.body,
            created_by: input.created_by ?? null,
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as PremiumLabComment;
}

export async function getPremiumLabSessionComments(
    sessionId: string,
): Promise<PremiumLabComment[]> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_comments')
        .select('*')
        .eq('scope', 'session')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as PremiumLabComment[];
}

export async function getPremiumLabTurnComments(
    turnIds: string[],
): Promise<Record<string, PremiumLabComment[]>> {
    if (turnIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_premium_lab_comments')
        .select('*')
        .eq('scope', 'turn')
        .in('turn_id', turnIds)
        .order('created_at', { ascending: true });

    if (error) throw error;

    const map: Record<string, PremiumLabComment[]> = {};
    for (const row of data ?? []) {
        const comment = row as PremiumLabComment;
        const turnId = comment.turn_id;
        if (!turnId) continue;
        map[turnId] = [...(map[turnId] ?? []), comment];
    }
    return map;
}

export async function linkPremiumLabTurnToCaseDraft(
    input: CreatePremiumLabCaseDraftLinkInput,
): Promise<PremiumLabCaseDraftLink> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_turn_case_draft_links')
        .insert({
            turn_id: input.turn_id,
            case_draft_id: input.case_draft_id,
            link_kind: input.link_kind ?? 'derived_case_draft',
            created_by: input.created_by ?? null,
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as PremiumLabCaseDraftLink;
}

export async function getPremiumLabCaseDraftLinks(
    turnIds: string[],
): Promise<Record<string, PremiumLabCaseDraftLink[]>> {
    if (turnIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_premium_lab_turn_case_draft_links')
        .select('*')
        .in('turn_id', turnIds)
        .order('created_at', { ascending: true });

    if (error) throw error;

    const map: Record<string, PremiumLabCaseDraftLink[]> = {};
    for (const row of data ?? []) {
        const link = row as PremiumLabCaseDraftLink;
        map[link.turn_id] = [...(map[link.turn_id] ?? []), link];
    }
    return map;
}

export async function linkPremiumLabTurnToImprovement(
    input: CreatePremiumLabImprovementLinkInput,
): Promise<PremiumLabImprovementLink> {
    const { data, error } = await supabase
        .from('cesarin_premium_lab_turn_improvement_links')
        .insert({
            turn_id: input.turn_id,
            link_kind: input.link_kind,
            improvement_item_id: input.improvement_item_id ?? null,
            intervention_signal_id: input.intervention_signal_id ?? null,
            intervention_recommendation_id: input.intervention_recommendation_id ?? null,
            created_by: input.created_by ?? null,
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as PremiumLabImprovementLink;
}

export async function getPremiumLabImprovementLinks(
    turnIds: string[],
): Promise<Record<string, PremiumLabImprovementLink[]>> {
    if (turnIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_premium_lab_turn_improvement_links')
        .select('*')
        .in('turn_id', turnIds)
        .order('created_at', { ascending: true });

    if (error) throw error;

    const map: Record<string, PremiumLabImprovementLink[]> = {};
    for (const row of data ?? []) {
        const link = row as PremiumLabImprovementLink;
        map[link.turn_id] = [...(map[link.turn_id] ?? []), link];
    }
    return map;
}

export async function getPremiumLabSessionBundle(
    sessionId: string,
): Promise<PremiumLabSessionBundle | null> {
    const session = await getPremiumLabSession(sessionId);
    if (!session) return null;

    const turns = await getPremiumLabTurns(sessionId);
    const turnIds = turns.map((turn) => turn.id);

    const [
        reviewsByTurnId,
        sessionComments,
        turnCommentsByTurnId,
        caseDraftLinksByTurnId,
        improvementLinksByTurnId,
    ] = await Promise.all([
        getPremiumLabTurnReviews(turnIds),
        getPremiumLabSessionComments(sessionId),
        getPremiumLabTurnComments(turnIds),
        getPremiumLabCaseDraftLinks(turnIds),
        getPremiumLabImprovementLinks(turnIds),
    ]);

    return {
        session,
        turns,
        reviews_by_turn_id: reviewsByTurnId,
        session_comments: sessionComments,
        turn_comments_by_turn_id: turnCommentsByTurnId,
        case_draft_links_by_turn_id: caseDraftLinksByTurnId,
        improvement_links_by_turn_id: improvementLinksByTurnId,
    };
}
