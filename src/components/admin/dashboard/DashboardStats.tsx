/**
 * // ─── COMPONENTE: DashboardStats ───
 * // Arquitectura: Dumb Component (Visual Grid)
 * // Propósito principal: Mostrar las métricas clave de la tienda en tarjetas glassmorphism.
 * // Regla / Notas: Mantiene una arquitectura visual robusta con bordes sutiles y gradientes en la base.
 */
import {
    DollarSign,
    Clock,
    AlertTriangle,
    Users,
    Package,
    ShoppingCart,
} from 'lucide-react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import type { DashboardStats as StatsType } from '@/services/admin';
import type { LucideIcon } from 'lucide-react';

interface StatCardData {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    gradient: string;
    tooltip: string;
}

interface DashboardStatsProps {
    stats?: StatsType;
}

function StatCard({ card }: { card: StatCardData }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/40 backdrop-blur-2xl p-6 transition-all duration-500 hover:border-white/20 hover:bg-[#13141f]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            onMouseMove={handleMouseMove}
            title={card.tooltip}
        >
            {/* 🔦 Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            250px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.08),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-theme-secondary/60 uppercase tracking-[0.25em]">
                            {card.label}
                        </p>
                    </div>
                    <p className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                        {card.value}
                    </p>
                </div>
                <div className={`rounded-2xl ${card.iconBg} p-4 shadow-inner border border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
            </div>

            {/* Ambient Glow */}
            <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.05] blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />

            {/* Bottom Line Indicator */}
            <div
                className={`absolute bottom-0 left-0 h-[4px] w-full bg-gradient-to-r ${card.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-700 ease-out shadow-[0_-2px_10px_rgba(255,255,255,0.1)]`}
            />
        </div>
    );
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const statCards = [
        {
            label: 'Ventas hoy',
            value: formatPrice(stats?.todaySales ?? 0),
            icon: DollarSign,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            gradient: 'from-emerald-500/40 to-emerald-600/40',
            tooltip: 'Total vendido hoy (00:00 - 23:59). Incluye órdenes pagadas/confirmadas.',
        },
        {
            label: 'Pedidos pendientes',
            value: stats?.pendingOrders ?? 0,
            icon: Clock,
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            gradient: 'from-amber-500/40 to-amber-600/40',
            tooltip: 'Órdenes nuevas que requieren atención o preparación.',
        },
        {
            label: 'Stock bajo',
            value: stats?.lowStockProducts ?? 0,
            icon: AlertTriangle,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
            gradient: 'from-red-500/40 to-red-600/40',
            tooltip: 'Productos con inventario menor al límite mínimo (default: 5 uds).',
        },
        {
            label: 'Total clientes',
            value: stats?.totalCustomers ?? 0,
            icon: Users,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            gradient: 'from-blue-500/40 to-blue-600/40',
            tooltip: 'Número total de clientes registrados en la plataforma.',
        },
        {
            label: 'Productos activos',
            value: stats?.totalProducts ?? 0,
            icon: Package,
            iconBg: 'bg-vape-500/10',
            iconColor: 'text-vape-400',
            gradient: 'from-vape-500/40 to-vape-600/40',
            tooltip: 'Productos visibles en la tienda (no archivados ni borradores).',
        },
        {
            label: 'Total pedidos',
            value: stats?.totalOrders ?? 0,
            icon: ShoppingCart,
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            gradient: 'from-cyan-500/40 to-cyan-600/40',
            tooltip: 'Conteo histórico de todas las órdenes procesadas.',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((card) => (
                <StatCard key={card.label} card={card} />
            ))}
        </div>
    );
}
