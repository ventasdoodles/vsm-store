// Página de pedidos - VSM Store
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, Package } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerOrders } from '@/hooks/useOrders';
import { ORDER_STATUS } from '@/services/orders.service';
import type { OrderStatus } from '@/services/orders.service';

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' },
];

export function Orders() {
    const { user } = useAuth();
    const { data: orders = [], isLoading } = useCustomerOrders(user?.id);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        document.title = 'Mis pedidos | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vape-500/10">
                    <ShoppingBag className="h-5 w-5 text-vape-400" />
                </div>
                <h1 className="text-xl font-bold text-theme-primary">Mis pedidos</h1>
            </div>

            {/* Filtros */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={cn(
                            'flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                            filter === f.value
                                ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                : 'border-theme text-theme-secondary hover:border-theme'
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-theme py-16 text-center">
                    <Package className="mx-auto mb-3 h-10 w-10 text-theme-secondary" />
                    <p className="text-sm text-theme-secondary">
                        {filter === 'all' ? 'Aún no tienes pedidos' : 'No hay pedidos con este estado'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order) => {
                        const status = ORDER_STATUS[order.status as OrderStatus] ?? ORDER_STATUS.pending;
                        const itemCount = Array.isArray(order.items) ? order.items.reduce((s, i) => s + (i.quantity ?? 1), 0) : 0;
                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="block rounded-xl border border-theme bg-theme-secondary/20 p-4 transition-all hover:border-theme hover:bg-theme-secondary/40"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-theme-primary">{order.order_number}</p>
                                        <p className="text-xs text-theme-secondary mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
                                        status.color, status.bg, status.border
                                    )}>
                                        {status.label}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-theme-secondary">{itemCount} artículo{itemCount !== 1 ? 's' : ''}</span>
                                    <span className="text-sm font-bold text-vape-400">{formatPrice(order.total)}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
