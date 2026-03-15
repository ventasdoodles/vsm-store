/**
 * // ─── COMPONENTE: WheelGameHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Header del módulo Admin Ruleta. Muestra stats en vivo
 *    (total premios, activos, giros totales) y botón "Nuevo Premio".
 *    Mini preview estática de la ruleta SVG para referencia visual rápida.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema índigo/púrpura (gamificación).
 */
import { Dices, Plus, Zap, Users, Trophy } from 'lucide-react';
import type { WheelPrizeAdmin, WheelStats } from '@/services/admin';

interface WheelGameHeaderProps {
    prizes: WheelPrizeAdmin[];
    stats: WheelStats | undefined;
    onAdd: () => void;
}

export function WheelGameHeader({ prizes, stats, onAdd }: WheelGameHeaderProps) {
    const active = prizes.filter(p => p.is_active).length;
    const totalProb = prizes
        .filter(p => p.is_active)
        .reduce((sum, p) => sum + p.probability, 0);
    const probOk = Math.abs(totalProb - 1) < 0.01 || prizes.filter(p => p.is_active).length === 0;

    const statCards = [
        {
            label: 'Premios Activos',
            value: `${active} / ${prizes.length}`,
            icon: Dices,
            color: 'text-indigo-400',
            bg: 'from-indigo-500/20 to-purple-500/10',
            border: 'border-indigo-500/20',
        },
        {
            label: 'Giros Totales',
            value: stats?.totalSpins ?? '—',
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'from-yellow-500/20 to-orange-500/10',
            border: 'border-yellow-500/20',
        },
        {
            label: 'Jugadores Únicos',
            value: stats?.uniqueUsers ?? '—',
            icon: Users,
            color: 'text-emerald-400',
            bg: 'from-emerald-500/20 to-teal-500/10',
            border: 'border-emerald-500/20',
        },
        {
            label: 'Premio Top',
            value: stats?.topPrizeLabel ?? '—',
            icon: Trophy,
            color: 'text-pink-400',
            bg: 'from-pink-500/20 to-rose-500/10',
            border: 'border-pink-500/20',
        },
    ] as const;

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 p-8 shadow-2xl backdrop-blur-md">
            {/* Orbes ambientales */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-purple-500/8 blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Title + prob alert */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-purple-500/15 border border-indigo-500/25 shadow-lg shadow-indigo-500/10">
                        <Dices className="h-7 w-7 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Ruleta de Premios</h1>
                        <p className="text-sm text-white/40 mt-0.5">
                            Gestiona segmentos, probabilidades y mecánicas de gamificación
                        </p>
                        {!probOk && prizes.length > 0 && (
                            <p className="mt-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-0.5 inline-block">
                                ⚠ Probabilidades activas suman {(totalProb * 100).toFixed(1)}% — deben sumar 100%
                            </p>
                        )}
                    </div>
                </div>

                {/* Add button */}
                <button
                    onClick={onAdd}
                    className="group relative inline-flex flex-shrink-0 items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    <Plus className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">Nuevo Premio</span>
                </button>
            </div>

            {/* Stats grid */}
            <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
                    <div
                        key={label}
                        className={`flex items-center gap-3 rounded-[1.25rem] border ${border} bg-gradient-to-br ${bg} px-4 py-3 backdrop-blur-sm`}
                    >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
                        <div className="min-w-0">
                            <p className="text-base font-black text-white truncate">{value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">{label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
