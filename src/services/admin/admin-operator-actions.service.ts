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
 * Diagnostic probe: attempts a real insert + select to both traceability tables.
 * Call this from AdminCesarinOS on mount to validate the write path end-to-end.
 * Results are logged to the browser console with [cesarin-trace] prefix.
 *
 * Distinguishes between:
 *  - Table does not exist (migration not applied) → code 42P01
 *  - RLS blocks the write → code 42501
 *  - Auth session missing → null uid or 401
 *  - Write succeeded → row id returned
 */
export async function probeCesarinTrace(): Promise<void> {
    console.group('[cesarin-trace] Write-path diagnostic');

    // ── operator_actions probe ───────────────────────────────────────────────
    try {
        const { data, error } = await supabase
            .from('cesarin_operator_actions')
            .insert({ action: '_probe', module: 'cesarin_os_diagnostic', outcome: 'probe' })
            .select('id')
            .single();
        if (error) {
            console.error('operator_actions INSERT:', error.code, '—', error.message);
        } else {
            // Probe row intentionally kept — it proves the write path works
            // and appears in the shared activity log as evidence.
            console.info('operator_actions INSERT: OK — id', data?.id);
        }
    } catch (e) {
        console.error('operator_actions INSERT exception:', e);
    }

    // ── signal_states probe (uses a synthetic non-UUID analytics_id to avoid FK issues) ──
    const probeId = '00000000-0000-0000-0000-000000000001';
    try {
        const { data, error } = await supabase
            .from('cesarin_signal_states')
            .upsert({ analytics_id: probeId, status: 'revisada', handled_by: '_probe' }, { onConflict: 'analytics_id' })
            .select('analytics_id')
            .single();
        if (error) {
            console.error('signal_states UPSERT:', error.code, '—', error.message);
        } else {
            // Probe row intentionally kept — proves the write path works.
            console.info('signal_states UPSERT: OK — analytics_id', data?.analytics_id);
        }
    } catch (e) {
        console.error('signal_states UPSERT exception:', e);
    }

    console.groupEnd();
}

/**
 * Fetches the most recent operator actions for the activity log panel.
 * Ordered by ts desc. Default limit: 50.
 */
export async function getOperatorActions(limit = 50): Promise<OperatorActionRow[]> {
    const { data, error } = await supabase
        .from('cesarin_operator_actions')
        .select('id, actor, action, module, target_ref, detail, outcome, ts')
        // Exclude internal diagnostic probes (action starts with '_')
        .not('action', 'like', '_%')
        .order('ts', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data ?? []) as OperatorActionRow[];
}
