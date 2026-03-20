/**
 * // ─── HOOK: useAdminPilotOps ─── [Wave 187 — Pilot Operations Intelligence]
 * // Propósito: TanStack Query hooks for Piloto Operativo telemetry cockpit.
 * // Arquitectura: Hook Layer — DB → Service → Hook → Component.
 */
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
    getPilotKPIs,
    getPilotQueryLog,
    filterByBucket,
    type PilotBucket,
    type PilotKPIs as PilotKPIsType,
    type PilotQueryRow,
} from '@/services/admin/admin-pilot-ops.service';

export type TimeRange = '24h' | '7d' | '30d';

function getDateRange(range: TimeRange): { from: string; to: string } {
    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date();
    switch (range) {
        case '24h':
            from.setHours(from.getHours() - 24);
            break;
        case '7d':
            from.setDate(from.getDate() - 7);
            from.setHours(0, 0, 0, 0);
            break;
        case '30d':
            from.setDate(from.getDate() - 30);
            from.setHours(0, 0, 0, 0);
            break;
    }

    return { from: from.toISOString(), to: to.toISOString() };
}

export function usePilotOps() {
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [activeBucket, setActiveBucket] = useState<PilotBucket>('all');
    const [includeSimulation, setIncludeSimulation] = useState(false);

    const { from, to } = useMemo(() => getDateRange(timeRange), [timeRange]);

    const kpis = useQuery<PilotKPIsType>({
        queryKey: ['admin', 'pilot-ops', 'kpis', from, to, includeSimulation],
        queryFn: () => getPilotKPIs(from, to, includeSimulation),
        staleTime: 60_000,
    });

    const queryLog = useQuery<PilotQueryRow[]>({
        queryKey: ['admin', 'pilot-ops', 'query-log', from, to, includeSimulation],
        queryFn: () => getPilotQueryLog(from, to, 100, includeSimulation),
        staleTime: 60_000,
    });

    const filteredLog = useMemo(() => {
        if (!queryLog.data) return [];
        return filterByBucket(queryLog.data, activeBucket);
    }, [queryLog.data, activeBucket]);

    return {
        // Time range
        timeRange,
        setTimeRange,

        // KPIs
        kpis: kpis.data,
        isLoadingKPIs: kpis.isLoading,
        kpiError: kpis.error,

        // Query log
        queryLog: filteredLog,
        totalLogRows: queryLog.data?.length ?? 0,
        filteredLogRows: filteredLog.length,
        isLoadingLog: queryLog.isLoading,
        logError: queryLog.error,

        // Bucket filter
        activeBucket,
        setActiveBucket,

        // Simulation Isolation (Wave 190 Hygiene)
        includeSimulation,
        setIncludeSimulation,

        // Refresh
        refresh: () => {
            void kpis.refetch();
            void queryLog.refetch();
        },
    };
}
