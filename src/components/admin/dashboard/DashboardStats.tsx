import {
    DollarSign,
    Clock,
    AlertTriangle,
    Users,
    Package,
    ShoppingCart,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { DashboardStats as StatsType } from '@/services/admin';

interface DashboardStatsProps {
    stats?: StatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const statCards = [
        {
            label: 'Ventas hoy',
            value: formatPrice(stats?.salesToday ?? 0),
            icon: DollarSign,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            gradient: 'from-emerald-500 to-emerald-600',
            tooltip: 'Total vendido hoy (00:00 - 23:59). Incluye órdenes pagadas/confirmadas.',
        },
        {
            label: 'Pedidos pendientes',
            value: stats?.pendingOrders ?? 0,
            icon: Clock,
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            gradient: 'from-amber-500 to-amber-600',
            tooltip: 'Órdenes nuevas que requieren atención o preparación.',
        },
        {
            label: 'Stock bajo',
            value: stats?.lowStockProducts ?? 0,
            icon: AlertTriangle,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
            gradient: 'from-red-500 to-red-600',
            tooltip: 'Productos con inventario menor al límite mínimo (default: 5 uds).',
        },
        {
            label: 'Total clientes',
            value: stats?.totalCustomers ?? 0,
            icon: Users,
            iconBg: 'bg-accent-primary/10',
            iconColor: 'text-blue-400',
            gradient: 'from-blue-500 to-blue-600',
            tooltip: 'Número total de clientes registrados en la plataforma.',
        },
        {
            label: 'Productos activos',
            value: stats?.totalProducts ?? 0,
            icon: Package,
            iconBg: 'bg-accent-primary/10',
            iconColor: 'text-accent-primary',
            gradient: 'from-purple-500 to-purple-600',
            tooltip: 'Productos visibles en la tienda (no archivados ni borradores).',
        },
        {
            label: 'Total pedidos',
            value: stats?.totalOrders ?? 0,
            icon: ShoppingCart,
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            gradient: 'from-cyan-500 to-cyan-600',
            tooltip: 'Conteo histórico de todas las órdenes procesadas.',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((card) => (
                <div
                    key={card.label}
                    className="group relative overflow-hidden rounded-3xl border border-theme bg-theme-primary/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-theme-strong hover:bg-theme-primary/60 hover:shadow-2xl hover:shadow-vape-500/5 hover:-translate-y-1"
                    title={card.tooltip}
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-theme-secondary uppercase tracking-[0.2em]">
                                    {card.label}
                                </p>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-white">{card.value}</p>
                        </div>
                        <div className={`rounded-2xl ${card.iconBg} p-3 shadow-inner`}>
                            <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                        </div>
                    </div>
                    <div
                        className={`absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r ${card.gradient} opacity-20 group-hover:opacity-60 transition-opacity`}
                    />
                </div>
            ))}
        </div>
    );
}
