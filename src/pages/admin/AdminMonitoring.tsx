// Página de Monitoreo - VSM Admin
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    Activity,
    Clock,
    ExternalLink,
    Search,
    Filter,
    Terminal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MONITORING_CHANNEL } from '@/services/monitoring.service';
import { cn, formatTimeAgo } from '@/lib/utils';

interface ActiveUser {
    id: string;
    email: string;
    path: string;
    joined_at: string;
    session_start: number;
    last_active: number;
}

export function AdminMonitoring() {
    const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([]);
    const [logFilter, setLogFilter] = useState<string>('all');

    // 1. Suscribirse a Presence
    useEffect(() => {
        const channel = supabase.channel(MONITORING_CHANNEL);

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users: ActiveUser[] = [];

                Object.entries(state).forEach(([key, value]) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const presence = value[0] as any;
                    users.push({
                        id: key,
                        ...presence
                    });
                });
                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                // eslint-disable-next-line
                console.log('Joined:', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                // eslint-disable-next-line
                console.log('Left:', key, leftPresences);
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    // 2. Query de Logs Históricos
    const { data: logs = [], isLoading: loadingLogs } = useQuery({
        queryKey: ['admin', 'logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('app_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data;
        },
        refetchInterval: 5000 // Refrescar logs cada 5 segundos
    });

    const filteredLogs = logs.filter(l => logFilter === 'all' || l.level === logFilter);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Sistema de Monitoreo</h1>
                <p className="text-sm text-theme-primary0">Visibilidad en tiempo real de usuarios y errores del sistema.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Usuarios Online */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                            <Users className="h-5 w-5 text-vape-400" />
                            Usuarios Activos ({onlineUsers.length})
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-theme/30 bg-theme-primary/40 backdrop-blur-xl">
                        <table className="w-full text-left">
                            <thead className="border-b border-theme/30 bg-theme-primary/20 text-[11px] font-bold uppercase tracking-wider text-theme-primary0">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Usuario</th>
                                    <th className="px-6 py-4 font-semibold">Página Actual</th>
                                    <th className="px-6 py-4 font-semibold">Tiempo</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-800/20 text-sm">
                                {onlineUsers.map((u) => {
                                    // eslint-disable-next-line react-hooks/purity
                                    const sessionTime = Math.floor((Date.now() - u.session_start) / 1000 / 60);
                                    return (
                                        <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-theme-primary">{u.email}</span>
                                                    <span className="text-[10px] text-primary-600 font-mono">{u.id.substring(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-theme-primary/50 px-2.5 py-1 text-xs text-vape-400 border border-vape-500/10">
                                                    <Activity className="h-3 w-3" />
                                                    {u.path}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-theme-secondary">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {sessionTime} min
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-primary-600 hover:text-vape-400 transition-colors">
                                                    <ExternalLink className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {onlineUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-primary-600 italic">
                                            No hay usuarios activos en este momento
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resumen Log Rápido */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                        <Terminal className="h-5 w-5 text-vape-400" />
                        Log del Sistema
                    </h2>

                    <div className="flex gap-2">
                        {['all', 'error', 'warn'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setLogFilter(f)}
                                className={cn(
                                    "flex-1 rounded-xl border py-2 text-[10px] font-bold uppercase transition-all",
                                    logFilter === f
                                        ? "border-vape-500/50 bg-vape-500/10 text-vape-400"
                                        : "border-theme/30 bg-theme-primary/30 text-primary-600 hover:text-theme-secondary"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className={cn(
                                    "rounded-xl border p-3 text-xs space-y-2 backdrop-blur-sm",
                                    log.level === 'error' ? "border-red-500/20 bg-red-500/5 text-red-200" :
                                        log.level === 'warn' ? "border-amber-500/20 bg-amber-500/5 text-amber-200" :
                                            "border-theme/30 bg-theme-primary/30 text-theme-secondary"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold uppercase tracking-widest text-[9px] opacity-70">
                                        {log.category}
                                    </span>
                                    <span className="opacity-50 font-mono text-[9px]">
                                        {formatTimeAgo(log.created_at)}
                                    </span>
                                </div>
                                <p className="leading-relaxed break-words font-medium">{log.message}</p>
                                {log.url && (
                                    <div className="flex items-center gap-1 text-[9px] opacity-40 italic">
                                        <Filter className="h-2 w-2" />
                                        {new URL(log.url, 'https://vsm.store').pathname}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loadingLogs && (
                            <div className="flex justify-center py-10 opacity-50">
                                <Search className="h-5 w-5 animate-pulse" />
                            </div>
                        )}
                        {!loadingLogs && filteredLogs.length === 0 && (
                            <div className="text-center py-10 text-primary-700 italic text-sm">
                                No hay logs registrados
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
