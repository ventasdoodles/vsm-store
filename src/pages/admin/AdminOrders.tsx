// Gestión de Pedidos (Admin) - VSM Store
import { useEffect, useState } from 'react';
import { ClipboardList, ChevronDown, ChevronUp, MapPin, Phone, User } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { getAllOrders, updateOrderStatus, ORDER_STATUSES, type OrderStatus } from '@/services/admin.service';

export function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const loadOrders = () => {
        setLoading(true);
        getAllOrders(statusFilter || undefined)
            .then(setOrders)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadOrders(); }, [statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error al actualizar el status');
        } finally { setUpdating(null); }
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-primary-100">Pedidos</h1>
                <p className="text-sm text-primary-500">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                <button onClick={() => setStatusFilter('')} className={cn('whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors', !statusFilter ? 'bg-primary-700 text-primary-100' : 'text-primary-500 hover:text-primary-300')}>
                    Todos
                </button>
                {ORDER_STATUSES.map((s) => (
                    <button key={s.value} onClick={() => setStatusFilter(s.value)} className={cn('whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors', statusFilter === s.value ? 'text-white' : 'text-primary-500 hover:text-primary-300')} style={statusFilter === s.value ? { backgroundColor: `${s.color}25`, color: s.color } : undefined}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4].map((i) => (<div key={i} className="h-20 animate-pulse rounded-2xl bg-primary-800/30" />))}</div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/60 py-16">
                    <ClipboardList className="h-12 w-12 text-primary-700 mb-3" />
                    <p className="text-sm text-primary-500">No hay pedidos{statusFilter ? ` con status "${statusFilter}"` : ''}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status);
                        const isExpanded = expandedId === order.id;
                        const items = order.items ?? [];
                        return (
                            <div key={order.id} className="rounded-2xl border border-primary-800/40 bg-primary-900/60 overflow-hidden transition-all">
                                {/* Order Header */}
                                <button onClick={() => setExpandedId(isExpanded ? null : order.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-primary-800/20 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-primary-500">#{order.id?.slice(-6).toUpperCase()}</span>
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${statusInfo?.color}15`, color: statusInfo?.color }}>
                                                {statusInfo?.label ?? order.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-primary-200 truncate">{order.customer_name || 'Sin nombre'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-primary-100">{formatPrice(order.total ?? 0)}</p>
                                        <p className="text-[11px] text-primary-500">{new Date(order.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-primary-500 shrink-0" />}
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="border-t border-primary-800/30 px-5 py-4 space-y-4">
                                        {/* Customer Info */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <div className="flex items-center gap-2 text-sm text-primary-400">
                                                <User className="h-3.5 w-3.5 text-primary-600" />
                                                {order.customer_name || '—'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-primary-400">
                                                <Phone className="h-3.5 w-3.5 text-primary-600" />
                                                {order.customer_phone || '—'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-primary-400">
                                                <MapPin className="h-3.5 w-3.5 text-primary-600" />
                                                {order.delivery_address || 'Recoger en tienda'}
                                            </div>
                                        </div>

                                        {/* Items */}
                                        {items.length > 0 && (
                                            <div className="rounded-xl border border-primary-800/30 overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead><tr className="border-b border-primary-800/20 bg-primary-950/40">
                                                        <th className="px-3 py-2 text-left font-medium text-primary-500">Producto</th>
                                                        <th className="px-3 py-2 text-center font-medium text-primary-500">Cant.</th>
                                                        <th className="px-3 py-2 text-right font-medium text-primary-500">Precio</th>
                                                    </tr></thead>
                                                    <tbody className="divide-y divide-primary-800/15">
                                                        {items.map((item: any, i: number) => (
                                                            <tr key={i}>
                                                                <td className="px-3 py-2 text-primary-300">{item.name || item.product_name || '—'}</td>
                                                                <td className="px-3 py-2 text-center text-primary-400">{item.quantity}</td>
                                                                <td className="px-3 py-2 text-right text-primary-300">{formatPrice(item.price * item.quantity)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Status Updater */}
                                        <div className="flex items-center gap-3 pt-2 border-t border-primary-800/20">
                                            <span className="text-xs font-medium text-primary-500">Cambiar status:</span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                disabled={updating === order.id}
                                                className="rounded-lg border border-primary-800/50 bg-primary-950/60 px-3 py-1.5 text-xs text-primary-200 focus:border-vape-500/50 focus:outline-none disabled:opacity-50"
                                            >
                                                {ORDER_STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                                            </select>
                                            {updating === order.id && <span className="text-[11px] text-vape-400 animate-pulse">Actualizando...</span>}
                                        </div>

                                        {/* Payment & Delivery Info */}
                                        <div className="flex flex-wrap gap-2 text-[11px]">
                                            {order.payment_method && <span className="rounded-full bg-primary-800/40 px-2.5 py-0.5 text-primary-400">Pago: {order.payment_method}</span>}
                                            {order.delivery_method && <span className="rounded-full bg-primary-800/40 px-2.5 py-0.5 text-primary-400">Envío: {order.delivery_method}</span>}
                                            {order.coupon_code && <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-amber-400">Cupón: {order.coupon_code}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
