/**
 * // ─── ADMIN IMPROVEMENT SERVICE ─── [Evaluation → Queue Bridge]
 * // Purpose: CRUD for governed improvement items sourced from reviewed interactions.
 * // Scope: Operator-explicit creation and tracking only. No autonomous execution.
 */
import { supabase } from '@/lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ImprovementLane   = 'rule' | 'knowledge' | 'compatibility' | 'commerce' | 'other';
export type ImprovementStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';

export interface ImprovementItem {
    id:             string;
    analytics_id:   string;
    evaluation_id:  string | null;
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
    analytics_id:  string;
    evaluation_id?: string | null;
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

    return (data ?? []).map((row: any) => ({
        ...row,
        source_query:  row.ai_analytics?.query ?? null,
        ai_analytics:  undefined,
    })) as ImprovementItem[];
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

        if (!map[item.analytics_id]) {
            map[item.analytics_id] = item;
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
