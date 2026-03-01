import { useState, useEffect } from 'react';
import { Truck, MapPin, CreditCard, MessageCircle, Package, User, ChevronDown, ChevronRight, Hash } from 'lucide-react';
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
    onTrackingUpdate: (id: string, tracking: string) => void;
}

export function OrderDetailDrawer({ 
    order, 
    isOpen, 
    onClose, 
    onStatusChange,
    onTrackingUpdate 
}: OrderDetailDrawerProps) {
    const notify = useNotification();
    const [trackingInput, setTrackingInput] = useState('');
    const [isEditingTracking, setIsEditingTracking] = useState(false);

    useEffect(() => {
        if (order) {
            setTrackingInput(order.tracking_number || '');
            setIsEditingTracking(false);
        }
    }, [order]);

    if (!order) return null;

    const handleSaveTracking = () => {
        if (!trackingInput.trim()) {
            notify.error('Datos incompletos', 'Por favor ingresa un número de guía válido.');
            return;
        }
        onTrackingUpdate(order.id, trackingInput);
        setIsEditingTracking(false);
        notify.success('Tracking actualizado', 'El número de guía se ha guardado exitosamente.');
    };

    const handleWhatsAppDispatch = () => {
        if (!order.customer_phone) {
            notify.error('Falta número', 'El cliente no tiene un teléfono registrado.');
            return;
        }
        const stLabel = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === order.status)?.label || order.status;
        const msg = `Hola ${order.customer_name || ''},\n\nTu pedido de VSM Store (#${order.id.slice(-6).toUpperCase()}) ha sido actualizado a: *${stLabel}*.\n\n${order.tracking_number ? `Tu número de guía es: ${order.tracking_number}` : 'Pronto te daremos más detalles.'}`;
        const encoded = encodeURIComponent(msg);
        const phone = order.customer_phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
        notify.success('Cargando WhatsApp', 'Redirigiendo a la pantalla de chat...');
    };

    const handleStatusUpdate = (newStatus: string) => {
        if (newStatus === order.status) return;
        
        const targetStatus = newStatus as AdminOrderStatus;
        const currentStatus = order.status as AdminOrderStatus;

        if (!canTransitionTo(currentStatus, targetStatus)) {
            notify.error('Transición Inválida', `No se permite cambiar de ${currentStatus} a ${targetStatus}.`);
            return;
        }

        onStatusChange(order.id, targetStatus as OrderStatus);
        notify.success('Estado actualizado', `El pedido ahora está en "${targetStatus}".`);
    };

    const getStatusColor = (status: string) => {
        const found = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === status);
        return found?.color || '#ffffff';
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Pedido #${order.id.slice(-6).toUpperCase()}`}
        >
            <div className="bg-[#0F1115]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
                {/* Neon Glow FX Backings */}
                <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-[100px] -left-[100px] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Status & Customer */}
                    <div className="space-y-6">
                        
                        {/* Status Controls */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-5 shadow-inner backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-1 rounded-full bg-accent-primary shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                <h3 className="text-sm font-semibold tracking-widest text-white/60 uppercase">
                                    Estado del Pedido
                                </h3>
                            </div>
                            
                            <div className="relative">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    style={{ borderLeftColor: getStatusColor(order.status), borderLeftWidth: '4px' }}
                                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#14171F] px-4 py-3 text-sm text-white font-medium focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all cursor-pointer shadow-inner"
                                >
                                    {ADMIN_ORDER_STATUSES_LIST.map(s => {
                                        const isCurrent = s.value === order.status;
                                        const isAllowed = canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus);
                                        const disabled = !isCurrent && !isAllowed;
                                        
                                        return (
                                            <option 
                                                key={s.value} 
                                                value={s.value} 
                                                disabled={disabled}
                                                className={disabled ? 'text-white/30 bg-[#0F1115]' : 'text-white bg-[#1A1D24]'}
                                            >
                                                {s.label} {!isCurrent && disabled ? '(No permitido)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 pointer-events-none" />
                            </div>
                        </div>

                        {/* Customer Profile */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md space-y-4 shadow-inner hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <User className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold tracking-widest text-white/60 uppercase">
                                    Cliente
                                </h3>
                            </div>
                            
                            <div className="bg-[#14171F] rounded-xl border border-white/5 p-4 flex flex-col gap-1 shadow-inner">
                                <span className="text-white font-medium text-lg tracking-tight">
                                    {order.customer_name || 'Sin nombre registrado'}
                                </span>
                                <span className="text-white/40 text-sm font-mono tracking-tight">
                                    {order.customer_phone || 'Sin teléfono registrado'}
                                </span>
                            </div>

                            {order.customer_phone ? (
                                <button 
                                    onClick={handleWhatsAppDispatch}
                                    className="group flex w-full items-center justify-between rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 px-4 py-3 transition-all backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="h-5 w-5 text-[#25D366]" />
                                        <span className="text-sm font-medium text-[#25D366]">Notificar por WhatsApp</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-[#25D366]/50 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                                </button>
                            ) : (
                                <div className="text-center p-3 rounded-xl border border-dashed border-white/10 text-white/30 text-xs font-medium">
                                    Sin número de teléfono asociado
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Tracking & Logistics */}
                    <div className="space-y-6">

                        {/* Tracking Info */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md hover:bg-white/[0.04] transition-all shadow-inner">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Truck className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold tracking-widest text-white/60 uppercase">
                                    Rastreo / Envíos
                                </h3>
                            </div>

                            {isEditingTracking ? (
                                <div className="flex flex-col gap-3 bg-[#14171F] p-4 rounded-xl border border-white/5 shadow-inner">
                                    <input 
                                        type="text"
                                        placeholder="Ingrese el número de guía / link"
                                        value={trackingInput}
                                        onChange={e => setTrackingInput(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder-white/30 focus:border-emerald-500/50 focus:outline-none font-mono shadow-inner"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            onClick={() => { setIsEditingTracking(false); setTrackingInput(order.tracking_number || ''); }}
                                            className="px-3 py-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleSaveTracking}
                                            className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-400 transition-colors"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-[#14171F] border border-white/5 rounded-xl p-4 shadow-inner hover:border-white/10 transition-colors">
                                    {order.tracking_number ? (
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Hash className="h-4 w-4 text-emerald-400/50 flex-shrink-0" />
                                            <span className="text-sm font-mono text-white/90 truncate font-semibold tracking-wider">
                                                {order.tracking_number}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-white/30 italic font-medium">Sin guía asignada</span>
                                    )}
                                    <button 
                                        onClick={() => setIsEditingTracking(true)}
                                        className="rounded-md bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white transition-all border border-white/5 hover:border-white/10"
                                    >
                                        {order.tracking_number ? 'Editar' : 'Agregar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment & Delivery Blocks */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-white/5 bg-[#14171F] p-5 shadow-inner hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="h-4 w-4 text-purple-400" />
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                        Envío
                                    </span>
                                </div>
                                <p className="text-sm text-white font-semibold capitalize">{order.delivery_method || 'N/A'}</p>
                                {order.delivery_address && (
                                    <p className="text-[11px] text-white/40 line-clamp-3 leading-relaxed mt-1">{order.delivery_address}</p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#14171F] p-5 shadow-inner hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <CreditCard className="h-4 w-4 text-amber-400" />
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                        Pago
                                    </span>
                                </div>
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20 capitalize">
                                    {order.payment_method === 'transfer' ? 'Transferencia' : order.payment_method}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Cart Items Table */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-inner overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                <Package className="h-5 w-5 text-white/80" />
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Productos del Pedido</h3>
                            <span className="ml-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold font-mono border border-white/5">
                                {order.items?.length || 0}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {order.items?.map((item: OrderItem, i: number) => (
                            <div key={i} className="group relative flex gap-5 p-4 rounded-xl border border-white/5 bg-[#14171F] hover:bg-white/[0.04] transition-all shadow-inner hover:border-white/10">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-inner">
                                    {item.image ? (
                                        <OptimizedImage 
                                            src={item.image} 
                                            alt={item.product_name || item.name || ''}
                                            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            width={80}
                                            height={80}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-[#1A1D24] flex items-center justify-center">
                                            <Package className="h-6 w-6 text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
                                    <p className="text-sm font-bold text-white truncate mb-2" title={item.product_name || item.name}>
                                        {item.product_name || item.name || '—'}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-white/70 font-mono border border-white/5">
                                            {item.quantity} und
                                        </span>
                                        <span className="text-xs text-white/40">{formatPrice(item.price)} c/u</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-end pl-4 border-l border-white/5">
                                    <span className="text-base font-black text-white font-mono tracking-tight">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Total */}
                    <div className="p-6 bg-[#1A1D24]/80 border-t border-white/5 flex justify-end items-end backdrop-blur-xl">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">Total Pagado</span>
                            <span className="text-4xl font-black text-white tracking-tighter mt-1">
                                {formatPrice(order.total)}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </SideDrawer>
    );
}