/**
 * // ─── COMPONENTE: TagsStats ───
 * // Arquitectura: Dumb Component (Visual)
 * // Propósito principal: Mostrar métricas clave del módulo de etiquetas en pills compactas.
 * // Regla / Notas: Patrón idéntico a BrandsStats — glassmorphism pills.
 */
import { Tags, Box, TrendingUp } from 'lucide-react';

interface TagsStatsProps {
    total: number;
    productsTagged: number;
    mostUsedTag: string | null;
}

export function TagsStats({ total, productsTagged, mostUsedTag }: TagsStatsProps) {
    const stats = [
        {
            icon: Tags,
            label: 'Total etiquetas',
            value: total,
            color: 'text-accent-primary',
            bg: 'bg-accent-primary/10',
            ring: 'ring-accent-primary/20',
        },
        {
            icon: Box,
            label: 'Productos clasificados',
            value: productsTagged,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            ring: 'ring-blue-500/20',
        },
        {
            icon: TrendingUp,
            label: 'Más usada',
            value: mostUsedTag ?? '—',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            ring: 'ring-emerald-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#181825]/50 p-4 backdrop-blur-md"
                >
                    <div className={`p-2.5 rounded-xl ${s.bg} ring-1 ring-inset ${s.ring}`}>
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-theme-secondary/60">
                            {s.label}
                        </p>
                        <p className={`text-lg font-black ${typeof s.value === 'number' ? 'text-white' : 'text-white truncate'}`}>
                            {s.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
