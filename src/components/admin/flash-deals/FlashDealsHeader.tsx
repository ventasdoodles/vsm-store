/**
 * // ─── COMPONENTE: FlashDealsHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Header premium del modulo Flash Deals con stats en vivo
 *    (activas, expiradas, ventas totales) y boton para crear nueva oferta.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema naranja/rojo (urgencia). Glassmorphism.
 */
import { Zap, Plus, Flame, Clock, TrendingUp } from 'lucide-react';
import type { FlashDeal } from '@/services/admin/admin-flash-deals.service';

interface FlashDealsHeaderProps {
    deals: FlashDeal[];
    onAdd: () => void;
}

export function FlashDealsHeader({ deals, onAdd }: FlashDealsHeaderProps) {
    const now = Date.now();
    const active = deals.filter(d => d.is_active && new Date(d.ends_at).getTime() > now && new Date(d.starts_at).getTime() <= now);
    const expired = deals.filter(d => new Date(d.ends_at).getTime() <= now);
    const totalSold = deals.reduce((sum, d) => sum + d.sold_count, 0);

    const stats = [
        { label: 'Activas', value: active.length, icon: Flame, color: 'text-orange-400', bg: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/20' },
        { label: 'Expiradas', value: expired.length, icon: Clock, color: 'text-white/40', bg: 'from-white/5 to-white/[0.02]', border: 'border-white/10' },
        { label: 'Vendidos', value: totalSold, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20' },
    ] as const;

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 p-8 shadow-2xl backdrop-blur-md">
            {/* Orbes ambientales */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-red-500/8 blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Title */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/25 to-red-500/15 border border-orange-500/25 shadow-lg shadow-orange-500/10">
                        <Zap className="h-7 w-7 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">
                            Ofertas Flash
                        </h1>
                        <p className="text-sm text-white/40 mt-0.5">
                            Promociones urgentes con timer y stock limitado
                        </p>
                    </div>
                </div>

                {/* Add button */}
                <button
                    onClick={onAdd}
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    <Plus className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">Nueva Oferta</span>
                </button>
            </div>

            {/* Stats row */}
            <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
                {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
                    <div
                        key={label}
                        className={`flex items-center gap-3 rounded-[1.25rem] border ${border} bg-gradient-to-br ${bg} px-4 py-3 backdrop-blur-sm`}
                    >
                        <Icon className={`h-5 w-5 ${color}`} />
                        <div>
                            <p className="text-lg font-black text-white">{value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">{label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
