/**
 * // ─── COMPONENTE: SystemLogsPanel ───
 * // Arquitectura: Dumb Component (Visual Feed)
 * // Proposito principal: Feed de logs del sistema con filtros por nivel y colores semanticos.
 * // Regla / Notas: Glassmorphism. Cada log es una tarjeta con borde de color segun nivel.
 *                    Filtros en pill-buttons. Recibe array `logs` y `isLoading` del Orchestrator.
 */
import { useState } from 'react';
import { Terminal, AlertOctagon, AlertTriangle, Info, Search, Clock } from 'lucide-react';
import type { LogLevel } from '@/services/monitoring.service';
import { formatTimeAgo } from '@/lib/utils';

export interface AppLogEntry {
    id: string;
    level: LogLevel;
    category: string;
    message: string;
    details?: Record<string, unknown>;
    url?: string;
    user_agent?: string;
    created_at: string;
}

interface SystemLogsPanelProps {
    logs: AppLogEntry[];
    isLoading: boolean;
}

/** Constantes de filtro para eliminar cadenas magicas */
const LOG_FILTERS = ['all', 'error', 'warn', 'info'] as const;
type LogFilter = (typeof LOG_FILTERS)[number];

const LEVEL_CONFIG: Record<string, {
    border: string;
    bg: string;
    text: string;
    icon: React.ElementType;
    label: string;
}> = {
    error: {
        border: 'border-rose-500/20',
        bg: 'bg-rose-500/5',
        text: 'text-rose-400',
        icon: AlertOctagon,
        label: 'ERROR',
    },
    warn: {
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/5',
        text: 'text-amber-400',
        icon: AlertTriangle,
        label: 'WARN',
    },
    info: {
        border: 'border-cyan-500/20',
        bg: 'bg-cyan-500/5',
        text: 'text-cyan-400',
        icon: Info,
        label: 'INFO',
    },
    debug: {
        border: 'border-theme-secondary/10',
        bg: 'bg-white/[0.02]',
        text: 'text-theme-secondary/70',
        icon: Terminal,
        label: 'DEBUG',
    },
};

export function SystemLogsPanel({ logs, isLoading }: SystemLogsPanelProps) {
    const [filter, setFilter] = useState<LogFilter>('all');

    const filteredLogs = logs.filter(
        (l) => filter === 'all' || l.level === filter
    );

    // Count per level
    const counts = {
        all: logs.length,
        error: logs.filter((l) => l.level === 'error').length,
        warn: logs.filter((l) => l.level === 'warn').length,
        info: logs.filter((l) => l.level === 'info').length,
    };

    return (
        <div className="space-y-4">
            {/* Section Title */}
            <div className="flex items-center gap-3 px-1">
                <div className="h-5 w-1.5 rounded-full bg-cyan-400" />
                <h2 className="text-lg font-black text-white tracking-tight">
                    Logs del Sistema
                </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 flex-wrap">
                {LOG_FILTERS.map((f) => {
                    const isActive = filter === f;
                    const levelStyle = f !== 'all' ? LEVEL_CONFIG[f] : undefined;
                    const config = levelStyle
                        ? { text: levelStyle.text, bg: levelStyle.bg, border: levelStyle.border }
                        : { text: 'text-white', bg: 'bg-white/10', border: 'border-white/20' };

                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`relative rounded-[1rem] border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                                isActive
                                    ? `${config.border} ${config.bg} ${config.text} shadow-lg`
                                    : 'border-white/5 bg-[#13141f]/40 text-theme-secondary/50 hover:text-theme-secondary hover:border-white/10'
                            }`}
                        >
                            {f === 'all' ? 'Todos' : f}
                            <span className={`ml-1.5 text-[9px] font-mono ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                                ({counts[f]})
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Logs Feed */}
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-[1.5rem] border border-white/5 bg-[#13141f]/40 backdrop-blur-md">
                        <Search className="h-8 w-8 text-theme-secondary/30 animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest text-theme-secondary/40 mt-3">
                            Cargando registros...
                        </p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-[1.5rem] border border-white/5 border-dashed bg-[#13141f]/40 backdrop-blur-md">
                        <Terminal className="h-8 w-8 text-theme-secondary/20 mb-3" />
                        <p className="text-sm font-black text-theme-secondary/40 uppercase tracking-widest">
                            Sin registros
                        </p>
                        <p className="text-xs text-theme-secondary/25 mt-1">
                            {filter !== 'all' ? `No hay logs de tipo "${filter}"` : 'El sistema esta limpio'}
                        </p>
                    </div>
                ) : (
                    filteredLogs.map((log) => {
                        const config = LEVEL_CONFIG[log.level] ?? LEVEL_CONFIG.debug;
                        // Safe: config is guaranteed by fallback above
                        const Icon = config!.icon;

                        return (
                            <div
                                key={log.id}
                                className={`group relative overflow-hidden rounded-[1.25rem] border p-4 backdrop-blur-md transition-all duration-300 hover:shadow-lg ${config!.border} ${config!.bg}`}
                            >
                                {/* Top: Level + Category + Time */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded-lg bg-white/5`}>
                                            <Icon className={`h-3.5 w-3.5 ${config!.text}`} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${config!.text}`}>
                                            {config!.label}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-theme-secondary/40 bg-white/5 px-2 py-0.5 rounded-md">
                                            {log.category}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-1 text-[9px] font-mono text-theme-secondary/40">
                                        <Clock className="h-2.5 w-2.5" />
                                        {formatTimeAgo(log.created_at)}
                                    </span>
                                </div>

                                {/* Message */}
                                <p className={`text-sm font-semibold leading-relaxed break-words ${config!.text} opacity-90`}>
                                    {log.message}
                                </p>

                                {/* URL (if present) */}
                                {log.url && (
                                    <p className="mt-2 text-[9px] font-mono text-theme-secondary/30 truncate">
                                        {(() => {
                                            try {
                                                return new URL(log.url, 'https://vsm.store').pathname;
                                            } catch {
                                                return log.url;
                                            }
                                        })()}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
