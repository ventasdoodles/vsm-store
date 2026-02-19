// Detalle de pedido - VSM Store
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, RotateCcw } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useOrder } from '@/hooks/useOrders';
import { useCartStore } from '@/stores/cart.store';
import { ORDER_STATUS } from '@/services/orders.service';
import { SITE_CONFIG } from '@/config/site';
import type { OrderStatus, OrderItem } from '@/services/orders.service';
import type { Product } from '@/types/product';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function OrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading } = useOrder(orderId);
    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);

    useEffect(() => {
        if (order) document.title = `Pedido ${order.order_number} | VSM Store`;
        return () => { document.title = 'VSM Store'; };
    }, [order]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-vape-500" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container-vsm py-16 text-center">
                <p className="text-theme-secondary">Pedido no encontrado</p>
                <Link to="/orders" className="mt-3 inline-block text-sm text-vape-400 hover:text-vape-300">← Volver a mis pedidos</Link>
            </div>
        );
    }

    const currentStatus = order.status as OrderStatus;
    const statusConfig = ORDER_STATUS[currentStatus] ?? ORDER_STATUS.pending;
    const isCancelled = currentStatus === 'cancelled';
    const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);
    const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];

    // Reordenar — solo necesitamos campos mínimos para el carrito
    const handleReorder = () => {
        items.forEach((item) => {
            addItem({
                id: item.product_id,
                name: item.name,
                price: item.price,
                images: item.image ? [item.image] : [],
                section: (item.section as 'vape' | '420') ?? 'vape',
            } as Product, item.quantity);
        });
        openCart();
    };

    // WhatsApp de soporte
    const handleWhatsApp = () => {
        const msg = `Hola, tengo una consulta sobre mi pedido *${order.order_number}*`;
        window.open(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to="/orders" className="rounded-lg p-2 text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-theme-primary">{order.order_number}</h1>
                    <p className="text-xs text-theme-secondary">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                    </p>
                </div>
                <span className={cn(
                    'ml-auto inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
                    statusConfig.color, statusConfig.bg, statusConfig.border
                )}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Timeline de status */}
            {!isCancelled && (
                <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4">
                    <div className="flex items-center justify-between">
                        {STATUS_STEPS.map((step, i) => {
                            const config = ORDER_STATUS[step];
                            const isActive = i <= currentStepIndex;
                            const isCurrent = i === currentStepIndex;
                            return (
                                <div key={step} className="flex flex-1 items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            'flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all',
                                            isCurrent
                                                ? `${config.border} ${config.bg} ${config.color}`
                                                : isActive
                                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                                    : 'border-theme text-theme-secondary'
                                        )}>
                                            {isActive ? '✓' : i + 1}
                                        </div>
                                        <span className={cn(
                                            'mt-1.5 text-[9px] font-medium',
                                            isActive ? 'text-theme-primary' : 'text-theme-secondary'
                                        )}>
                                            {config.label}
                                        </span>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={cn(
                                            'flex-1 h-0.5 mx-1',
                                            i < currentStepIndex ? 'bg-green-500/30' : 'bg-theme/50'
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notas de tracking */}
            {order.tracking_notes && (
                <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4">
                    <p className="text-xs font-medium text-theme-secondary mb-1">Notas de seguimiento</p>
                    <p className="text-sm text-theme-primary">{order.tracking_notes}</p>
                </div>
            )}

            {/* TICKET / RECIBO */}
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-none bg-theme-secondary/10 shadow-2xl">
                {/* Diente de sierra (CSS trick simple o border dashed) */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-theme/50 to-transparent opacity-50" />

                <div className="p-6 space-y-6">
                    <div className="text-center space-y-1 border-b border-dashed border-theme pb-6">
                        <div className="mx-auto h-12 w-12 rounded-full bg-theme-secondary/30 flex items-center justify-center mb-2">
                            <div className={cn("h-3 w-3 rounded-full", statusConfig.bg)} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">RECIBO DE VENTA</h2>
                        <p className="text-sm font-mono text-theme-secondary">#{order.order_number}</p>
                        <p className="text-xs text-theme-secondary">
                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                        </p>
                    </div>

                    {/* Items List (Mono) */}
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm font-mono">
                                <span className="text-theme-secondary truncate pr-4">
                                    {item.quantity}x {item.name}
                                </span>
                                <span className="text-theme-primary">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totales (Mono + Bold) */}
                    <div className="border-t border-dashed border-theme pt-4 space-y-2 font-mono text-sm">
                        <div className="flex justify-between text-theme-secondary">
                            <span>SUBTOTAL</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.shipping_cost > 0 && (
                            <div className="flex justify-between text-theme-secondary">
                                <span>ENVIO</span>
                                <span>{formatPrice(order.shipping_cost)}</span>
                            </div>
                        )}
                        {order.discount > 0 && (
                            <div className="flex justify-between text-herbal-400">
                                <span>DESCUENTO</span>
                                <span>-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-dashed border-theme mt-2">
                            <span>TOTAL</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>

                    {/* Footer del Ticket */}
                    <div className="text-center pt-4">
                        <p className="text-xs text-theme-secondary uppercase tracking-widest">Gracias por su compra</p>
                        <p className="text-[10px] text-theme-secondary mt-1">vsmstore.com</p>
                    </div>
                </div>

                {/* Diente de sierra abajo */}
                <div className="h-4 bg-theme-primary w-full" style={{
                    maskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
                    maskSize: '16px 16px',
                    maskPosition: '0 100%'
                }} />
            </div>

            {/* Pago */}
            <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4 text-sm">
                <div className="flex justify-between text-theme-secondary">
                    <span>Método de pago</span>
                    <span className="text-theme-primary capitalize">{order.payment_method === 'cash' ? 'Efectivo' : order.payment_method === 'transfer' ? 'Transferencia' : 'Tarjeta'}</span>
                </div>
                <div className="flex justify-between text-theme-secondary mt-1">
                    <span>Estado de pago</span>
                    <span className={cn(
                        'capitalize font-medium',
                        order.payment_status === 'paid' ? 'text-green-400' : order.payment_status === 'refunded' ? 'text-orange-400' : 'text-yellow-400'
                    )}>
                        {order.payment_status === 'paid' ? 'Pagado' : order.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                    </span>
                </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
                <button
                    onClick={handleReorder}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-theme py-3 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/20 transition-colors"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reordenar
                </button>
                <button
                    onClick={handleWhatsApp}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-herbal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-herbal-500/25 hover:bg-herbal-600 transition-all"
                >
                    <MessageCircle className="h-4 w-4" />
                    Contactar
                </button>
            </div>
        </div>
    );
}
