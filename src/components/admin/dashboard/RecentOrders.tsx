/**
 * // ─── COMPONENTE: RecentOrders ───
 * // Arquitectura: Dumb Component (Visual Table)
 * // Propósito principal: Tabla preview de los últimos pedídos procesados, sirviendo como puente a AdminOrders.
 * // Regla / Notas: Mapea estados a chips visuales y provee links directos a los detalles de una orden.
 */
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, type AdminOrder } from '@/services/admin';

interface RecentOrdersProps {
    orders: AdminOrder[];
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
    return (
        <div className="rounded-[1.5rem] border border-white/5 bg-[#13141f]/70 backdrop-blur-md overflow-hidden shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-accent-primary/5">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[0.75rem] bg-accent-primary/10">
                        <Package className="h-5 w-5 text-accent-primary" />
                    </div>
                    <h2 className="text-sm font-bold text-white tracking-wide">Pedidos recientes</h2>
                </div>
                <Link
                    to="/admin/orders"
                    className="group flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:text-white transition-colors bg-accent-primary/10 hover:bg-accent-primary/20 px-4 py-2 rounded-full"
                >
                    Ver todos
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-12 w-12 text-theme-secondary/50 mb-4" />
                    <p className="text-sm font-medium text-theme-secondary">No hay pedidos recientes aún</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-left bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-bold text-theme-secondary uppercase tracking-[0.15em]">Orden</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-theme-secondary uppercase tracking-[0.15em]">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-theme-secondary uppercase tracking-[0.15em]">Total</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-theme-secondary uppercase tracking-[0.15em]">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-theme-secondary uppercase tracking-[0.15em]">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-theme-secondary uppercase tracking-[0.15em] text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map((order: AdminOrder) => {
                                const statusInfo = ORDER_STATUSES.find(
                                    (s) => s.value === order.status
                                );
                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-accent-primary/80">
                                            #{order.id?.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-white">
                                            {order.customer_name || 'Sin nombre'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-white">
                                            {formatPrice(order.total ?? 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-current/10"
                                                style={{
                                                    backgroundColor: `${statusInfo?.color}15`,
                                                    color: statusInfo?.color,
                                                }}
                                            >
                                                {statusInfo?.label ?? order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-theme-secondary">
                                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/orders?id=${order.id}`}
                                                className="inline-flex items-center justify-center p-2 rounded-[0.75rem] text-theme-secondary/70 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
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
