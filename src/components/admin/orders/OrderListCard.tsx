// ─── COMPONENTE: TARJETA DE PEDIDO LIGERA ───────────────────────────────────────────
// Vista expandible en formato lista para administrar un pedido a la vez.
// Incorpora transiciones de estado validadas desde el Domain Model, actualizaciones
// optimistas de guía de rastreo y botones de contacto rápido vía WhatsApp.
// Implementa efectos unificados con el Theme Premium (bg-black/20 y hover).
// ───────────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ChevronDown, MapPin, Phone, User, Loader2, Truck, Save, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { type AdminOrder, type OrderStatus, type OrderItem } from '@/services/admin';
import { canTransitionTo, ADMIN_ORDER_STATUSES_LIST, type AdminOrderStatus } from '@/lib/domain/orders';
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
        notify.success('Guía guardada', 'El número de guía se actualizó correctamente.');
    };

    const handleNotifyWhatsApp = () => {
        if (!order.customer_phone) {
            notify.warning('Sin teléfono', 'El cliente no tiene un número de teléfono registrado.');
            return;
        }
        const msg = `Hola ${order.customer_name || ''}, tu pedido de VSM Store ha sido enviado. Tu número de guía es: *${trackingInput}*. ¡Gracias por tu compra!`;
        const phone = order.customer_phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="rounded-[1.5rem] border border-white/5 bg-black/20 hover:border-white/10 hover:bg-black/40 transition-all duration-300 overflow-hidden group">
            {/* Header Row */}
            <button
                onClick={() => onOrderClick ? onOrderClick() : setIsExpanded(!isExpanded)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-theme-secondary/60">
                            #{order.id?.slice(-6).toUpperCase()}
                        </span>
                        <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
                            style={{ backgroundColor: `${statusInfo?.color}18`, color: statusInfo?.color, border: `1px solid ${statusInfo?.color}30` }}
                        >
                            {statusInfo?.label ?? order.status}
                        </span>
                    </div>
                    <p className="mt-1 text-sm font-black text-theme-primary truncate">
                        {order.customer_name || 'Sin nombre'}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm font-black text-theme-primary">{formatPrice(order.total ?? 0)}</p>
                    <p className="text-[11px] text-theme-secondary/60 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                    </p>
                </div>
                <div className={`shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDown className="h-5 w-5 text-theme-secondary/40 group-hover:text-theme-secondary transition-colors" />
                </div>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
                <div className="border-t border-white/5 px-5 py-4 space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                            { icon: User, text: order.customer_name || '—' },
                            { icon: Phone, text: order.customer_phone || '—' },
                            { icon: MapPin, text: order.delivery_address || 'Recoger en tienda' },
                        ].map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-theme-secondary/80">
                                <Icon className="h-3.5 w-3.5 text-theme-secondary/40 shrink-0" />
                                <span className="truncate">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Items Table */}
                    {items.length > 0 && (
                        <div className="rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="px-3 py-2 text-left text-[10px] font-black tracking-widest text-theme-secondary/50 uppercase">Producto</th>
                                        <th className="px-3 py-2 text-center text-[10px] font-black tracking-widest text-theme-secondary/50 uppercase">Cant.</th>
                                        <th className="px-3 py-2 text-right text-[10px] font-black tracking-widest text-theme-secondary/50 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {items.map((item: OrderItem, i: number) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-3 py-2.5 text-theme-secondary/80">{item.name || item.product_name || '—'}</td>
                                            <td className="px-3 py-2.5 text-center text-theme-secondary/60">{item.quantity}</td>
                                            <td className="px-3 py-2.5 text-right font-bold text-theme-primary">{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Status + Tracking Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-white/5">
                        {/* Status Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-widest text-theme-secondary/50">Status:</span>
                            <select
                                value={order.status}
                                onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                                disabled={isUpdating}
                                className="rounded-lg border border-white/10 bg-[#1a1c29] px-3 py-1.5 text-xs font-medium text-theme-primary focus:border-vape-500/50 focus:outline-none disabled:opacity-50 transition-colors hover:border-white/20"
                            >
                                {ADMIN_ORDER_STATUSES_LIST.map((s) => {
                                    const isCurrent = order.status === s.value;
                                    const allowed = canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus);
                                    return (
                                        <option key={s.value} value={s.value} disabled={!allowed && !isCurrent}>
                                            {s.label}{(!allowed && !isCurrent) ? ' (No permitido)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {isUpdating && (
                                <span className="flex items-center gap-1 text-[11px] text-blue-400/80">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
                                </span>
                            )}
                        </div>

                        {/* Tracking input */}
                        <div className="flex items-center gap-2 sm:ml-auto">
                            <Truck className="h-4 w-4 text-theme-secondary/40 shrink-0" />
                            <input
                                type="text"
                                placeholder="Número de guía..."
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                className="w-36 rounded-lg border border-white/10 bg-[#1a1c29] px-3 py-1.5 text-xs text-theme-primary placeholder-theme-secondary/30 focus:border-vape-500/50 focus:outline-none transition-colors hover:border-white/20"
                            />
                            <button
                                onClick={handleSaveTracking}
                                disabled={trackingInput === (order.tracking_number || '')}
                                className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-theme-secondary/60 hover:border-white/20 hover:text-theme-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Guardar número de guía"
                            >
                                <Save className="h-3.5 w-3.5" />
                            </button>
                            {trackingInput && (
                                <button
                                    onClick={handleNotifyWhatsApp}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                                    title="Notificar por WhatsApp"
                                >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                        {order.payment_method && (
                            <span className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-0.5 text-theme-secondary/70">
                                Pago: {order.payment_method}
                            </span>
                        )}
                        {order.delivery_method && (
                            <span className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-0.5 text-theme-secondary/70">
                                Envío: {order.delivery_method}
                            </span>
                        )}
                        {order.coupon_code && (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-amber-400/90 font-bold">
                                Cupón: {order.coupon_code}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
