/**
 * // ─── COMPONENTE: AdminMonitoring ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar la suscripcion Presence de Supabase (usuarios en vivo)
 *    y la query de logs historicos. Delega TODO el renderizado visual a los Legos en
 *    components/admin/monitoring/.
 * // Regla / Notas: Cero UI propio excepto el layout grid. Actualiza presence via Realtime channel
 *    y logs via react-query con refetch cada 5s. Sin `any`, sin cadenas magicas.
 */
import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MONITORING_CHANNEL } from '@/services/monitoring.service';

// Legos
import { MonitoringHeader } from '@/components/admin/monitoring/MonitoringHeader';
import { MonitoringStatsGrid } from '@/components/admin/monitoring/MonitoringStatsGrid';
import { LiveUsersPanel, type ActiveUser } from '@/components/admin/monitoring/LiveUsersPanel';
import { SystemLogsPanel, type AppLogEntry } from '@/components/admin/monitoring/SystemLogsPanel';
import { HealthPulse } from '@/components/admin/monitoring/HealthPulse';

/** Query keys centralizadas */
const QUERY_KEYS = {
    logs: ['admin', 'monitoring-logs'],
} as const;

/** Intervalo de refresco de logs en ms */
const LOGS_REFETCH_INTERVAL = 5_000;
const LOGS_LIMIT = 50;

export function AdminMonitoring() {
    // ─── State: Presence (Realtime) ───
    const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([]);

    // ─── Presence subscription ───
    const handlePresenceSync = useCallback((channel: ReturnType<typeof supabase.channel>) => {
        const state = channel.presenceState();
        const users: ActiveUser[] = [];

        Object.entries(state).forEach(([key, value]) => {
            const presence = value[0] as Record<string, unknown>;
            users.push({
                id: key,
                email: (presence.email as string) ?? 'Desconocido',
                path: (presence.path as string) ?? '/',
                joined_at: (presence.joined_at as string) ?? new Date().toISOString(),
                session_start: (presence.session_start as number) ?? Date.now(),
                last_active: (presence.last_active as number) ?? Date.now(),
            });
        });

        setOnlineUsers(users);
    }, []);

    useEffect(() => {
        const channel = supabase.channel(MONITORING_CHANNEL);

        channel
            .on('presence', { event: 'sync' }, () => handlePresenceSync(channel))
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [handlePresenceSync]);

    // ─── Query: System Logs ───
    const { data: logs = [], isLoading: loadingLogs } = useQuery<AppLogEntry[]>({
        queryKey: QUERY_KEYS.logs,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('app_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(LOGS_LIMIT);
            if (error) throw error;
            return (data ?? []) as AppLogEntry[];
        },
        refetchInterval: LOGS_REFETCH_INTERVAL,
    });

    // ─── Derived State ───
    const errorCount = logs.filter((l) => l.level === 'error').length;
    const warnCount = logs.filter((l) => l.level === 'warn').length;
    const infoCount = logs.filter((l) => l.level === 'info').length;
    const isSystemHealthy = errorCount === 0;

    // Session uptime (since admin opened monitoring)
    const [sessionStart] = useState(() => Date.now());
    const uptimeMinutes = Math.floor((Date.now() - sessionStart) / 1000 / 60);

    const lastCheckTime = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className="space-y-8">
            {/* Header Premium */}
            <MonitoringHeader
                onlineCount={onlineUsers.length}
                errorCount={errorCount}
                warnCount={warnCount}
            />

            {/* KPI Stats Grid */}
            <MonitoringStatsGrid
                onlineUsers={onlineUsers.length}
                totalErrors={errorCount}
                totalWarnings={warnCount}
                totalInfoLogs={infoCount}
            />

            {/* Main Content: 2-Column Layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left: Live Users (2 cols) */}
                <div className="lg:col-span-2">
                    <LiveUsersPanel users={onlineUsers} />
                </div>

                {/* Right: Heartbeat */}
                <div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-5 w-1.5 rounded-full bg-accent-primary" />
                            <h2 className="text-lg font-black text-white tracking-tight">
                                Pulso del Sistema
                            </h2>
                        </div>
                        <HealthPulse
                            isHealthy={isSystemHealthy}
                            lastCheckTime={lastCheckTime}
                            uptimeMinutes={uptimeMinutes}
                        />
                    </div>
                </div>
            </div>

            {/* System Logs (Full Width) */}
            <SystemLogsPanel logs={logs} isLoading={loadingLogs} />
        </div>
    );
}
