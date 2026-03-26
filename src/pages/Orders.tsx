import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Loader2, Package, ShoppingBag, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticatedOrderReorder } from '@/hooks/useAuthenticatedOrderReorder';
import { useCustomerOrders, ORDER_STATUS } from '@/hooks/useOrders';
import {
    getStorefrontOrderPaymentView,
    getStorefrontOrdersIndexActionView,
} from '@/lib/domain/orders';
import { useNotification } from '@/hooks/useNotification';
import { mercadopagoService } from '@/services/payments/mercadopago.service';
import { SEO } from '@/components/seo/SEO';
import type { OrderStatus, OrderRecord } from '@/hooks/useOrders';

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' },
];

interface OrderStatusDisplay {
    label: string;
    color: string;
    bg: string;
    border: string;
}

interface OrderCardProps {
    order: OrderRecord;
    status: OrderStatusDisplay;
    continuing: boolean;
    reordering: boolean;
    onContinuePayment: (order: OrderRecord) => void;
    onReorder: (order: OrderRecord) => void;
}

function getPaymentMethodLabel(paymentMethod: string) {
    switch (paymentMethod) {
        case 'cash':
            return 'Efectivo';
        case 'transfer':
            return 'Transferencia';
        case 'mercadopago':
            return 'Mercado Pago';
        case 'card':
            return 'Tarjeta';
        case 'whatsapp':
            return 'WhatsApp';
        default:
            return paymentMethod;
    }
}

function OrderCard({ order, status, continuing, reordering, onContinuePayment, onReorder }: OrderCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const paymentView = getStorefrontOrderPaymentView(order);
    const actionView = getStorefrontOrdersIndexActionView(order);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const itemCount = Array.isArray(order.items)
        ? order.items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 1), 0)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onMouseMove={handleMouseMove}
            className="group relative"
        >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-700 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <motion.div
                    className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                350px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.08),
                                transparent 80%
                            )
                        `,
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            'flex h-14 w-14 items-center justify-center rounded-2xl border text-white shadow-2xl transition-all duration-700 group-hover:scale-110',
                            status.bg,
                            status.border,
                        )}>
                            <Package className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-white">{order.order_number}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary/60">
                                {new Date(order.created_at).toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className={cn(
                            'inline-flex rounded-xl border px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-inner transition-all duration-700 group-hover:px-6',
                            status.color,
                            status.bg,
                            status.border,
                        )}>
                            {status.label}
                        </span>
                        <span className={cn(
                            'inline-flex rounded-xl border px-5 py-2 text-[10px] font-black uppercase tracking-widest',
                            paymentView.paymentTone === 'success'
                                ? 'border-herbal-500/30 bg-herbal-500/10 text-herbal-500'
                                : paymentView.paymentTone === 'danger'
                                    ? 'border-red-400/30 bg-red-400/10 text-red-400'
                                    : paymentView.paymentTone === 'neutral'
                                        ? 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary'
                                        : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400',
                        )}>
                            {paymentView.paymentLabel}
                        </span>
                    </div>
                </div>

                <div className="relative z-10 mt-8 rounded-[1.75rem] border border-white/5 bg-black/20 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-50">
                        Estado real del pedido
                    </p>
                    <p className="mt-2 text-sm font-black uppercase italic text-white">
                        {actionView.actionHeadline}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider leading-relaxed text-theme-secondary/80">
                        {actionView.actionDetail}
                    </p>
                </div>

                <div className="relative z-10 mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4">
                    <div>
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40">
                            Articulos
                        </span>
                        <span className="text-sm font-black uppercase italic text-white">
                            {itemCount} objeto{itemCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div>
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40">
                            Total
                        </span>
                        <span className="text-xl font-black text-vape-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                            {formatPrice(order.total)}
                        </span>
                    </div>
                    <div>
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40">
                            Metodo
                        </span>
                        <span className="text-sm font-black uppercase italic text-white">
                            {getPaymentMethodLabel(order.payment_method)}
                        </span>
                    </div>
                    <div>
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40">
                            Accion real
                        </span>
                        <span className="text-sm font-black uppercase italic text-white">
                            {actionView.actionHeadline}
                        </span>
                    </div>
                </div>

                <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to={`/orders/${order.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-[1.25rem] border border-white/10 bg-white/5 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                    >
                        <ArrowRight className="h-4 w-4" />
                        {actionView.detailLabel}
                    </Link>

                    {actionView.showReorder && (
                        <button
                            type="button"
                            onClick={() => onReorder(order)}
                            disabled={reordering}
                            className="flex flex-1 items-center justify-center gap-2 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <Package className="h-4 w-4" />
                            {reordering ? 'Revisando catalogo...' : 'Reordenar con catalogo actual'}
                        </button>
                    )}

                    {actionView.showContinuePayment && (
                        <button
                            type="button"
                            onClick={() => onContinuePayment(order)}
                            disabled={continuing}
                            className="flex flex-1 items-center justify-center gap-2 rounded-[1.25rem] bg-yellow-600 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <CreditCard className="h-4 w-4" />
                            {continuing ? 'Abriendo Mercado Pago...' : 'Continuar pago en Mercado Pago'}
                        </button>
                    )}
                </div>

                <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-transparent via-accent-primary to-transparent transition-transform duration-1000 group-hover:scale-x-100" />
            </div>
        </motion.div>
    );
}

