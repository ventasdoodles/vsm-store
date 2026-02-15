// Dashboard del Admin - VSM Store
// Métricas principales + pedidos recientes
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    DollarSign,
    Clock,
    AlertTriangle,
    Users,
    Package,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
    getDashboardStats,
    getRecentOrders,
    ORDER_STATUSES,
    type DashboardStats,
    type AdminOrder,
} from '@/services/admin.service';

export function AdminDashboard() {
    const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
        queryKey: ['admin', 'stats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000, // Refresh every 30s
    });

    const { data: recentOrders, isLoading: loadingOrders } = useQuery({
        queryKey: ['admin', 'recent-orders'],
        queryFn: () => getRecentOrders(8),
    });

    const loading = loadingStats || loadingOrders;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-primary-800/40" />
                    ))}
                </div>
                <div className="h-96 animate-pulse rounded-2xl bg-primary-800/40" />
            </div>
        );
    }

    const statCards = [
        {
            label: 'Ventas hoy',
            value: formatPrice(stats?.salesToday ?? 0),
            icon: DollarSign,
            color: 'from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
        },
        {
            label: 'Pedidos pendientes',
            value: stats?.pendingOrders ?? 0,
            icon: Clock,
            color: 'from-amber-500 to-amber-600',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
        },
        {
            label: 'Stock bajo',
            value: stats?.lowStockProducts ?? 0,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
        },
        {
            label: 'Total clientes',
            value: stats?.totalCustomers ?? 0,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Dashboard</h1>
                    <p className="text-sm text-primary-500">Resumen de tu tienda</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary-800/40 px-3 py-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-primary-400">
                        {new Date().toLocaleDateString('es-MX', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="group relative overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 transition-all hover:border-primary-700/50 hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-primary-500 uppercase tracking-wider">
                                    {card.label}
                                </p>
                                <p className="text-2xl font-bold text-primary-100">{card.value}</p>
                            </div>
                            <div className={`rounded-xl ${card.iconBg} p-2.5`}>
                                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                            </div>
                        </div>
                        {/* Decorative gradient line */}
                        <div
                            className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${card.color} opacity-40`}
                        />
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl border border-primary-800/40 bg-primary-900/60 overflow-hidden">
                <div className="flex items-center justify-between border-b border-primary-800/40 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-vape-400" />
                        <h2 className="text-sm font-semibold text-primary-200">Pedidos recientes</h2>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="flex items-center gap-1 text-xs text-vape-400 hover:text-vape-300 transition-colors"
                    >
                        Ver todos
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {!recentOrders || recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-10 w-10 text-primary-700 mb-3" />
                        <p className="text-sm text-primary-500">No hay pedidos aún</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary-800/30 text-left">
                                    <th className="px-5 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Orden
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-800/20">
                                {recentOrders.map((order: AdminOrder) => {
                                    const statusInfo = ORDER_STATUSES.find(
                                        (s) => s.value === order.status
                                    );
                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-primary-800/20 transition-colors"
                                        >
                                            <td className="px-5 py-3 font-mono text-xs text-primary-400">
                                                #{order.id?.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-5 py-3 text-primary-300">
                                                {order.customer_name || 'Sin nombre'}
                                            </td>
                                            <td className="px-5 py-3 font-medium text-primary-200">
                                                {formatPrice(order.total ?? 0)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${statusInfo?.color}15`,
                                                        color: statusInfo?.color,
                                                    }}
                                                >
                                                    {statusInfo?.label ?? order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-primary-500">
                                                {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
