/**
 * // ─── PÁGINA: ORDER DETAIL ───
 * // Propósito: Visualización detallada de una adquisición (Recibo Cinemático).
 * // Arquitectura: Pure presentation with domain hooks integration (§1.1).
 * // Estilo: High-End Premium Receipt & Cinematic Timeline (§2.1).
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Loader2, 
    Clock,
    XCircle,
    MessageCircle,
    RotateCcw,
    Copy, 
    CheckCircle2, 
    Package, 
    Truck, 
    CreditCard,
    Sparkles,
    ShieldCheck,
    Zap,
    type LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useOrder, ORDER_STATUS } from '@/hooks/useOrders';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { SEO } from '@/components/seo/SEO';
import { SITE_CONFIG } from '@/config/site';
import type { OrderStatus, OrderItem } from '@/hooks/useOrders';
import type { Product } from '@/types/product';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
    pending: Clock,
    confirmed: ShieldCheck,
    processing: Zap,
    shipped: Truck,
    delivered: Package,
    cancelled: XCircle
};

export function OrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading } = useOrder(orderId);
    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);
    const notify = useNotification();

    useEffect(() => {
        if (order) document.title = `Pedido ${order.order_number} | VSM Store`;
        return () => { document.title = 'VSM Store'; };
    }, [order]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary animate-pulse">Consultando Archivo...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container-vsm py-32 text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Package size={40} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic">Adquisición No Encontrada</h2>
                <Link to="/orders" className="vsm-button-primary inline-flex">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Bitácora
                </Link>
            </div>
        );
    }

    const currentStatus = order.status as OrderStatus;
    const statusConfig = ORDER_STATUS[currentStatus] ?? ORDER_STATUS.pending;
    const isCancelled = currentStatus === 'cancelled';
    const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);
    const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];

    // Reordenar — construye objetos Product completos
    const handleReorder = () => {
        const now = new Date().toISOString();
        items.forEach((item) => {
            addItem({
                id: item.product_id,
                name: item.name,
                price: item.price,
                images: item.image ? [item.image] : [],
                cover_image: item.image ?? null,
                section: (item.section as 'vape' | '420') ?? 'vape',
                is_active: true,
                status: 'active' as const,
                stock: 99,
                slug: '',
                created_at: now,
                updated_at: now,
            } as Product, item.quantity);
        });
        notify.success('Carrito Actualizado', 'Productos re-integrados exitosamente.');
        openCart();
    };

    const handleWhatsApp = () => {
        const msg = `Hola, tengo una consulta sobre mi pedido *${order.order_number}* de fecha ${new Date(order.created_at).toLocaleDateString()}.`;
        window.open(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="container-vsm py-12 space-y-12 max-w-4xl">
            <SEO title={`Pedido ${order.order_number}`} />

            {/* Header Cinemático Detalle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-6">
                    <Link to="/orders" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-theme-secondary hover:bg-white/10 hover:text-white transition-all shadow-xl">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">{order.order_number}</h1>
                            <Sparkles className="h-4 w-4 text-accent-primary animate-pulse" />
                        </div>
                        <p className="text-[10px] text-theme-tertiary font-black uppercase tracking-[0.2em] opacity-60">
                            Registro de compra: {new Date(order.created_at).toLocaleDateString('es-MX', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
                <div className={cn(
                    'inline-flex items-center gap-3 rounded-2xl border px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-2xl',
                    statusConfig.color, statusConfig.bg, statusConfig.border
                )}>
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", statusConfig.bg.replace('/10', ''))} />
                    {statusConfig.label}
                </div>
            </div>

            {/* Status Banner */}
            <div className={cn(
                "rounded-[2.5rem] border p-8 space-y-4 mb-8 relative overflow-hidden group/banner",
                statusConfig.bg, statusConfig.border
            )}>
                {(() => {
                    const StatusIcon = STATUS_ICONS[currentStatus] || Package;
                    return (
                        <>
                            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 transition-transform duration-1000 group-hover/banner:scale-110 group-hover/banner:rotate-0">
                                <StatusIcon size={120} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
                                    <h2 className={cn("text-xs font-black uppercase tracking-[0.2em]", statusConfig.color)}>
                                        Estado del Pedido: {statusConfig.label}
                                    </h2>
                                </div>
                            </div>
                        </>
                    );
                })()}
                <p className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                    {order.payment_status === 'pending' ? 'Validando tu pago' : 'Pedido en Marcha'}
                </p>

                {order.payment_status === 'pending' && (
                    <div className="relative z-10 p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-theme-tertiary leading-relaxed uppercase tracking-wider">
                            <span className="text-yellow-400">Nota:</span> Estamos validando tu comprobante de pago. Una vez confirmado por nuestro equipo administrativo, el proceso de envío comenzará de inmediato.
                        </p>
                    </div>
                )}
            </div>

            {/* Timeline Cinemático */}
            {!isCancelled && (
                <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
                    
                    <div className="flex items-center justify-between relative">
                        {STATUS_STEPS.map((step, i) => {
                            const config = ORDER_STATUS[step];
                            const isActive = i <= currentStepIndex;
                            const isCurrent = i === currentStepIndex;
                            return (
                                <div key={step} className="flex flex-1 items-center group/step">
                                    <div className="flex flex-col items-center relative z-10 transition-transform duration-500 group-hover/step:scale-110">
                                        <div className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-xl border-2 text-[10px] font-black transition-all duration-700 shadow-2xl',
                                            isCurrent
                                                ? `${config.border} ${config.bg} ${config.color} ring-4 ring-accent-primary/5 scale-110`
                                                : isActive
                                                    ? 'border-accent-primary bg-accent-primary text-white'
                                                    : 'border-white/10 bg-black/40 text-theme-tertiary'
                                        )}>
                                            {isActive ? <CheckCircle2 size={16} /> : i + 1}
                                        </div>
                                        <span className={cn(
                                            'absolute -bottom-7 w-20 text-center text-[8px] font-black uppercase tracking-widest transition-colors duration-500',
                                            isActive ? 'text-white' : 'text-theme-tertiary opacity-40'
                                        )}>
                                            {config.label}
                                        </span>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className="flex-1 px-2">
                                            <div className={cn(
                                                'h-[2px] w-full rounded-full transition-all duration-1000 relative overflow-hidden',
                                                i < currentStepIndex ? 'bg-accent-primary' : 'bg-white/5'
                                            )}>
                                                {isCurrent && (
                                                    <motion.div 
                                                        initial={{ x: '-100%' }}
                                                        animate={{ x: '100%' }}
                                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* TICKET DE VENTA PREMIUM */}
                <div className="animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                    <div className="relative overflow-hidden rounded-t-[2rem] bg-zinc-900 border-x border-t border-white/10 pt-10 pb-6 px-10 shadow-2xl">
                        {/* Shimmer on ticket */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-vape-500/20 to-transparent" />
                        
                        <div className="text-center space-y-4 mb-10">
                            <div className="mx-auto w-24 h-24 rounded-[2rem] bg-black border border-white/5 flex items-center justify-center shadow-inner relative group">
                                <Package className="h-10 w-10 text-theme-tertiary opacity-20 transition-opacity group-hover:opacity-40" />
                                <div className="absolute -inset-2 bg-accent-primary/5 rounded-full blur-xl animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-[0.2em]">Recibo Oficial</h2>
                            <div className="flex flex-col items-center gap-1 opacity-60">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary">Cod. Reg: {order.order_number}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary">VSM STORE FRONTEND UNIT</p>
                            </div>
                        </div>

                        {/* Items Loop */}
                        <div className="space-y-6 pb-10">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-theme-tertiary border-b border-white/5 pb-2">
                                <span>Concepto</span>
                                <span>Total Parcial</span>
                            </div>
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group/item">
                                    <div className="flex gap-4 items-center">
                                         <div className="h-12 w-12 rounded-xl bg-black border border-white/5 overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-theme-tertiary opacity-30">📦</div>
                                            )}
                                         </div>
                                         <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-white uppercase truncate max-w-[150px]">{item.name}</p>
                                            <p className="text-[9px] font-black text-accent-primary uppercase tracking-widest">{item.quantity} Uni. × {formatPrice(item.price)}</p>
                                         </div>
                                    </div>
                                    <span className="text-xs font-black text-white italic">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totales */}
                        <div className="border-t border-dashed border-white/10 pt-8 space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                                <span>Subtotal</span>
                                <span className="text-white opacity-80">{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.shipping_cost > 0 && (
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                                    <span>Logística de Envío</span>
                                    <span className="text-white opacity-80">{formatPrice(order.shipping_cost)}</span>
                                </div>
                            )}
                            {order.discount > 0 && (
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-herbal-500">
                                    <span>Bonificación Digital</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                <span className="text-sm font-black text-white uppercase italic tracking-[0.2em]">Inversión Total</span>
                                <span className="text-2xl font-black text-accent-primary italic drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        <div className="mt-12 text-center opacity-30">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-theme-tertiary">★ Thank you for your trust ★</p>
                        </div>
                    </div>
                    {/* Jagged Bottom Detail */}
                    <div className="h-6 bg-zinc-900 w-full relative -top-[1px] shadow-2xl" 
                         style={{
                             clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                         }}
                    />
                </div>

                {/* INFO LATERAL: LOGÍSTICA Y PAGO */}
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
                    {/* Seguimiento */}
                    {(order.tracking_notes) && (
                        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 space-y-6 group/tracking overflow-hidden relative">
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-accent-primary/5 rounded-full blur-2xl transition-all duration-700 group-hover/tracking:scale-150" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shadow-xl">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Seguimiento</h3>
                                    <p className="text-[10px] text-theme-tertiary font-bold uppercase opacity-60">Logística en tiempo real</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest px-1">Referencia de Seguimiento</p>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5 group/copy transition-all hover:border-accent-primary/30">
                                    <p className="text-sm font-black text-accent-primary font-mono tracking-tighter uppercase italic">{order.tracking_notes}</p>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(order.tracking_notes!);
                                            notify.success('Copiado', 'Código de seguimiento listo.');
                                        }}
                                        className="text-theme-tertiary hover:text-white transition-colors"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pago */}
                    <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-theme-secondary shadow-xl">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Transacción</h3>
                                <p className="text-[10px] text-theme-tertiary font-bold uppercase opacity-60">Seguridad Encriptada</p>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.01] border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary opacity-40">Método Digital</span>
                                <span className="text-xs font-black text-white uppercase italic">{{ cash: 'Efectivo', transfer: 'Transferencia', mercadopago: 'Mercado Pago', card: 'Tarjeta', whatsapp: 'WhatsApp' }[order.payment_method as string] ?? order.payment_method}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.01] border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary opacity-40">Estado de Cuenta</span>
                                <span className={cn(
                                    'text-xs font-black uppercase italic tracking-widest',
                                    order.payment_status === 'paid' ? 'text-herbal-500' : order.payment_status === 'refunded' ? 'text-accent-primary' : 'text-yellow-500'
                                )}>
                                    {order.payment_status === 'paid' ? 'Liquidado' : order.payment_status === 'refunded' ? 'Bonificado' : 'En Espera'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones Cinemáticas */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleReorder}
                            className="flex-1 group flex items-center justify-center gap-3 rounded-[2rem] border border-white/5 bg-white/[0.02] py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary hover:bg-white/5 hover:text-white transition-all duration-500 shadow-xl"
                        >
                            <RotateCcw className="h-4 w-4 group-hover:-rotate-180 transition-transform duration-700" />
                            Re-adquirir
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex-1 group flex items-center justify-center gap-3 rounded-[2rem] bg-herbal-500 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:bg-herbal-600 hover:-translate-y-1 active:scale-95 transition-all duration-500"
                        >
                            <MessageCircle className="h-4 w-4 group-hover:scale-125 transition-transform" />
                            Soporte VSM
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
