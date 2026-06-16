/**
 * // ─── ADMIN IMPROVEMENT SERVICE ─── [Evaluation → Queue Bridge]
 * // Purpose: CRUD for governed improvement items sourced from reviewed interactions.
 * // Scope: Operator-explicit creation and tracking only. No autonomous execution.
 */
import { supabase } from '@/lib/supabase';
import type { InterventionRecommendation, InterventionSignal } from '@/types/cesarin';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ImprovementLane   = 'rule' | 'knowledge' | 'compatibility' | 'commerce' | 'other';
export type ImprovementStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';
export type ImprovementSourceKind = 'review_interaction' | 'intervention_recommendation';

export interface ImprovementItem {
    id:             string;
    analytics_id:   string | null;
    evaluation_id:  string | null;
    source_kind?:   ImprovementSourceKind;
    intervention_signal_id?: string | null;
    intervention_recommendation_id?: string | null;
    lane:           ImprovementLane;
    title:          string;
    summary:        string | null;
    severity:       'low' | 'medium' | 'high' | 'critical';
    status:         ImprovementStatus;
    owner_id:       string | null;
    execution_note: string | null;
    artifact_ref:   string | null;
    created_at:     string;
    updated_at:     string;
    // Joined from ai_analytics — available when fetched via getImprovementItems
    source_query?:  string | null;
}

export interface CreateImprovementItemInput {
    analytics_id?: string | null;
    evaluation_id?: string | null;
    source_kind?: ImprovementSourceKind;
    intervention_signal_id?: string | null;
    intervention_recommendation_id?: string | null;
    lane:          ImprovementLane;
    title:         string;
    summary?:      string | null;
    severity:      'low' | 'medium' | 'high' | 'critical';
}

// ─── Lane auto-derivation from evaluation primary_tag ───────────────────────

const LANE_FROM_TAG: Record<string, ImprovementLane> = {
    intent_miss:              'rule',
    hallucination:            'knowledge',
    bad_recommendation_fit:   'rule',
    compatibility_gap:        'compatibility',
    knowledge_gap:            'knowledge',
    false_certainty:          'knowledge',
    missing_followup:         'rule',
    tone_or_clarity_issue:    'other',
    correct_response:         'other',
};

export function laneFromPrimaryTag(tag: string): ImprovementLane {
    return LANE_FROM_TAG[tag] ?? 'other';
}

function laneFromInterventionType(type: InterventionRecommendation['intervention_type']): ImprovementLane {
    if (type === 'enrichment') return 'knowledge';
    if (type === 'compatibility') return 'compatibility';
    if (type === 'escalation_playbook') return 'rule';
    return 'other';
}

function severityFromRecommendation(
    recommendation: InterventionRecommendation,
    signal: InterventionSignal,
): ImprovementItem['severity'] {
    if (signal.confidence === 'high' || recommendation.diagnosis.estimated_impact === 'high') return 'high';
    if (signal.confidence === 'low' && recommendation.diagnosis.estimated_impact === 'low') return 'low';
    return 'medium';
}

function titleFromRecommendation(recommendation: InterventionRecommendation): string {
    const source = recommendation.intervention_type === 'enrichment'
        ? 'Enriquecimiento'
        : recommendation.intervention_type === 'compatibility'
            ? 'Compatibilidad'
            : 'Playbook';

    return `${source}: ${recommendation.diagnosis.root_cause.slice(0, 90)}`;
}

// ─── Service functions ──────────────────────────────────────────────────────

/**
 * Creates a new improvement item linked to a reviewed interaction.
 * Status defaults to 'open'; owner is unassigned until claimed.
 *
 * Returns null (no throw) if an item already exists for this analytics_id
 * (unique constraint violation — code 23505). All other errors throw.
 */
