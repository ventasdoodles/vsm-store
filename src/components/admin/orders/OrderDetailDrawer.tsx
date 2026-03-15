// ─── COMPONENTE: PANEL DE DETALLES DEL PEDIDO (GOD MODE) ──────────────────────────
// Panel lateral deslizable (Off-canvas) que muestra la radiografía total de un pedido.
// Se invoca desde listados o tarjetas Kanban e inyecta toda la información vital:
// Productos, Precios, Direcciones, Notas de envío, Tracking y Acciones de Estado.
// Permite guardar el input del tracking y cambiar estados validando las transiciones.
// ───────────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
    Truck, MapPin, CreditCard, MessageCircle, Package,
    User, ChevronDown, ChevronRight, Hash, Save, Phone,
} from 'lucide-react';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { type AdminOrder, type OrderStatus, type OrderItem } from '@/services/admin';
import { ADMIN_ORDER_STATUSES_LIST, canTransitionTo, type AdminOrderStatus } from '@/lib/domain/orders';
import { formatPrice } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useNotification } from '@/hooks/useNotification';

interface OrderDetailDrawerProps {
    order: AdminOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (id: string, status: OrderStatus) => void;
    onPaymentStatusChange: (id: string, status: string) => void;
    onTrackingUpdate: (id: string, tracking: string) => void;
}

