/**
 * ProfileStats — Grid de tarjetas con estadísticas del usuario.
 *
 * @module ProfileStats
 * @independent Componente 100% independiente. Lee auth + loyalty internamente.
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
 */
import { ShoppingBag, Wallet, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePointsBalance, useTierProgress } from '@/hooks/useLoyalty';
import { useCustomerStats } from '@/hooks/useStats';
import type { CustomerTier } from '@/types/customer';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
    to?: string;
    isLoading?: boolean;
}

function StatCard({ icon, label, value, gradient, to, isLoading }: StatCardProps) {
    const content = (
        <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 glass-premium spotlight-container hover:-translate-y-1 h-full border-white/5 bg-white/[0.02]">
            {/* Background Glow */}
            <div className={cn(
                "absolute -top-12 -right-12 h-32 w-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-all duration-700 bg-gradient-to-br",
                gradient
            )} />

            <div className="relative z-10 flex flex-col gap-5">
                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-gradient-to-br",
                    gradient
                )}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-50 mb-1.5">{label}</p>
                    {isLoading ? (
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-white/5" />
                    ) : (
                        <p className="text-2xl font-black text-theme-primary tracking-tighter uppercase italic">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return content;
}

export function ProfileStats() {
    const { user, profile } = useAuth();
    const { data: points = 0 } = usePointsBalance(user?.id);
    const { data: stats, isLoading: statsLoading } = useCustomerStats(user?.id);
    const { data: tierProgress, isLoading: tierLoading } = useTierProgress(user?.id);

    const tier = (tierProgress?.currentTier || profile?.tier || 'bronze') as CustomerTier;
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
    const isLoading = statsLoading || tierLoading;

    return (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Pedidos"
                value={stats?.totalOrders ?? 0}
                gradient="from-blue-500 to-cyan-400"
                to="/orders"
                isLoading={isLoading}
            />
            <StatCard
                icon={<Wallet className="h-5 w-5" />}
                label="Total gastado"
                value={formatPrice(stats?.totalSpent ?? 0)}
                gradient="from-emerald-500 to-teal-400"
                to="/stats"
                isLoading={isLoading}
            />
            <StatCard
                icon={<Star className="h-5 w-5" />}
                label="V-Coins"
                value={points.toLocaleString()}
                gradient="from-yellow-500 to-amber-400"
                to="/loyalty"
                isLoading={isLoading}
            />
            <StatCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Nivel"
                value={tierLabel}
                gradient="from-violet-500 to-purple-400"
                to="/loyalty"
                isLoading={isLoading}
            />
        </section>
    );
}
