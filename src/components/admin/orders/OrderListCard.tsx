import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone, User, Loader2, Truck, Save, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { type AdminOrder, type OrderStatus, type OrderItem } from '@/services/admin';
import { canTransitionTo, ADMIN_ORDER_STATUSES_LIST } from '@/lib/domain/orders';
import type { AdminOrderStatus } from '@/lib/domain/orders';
import { useNotification } from '@/hooks/useNotification';

interface OrderListCardProps {
    order: AdminOrder;
    isUpdating: boolean;
    onStatusChange: (id: string, status: OrderStatus) => void;
    onTrackingChange: (id: string, tracking: string) => void;
    onOrderClick?: () => void;
}

export function OrderListCard({ order, isUpdating, onStatusChange, onTrackingChange, onOrderClick }: OrderListCardProps) {
    const notify = useNotification();
    const [isExpanded, setIsExpanded] = useState(false);
    const [trackingInput, setTrackingInput] = useState(order.tracking_number || '');
    const statusInfo = ADMIN_ORDER_STATUSES_LIST.find((s) => s.value === order.status);
    const items = order.items ?? [];

    const handleSaveTracking = () => {
        onTrackingChange(order.id, trackingInput);
    };

    const handleNotifyWhatsApp = () => {
        if (!order.customer_phone) {
            notify.warning('Datos Incompletos', 'El cliente no tiene un número de teléfono registrado.');
            return;
        }
        const msg = `Hola ${order.customer_name || ''}, tu pedido de VSM Store ha sido enviado. Tu número de guía es: *${trackingInput}*. ¡Gracias por tu compra!`;
        const phone = order.customer_phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="rounded-2xl bg-[#0F1115]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 relative overflow-hidden">
            {/* Order Header */}
            <button
                onClick={() => onOrderClick ? onOrderClick() : setIsExpanded(!isExpanded)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-theme-secondary/20 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-theme-secondary">
                            #{order.id?.slice(-6).toUpperCase()}
                        </span>
                        <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: `${statusInfo?.color}15`, color: statusInfo?.color }}
                        >
                            {statusInfo?.label ?? order.status}
                        </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-theme-primary truncate">
                        {order.customer_name || 'Sin nombre'}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-theme-primary">{formatPrice(order.total ?? 0)}</p>
                    <p className="text-[11px] text-theme-secondary">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-theme-secondary shrink-0" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-theme-secondary shrink-0" />
                )}
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
                <div className="border-t border-theme px-5 py-4 space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm text-theme-secondary">
                            <User className="h-3.5 w-3.5 text-accent-primary" />
                            {order.customer_name || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary">
                            <Phone className="h-3.5 w-3.5 text-accent-primary" />
                            {order.customer_phone || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary">
                            <MapPin className="h-3.5 w-3.5 text-accent-primary" />
                            {order.delivery_address || 'Recoger en tienda'}
                        </div>
                    </div>

                    {/* Items */}
                    {items.length > 0 && (
                        <div className="rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 bg-theme-primary/40">
                                        <th className="px-3 py-2 text-left text-[10px] tracking-widest text-theme-secondary/70 uppercase">Producto</th>
                                        <th className="px-3 py-2 text-center text-[10px] tracking-widest text-theme-secondary/70 uppercase">Cant.</th>
                                        <th className="px-3 py-2 text-right text-[10px] tracking-widest text-theme-secondary/70 uppercase">Precio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map((item: OrderItem, i: number) => (
                                        <tr key={i}>
                                            <td className="px-3 py-2 text-theme-secondary">
                                                {item.name || item.product_name || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-center text-theme-secondary">{item.quantity}</td>
                                            <td className="px-3 py-2 text-right text-theme-secondary">
                                                {formatPrice(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Status Updater & Tracking */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-theme-subtle">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-theme-secondary">Cambiar status:</span>
                            <select
                                value={order.status}
                                onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                                disabled={isUpdating}
                                className="rounded-lg border border-white/10 bg-[#13141f] px-3 py-1.5 text-xs text-theme-primary focus:border-vape-500/50 focus:outline-none disabled:opacity-50"
                            >
                                {ADMIN_ORDER_STATUSES_LIST.map((s) => {
                                    const allowed = canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus);
                                    const isCurrent = order.status === s.value;
                                    const disabled = !allowed && !isCurrent;
                                    return (
                                        <option key={s.value} value={s.value} disabled={disabled}>
                                            {s.label} {disabled ? '(No permitido)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {isUpdating && (
                                <span className="flex items-center gap-1 text-[11px] text-vape-400">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Actualizando...
                                </span>
                            )}
                        </div>

                        {/* Tracking Number Superpower */}
                        <div className="flex items-center gap-2 sm:ml-auto">
                            <Truck className="h-4 w-4 text-theme-secondary" />
                            <input
                                type="text"
                                placeholder="Número de guía..."
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                className="w-40 rounded-lg border border-white/10 bg-[#13141f] px-3 py-1.5 text-xs text-theme-primary focus:border-vape-500/50 focus:outline-none"
                            />
                            <button
                                onClick={handleSaveTracking}
                                disabled={trackingInput === (order.tracking_number || '')}
                                className="p-1.5 rounded-lg border border-white/10 bg-[#13141f] text-theme-secondary hover:border-white/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Guardar número de guía"
                            >
                                <Save className="h-4 w-4" />
                            </button>
                            {trackingInput && (
                                <button
                                    onClick={handleNotifyWhatsApp}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-colors"
                                    title="Notificar por WhatsApp"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Payment & Delivery Info */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                        {order.payment_method && (
                            <span className="rounded-full bg-theme-secondary/40 px-2.5 py-0.5 text-theme-secondary">
                                Pago: {order.payment_method}
                            </span>
                        )}
                        {order.delivery_method && (
                            <span className="rounded-full bg-theme-secondary/40 px-2.5 py-0.5 text-theme-secondary">
                                Envío: {order.delivery_method}
                            </span>
                        )}
                        {order.coupon_code && (
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-amber-400">
                                Cupón: {order.coupon_code}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
