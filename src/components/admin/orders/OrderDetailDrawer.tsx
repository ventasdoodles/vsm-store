import React, { useState } from 'react';
import { Truck, MapPin, CreditCard, MessageCircle, Package, Link as LinkIcon, User } from 'lucide-react';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { type AdminOrder, type OrderStatus, ORDER_STATUSES } from '@/services/admin';
import { formatPrice } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

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
    const [trackingInput, setTrackingInput] = useState('');
    const [isEditingTracking, setIsEditingTracking] = useState(false);

    // Reset state when opening a new order
    React.useEffect(() => {
        if (order) {
            setTrackingInput(order.tracking_number || '');
            setIsEditingTracking(false);
        }
    }, [order]);

    if (!order) return null;

    const handleSaveTracking = () => {
        onTrackingUpdate(order.id, trackingInput);
        setIsEditingTracking(false);
    };

    const handleWhatsAppDispatch = () => {
        if (!order.customer_phone) return;
        const msg = `Hola ${order.customer_name || ''},\n\nTu pedido de VSM Store (#${order.id.slice(-6).toUpperCase()}) ha sido actualizado a: *${ORDER_STATUSES.find(s => s.value === order.status)?.label}*.\n\n${order.tracking_number ? `Tu número de guía es: ${order.tracking_number}` : 'Pronto te daremos más detalles.'}`;
        const encoded = encodeURIComponent(msg);
        const phone = order.customer_phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Pedido #${order.id.slice(-6).toUpperCase()}`}
            width="max-w-md w-full"
        >
            <div className="space-y-6">
                
                {/* 1. Status y Acciones Rápidas */}
                <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4">
                    <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2 block">
                        Estado del Pedido
                    </label>
                    <div className="flex gap-3 items-center">
                        <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                            className="flex-1 rounded-lg border border-theme bg-theme-primary px-3 py-2 text-sm text-theme-primary focus:border-theme focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            {ORDER_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2. Tracking / Envío */}
                <div className="rounded-xl border border-theme bg-theme-primary p-4 space-y-3">
                    <div className="flex items-center gap-2 text-theme-primary">
                        <Truck className="h-5 w-5 text-accent-primary" />
                        <h3 className="font-medium">Rastreo de Envío</h3>
                    </div>
                    
                    {isEditingTracking ? (
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="Número de Guía / Link"
                                value={trackingInput}
                                onChange={e => setTrackingInput(e.target.value)}
                                className="flex-1 rounded-md border border-theme bg-transparent px-3 py-1 text-sm focus:border-theme focus:outline-none text-theme-primary"
                            />
                            <button 
                                onClick={handleSaveTracking}
                                className="rounded bg-accent-primary px-3 py-1 text-sm text-white hover:bg-accent-primary"
                            >
                                Guardar
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-theme-secondary/30 rounded-lg p-3">
                            {order.tracking_number ? (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <LinkIcon className="h-4 w-4 text-theme-secondary flex-shrink-0" />
                                    <span className="text-sm font-mono text-theme-primary truncate">
                                        {order.tracking_number}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-theme-secondary italic">Sin guía asiganda</span>
                            )}
                            <button 
                                onClick={() => setIsEditingTracking(true)}
                                className="text-xs text-primary-400 hover:text-primary-300 whitespace-nowrap ml-2"
                            >
                                {order.tracking_number ? 'Editar' : 'Añadir'}
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Cliente y Contacto */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                        <User className="h-5 w-5" /> Cliente
                    </h3>
                    <div className="rounded-xl border border-theme bg-theme-primary p-4 text-sm space-y-3">
                        <div>
                            <p className="font-medium text-theme-primary">{order.customer_name || 'Desconocido'}</p>
                        </div>
                        
                        {order.customer_phone && (
                            <div className="pt-2 border-t border-theme-subtle">
                                <button 
                                    onClick={handleWhatsAppDispatch}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366]/20 py-2 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Enviar actualización por WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Dirección y Pago */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-theme bg-theme-primary p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-theme-secondary" />
                            <span className="text-xs font-semibold text-theme-secondary uppercase">Envío</span>
                        </div>
                        <p className="text-sm text-theme-primary capitalize">{order.delivery_method || 'N/A'}</p>
                        {order.delivery_address && (
                            <p className="text-xs text-theme-secondary mt-1 line-clamp-2">
                                {order.delivery_address}
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl border border-theme bg-theme-primary p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-theme-secondary" />
                            <span className="text-xs font-semibold text-theme-secondary uppercase">Pago</span>
                        </div>
                        <p className="text-sm text-theme-primary capitalize">
                            {order.payment_method === 'transfer' ? 'Transferencia / Depósito' : order.payment_method}
                        </p>
                    </div>
                </div>

                {/* 5. Productos */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                        <Package className="h-5 w-5" /> Productos ({order.items?.length || 0})
                    </h3>
                    <div className="rounded-xl border border-theme bg-theme-primary divide-y divide-white/10">
                        {order.items?.map((item: any) => (
                            <div key={item.id} className="flex gap-3 p-3">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-theme-subtle bg-theme-secondary/50">
                                    {item.product?.image_url ? (
                                        <OptimizedImage 
                                            src={item.product.image_url} 
                                            alt={item.product_name}
                                            className="h-full w-full object-cover"
                                            width={48}
                                            height={48}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-theme-secondary/80 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-theme-secondary" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-theme-primary truncate" title={item.product_name}>
                                        {item.product_name}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-theme-secondary">
                                            {item.quantity} x {formatPrice(item.unit_price)}
                                        </p>
                                        <p className="text-sm font-semibold text-theme-primary">
                                            {formatPrice(item.total_price)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Totales */}
                        <div className="p-4 space-y-2 bg-theme-secondary/10 rounded-b-xl">
                            <div className="flex justify-between font-bold text-theme-primary text-lg pt-2 border-t border-theme-subtle">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </SideDrawer>
    );
}
