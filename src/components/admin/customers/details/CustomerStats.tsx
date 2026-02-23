import type { AdminCustomerDetail } from '@/services/admin';
import { Target } from 'lucide-react';

interface Props {
    stats: AdminCustomerDetail['orders_summary'];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

function calculateSegment(stats: AdminCustomerDetail['orders_summary']) {
    if (!stats || stats.total_orders === 0) return { label: 'Prospecto', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };

    const daysSinceLastOrder = stats.last_order_date 
        ? Math.floor((new Date().getTime() - new Date(stats.last_order_date).getTime()) / (1000 * 3600 * 24))
        : 999;

    if (stats.total_spent > 5000 && stats.total_orders >= 5) {
        return { label: 'Ballena 🐋', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' };
    }
    if (stats.total_orders >= 3 && daysSinceLastOrder <= 30) {
        return { label: 'Leal 🏆', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    }
    if (stats.total_orders >= 2 && daysSinceLastOrder > 60) {
        return { label: 'En Riesgo ⚠️', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
    }
    if (stats.total_orders === 1 && daysSinceLastOrder <= 15) {
        return { label: 'Nuevo 🌱', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    }
    if (stats.total_orders === 1 && daysSinceLastOrder > 60) {
        return { label: 'Durmiente 💤', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    }

    return { label: 'Regular', color: 'text-theme-primary', bg: 'bg-theme-primary/20', border: 'border-theme' };
}

export function CustomerStats({ stats }: Props) {
    const segment = calculateSegment(stats);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Segmento Automático */}
            <div className={`rounded-xl border ${segment.border} ${segment.bg} p-4 flex flex-col justify-center items-center text-center col-span-2 lg:col-span-1`}>
                <div className="text-xs text-theme-primary0 mb-1 flex items-center gap-1">
                    <Target className="h-3 w-3" /> Segmento
                </div>
                <div className={`text-lg font-bold ${segment.color}`}>{segment.label}</div>
            </div>

            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-primary0 mb-1">Total Gastado</div>
                <div className="text-xl font-bold text-herbal-400">{formatCurrency(stats?.total_spent || 0)}</div>
            </div>
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-primary0 mb-1">Pedidos</div>
                <div className="text-xl font-bold text-theme-primary">{stats?.total_orders || 0}</div>
            </div>
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-primary0 mb-1">Ticket Promedio</div>
                <div className="text-xl font-bold text-blue-400">{formatCurrency(stats?.aov || 0)}</div>
            </div>
            <div className="rounded-xl border border-theme bg-theme-primary/40 p-4">
                <div className="text-xs text-theme-primary0 mb-1">Última Compra</div>
                <div className="text-sm font-bold text-theme-primary">
                    {stats?.last_order_date ? new Date(stats.last_order_date).toLocaleDateString() : 'N/A'}
                </div>
            </div>
        </div>
    );
}