export function OrderDetailDrawer({ order, isOpen, onClose, onStatusChange, onPaymentStatusChange, onTrackingUpdate }: OrderDetailDrawerProps) {
    const notify = useNotification();
    const [trackingInput, setTrackingInput] = useState('');
    const [isEditingTracking, setIsEditingTracking] = useState(false);

    useEffect(() => {
        if (order) {
            setTrackingInput(order.tracking_notes || '');
            setIsEditingTracking(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.id]); // intentionally only re-run when order ID changes

    const handleSaveTracking = () => {
        if (!trackingInput.trim()) {
            notify.error('Guía vacía', 'Ingresa un número de guía válido.');
            return;
        }
        onTrackingUpdate(order!.id, trackingInput);
        setIsEditingTracking(false);
        notify.success('Guía guardada', 'El número de rastreo se actualizó.');
    };

    const handleWhatsApp = () => {
        if (!order?.customer_phone) {
            notify.warning('Sin teléfono', 'El cliente no tiene teléfono registrado.');
            return;
        }
        const stLabel = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === order.status)?.label || order.status;
        const msg = `Hola ${order.customer_name || ''}, tu pedido de VSM Store (#${order.id.slice(-6).toUpperCase()}) está en: *${stLabel}*.\n${order.tracking_notes ? `Guía: ${order.tracking_notes}` : ''}`;
        window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleStatusChange = (newStatus: string) => {
        if (!order || newStatus === order.status) return;
        if (!canTransitionTo(order.status as AdminOrderStatus, newStatus as AdminOrderStatus)) {
            notify.error('Transición inválida', `No se puede pasar de "${order.status}" a "${newStatus}".`);
            return;
        }
        onStatusChange(order.id, newStatus as OrderStatus);
        notify.success('Status actualizado', `Pedido movido a "${newStatus}".`);
    };

    const statusInfo = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === order?.status);

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={order ? `Pedido #${order.id.slice(-6).toUpperCase()}` : 'Detalle de Pedido'}
            width="max-w-2xl"
        >
            {!order ? null : (
                <div className="space-y-4">

                    {/* ── Status Badge + Selector ───────────────────── */}
                    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-5 w-1 rounded-full shrink-0" style={{ backgroundColor: statusInfo?.color }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary/60">Estado del Pedido</span>
                        </div>
                        <div className="relative">
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                style={{ borderLeftColor: statusInfo?.color, borderLeftWidth: '3px' }}
                                className="w-full appearance-none rounded-xl border border-white/10 bg-[#1a1c29] px-4 py-3 text-sm font-bold text-theme-primary focus:border-vape-500/50 focus:outline-none cursor-pointer transition-colors hover:border-white/20"
                            >
                                {ADMIN_ORDER_STATUSES_LIST.map(s => {
                                    const isCurrent = s.value === order.status;
                                    const allowed = canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus);
                                    return (
                                        <option key={s.value} value={s.value} disabled={!isCurrent && !allowed} className="bg-[#0d0e12] text-white">
                                            {s.label}{(!isCurrent && !allowed) ? ' (No permitido)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-secondary/40 pointer-events-none" />
                        </div>
                    </section>

                    {/* ── Cliente ───────────────────────────────────── */}
                    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10">
                                <User className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary/60">Cliente</span>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                            <p className="text-base font-black text-theme-primary">
                                {order.customer_name || 'Sin nombre registrado'}
                            </p>
                            {order.customer_phone && (
                                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-theme-secondary/60">
                                    <Phone className="h-3 w-3" />
                                    {order.customer_phone}
                                </div>
                            )}
                            {order.delivery_address && (
                                <div className="flex items-start gap-1.5 mt-1.5 text-xs text-theme-secondary/50">
                                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                    {order.delivery_address}
                                </div>
                            )}
                        </div>

                        {order.customer_phone && (
                            <button
                                onClick={handleWhatsApp}
                                className="group flex w-full items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm font-bold text-emerald-400">Notificar por WhatsApp</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-emerald-400/40 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        )}
                    </section>

                    {/* ── Tracking ──────────────────────────────────── */}
                    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary/60">Rastreo / Guía</span>
                        </div>

                        {isEditingTracking ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Número de guía o link de rastreo..."
                                    value={trackingInput}
                                    onChange={e => setTrackingInput(e.target.value)}
                                    autoFocus
                                    className="w-full rounded-xl border border-white/10 bg-[#1a1c29] px-4 py-2.5 text-sm font-mono text-theme-primary placeholder-theme-secondary/30 focus:border-emerald-500/40 focus:outline-none transition-colors"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => { setIsEditingTracking(false); setTrackingInput(order.tracking_notes || ''); }}
                                        className="px-4 py-2 text-xs font-bold text-theme-secondary/60 hover:text-theme-primary transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveTracking}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-4 py-2 text-xs font-black text-emerald-400 transition-colors"
                                    >
                                        <Save className="h-3.5 w-3.5" /> Guardar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Hash className="h-3.5 w-3.5 text-emerald-400/50 shrink-0" />
                                    {order.tracking_notes
                                        ? <span className="text-sm font-mono font-bold text-theme-primary truncate">{order.tracking_notes}</span>
                                        : <span className="text-sm text-theme-secondary/30 italic">Sin guía asignada</span>
                                    }
                                </div>
                                <button
                                    onClick={() => setIsEditingTracking(true)}
                                    className="shrink-0 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-theme-secondary/60 hover:border-white/15 hover:text-theme-primary transition-colors ml-3"
                                >
                                    {order.tracking_notes ? 'Editar' : 'Agregar'}
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── Pago & Envío ──────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-3">
                        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                            <div className="flex items-center gap-1.5 mb-2">
                                <CreditCard className="h-3.5 w-3.5 text-amber-400/70" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className={`inline-flex items-center self-start rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${
                                    order.payment_status === 'paid' 
                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                                        : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                }`}>
                                    {order.payment_method === 'transfer' ? 'Transferencia' : (order.payment_method || 'N/A')}
                                    {order.payment_status === 'paid' ? ' (Pagado)' : ' (Pendiente)'}
                                </span>
                                
                                {order.payment_status !== 'paid' && (
                                    <button
                                        onClick={() => onPaymentStatusChange(order.id, 'paid')}
                                        className="text-[10px] font-black uppercase tracking-tighter text-emerald-400 hover:text-emerald-300 transition-colors text-left"
                                    >
                                        [Confirmar Pago]
                                    </button>
                                )}
                            </div>
                            {order.coupon_code && (
                                <p className="mt-2 text-[11px] text-amber-400/60 font-mono">Cupón: {order.coupon_code}</p>
                            )}
                        </section>


                        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                            <div className="flex items-center gap-1.5 mb-2">
                                <MapPin className="h-3.5 w-3.5 text-purple-400/70" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary/50">Envío</span>
                            </div>
                            <p className="text-sm font-bold text-theme-primary capitalize">
                                {order.delivery_method || 'N/A'}
                            </p>
                        </section>
                    </div>

                    {/* ── Productos ─────────────────────────────────── */}
                    <section className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.01] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <Package className="h-4 w-4 text-theme-secondary/60" />
                                <span className="text-sm font-black text-theme-primary">Productos del Pedido</span>
                                <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[11px] font-bold text-theme-secondary/60">
                                    {order.items?.length ?? 0}
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-white/[0.04]">
                            {(order.items ?? []).map((item: OrderItem, i: number) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.03]">
                                        {item.image ? (
                                            <OptimizedImage
                                                src={item.image}
                                                alt={item.product_name || item.name || ''}
                                                className="h-full w-full object-cover"
                                                width={48}
                                                height={48}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-4 w-4 text-theme-secondary/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-theme-primary truncate">
                                            {item.product_name || item.name || '—'}
                                        </p>
                                        {item.variant_name && (
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                {item.variant_name}
                                            </p>
                                        )}
                                        <p className="text-xs text-theme-secondary/50 mt-0.5">
                                            {item.quantity} × {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-black text-theme-primary shrink-0">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-5 py-4">
                            <span className="text-xs font-black uppercase tracking-widest text-theme-secondary/50">Total Pagado</span>
                            <span className="text-2xl font-black text-theme-primary">{formatPrice(order.total)}</span>
                        </div>
                    </section>

                </div>
            )}
        </SideDrawer>
    );
}
