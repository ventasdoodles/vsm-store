/**
 * // ─── COMPONENTE: FlashDealsConfig ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Panel de estado glassmorphism para ofertas flash.
 *    Muestra cuántas deals están activas, la próxima expiración y un live countdown.
 *    Reemplaza el timer global desconectado por información REAL extraída de las deals.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema naranja/rojo (urgencia).
 */
import { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashDeal } from '@/services/admin';

interface FlashDealsConfigProps {
    deals: FlashDeal[];
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
    total: number; // ms
}

function getTimeLeft(isoDate: string): TimeLeft {
    const diff = Math.max(0, new Date(isoDate).getTime() - Date.now());
    const totalSec = Math.floor(diff / 1000);
    return {
        hours: Math.floor(totalSec / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
        total: diff,
    };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function FlashDealsConfig({ deals }: FlashDealsConfigProps) {
    const now = Date.now();

    // Classify deals
    const liveDeals = deals.filter(d =>
        d.is_active &&
        new Date(d.starts_at).getTime() <= now &&
        new Date(d.ends_at).getTime() > now &&
        d.sold_count < d.max_qty
    );
    const scheduledDeals = deals.filter(d =>
        d.is_active && new Date(d.starts_at).getTime() > now
    );
    const expiredDeals = deals.filter(d =>
        !d.is_active || new Date(d.ends_at).getTime() <= now
    );

    // Deal that expires soonest among live ones
    const nextExpiring = liveDeals.reduce<FlashDeal | null>((acc, d) => {
        if (!acc) return d;
        return new Date(d.ends_at) < new Date(acc.ends_at) ? d : acc;
    }, null);

    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
        nextExpiring ? getTimeLeft(nextExpiring.ends_at) : null
    );

    useEffect(() => {
        if (!nextExpiring) { setTimeLeft(null); return; }
        const endDate = nextExpiring.ends_at;
        const tick = () => setTimeLeft(getTimeLeft(endDate));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [nextExpiring?.id, nextExpiring?.ends_at]);

    const isUrgent = timeLeft && timeLeft.total < 3_600_000; // < 1h

    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-orange-500/10 h-full">
            {/* Orbe */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/8 blur-[70px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/20">
                        <Zap className="h-5 w-5 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">Estado de Ofertas</h2>
                        <p className="text-xs text-white/35">Vista en tiempo real</p>
                    </div>
                </div>

                <div className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border',
                    liveDeals.length > 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-white/30 border-white/10'
                )}>
                    <span className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        liveDeals.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
                    )} />
                    {liveDeals.length > 0 ? 'En vivo' : 'Sin activas'}
                </div>
            </div>

            {/* Stats grid */}
            <div className="relative z-10 grid grid-cols-3 gap-2 mb-5">
                <StatCard
                    icon={CheckCircle}
                    value={liveDeals.length}
                    label="En vivo"
                    colorCls="text-emerald-400"
                    bgCls="bg-emerald-500/10 border-emerald-500/20"
                />
                <StatCard
                    icon={Clock}
                    value={scheduledDeals.length}
                    label="Prog."
                    colorCls="text-blue-400"
                    bgCls="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard
                    icon={TrendingUp}
                    value={expiredDeals.length}
                    label="Inact."
                    colorCls="text-white/30"
                    bgCls="bg-white/5 border-white/10"
                />
            </div>

            {/* Countdown to next expiry */}
            <div className="relative z-10">
                {nextExpiring && timeLeft ? (
                    <div className={cn(
                        'rounded-[1rem] border p-4 transition-all',
                        isUrgent
                            ? 'border-red-500/30 bg-red-500/5'
                            : 'border-orange-500/15 bg-orange-500/5'
                    )}>
                        <p className={cn(
                            'text-[10px] font-black uppercase tracking-widest mb-3',
                            isUrgent ? 'text-red-400' : 'text-orange-400/70'
                        )}>
                            {isUrgent ? '⚠ Caduca pronto' : '⏱ Próxima caducidad'}
                        </p>
                        <p className="text-[11px] text-white/40 mb-3 truncate">
                            {nextExpiring.product?.name ?? 'Oferta'}
                        </p>

                        {/* Flip-style countdown */}
                        <div className="flex items-end gap-2">
                            {[
                                { val: timeLeft.hours, label: 'h' },
                                { val: timeLeft.minutes, label: 'm' },
                                { val: timeLeft.seconds, label: 's' },
                            ].map(({ val, label }, i) => (
                                <div key={i} className="flex items-end gap-0.5">
                                    <div className={cn(
                                        'flex items-center justify-center rounded-lg border px-2 py-1 min-w-[2.25rem] text-center',
                                        isUrgent
                                            ? 'bg-red-500/10 border-red-500/20 text-red-300'
                                            : 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                                    )}>
                                        <span className="text-xl font-black tabular-nums">{pad(val)}</span>
                                    </div>
                                    <span className="text-[10px] text-white/25 pb-0.5">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-[1rem] border border-dashed border-white/10 p-6 text-center">
                        <Zap className="h-8 w-8 text-orange-500/20" />
                        <p className="text-xs text-white/30">Crea tu primera oferta flash para comenzar</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-[1rem] border border-amber-500/15 bg-amber-500/5 p-4">
                        <AlertTriangle className="h-4 w-4 text-amber-400/60 flex-shrink-0" />
                        <p className="text-xs text-amber-400/60">
                            Ninguna oferta activa. La sección no aparecerá en el storefront.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Stat Card sub-component ─── */
interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    label: string;
    colorCls: string;
    bgCls: string;
}
function StatCard({ icon: Icon, value, label, colorCls, bgCls }: StatCardProps) {
    return (
        <div className={cn('flex flex-col items-center gap-1 rounded-xl border py-3 px-2', bgCls)}>
            <Icon className={cn('h-4 w-4', colorCls)} />
            <span className={cn('text-2xl font-black tabular-nums', colorCls)}>{value}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/25">{label}</span>
        </div>
    );
}
