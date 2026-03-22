/**
 * useCesarinActivityLog — Hybrid activity log persistence
 *
 * Hydrates from DB on mount (shared across operators).
 * On logAction: updates localStorage immediately (optimistic), fires DB insert async.
 * DB is authoritative when available; localStorage is the offline/fallback layer.
 */
import { useState, useCallback, useEffect } from 'react';
import {
    insertOperatorAction,
    getOperatorActions,
} from '@/services/admin/admin-operator-actions.service';

export interface ActivityEntry {
    id:          string;
    ts:          string;
    label:       string;
    detail?:     string;
    actor?:      string | null;
    module?:     string;
    target_ref?: string | null;
}

const STORAGE_KEY = 'cesarin_activity_log_v1';
const MAX_ENTRIES = 50;

function loadLocal(): ActivityEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
    } catch {
        return [];
    }
}

function persistLocal(entries: ActivityEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        // storage unavailable — degrade gracefully
    }
}

export function useCesarinActivityLog() {
    const [activityLog, setActivityLog] = useState<ActivityEntry[]>(loadLocal);

    // Hydrate from DB on mount — shared history across operators
    useEffect(() => {
        getOperatorActions(MAX_ENTRIES)
            .then(rows => {
                console.info(`[cesarin:activity-log] Hydrated ${rows.length} shared rows from DB`);
                if (rows.length === 0) return;
                const dbEntries: ActivityEntry[] = rows.map(r => ({
                    id:         r.id,
                    ts:         r.ts,
                    label:      r.action,
                    detail:     r.detail   ?? undefined,
                    actor:      r.actor,
                    module:     r.module,
                    target_ref: r.target_ref,
                }));
                // DB is authoritative — replace local log with shared history
                setActivityLog(dbEntries);
                persistLocal(dbEntries);
            })
            .catch((err) => {
                console.error('[cesarin:activity-log] DB hydration failed:', err);
                // Keep localStorage entries as fallback
            });
    }, []);

    /**
     * Logs an operator action.
     * - Updates local state immediately (optimistic, no visual delay)
     * - Fires DB insert async (fire-and-forget with silent error handling)
     *
     * @param label   Human-readable action label
     * @param detail  Optional detail string (rule content snippet, etc.)
     * @param opts    Optional actor, module, target_ref, outcome metadata
     */
    const logAction = useCallback((
        label:   string,
        detail?: string,
        opts?:   {
            actor?:      string | null;
            module?:     string;
            target_ref?: string | null;
            outcome?:    string | null;
        }
    ) => {
        const entry: ActivityEntry = {
            id:         `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ts:         new Date().toISOString(),
            label,
            detail,
            actor:      opts?.actor      ?? null,
            module:     opts?.module     ?? 'cesarin_os',
            target_ref: opts?.target_ref ?? null,
        };

        // Optimistic local update — immediate UI feedback
        setActivityLog(prev => {
            const next = [entry, ...prev].slice(0, MAX_ENTRIES);
            persistLocal(next);
            return next;
        });

        // Async DB sync — shared persistence (fire-and-forget)
        insertOperatorAction({
            action:     label,
            detail,
            actor:      opts?.actor      ?? null,
            module:     opts?.module     ?? 'cesarin_os',
            target_ref: opts?.target_ref ?? null,
            outcome:    opts?.outcome    ?? null,
        }).catch((err) => {
            // Log to console so write failures are visible during validation
            console.error('[cesarin:activity-log] DB write failed:', err);
        });
    }, []);

    const clearLog = useCallback(() => {
        setActivityLog([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
        // Note: DB rows are preserved (append-only audit trail)
    }, []);

    return { activityLog, logAction, clearLog };
}
