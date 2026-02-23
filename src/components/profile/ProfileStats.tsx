/**
 * ProfileStats — Grid de tarjetas con estadísticas del usuario.
 *
 * @module ProfileStats
 * @independent Componente 100% independiente. Lee auth + loyalty internamente.
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
 */
import { ShoppingBag, Wallet, Star, TrendingUp } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePointsBalance } from '@/hooks/useLoyalty';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl p-5 transition-all duration-500 glass-premium spotlight-container hover:-translate-y-1">
            {/* Background Glow */}
            <div className={cn(
                "absolute -top-10 -right-10 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity bg-gradient-to-br",
                gradient
            )} />

            <div className="relative z-10 flex flex-col gap-4">
                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-gradient-to-br",
                    gradient
                )}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-black uppercase tracking-widest text-theme-tertiary opacity-40 mb-1">{label}</p>
                    <p className="text-2xl font-black text-theme-primary tracking-tighter">{value}</p>
                </div>
            </div>
        </div>
    );
}

export function ProfileStats() {
    const { user, profile } = useAuth();
    const { data: points = 0 } = usePointsBalance(user?.id);

    const tier = profile?.customer_tier ?? 'bronze';
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    return (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Pedidos"
                value={profile?.total_orders ?? 0}
                gradient="from-blue-500 to-cyan-400"
            />
            <StatCard
                icon={<Wallet className="h-5 w-5" />}
                label="Total gastado"
                value={formatPrice(profile?.total_spent ?? 0)}
                gradient="from-emerald-500 to-teal-400"
            />
            <StatCard
                icon={<Star className="h-5 w-5" />}
                label="Puntos"
                value={points.toLocaleString()}
                gradient="from-yellow-500 to-amber-400"
            />
            <StatCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Nivel"
                value={tierLabel}
                gradient="from-violet-500 to-purple-400"
            />
        </section>
    );
}
