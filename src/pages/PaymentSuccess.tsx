import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cart.store';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    CreditCard,
    Home,
    Package,
    RefreshCw,
    ShoppingBag,
    XCircle,
    Calendar,
    type LucideIcon,
} from 'lucide-react';
import { useOrderWithCrossSurfaceReconciliation } from '@/hooks/useOrders';
import { getStorefrontOrderLifecycleView, getStorefrontPaymentReentryView, getStorefrontPostPurchaseConfidenceView } from '@/lib/domain/orders';
import { useStorefrontPaymentReentry } from '@/hooks/useStorefrontPaymentReentry';
import { formatPrice } from '@/lib/utils';
import { SEO } from '@/components/seo/SEO';
import { PostPurchaseReceiptCard } from '@/components/order/PostPurchaseReceiptCard';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
};

const TONE_UI: Record<
    'success' | 'warning' | 'danger' | 'neutral',
    {
        icon: LucideIcon;
        iconWrap: string;
        iconGlow: string;
        eyebrow: string;
        infoBox: string;
        button: string;
    }
> = {
    success: {
        icon: CheckCircle2,
        iconWrap: 'from-green-400 to-emerald-600 shadow-[0_0_50px_rgba(16,185,129,0.3)]',
        iconGlow: 'bg-green-500/20',
        eyebrow: 'text-emerald-300',
        infoBox: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300',
        button: 'bg-vape-600 hover:scale-105',
    },
    warning: {
        icon: Clock,
        iconWrap: 'from-yellow-400 to-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.3)]',
        iconGlow: 'bg-yellow-500/20',
        eyebrow: 'text-yellow-300',
        infoBox: 'bg-yellow-500/5 border-yellow-500/10 text-yellow-200',
        button: 'bg-yellow-600 hover:scale-105',
    },
    danger: {
        icon: XCircle,
        iconWrap: 'from-red-400 to-rose-600 shadow-[0_0_50px_rgba(239,68,68,0.3)]',
        iconGlow: 'bg-red-500/20',
        eyebrow: 'text-red-300',
        infoBox: 'bg-red-500/5 border-red-500/10 text-red-200',
        button: 'bg-red-600 hover:scale-105',
    },
    neutral: {
        icon: AlertTriangle,
        iconWrap: 'from-sky-400 to-cyan-600 shadow-[0_0_50px_rgba(56,189,248,0.3)]',
        iconGlow: 'bg-sky-500/20',
        eyebrow: 'text-sky-300',
        infoBox: 'bg-sky-500/5 border-sky-500/10 text-sky-200',
        button: 'bg-sky-600 hover:scale-105',
    },
};

