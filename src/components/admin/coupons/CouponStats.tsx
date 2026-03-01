import { Ticket, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { AdminCoupon } from '@/services/admin';

interface Props {
    coupons: AdminCoupon[];
}

export function CouponStats({ coupons }: Props) {
    const now = new Date();

    const active = coupons.filter(c => 
        c.is_active && 
        (!c.valid_until || new Date(c.valid_until) > now) &&
        (!c.max_uses || c.current_uses < c.max_uses)
    ).length;

    const depleted = coupons.filter(c => 
        c.max_uses && c.current_uses >= c.max_uses
    ).length;

    const expired = coupons.filter(c => 
        c.valid_until && new Date(c.valid_until) < now
    ).length;

    const totalUses = coupons.reduce((sum, c) => sum + (c.current_uses || 0), 0);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-secondary mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-400" /> Activos
                </div>
                <div className="text-xl font-bold text-green-400">{active}</div>
            </div>
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-secondary mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-400" /> Agotados
                </div>
                <div className="text-xl font-bold text-orange-400">{depleted}</div>
            </div>
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-secondary mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-red-400" /> Expirados
                </div>
                <div className="text-xl font-bold text-red-400">{expired}</div>
            </div>
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-secondary mb-1 flex items-center gap-1">
                    <Ticket className="h-3 w-3 text-purple-400" /> Usos Totales
                </div>
                <div className="text-xl font-bold text-purple-400">{totalUses}</div>
            </div>
        </div>
    );
}
