/**
 * useCesarinSignalStates — Hybrid signal state persistence
 *
 * Hydrates from DB on mount (shared across operators).
 * On markSignal: updates localStorage immediately (optimistic), fires DB upsert async.
 * DB is authoritative when available; localStorage is the offline/fallback layer.
 */
import { useState, useCallback, useEffect } from 'react';
import { upsertSignalState, getAllSignalStates } from '@/services/admin/admin-signal-states.service';

export interface SignalState {
    status:     'revisada' | 'convertida_regla' | 'convertida_mejora' | 'descartada' | 'resuelta';
    handled_at: string;
    handled_by?: string | null;
    ref_label?:  string;
}

const STORAGE_KEY = 'cesarin_signal_states_v1';

function loadLocal(): Record<string, SignalState> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Record<string, SignalState>) : {};
    } catch {
        return {};
    }
}

function persistLocal(states: Record<string, SignalState>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch {
        // storage unavailable — degrade gracefully
    }
}

export function useCesarinSignalStates() {
    const [signalStates, setSignalStates] = useState<Record<string, SignalState>>(loadLocal);
    const [dbSynced, setDbSynced] = useState(false);

    // Hydrate from DB on mount — DB is authoritative for any IDs it holds
    useEffect(() => {
        getAllSignalStates()
            .then(dbStates => {
                if (Object.keys(dbStates).length === 0) {
                    setDbSynced(true);
                    return;
                }
                setSignalStates(prev => {
                    const merged: Record<string, SignalState> = { ...prev };
                    for (const [id, row] of Object.entries(dbStates)) {
                        merged[id] = {
                            status:     row.status,
                            handled_at: row.handled_at,
                            handled_by: row.handled_by,
                            ref_label:  row.ref_label ?? undefined,
                        };
                    }
                    persistLocal(merged);
                    return merged;
                });
                setDbSynced(true);
            })
            .catch(() => {
                // DB unavailable — keep local state, mark as synced so UI doesn't wait
                setDbSynced(true);
            });
    }, []);

    /**
     * Marks a signal with a new state.
     * - Updates localStorage immediately (optimistic, no visual delay)
     * - Fires DB upsert async (fire-and-forget with silent error handling)
     *
     * @param id     analytics_id of the signal
     * @param state  new state to apply
     * @param actor  operator email for attribution (best-effort)
     */
    const markSignal = useCallback((id: string, state: SignalState, actor?: string | null) => {
        const enriched: SignalState = { ...state, handled_by: actor ?? null };

        // Optimistic local update — immediate UI feedback
        setSignalStates(prev => {
            const next = { ...prev, [id]: enriched };
            persistLocal(next);
            return next;
        });

        // Async DB sync — shared persistence
        upsertSignalState(id, state.status, {
            handled_by: actor ?? null,
            ref_label:  state.ref_label ?? null,
        }).catch(() => {
            // silently degrade — local state is already updated
        });
    }, []);

    return { signalStates, markSignal, dbSynced };
}
