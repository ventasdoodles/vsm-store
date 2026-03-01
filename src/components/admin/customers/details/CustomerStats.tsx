/**
 * CustomerStats — Métricas y Segmentación Automática
 * 
 * Grid de KPIs: LTV, transacciones, AOV y recencia.
 * Incluye un motor de segmentación algorítmica que clasifica 
 * al cliente automáticamente según su comportamiento de compra
 * (Top Spender, Embajador Leal, En Riesgo, Durmiente, etc.)
 * 
 * @module admin/customers/details
 */
import type { AdminCustomerDetail } from '@/services/admin';
import { Target, TrendingUp, ShoppingBag, CreditCard, Clock, Activity } from 'lucide-react';

interface Props {
    customer: AdminCustomerDetail;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

function calculateSegment(stats: AdminCustomerDetail['orders_summary']) {
    if (!stats || stats.total_orders === 0) return { 
        label: 'Prospecto Pasivo', 
        color: 'text-gray-400', 
        bg: 'from-gray-500/10 to-gray-500/5', 
        border: 'border-gray-500/20',
        icon: <Activity className="h-5 w-5 text-gray-400" />
    };

    const daysSinceLastOrder = stats.last_order_date 
        ? Math.floor((new Date().getTime() - new Date(stats.last_order_date).getTime()) / (1000 * 3600 * 24))
        : 999;

    if (stats.total_spent > 5000 && stats.total_orders >= 5) {
        return { 
            label: 'Top Spender 🐋', 
            color: 'text-purple-400', 
            bg: 'from-purple-500/20 to-purple-500/5', 
            border: 'border-purple-500/30',
            icon: <TrendingUp className="h-5 w-5 text-purple-400" />
        };
    }
    if (stats.total_orders >= 3 && daysSinceLastOrder <= 30) {
        return { 
            label: 'Embajador Leal 🏆', 
            color: 'text-yellow-400', 
            bg: 'from-amber-500/20 to-amber-500/5', 
            border: 'border-amber-500/30',
            icon: <Target className="h-5 w-5 text-amber-400" />
        };
    }
    if (stats.total_orders >= 2 && daysSinceLastOrder > 60) {
        return { 
            label: 'En Riesgo de Fuga ⚠️', 
            color: 'text-orange-400', 
            bg: 'from-orange-500/20 to-orange-500/5', 
            border: 'border-orange-500/30',
            icon: <Activity className="h-5 w-5 text-orange-400" />
        };
    }
    if (stats.total_orders === 1 && daysSinceLastOrder <= 15) {
        return { 
            label: 'Adquisición Reciente 🌱', 
            color: 'text-green-400', 
            bg: 'from-green-500/20 to-green-500/5', 
            border: 'border-green-500/30',
            icon: <Activity className="h-5 w-5 text-green-400" />
        };
    }
    if (stats.total_orders === 1 && daysSinceLastOrder > 60) {
        return { 
            label: 'Cliente Durmiente 💤', 
            color: 'text-blue-400', 
            bg: 'from-blue-500/20 to-blue-500/5', 
            border: 'border-blue-500/30',
            icon: <Clock className="h-5 w-5 text-blue-400" />
        };
    }

    return { 
        label: 'Recurrente Base', 
        color: 'text-white', 
        bg: 'from-[#1a1c29] to-[#13141f]', 
        border: 'border-white/10',
        icon: <Target className="h-5 w-5 text-theme-secondary" />
    };
}

export function CustomerStats({ customer }: Props) {
    const stats = customer.orders_summary;
    const segment = calculateSegment(stats);

    // Calc time ago string nicely
    const daysSinceLastOrder = stats?.last_order_date 
        ? Math.floor((new Date().getTime() - new Date(stats.last_order_date).getTime()) / (1000 * 3600 * 24))
        : null;
        
    let lastOrderString = 'N/A';
    if (daysSinceLastOrder === 0) lastOrderString = 'Hoy';
    else if (daysSinceLastOrder === 1) lastOrderString = 'Ayer';
    else if (daysSinceLastOrder !== null && daysSinceLastOrder < 30) lastOrderString = `Hace ${daysSinceLastOrder} días`;
    else if (daysSinceLastOrder !== null) lastOrderString = stats?.last_order_date ? new Date(stats.last_order_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';


    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Segmento Automático (Hero Box) */}
            <div className={`col-span-2 lg:col-span-1 rounded-2xl border ${segment.border} bg-gradient-to-br ${segment.bg} p-5 flex flex-col justify-center items-start shadow-lg relative overflow-hidden backdrop-blur-sm`}>
                <div className="absolute -right-4 -top-4 opacity-10 scale-150 transform rotate-12 pointer-events-none">
                    {segment.icon}
                </div>
                <div className="flex items-center gap-2 mb-2 z-10">
                    <div className={`p-1.5 rounded-lg bg-black/20 backdrop-blur-md`}>
                        {segment.icon}
                    </div>
                </div>
                <div className="text-xs text-theme-secondary/80 font-medium mb-1 z-10 uppercase tracking-wider">Health Score</div>
                <div className={`text-lg font-black ${segment.color} z-10 leading-tight`}>{segment.label}</div>
            </div>

            {/* Total Gastado (LTV) */}
            <div className="rounded-2xl border border-white/5 bg-[#13141f]/80 p-5 flex flex-col justify-center shadow-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-theme-secondary font-medium uppercase tracking-wider">LTV (Lifetime Value)</div>
                    <CreditCard className="h-4 w-4 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-black text-green-400">{formatCurrency(stats?.total_spent || 0)}</div>
                <div className="text-xs text-theme-secondary/50 mt-1">Acumulado histórico</div>
            </div>

            {/* Pedidos Totales */}
            <div className="rounded-2xl border border-white/5 bg-[#13141f]/80 p-5 flex flex-col justify-center shadow-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-theme-secondary font-medium uppercase tracking-wider">Transacciones</div>
                    <ShoppingBag className="h-4 w-4 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-black text-white">{stats?.total_orders || 0}</div>
                <div className="text-xs text-theme-secondary/50 mt-1">Pedidos exitosos</div>
            </div>

            {/* Ticket Promedio (AOV) */}
            <div className="rounded-2xl border border-white/5 bg-[#13141f]/80 p-5 flex flex-col justify-center shadow-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-theme-secondary font-medium uppercase tracking-wider">Ticket Promedio</div>
                    <TrendingUp className="h-4 w-4 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-black text-purple-400">{formatCurrency(stats?.aov || 0)}</div>
                <div className="text-xs text-theme-secondary/50 mt-1">AOV Recurrente</div>
            </div>

            {/* Última Compra */}
            <div className="rounded-2xl border border-white/5 bg-[#13141f]/80 p-5 flex flex-col justify-center shadow-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-theme-secondary font-medium uppercase tracking-wider">Recencia</div>
                    <Clock className="h-4 w-4 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xl sm:text-lg font-black text-amber-400 truncate">{lastOrderString}</div>
                <div className="text-xs text-theme-secondary/50 mt-1 truncate">
                    {stats?.last_order_date ? new Date(stats.last_order_date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric'}) : 'Sin actividad'}
                </div>
            </div>
        </div>
    );
}