export async function createImprovementItem(
    input: CreateImprovementItemInput
): Promise<ImprovementItem | null> {
    const { data, error } = await supabase
        .from('cesarin_improvement_items')
        .insert({
            analytics_id:  input.analytics_id,
            evaluation_id: input.evaluation_id ?? null,
            source_kind: input.source_kind ?? 'review_interaction',
            intervention_signal_id: input.intervention_signal_id ?? null,
            intervention_recommendation_id: input.intervention_recommendation_id ?? null,
            lane:          input.lane,
            title:         input.title,
            summary:       input.summary ?? null,
            severity:      input.severity,
            status:        'open',
        })
        .select()
        .single();

    if (error) {
        // 23505 = unique_violation — item already exists for this interaction
        if (error.code === '23505') return null;
        throw error;
    }
    return data as ImprovementItem;
}

export async function createImprovementItemFromRecommendation(input: {
    recommendation: InterventionRecommendation;
    signal: InterventionSignal;
}): Promise<ImprovementItem | null> {
    const existingMap = await getImprovementItemsByRecommendationIds([input.recommendation.id]);
    const existing = existingMap[input.recommendation.id];
    if (existing) return existing;

    return createImprovementItem({
        analytics_id: null,
        evaluation_id: null,
        source_kind: 'intervention_recommendation',
        intervention_signal_id: input.signal.id,
        intervention_recommendation_id: input.recommendation.id,
        lane: laneFromInterventionType(input.recommendation.intervention_type),
        title: titleFromRecommendation(input.recommendation),
        summary: [
            input.recommendation.diagnosis.reasoning,
            input.recommendation.diagnosis.implementation_notes,
        ].filter(Boolean).join('\n\n') || null,
        severity: severityFromRecommendation(input.recommendation, input.signal),
    });
}

/**
 * Fetches improvement items, optionally filtered by status and/or lane.
 * Joins ai_analytics.query for source context display.
 */
export async function getImprovementItems(filters?: {
    status?: ImprovementStatus;
    lane?:   ImprovementLane;
    limit?:  number;
}): Promise<ImprovementItem[]> {
    let q = supabase
        .from('cesarin_improvement_items')
        .select('*, ai_analytics(query)')
        .order('created_at', { ascending: false })
        .limit(filters?.limit ?? 100);

    if (filters?.status) q = q.eq('status', filters.status);
    if (filters?.lane)   q = q.eq('lane',   filters.lane);

    const { data, error } = await q;
    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        source_query:  (row.ai_analytics as Record<string, unknown>)?.query ?? null,
        ai_analytics:  undefined,
    })) as unknown as ImprovementItem[];
}

/**
 * Fetches improvement items for a specific set of analytics IDs.
 * Returns the most recent row per analytics_id for O(1) workflow lookup.
 */
export async function getImprovementItemsByAnalyticsIds(
    analyticsIds: string[]
): Promise<Record<string, ImprovementItem>> {
    if (analyticsIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_improvement_items')
        .select('*, ai_analytics(query)')
        .in('analytics_id', analyticsIds)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const map: Record<string, ImprovementItem> = {};
    for (const row of data ?? []) {
        const item = {
            ...row,
            source_query: row.ai_analytics?.query ?? null,
            ai_analytics: undefined,
        } as ImprovementItem;

        if (item.analytics_id && !map[item.analytics_id]) {
            map[item.analytics_id] = item;
        }
    }

    return map;
}

export async function getImprovementItemsByRecommendationIds(
    recommendationIds: string[]
): Promise<Record<string, ImprovementItem>> {
    if (recommendationIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_improvement_items')
        .select('*, ai_analytics(query)')
        .in('intervention_recommendation_id', recommendationIds)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const map: Record<string, ImprovementItem> = {};
    for (const row of data ?? []) {
        const item = {
            ...row,
            source_query: row.ai_analytics?.query ?? null,
            ai_analytics: undefined,
        } as ImprovementItem;

        if (item.intervention_recommendation_id && !map[item.intervention_recommendation_id]) {
            map[item.intervention_recommendation_id] = item;
        }
    }

    return map;
}

/**
 * Updates mutable fields on an improvement item.
 * Immutable: analytics_id, evaluation_id, created_at.
 */
export async function updateImprovementItem(
    id: string,
    updates: Partial<Pick<
        ImprovementItem,
        'status' | 'lane' | 'title' | 'summary' | 'owner_id' | 'execution_note' | 'artifact_ref'
    >>
): Promise<void> {
    const { error } = await supabase
        .from('cesarin_improvement_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}
