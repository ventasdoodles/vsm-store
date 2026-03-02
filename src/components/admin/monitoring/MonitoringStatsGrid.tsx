/**
 * // ─── COMPONENTE: MonitoringStatsGrid ───
 * // Arquitectura: Dumb Component (Visual KPI Grid)
 * // Proposito principal: Mostrar 4 KPIs clave del sistema en tarjetas glassmorphism animadas.
 * // Regla / Notas: Cada tarjeta tiene su propio acento de color y brillo ambiental en hover.
 */
import { Users, AlertOctagon, AlertTriangle, Shield } from 'lucide-react';

interface MonitoringStatsGridProps {
    onlineUsers: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfoLogs: number;
}

interface StatCardConfig {
    label: string;
    value: number;
    icon: React.ElementType;
    accentColor: string;
    glowColor: string;
    textColor: string;
    suffix?: string;
}

export function MonitoringStatsGrid({
    onlineUsers,
    totalErrors,
    totalWarnings,
    totalInfoLogs,
}: MonitoringStatsGridProps) {
    const cards: StatCardConfig[] = [
        {
            label: 'Usuarios Activos',
            value: onlineUsers,
            icon: Users,
            accentColor: 'border-emerald-500/20 bg-emerald-500/5',
            glowColor: 'bg-emerald-500/10',
            textColor: 'text-emerald-400',
        },
        {
            label: 'Errores Recientes',
            value: totalErrors,
            icon: AlertOctagon,
            accentColor: 'border-rose-500/20 bg-rose-500/5',
            glowColor: 'bg-rose-500/10',
            textColor: 'text-rose-400',
        },
        {
            label: 'Advertencias',
            value: totalWarnings,
            icon: AlertTriangle,
            accentColor: 'border-amber-500/20 bg-amber-500/5',
            glowColor: 'bg-amber-500/10',
            textColor: 'text-amber-400',
        },
        {
            label: 'Logs de Info',
            value: totalInfoLogs,
            icon: Shield,
            accentColor: 'border-cyan-500/20 bg-cyan-500/5',
            glowColor: 'bg-cyan-500/10',
            textColor: 'text-cyan-400',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className={`group relative overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 ${card.accentColor}`}
                    >
                        {/* Ambient glow on hover */}
                        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${card.glowColor} blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-[0.75rem] bg-white/5 group-hover:bg-white/10 transition-colors`}>
                                    <Icon className={`h-5 w-5 ${card.textColor}`} />
                                </div>
                                {/* Live pulse for online users */}
                                {card.label === 'Usuarios Activos' && card.value > 0 && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                                    </span>
                                )}
                            </div>
                            <p className={`text-3xl font-black leading-none tracking-tight ${card.textColor}`}>
                                {card.value}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-theme-secondary/60 mt-2">
                                {card.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
