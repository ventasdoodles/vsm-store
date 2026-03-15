/**
 * // ─── COMPONENTE: WheelGameStatsPanel ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Panel de estadísticas detalladas de la Ruleta:
 *    giros totales, jugadores únicos, premio más ganado, giros hoy.
 * // Regla / Notas: Props tipadas. Sin `any`. Loading skeleton si isLoading.
 */
import { BarChart3, Users, Trophy, Calendar } from 'lucide-react';
import type { WheelStats } from '@/services/admin';

interface WheelGameStatsPanelProps {
    stats: WheelStats | undefined;
    isLoading: boolean;
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: typeof BarChart3;
    color: string;
    bg: string;
    border: string;
    isLoading: boolean;
}

function StatCard({ label, value, icon: Icon, color, bg, border, isLoading }: StatCardProps) {
    return (
        <div className={`rounded-[1.5rem] border ${border} bg-gradient-to-br ${bg} p-5 backdrop-blur-sm`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </div>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-7 w-16 rounded-lg bg-white/10 animate-pulse" />
                    <div className="h-3 w-24 rounded-lg bg-white/5 animate-pulse" />
                </div>
            ) : (
                <>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/35 mt-0.5">{label}</p>
                </>
            )}
        </div>
    );
}

export function WheelGameStatsPanel({ stats, isLoading }: WheelGameStatsPanelProps) {
    const cards = [
        {
            label: 'Total de Giros',
            value: stats?.totalSpins ?? 0,
            icon: BarChart3,
            color: 'text-indigo-400',
            bg: 'from-indigo-500/15 to-purple-500/5',
            border: 'border-indigo-500/15',
        },
        {
            label: 'Jugadores Únicos',
            value: stats?.uniqueUsers ?? 0,
            icon: Users,
            color: 'text-emerald-400',
            bg: 'from-emerald-500/15 to-teal-500/5',
            border: 'border-emerald-500/15',
        },
        {
            label: 'Premio Más Ganado',
            value: stats?.topPrizeLabel ?? 'Sin datos',
            icon: Trophy,
            color: 'text-yellow-400',
            bg: 'from-yellow-500/15 to-orange-500/5',
            border: 'border-yellow-500/15',
        },
        {
            label: 'Giros Hoy',
            value: stats?.spinsToday ?? 0,
            icon: Calendar,
            color: 'text-pink-400',
            bg: 'from-pink-500/15 to-rose-500/5',
            border: 'border-pink-500/15',
        },
    ] as const;

    return (
        <div className="rounded-[1.5rem] border border-white/5 bg-theme-primary/5 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">
                Estadísticas de Participación
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                    <StatCard key={card.label} {...card} isLoading={isLoading} />
                ))}
            </div>
        </div>
    );
}
