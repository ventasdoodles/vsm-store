// Dashboard del Admin - VSM Store
// Arquitectura de Legos + Superpoderes (Exportación, Presets de fecha)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    getDashboardStats,
    getRecentOrders,
    type DashboardStats,
} from '@/services/admin';

// Importar Legos
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { DashboardStats as StatsCards } from '@/components/admin/dashboard/DashboardStats';
import { SalesChart } from '@/components/admin/dashboard/SalesChart';
import { TopProducts } from '@/components/admin/dashboard/TopProducts';
import { RecentOrders } from '@/components/admin/dashboard/RecentOrders';

export function AdminDashboard() {
    // Default to last 7 days
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        return {
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
        };
    });

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

    // Superpoder: Exportar a CSV
    const handleExport = () => {
        if (!stats) return;
        
        const csvContent = [
            ['Reporte de Ventas VSM Store'],
            [`Periodo: ${dateRange.start} al ${dateRange.end}`],
            [],
            ['Métricas Globales'],
            ['Ventas Totales', stats.salesToday],
            ['Pedidos Pendientes', stats.pendingOrders],
            ['Total Clientes', stats.totalCustomers],
            [],
            ['Top Productos'],
            ['Producto', 'Unidades Vendidas', 'Ingresos'],
            ...stats.topProducts.map(p => [p.name, p.sold, p.revenue]),
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `vsm_reporte_${dateRange.start}_${dateRange.end}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-theme-secondary/40" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="h-72 animate-pulse rounded-2xl bg-theme-secondary/40" />
                    <div className="h-72 animate-pulse rounded-2xl bg-theme-secondary/40" />
                </div>
                <div className="h-72 animate-pulse rounded-2xl bg-theme-secondary/40" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Lego: Header con Presets y Exportación */}
            <DashboardHeader 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
                onExport={handleExport} 
            />

            {/* Lego: Tarjetas de Estadísticas */}
            <StatsCards stats={stats} />

            {/* Legos: Gráficas y Top Productos */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SalesChart 
                    chartData={stats?.salesLast7Days ?? []} 
                    dateRange={dateRange} 
                />
                <TopProducts 
                    products={stats?.topProducts ?? []} 
                />
            </div>

            {/* Lego: Pedidos Recientes */}
            <RecentOrders orders={recentOrders ?? []} />
        </div>
    );
}
