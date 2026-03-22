/**
 * // ─── ADMIN OPERATOR ACTIONS SERVICE ─── [Shared Activity Traceability]
 * // Purpose: Append-only shared log of operator actions taken in Cesarin OS.
 * // Scope: Insert + read. No update, no delete. Shared across operator sessions.
 */
import { supabase } from '@/lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OperatorActionRow {
    id:         string;
    actor:      string | null;
    action:     string;
    module:     string;
    target_ref: string | null;
    detail:     string | null;
    outcome:    string | null;
    ts:         string;
}

export interface InsertOperatorActionInput {
    action:      string;
    actor?:      string | null;
    module?:     string;
    target_ref?: string | null;
    detail?:     string | null;
    outcome?:    string | null;
}

// ─── Service functions ──────────────────────────────────────────────────────

/**
 * Appends a new operator action to the shared log.
 * Fire-and-forget safe: does not throw if insert fails silently in callers.
 */
export async function insertOperatorAction(
    input: InsertOperatorActionInput
): Promise<void> {
    const { error } = await supabase
        .from('cesarin_operator_actions')
        .insert({
            actor:      input.actor      ?? null,
            action:     input.action,
            module:     input.module     ?? 'cesarin_os',
            target_ref: input.target_ref ?? null,
            detail:     input.detail     ?? null,
            outcome:    input.outcome    ?? null,
        });

    if (error) throw error;
}

/**
 * Fetches the most recent operator actions for the activity log panel.
 * Ordered by ts desc. Default limit: 50.
 */
export async function getOperatorActions(limit = 50): Promise<OperatorActionRow[]> {
    const { data, error } = await supabase
        .from('cesarin_operator_actions')
        .select('id, actor, action, module, target_ref, detail, outcome, ts')
        .order('ts', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data ?? []) as OperatorActionRow[];
}
