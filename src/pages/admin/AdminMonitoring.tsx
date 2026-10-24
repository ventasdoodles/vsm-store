import { Heading } from "@/components/ui/Heading";
/**
 * // ─── COMPONENTE: AdminMonitoring ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar la suscripcion Presence (usuarios en vivo)
 *    y la query de logs historicos a traves del service layer (§1.1).
 *    Delega TODO el renderizado visual a los Legos en components/admin/monitoring/.
 * // Regla / Notas: Cero UI propio excepto el layout grid. Desacoplado de Supabase.
 *    Logs via react-query con refetch cada 5s. Sin `any`, sin cadenas magicas.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppLogs, subscribeToMonitoringPresence } from '@/services';

// Legos
import { MonitoringHeader } from '@/components/admin/monitoring/MonitoringHeader';
import { MonitoringStatsGrid } from '@/components/admin/monitoring/MonitoringStatsGrid';
import { LiveUsersPanel, type ActiveUser } from '@/components/admin/monitoring/LiveUsersPanel';
import { SystemLogsPanel, type AppLogEntry } from '@/components/admin/monitoring/SystemLogsPanel';
import { HealthPulse } from '@/components/admin/monitoring/HealthPulse';
import { InventoryAlertsPanel } from '@/components/admin/monitoring/InventoryAlertsPanel';

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

    // ─── Presence subscription via Service Layer (§1.1) ───
    useEffect(() => {
        const unsubscribe = subscribeToMonitoringPresence(
            (users) => {
                setOnlineUsers(users);
            },
            (error) => {
                console.error('[AdminMonitoring] Presence subscription error:', error);
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    // ─── Query: System Logs ───
    const { data: logs = [], isLoading: loadingLogs } = useQuery<AppLogEntry[]>({
        queryKey: QUERY_KEYS.logs,
        queryFn: () => getAppLogs(LOGS_LIMIT) as Promise<AppLogEntry[]>,
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
                            <Heading as="h2" className="text-lg font-black text-white tracking-tight">
                                Pulso del Sistema
                            </Heading>
                        </div>
                        <HealthPulse
                            isHealthy={isSystemHealthy}
                            lastCheckTime={lastCheckTime}
                            uptimeMinutes={uptimeMinutes}
                        />
                    </div>
                    
                    <InventoryAlertsPanel />
                </div>
            </div>

            {/* System Logs (Full Width) */}
            <SystemLogsPanel logs={logs} isLoading={loadingLogs} />
        </div>
    );
}
