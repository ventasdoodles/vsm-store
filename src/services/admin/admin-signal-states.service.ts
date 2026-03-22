/**
 * // ─── ADMIN SIGNAL STATES SERVICE ─── [Shared Signal Traceability]
 * // Purpose: Shared backend persistence for operator signal handling decisions.
 * // Scope: Read/upsert only. No delete. Replaces localStorage-only signal state.
 */
import { supabase } from '@/lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SignalStatusDB =
    | 'revisada'
    | 'descartada'
    | 'convertida_regla'
    | 'convertida_mejora'
    | 'resuelta';

export interface SignalStateRow {
    analytics_id: string;
    status:       SignalStatusDB;
    handled_by:   string | null;
    handled_at:   string;
    ref_label:    string | null;
}

// ─── Service functions ──────────────────────────────────────────────────────

/**
 * Upserts the handling state for a signal (keyed by analytics_id).
 * If a row already exists for this analytics_id, it is updated.
 */
export async function upsertSignalState(
    analytics_id: string,
    status:        SignalStatusDB,
    opts?: {
        handled_by?: string | null;
        ref_label?:  string | null;
    }
): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
        .from('cesarin_signal_states')
        .upsert(
            {
                analytics_id,
                status,
                handled_by: opts?.handled_by ?? null,
                ref_label:  opts?.ref_label  ?? null,
                handled_at: now,
                updated_at: now,
            },
            { onConflict: 'analytics_id' }
        );

    if (error) throw error;
}

/**
 * Fetches all signal states. Used to hydrate the hook on mount.
 * Returns a map keyed by analytics_id for O(1) lookup.
 */
export async function getAllSignalStates(): Promise<Record<string, SignalStateRow>> {
    const { data, error } = await supabase
        .from('cesarin_signal_states')
        .select('analytics_id, status, handled_by, handled_at, ref_label')
        .order('handled_at', { ascending: false })
        .limit(500);

    if (error) throw error;

    const map: Record<string, SignalStateRow> = {};
    for (const row of data ?? []) {
        map[row.analytics_id] = row as SignalStateRow;
    }
    return map;
}

/**
 * Fetches signal states for a specific set of analytics IDs.
 * More targeted than getAllSignalStates when the caller knows which IDs to load.
 */
export async function getSignalStatesByIds(
    analyticsIds: string[]
): Promise<Record<string, SignalStateRow>> {
    if (analyticsIds.length === 0) return {};

    const { data, error } = await supabase
        .from('cesarin_signal_states')
        .select('analytics_id, status, handled_by, handled_at, ref_label')
        .in('analytics_id', analyticsIds);

    if (error) throw error;

    const map: Record<string, SignalStateRow> = {};
    for (const row of data ?? []) {
        map[row.analytics_id] = row as SignalStateRow;
    }
    return map;
}
