/**
 * // ─── COMPONENTE: AdminDashboard ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Vista principal del Admin Panel con staggers inmersivos.
 *    Efectos: Entrada escalonada elástica, Orbes de luz premium, Métricas interactivas.
 * // Regla / Notas: Mantiene estado de rango de fechas. Delegación total a Legos de Dashboard.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { DashboardPulse } from '@/components/admin/dashboard/DashboardPulse';
import { AdminOracleDashboard } from '@/components/admin/dashboard/AdminOracleDashboard';
import { AIInsights } from '@/components/admin/dashboard/AIInsights';

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
                        <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-theme-primary/10 backdrop-blur-md border border-white/5" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="h-72 animate-pulse rounded-[1.5rem] bg-theme-primary/10 backdrop-blur-md border border-white/5" />
                    <div className="h-72 animate-pulse rounded-[1.5rem] bg-theme-primary/10 backdrop-blur-md border border-white/5" />
                </div>
                <div className="h-72 animate-pulse rounded-[1.5rem] bg-theme-primary/10 backdrop-blur-md border border-white/5" />
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
            className="space-y-6 pb-20 relative"
        >
            {/* 💡 Luces de Fondo (Orbes Premium) */}
            <div className="pointer-events-none absolute -left-10 top-0 h-64 w-64 rounded-full bg-accent-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 top-40 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

            {/* Lego: Header con Presets y Exportación */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <DashboardHeader
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onExport={handleExport}
                />
            </motion.div>

            {/* Lego: AI Pulse Tracker */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                {stats && <DashboardPulse stats={stats} />}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <AdminOracleDashboard />
            </motion.div>

            {/* Lego: AI Proactive Insights (Wave 59) */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <AIInsights />
            </motion.div>

            {/* Lego: Tarjetas de Estadísticas */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <StatsCards stats={stats} />
            </motion.div>

            {/* Legos: Gráficas y Top Productos */}
            <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
                <SalesChart
                    chartData={stats?.salesLast7Days ?? []}
                    dateRange={dateRange}
                />
                <TopProducts
                    products={stats?.topProducts ?? []}
                />
            </motion.div>

            {/* Lego: Pedidos Recientes */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <RecentOrders orders={recentOrders ?? []} />
            </motion.div>
        </motion.div>
    );
}
