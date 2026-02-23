/**
 * ProfileStats — Grid de tarjetas con estadísticas del usuario.
 *
 * @module ProfileStats
 * @independent Componente 100% independiente. Lee auth + loyalty internamente.
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
 */
import { ShoppingBag, Wallet, Star, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
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
        <div className="group relative overflow-hidden rounded-xl border border-theme bg-theme-secondary/20 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-theme-secondary/40 hover:border-theme hover:shadow-lg hover:-translate-y-0.5">
            {/* Gradient accent */}
            <div className={`absolute -top-8 -right-8 h-16 w-16 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br ${gradient}`} />

            <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <p className="text-2xl font-bold text-theme-primary">{value}</p>
                <p className="text-xs text-theme-secondary mt-1">{label}</p>
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
