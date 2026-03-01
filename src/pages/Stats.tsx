// Página de estadísticas - VSM Store
import { useEffect } from 'react';
import { BarChart3, Loader2, ShoppingBag, TrendingUp, Flame, Leaf } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerStats, useTopProducts, useSpendingHistory } from '@/hooks/useStats';

export function Stats() {
    const { user } = useAuth();
    const { data: stats, isLoading: loadingStats } = useCustomerStats(user?.id);
    const { data: topProducts = [], isLoading: loadingTop } = useTopProducts(user?.id);
    const { data: spending = [], isLoading: loadingSpending } = useSpendingHistory(user?.id);

    useEffect(() => {
        document.title = 'Mis estadísticas | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    const isLoading = loadingStats || loadingTop || loadingSpending;

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-vape-500" />
            </div>
        );
    }

    if (!stats || stats.totalOrders === 0) {
        return (
            <div className="container-vsm py-16 text-center">
                <BarChart3 className="mx-auto mb-3 h-12 w-12 text-accent-primary" />
                <h2 className="text-lg font-bold text-theme-secondary mb-1">Sin datos aún</h2>
                <p className="text-sm text-accent-primary">Realiza tu primera compra para ver tus estadísticas</p>
            </div>
        );
    }

    // Encontrar gasto máximo mensual para escalar barras
    const maxSpending = Math.max(...spending.map((s) => s.total), 1);

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vape-500/10">
                    <BarChart3 className="h-5 w-5 text-vape-400" />
                </div>
                <h1 className="text-xl font-bold text-theme-primary">Mis estadísticas</h1>
            </div>

            {/* ─── SECCIÓN 1: Resumen general ─── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total gastado', value: formatPrice(stats.totalSpent), color: 'text-vape-400' },
                    { label: 'Pedidos', value: stats.totalOrders.toString(), color: 'text-herbal-400' },
                    { label: 'Ticket promedio', value: formatPrice(stats.averageTicket), color: 'text-yellow-400' },
                    { label: 'Sección favorita', value: stats.favoriteSection === '420' ? '420 🌿' : 'Vape 💨', color: 'text-accent-primary' },
                ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-theme bg-theme-primary/30 p-4 text-center">
                        <p className="text-xs font-medium text-accent-primary uppercase tracking-wider mb-1">{item.label}</p>
                        <p className={cn('text-lg font-bold', item.color)}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* ─── SECCIÓN 2: Top productos ─── */}
            {topProducts.length > 0 && (
                <div className="rounded-xl border border-theme bg-theme-primary/30 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-theme-secondary flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-vape-400" /> Productos más comprados
                    </h3>
                    <div className="space-y-2">
                        {topProducts.map((p, i) => (
                            <div key={p.product_id} className="flex items-center gap-3 py-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-secondary text-[11px] font-bold text-theme-secondary">
                                    #{i + 1}
                                </span>
                                {p.image ? (
                                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-theme-secondary" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-theme-secondary text-accent-primary text-xs">📦</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-theme-primary truncate">{p.name}</p>
                                    <p className="text-xs text-accent-primary">
                                        {p.timesBought}x comprado · {formatPrice(p.totalSpent)} gastado
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── SECCIÓN 3: Gasto por mes (barras) ─── */}
            {spending.length > 0 && (
                <div className="rounded-xl border border-theme bg-theme-primary/30 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-theme-secondary flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-herbal-400" /> Gasto por mes
                    </h3>
                    <div className="flex items-end gap-2 h-40">
                        {spending.map((s) => {
                            const height = s.total > 0 ? Math.max(8, (s.total / maxSpending) * 100) : 4;
                            return (
                                <div key={s.month} className="flex flex-1 flex-col items-center gap-1">
                                    <span className="text-[9px] text-theme-secondary font-medium">
                                        {s.total > 0 ? formatPrice(s.total) : ''}
                                    </span>
                                    <div
                                        className={cn(
                                            'w-full rounded-t-lg transition-all duration-300',
                                            s.total > 0 ? 'bg-gradient-to-t from-vape-600 to-vape-400' : 'bg-theme-secondary/40'
                                        )}
                                        style={{ height: `${height}%` }}
                                    />
                                    <span className="text-xs text-accent-primary">{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── SECCIÓN 4: Preferencias ─── */}
            <div className="rounded-xl border border-theme bg-theme-primary/30 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-theme-secondary">Preferencias</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-lg bg-theme-secondary/30 p-3">
                        {stats.favoriteSection === '420' ? (
                            <Leaf className="h-5 w-5 text-herbal-400" />
                        ) : (
                            <Flame className="h-5 w-5 text-vape-400" />
                        )}
                        <div>
                            <p className="text-xs text-accent-primary uppercase">Sección favorita</p>
                            <p className="text-sm font-medium text-theme-primary">
                                {stats.favoriteSection === '420' ? 'Herbal 420' : 'Vape'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-theme-secondary/30 p-3">
                        <span className="text-lg">💳</span>
                        <div>
                            <p className="text-xs text-accent-primary uppercase">Método de pago</p>
                            <p className="text-sm font-medium text-theme-primary capitalize">
                                {stats.preferredPayment === 'cash' ? 'Efectivo' : stats.preferredPayment === 'transfer' ? 'Transferencia' : stats.preferredPayment ?? 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-theme-secondary/30 p-3">
                        <span className="text-lg">📦</span>
                        <div>
                            <p className="text-xs text-accent-primary uppercase">Total pedidos</p>
                            <p className="text-sm font-medium text-theme-primary">{stats.totalOrders} pedidos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