export function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const clearCart = useCartStore((s) => s.clearCart);
    const processed = useRef(false);
    const { continuePayment, continuingOrderId } = useStorefrontPaymentReentry();

    const { data: order, refetch, isFetching } = useOrderWithCrossSurfaceReconciliation(orderId ?? undefined);
    const lifecycleView = order ? getStorefrontOrderLifecycleView(order) : null;
    const paymentReentryView = order ? getStorefrontPaymentReentryView(order) : null;
    const confidenceView = order ? getStorefrontPostPurchaseConfidenceView(order) : null;
    const paymentView = lifecycleView?.paymentView ?? null;
    const tone = paymentView?.paymentTone ?? 'warning';
    const ui = TONE_UI[tone];
    const StatusIcon = ui.icon;
    const canRefreshPaymentState = Boolean(orderId) && (!order || lifecycleView?.canRefresh);
    const hasPersistedOrder = Boolean(order);
    const canContinuePayment = paymentReentryView?.canReenter === true;
    const continuingPayment = order ? continuingOrderId === order.id : false;

    // Auto-refresh is handled by useOrderWithCrossSurfaceReconciliation for pending MercadoPago.
    // Only explicit refetch on no-data fallback remains for the initial order lookup.
    useEffect(() => {
        if (orderId && !order && !isFetching) {
            void refetch();
        }
    }, [orderId, order, isFetching, refetch]);

    useEffect(() => {
        if (processed.current) return;
        if (!paymentView || paymentView.paymentStatus !== 'paid') return;
        processed.current = true;
        clearCart();
    }, [clearCart, paymentView]);

    useEffect(() => {
        if (!paymentView || paymentView.paymentStatus !== 'paid') return;

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, [paymentView]);

    const headline = paymentView?.headline ?? 'Estamos revisando tu pedido';
    const eyebrow = hasPersistedOrder
        ? lifecycleView?.statusEyebrow ?? 'Pedido existente, estado por confirmar'
        : 'Consulta el pedido antes de asumir cierre';
    const detail = paymentView?.detail ?? 'Abre el detalle del pedido para revisar el estado real de pago y del pedido.';
    const itemsLabel = order ? `${order.items?.length || 0} producto(s) registrados` : 'Buscando el pedido';
    const continuityNote = hasPersistedOrder && lifecycleView
        ? lifecycleView.continuityNote
        : 'Esta pantalla por si sola no confirma pago; el pedido es la fuente real para revisar el estado.';
    const orderCtaLabel = lifecycleView?.orderCtaLabel ?? 'Ver pedido y estado real';
    const refreshLabel = lifecycleView?.refreshLabel ?? 'Revisar estado de pago';

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] selection:bg-vape-500/30">
            <SEO
                title={`${headline} | VSM Store`}
                description="Consulta el estado real de tu pedido y de tu pago en VSM Store."
            />

            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-vape-600/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-herbal-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[20%] h-[30%] w-[30%] rounded-full bg-vape-400/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
            </div>

            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-2xl text-center space-y-8"
                >
                    <motion.div variants={item} className="relative inline-block">
                        <div className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br ${ui.iconWrap}`}>
                            <StatusIcon className="h-12 w-12 text-white" />
                        </div>
                        <div className={`absolute -inset-4 z-0 rounded-[2.5rem] blur-xl animate-pulse ${ui.iconGlow}`} />
                    </motion.div>

                    <motion.div variants={item} className="space-y-3">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase italic">
                            {headline}
                        </h1>
                        <p className={`text-lg font-bold uppercase tracking-[0.2em] ${ui.eyebrow}`}>
                            {eyebrow}
                        </p>
                    </motion.div>

                    <motion.div variants={item} className="relative group">
                        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-vape-500/20 to-herbal-500/20 opacity-50 blur transition duration-1000 group-hover:opacity-100" />
                        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-8 text-left backdrop-blur-2xl">
                            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Numero de pedido</span>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                                        {order?.order_number || 'Consultando...'}
                                    </h3>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                                    <span className="text-sm font-black text-vape-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                                        {order ? formatPrice(order.total) : '---'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                        <Calendar className="h-5 w-5 text-white/40" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Fecha</p>
                                        <p className="truncate text-sm font-bold text-white/80">
                                            {order
                                                ? new Date(order.created_at).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : 'Cargando...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                        <Package className="h-5 w-5 text-white/40" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Items</p>
                                        <p className="truncate text-sm font-bold text-white/80">
                                            {itemsLabel}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`mt-8 rounded-2xl border p-4 ${ui.infoBox}`}>
                                <p className="text-xs font-bold leading-relaxed italic">
                                    {detail}
                                </p>
                                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] opacity-80">
                                    {continuityNote}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {order && lifecycleView && confidenceView && (
                        <motion.div variants={item}>
                            <PostPurchaseReceiptCard
                                order={order}
                                lifecycleView={lifecycleView}
                                confidenceView={confidenceView}
                            />
                        </motion.div>
                    )}

                    <motion.div variants={item} className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                        {canContinuePayment && (
                            <button
                                type="button"
                                onClick={() => order && void continuePayment(order)}
                                disabled={continuingPayment}
                                className="group relative w-full overflow-hidden rounded-2xl bg-yellow-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    {continuingPayment ? 'Abriendo Mercado Pago...' : paymentReentryView?.ctaLabel ?? 'Continuar pago en Mercado Pago'}
                                </div>
                            </button>
                        )}
                        {canRefreshPaymentState && (
                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="group w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white sm:w-auto"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                    {isFetching ? 'Revisando estado...' : refreshLabel}
                                </div>
                            </button>
                        )}
                        {order && (
                            <Link
                                to={`/orders/${order.id}`}
                                className={`group relative w-full overflow-hidden rounded-2xl px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all duration-300 active:scale-95 sm:w-auto ${ui.button}`}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    {orderCtaLabel}
                                </div>
                                <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="group w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white sm:w-auto"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Home className="h-4 w-4" />
                                Volver al inicio
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
