// Dashboard del Admin - VSM Store
// Métricas principales + gráfica de ventas + top productos + pedidos recientes
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    DollarSign,
    Clock,
    AlertTriangle,
    Users,
    Package,
    ArrowRight,
    // TrendingUp,
    ShoppingCart,
    BarChart3,
    Trophy,
    Calendar,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
    getDashboardStats,
    getRecentOrders,
    ORDER_STATUSES,
    type DashboardStats,
    type AdminOrder,
} from '@/services/admin.service';

import { HelpTooltip } from '@/components/ui/HelpTooltip';

export function AdminDashboard() {
    // Default to last 7 days
    // Default to last 7 days
    const [dateRange, setDateRange] = useState(() => ({
        start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
    }));

    const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
        queryKey: ['admin', 'stats', dateRange],
        queryFn: () => getDashboardStats(dateRange.start, dateRange.end),
        refetchInterval: 30000,
    });

    const { data: recentOrders, isLoading: loadingOrders } = useQuery({
        queryKey: ['admin', 'recent-orders'],
        queryFn: () => getRecentOrders(8),
    });

    const loading = loadingStats || loadingOrders;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-primary-800/40" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="h-72 animate-pulse rounded-2xl bg-primary-800/40" />
                    <div className="h-72 animate-pulse rounded-2xl bg-primary-800/40" />
                </div>
                <div className="h-72 animate-pulse rounded-2xl bg-primary-800/40" />
            </div>
        );
    }

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
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            gradient: 'from-blue-500 to-blue-600',
            tooltip: 'Número total de clientes registrados en la plataforma.',
        },
        {
            label: 'Productos activos',
            value: stats?.totalProducts ?? 0,
            icon: Package,
            iconBg: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
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

    // Sales chart helpers
    const chartData = stats?.salesLast7Days ?? [];
    const maxSales = Math.max(...chartData.map((d) => d.total), 1);
    const totalWeekSales = chartData.reduce((s, d) => s + d.total, 0);
    const totalWeekOrders = chartData.reduce((s, d) => s + d.count, 0);

    const dayLabels = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const formatDay = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
        return dayLabels[d.getDay()];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Dashboard</h1>
                    <p className="text-sm text-primary-500">Resumen de tu tienda</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {/* Date Picker */}
                    <div className="flex items-center gap-2 rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                        <HelpTooltip
                            title="Rango de Fechas"
                            content="Filtrar métricas y gráficas por fecha. Afecta a Ventas, Pedidos y Top Productos."
                            position="left"
                            className="mr-2"
                        />
                        <div className="flex items-center gap-2 px-2 py-1">
                            <Calendar className="h-4 w-4 text-primary-500" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent text-xs font-medium text-primary-200 focus:outline-none [color-scheme:dark]"
                            />
                            <span className="text-primary-600">-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent text-xs font-medium text-primary-200 focus:outline-none [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards — 3x2 grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="group relative overflow-hidden rounded-3xl border border-primary-800/30 bg-primary-900/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary-700/50 hover:bg-primary-900/60 hover:shadow-2xl hover:shadow-vape-500/5 hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em]">
                                        {card.label}
                                    </p>
                                    <HelpTooltip
                                        title={card.label}
                                        content={card.tooltip}
                                        position="right"
                                        className="opacity-50 hover:opacity-100 transition-opacity"
                                    />
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

            {/* Charts Row: Sales + Top Products side by side */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Sales Chart (last 7 days) */}
                <div className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-vape-400" />
                            <h2 className="text-sm font-semibold text-primary-200">
                                Ventas
                                <span className="ml-2 text-xs font-normal text-primary-500">
                                    ({new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()})
                                </span>
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary-100">{formatPrice(totalWeekSales)}</p>
                            <p className="text-[11px] text-primary-500">{totalWeekOrders} pedidos</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                        {chartData.map((day) => {
                            const height = maxSales > 0 ? Math.max((day.total / maxSales) * 100, 4) : 4;
                            const isToday = day.date === new Date().toISOString().slice(0, 10);
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] text-primary-500 font-medium">
                                        {day.total > 0 ? formatPrice(day.total) : ''}
                                    </span>
                                    <div className="w-full flex items-end" style={{ height: '120px' }}>
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${isToday
                                                ? 'bg-gradient-to-t from-vape-500 to-vape-400 shadow-lg shadow-vape-500/20'
                                                : 'bg-gradient-to-t from-primary-700 to-primary-600'
                                                }`}
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                    </div>
                                    <span
                                        className={`text-[10px] font-medium ${isToday ? 'text-vape-400' : 'text-primary-600'
                                            }`}
                                    >
                                        {formatDay(day.date)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <h2 className="text-sm font-semibold text-primary-200">Top productos</h2>
                    </div>
                    {(!stats?.topProducts || stats.topProducts.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Package className="h-8 w-8 text-primary-700 mb-2" />
                            <p className="text-xs text-primary-500">Aún no hay datos de ventas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.topProducts.map((product, i) => {
                                const maxRev = stats.topProducts[0]?.revenue || 1;
                                const barWidth = (product.revenue / maxRev) * 100;
                                return (
                                    <div key={product.name} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary-800/60 text-[10px] font-bold text-primary-400 shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-primary-300 truncate max-w-[180px]">
                                                    {product.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[11px] text-primary-500">
                                                    {product.sold} uds
                                                </span>
                                                <span className="text-xs font-semibold text-primary-200">
                                                    {formatPrice(product.revenue)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-primary-800/40 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/80 transition-all"
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
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