export function Orders() {
    const { user } = useAuth();
    const { data: orders = [], isLoading, isError, error } = useCustomerOrders(user?.id);
    const { reorderOrder, reorderingOrderId } = useAuthenticatedOrderReorder();
    const [filter, setFilter] = useState('all');
    const [continuingOrderId, setContinuingOrderId] = useState<string | null>(null);
    const notify = useNotification();

    const filtered = filter === 'all' ? orders : orders.filter((order) => order.status === filter);
    const actionViews = orders.map((order) => ({
        order,
        paymentView: getStorefrontOrderPaymentView(order),
        actionView: getStorefrontOrdersIndexActionView(order),
    }));
    const payableCount = actionViews.filter(({ actionView }) => actionView.showContinuePayment).length;
    const paidCount = actionViews.filter(({ paymentView }) => paymentView.paymentStatus === 'paid').length;
    const reviewCount = actionViews.filter(({ paymentView, actionView }) => (
        paymentView.paymentTone === 'danger' || (
            !actionView.showContinuePayment &&
            !actionView.showReorder &&
            paymentView.paymentStatus === 'pending'
        )
    )).length;

    const handleContinuePayment = async (order: OrderRecord) => {
        if (continuingOrderId) return;

        try {
            setContinuingOrderId(order.id);
            const payment = await mercadopagoService.createPayment(order.id);
            window.location.assign(payment.init_point);
        } catch {
            notify.error(
                'No se pudo retomar el pago',
                'Tu pedido sigue registrado, pero Mercado Pago no pudo abrirse en este momento.',
            );
            setContinuingOrderId(null);
        }
    };

    const handleReorder = async (order: OrderRecord) => {
        await reorderOrder({
            id: order.id,
            items: Array.isArray(order.items) ? order.items : [],
        });
    };

    if (isError) {
        return (
            <div className="container-vsm animate-in fade-in zoom-in py-20 text-center duration-700">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                    <Package className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-white">Error de transmision</h2>
                <p className="mx-auto max-w-sm text-[10px] font-black uppercase tracking-widest leading-relaxed text-red-400/60">
                    {(error as Error)?.message || 'No se han podido recuperar tus bitacoras de compra. Por favor, reintenta.'}
                </p>
            </div>
        );
    }

    return (
        <div className="container-vsm min-h-screen space-y-12 py-12">
            <SEO title="Mis pedidos" description="Historial de pedidos en VSM Store." />

            <header className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-2xl bg-accent-primary blur opacity-25 transition duration-1000 group-hover:opacity-50" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-accent-primary shadow-2xl">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 animate-pulse text-accent-primary" />
                            <h1 className="text-4xl font-black uppercase italic tracking-tight text-white">Mis Pedidos</h1>
                        </div>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary opacity-60">
                            Bitacora historica con estado persistido y acciones reales
                        </p>
                    </div>
                </div>

                <div className="mask-fade-right flex gap-2 overflow-x-auto pb-4 scrollbar-none">
                    {STATUS_FILTERS.map((currentFilter) => (
                        <button
                            key={currentFilter.value}
                            type="button"
                            onClick={() => setFilter(currentFilter.value)}
                            className={cn(
                                'flex-shrink-0 rounded-[1.5rem] border px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95',
                                filter === currentFilter.value
                                    ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary shadow-2xl shadow-accent-primary/20'
                                    : 'border-white/5 bg-white/[0.02] text-theme-tertiary hover:border-white/20 hover:text-white',
                            )}
                        >
                            {currentFilter.label}
                        </button>
                    ))}
                </div>
            </header>

            <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-50">
                        Pagos por retomar
                    </p>
                    <p className="mt-3 text-3xl font-black uppercase italic text-yellow-400">{payableCount}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-theme-secondary/70">
                        Pedidos que siguen pagables en Mercado Pago desde la verdad persistida.
                    </p>
                </div>
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-50">
                        Pedidos liquidados
                    </p>
                    <p className="mt-3 text-3xl font-black uppercase italic text-herbal-500">{paidCount}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-theme-secondary/70">
                        Pedidos con pago confirmado en el estado persistido.
                    </p>
                </div>
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-50">
                        Requieren revision
                    </p>
                    <p className="mt-3 text-3xl font-black uppercase italic text-red-400">{reviewCount}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-theme-secondary/70">
                        Pedidos que no figuran con pago confirmado o ya no estan pagables.
                    </p>
                </div>
            </section>

            <div className="relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-32">
                        <Loader2 className="h-10 w-10 animate-spin text-accent-primary opacity-50" />
                        <p className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary">
                            Sincronizando archivos...
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <AnimatePresence initial={false}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative space-y-8 overflow-hidden rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] py-32 text-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-primary/[0.02] to-transparent" />
                            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-white/5 bg-black/40 shadow-2xl">
                                <Package className="h-10 w-10 text-theme-tertiary opacity-10" />
                            </div>
                            <div className="relative mx-auto max-w-sm space-y-4 px-6">
                                <h2 className="text-2xl font-black uppercase italic text-white">
                                    {filter === 'all' ? 'Sin registros' : 'Sin pedidos en este estado'}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed text-theme-tertiary/60">
                                    {filter === 'all'
                                        ? 'Tu historial de pedidos sigue vacio. Cuando exista una orden persistida, aparecera aqui con su estado real.'
                                        : 'No encontramos pedidos persistidos que coincidan con el filtro aplicado.'}
                                </p>
                                <div className="pt-6">
                                    <Link to="/" className="vsm-button-primary px-10">Explorar catalogo</Link>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence initial={false}>
                            {filtered.map((order) => {
                                const status = ORDER_STATUS[order.status as OrderStatus] ?? ORDER_STATUS.pending;
                                return (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        status={status}
                                        continuing={continuingOrderId === order.id}
                                        reordering={reorderingOrderId === order.id}
                                        onContinuePayment={handleContinuePayment}
                                        onReorder={(currentOrder) => void handleReorder(currentOrder)}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
