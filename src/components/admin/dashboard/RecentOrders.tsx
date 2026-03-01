import { Link } from 'react-router-dom';
import { Package, ArrowRight, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, type AdminOrder } from '@/services/admin';

interface RecentOrdersProps {
    orders: AdminOrder[];
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/60 overflow-hidden">
            <div className="flex items-center justify-between border-b border-theme px-5 py-4">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-vape-400" />
                    <h2 className="text-sm font-semibold text-theme-primary">Pedidos recientes</h2>
                </div>
                <Link
                    to="/admin/orders"
                    className="flex items-center gap-1 text-xs text-vape-400 hover:text-vape-300 transition-colors"
                >
                    Ver todos
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-10 w-10 text-accent-primary mb-3" />
                    <p className="text-sm text-theme-secondary">No hay pedidos aún</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-theme text-left">
                                <th className="px-5 py-3 text-xs font-medium text-theme-secondary uppercase tracking-wider">
                                    Orden
                                </th>
                                <th className="px-5 py-3 text-xs font-medium text-theme-secondary uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-5 py-3 text-xs font-medium text-theme-secondary uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-5 py-3 text-xs font-medium text-theme-secondary uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-xs font-medium text-theme-secondary uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-5 py-3 text-xs font-medium text-theme-secondary uppercase tracking-wider text-right">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-800/20">
                            {orders.map((order: AdminOrder) => {
                                const statusInfo = ORDER_STATUSES.find(
                                    (s) => s.value === order.status
                                );
                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-theme-secondary/20 transition-colors group"
                                    >
                                        <td className="px-5 py-3 font-mono text-xs text-theme-secondary">
                                            #{order.id?.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-3 text-theme-secondary">
                                            {order.customer_name || 'Sin nombre'}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-theme-primary">
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
                                        <td className="px-5 py-3 text-xs text-theme-secondary">
                                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link
                                                to={`/admin/orders?id=${order.id}`}
                                                className="inline-flex items-center justify-center p-1.5 rounded-lg text-theme-secondary hover:text-vape-400 hover:bg-vape-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Ver detalles del pedido"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
