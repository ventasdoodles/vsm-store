/**
 * Admin Case Drafts Service — B2 Pass 1
 * Manages operator_case_drafts: reusable private test case drafts
 * sourced from ReviewDrawer interactions or TabQuality simulation failures.
 */
import { supabase } from '@/lib/supabase';
import { PrivateCaseDraft, CaseDraftReadinessStatus } from '@/types/cesarin';

export type CreateCaseDraftInput = Omit<PrivateCaseDraft, 'id' | 'created_at' | 'updated_at'>;

/**
 * Derives readiness status from draft content.
 * A draft with expected_outcome and evaluation info is 'ready'.
 * A draft missing expected_outcome is 'needs_expected_outcome'.
 * A bare draft with only input is 'draft'.
 */
export function deriveCaseDraftReadiness(
    expectedOutcome: string | null,
    failureReason: string | null
): CaseDraftReadinessStatus {
    if (expectedOutcome?.trim()) return 'ready';
    if (failureReason?.trim()) return 'needs_expected_outcome';
    return 'draft';
}

/**
 * Creates a new private case draft.
 */
export async function createCaseDraft(
    input: CreateCaseDraftInput
): Promise<PrivateCaseDraft> {
    const { data, error } = await supabase
        .from('operator_case_drafts')
        .insert({
            source_type:           input.source_type,
            source_ref_id:         input.source_ref_id,
            source_session_id:     input.source_session_id ?? null,
            source_interaction_id: input.source_interaction_id ?? null,
            input:                 input.input,
            observed_response:     input.observed_response ?? null,
            evaluation_summary:    input.evaluation_summary ?? null,
            expected_outcome:      input.expected_outcome ?? null,
            route_or_capsule:      input.route_or_capsule ?? null,
            detected_intent:       input.detected_intent ?? null,
            evaluation_score:      input.evaluation_score ?? null,
            failure_reason:        input.failure_reason ?? null,
            readiness_status:      input.readiness_status,
        })
        .select()
        .single();

    if (error) throw error;
    return data as PrivateCaseDraft;
}

/**
 * Fetches all case drafts, ordered by most recent first.
 */
export async function getCaseDrafts(): Promise<PrivateCaseDraft[]> {
    const { data, error } = await supabase
        .from('operator_case_drafts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as PrivateCaseDraft[];
}

/**
 * Fetches drafts for a specific source type + source reference IDs.
 * Returns rows ordered newest-first so callers can keep the first match per ref.
 */
export async function getCaseDraftsBySourceRefs(
    sourceType: PrivateCaseDraft['source_type'],
    sourceRefIds: string[]
): Promise<PrivateCaseDraft[]> {
    if (sourceRefIds.length === 0) return [];

    const { data, error } = await supabase
        .from('operator_case_drafts')
        .select('*')
        .eq('source_type', sourceType)
        .in('source_ref_id', sourceRefIds)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as PrivateCaseDraft[];
}

/**
 * Fetches drafts linked to reviewed interactions.
 * Returns rows ordered newest-first so callers can keep the first match per interaction.
 */
export async function getCaseDraftsByInteractionIds(
    interactionIds: string[]
): Promise<PrivateCaseDraft[]> {
    if (interactionIds.length === 0) return [];

    const { data, error } = await supabase
        .from('operator_case_drafts')
        .select('*')
        .in('source_interaction_id', interactionIds)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as PrivateCaseDraft[];
}

/**
 * Updates a case draft (expected_outcome, readiness_status, etc.).
 */
export async function updateCaseDraft(
    id: string,
    updates: Partial<Pick<PrivateCaseDraft, 'expected_outcome' | 'readiness_status' | 'evaluation_summary' | 'failure_reason'>>
): Promise<void> {
    const { error } = await supabase
        .from('operator_case_drafts')
        .update(updates)
        .eq('id', id);

    if (error) throw error;
}

/**
 * Deletes a case draft.
 */
export async function deleteCaseDraft(id: string): Promise<void> {
    const { error } = await supabase
        .from('operator_case_drafts')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
