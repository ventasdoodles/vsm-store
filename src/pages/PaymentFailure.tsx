import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, CreditCard, Home, RefreshCw, ShoppingBag, XCircle, type LucideIcon } from 'lucide-react';
import { useOrderWithCrossSurfaceReconciliation } from '@/hooks/useOrders';
import { getStorefrontOrderLifecycleView, getStorefrontPaymentReentryView, getStorefrontPostPurchaseConfidenceView } from '@/lib/domain/orders';
import { useStorefrontPaymentReentry } from '@/hooks/useStorefrontPaymentReentry';
import { PostPurchaseReceiptCard } from '@/components/order/PostPurchaseReceiptCard';

const TONE_UI: Record<
    'success' | 'warning' | 'danger' | 'neutral',
    {
        icon: LucideIcon;
        ring: string;
        iconColor: string;
        note: string;
        primaryLink: string;
    }
> = {
    success: {
        icon: CheckCircle2,
        ring: 'bg-green-500/10 ring-green-500/30',
        iconColor: 'text-green-500',
        note: 'text-green-200/80',
        primaryLink: 'bg-green-600 hover:bg-green-500 shadow-green-600/20',
    },
    warning: {
        icon: Clock,
        ring: 'bg-yellow-500/10 ring-yellow-500/30',
        iconColor: 'text-yellow-500',
        note: 'text-yellow-200/80',
        primaryLink: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-600/20',
    },
    danger: {
        icon: XCircle,
        ring: 'bg-red-500/10 ring-red-500/30',
        iconColor: 'text-red-500',
        note: 'text-red-200/80',
        primaryLink: 'bg-red-600 hover:bg-red-500 shadow-red-600/20',
    },
    neutral: {
        icon: AlertTriangle,
        ring: 'bg-sky-500/10 ring-sky-500/30',
        iconColor: 'text-sky-400',
        note: 'text-sky-200/80',
        primaryLink: 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20',
    },
};

export function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { continuePayment, continuingOrderId } = useStorefrontPaymentReentry();
    const { data: order, refetch, isFetching } = useOrderWithCrossSurfaceReconciliation(orderId ?? undefined);
    const lifecycleView = order ? getStorefrontOrderLifecycleView(order) : null;
    const paymentReentryView = order ? getStorefrontPaymentReentryView(order) : null;
    const confidenceView = order ? getStorefrontPostPurchaseConfidenceView(order) : null;
    const paymentView = lifecycleView?.paymentView ?? null;
    const canContinuePayment = paymentReentryView?.canReenter === true;
    const continuingPayment = order ? continuingOrderId === order.id : false;
    const canRefreshPaymentState = Boolean(orderId) && (!order || lifecycleView?.canRefresh);
    const ui = TONE_UI[paymentView?.paymentTone ?? 'danger'];
    const StatusIcon = ui.icon;
    const orderExistsCopy = order && lifecycleView
        ? lifecycleView.continuityNote
        : 'Si venias de un intento de pago, revisa primero el pedido real antes de asumir que la compra no existe.';

    // Auto-refresh is handled by useOrderWithCrossSurfaceReconciliation for pending MercadoPago.

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-theme-primary px-4 py-10 text-center">
            <div className="w-full max-w-3xl">
                <div className={`mx-auto mb-6 w-fit rounded-full p-6 ring-1 ${ui.ring}`}>
                    <StatusIcon className={`h-16 w-16 ${ui.iconColor}`} />
                </div>

                <h1 className="mb-2 text-3xl font-bold text-white">
                    {paymentView?.headline ?? 'Pago no confirmado'}
                </h1>
                <p className={`mb-2 text-sm font-bold uppercase tracking-[0.18em] ${ui.iconColor}`}>
                    {lifecycleView?.statusEyebrow ?? 'Pedido existente, estado por confirmar'}
                </p>
                <p className="mx-auto mb-6 max-w-xl text-theme-secondary">
                    {paymentView?.detail ?? 'No pudimos confirmar el pago. Revisa el estado real del pedido antes de intentar otra vez.'}
                </p>
                <p className={`mx-auto mb-8 max-w-xl text-sm font-semibold ${ui.note}`}>
                    {orderExistsCopy}
                </p>

                {order && lifecycleView && confidenceView && (
                    <div className="mb-8 text-left">
                        <PostPurchaseReceiptCard
                            order={order}
                            lifecycleView={lifecycleView}
                            confidenceView={confidenceView}
                        />
                    </div>
                )}

                <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
                {canContinuePayment && (
                    <button
                        type="button"
                        onClick={() => order && void continuePayment(order)}
                        disabled={continuingPayment}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-600 py-3 text-sm font-semibold text-white shadow-lg shadow-yellow-600/20 transition-all hover:-translate-y-0.5 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <CreditCard className="h-4 w-4" />
                        {continuingPayment ? 'Abriendo Mercado Pago...' : paymentReentryView?.ctaLabel ?? 'Continuar pago en Mercado Pago'}
                    </button>
                )}

                {canRefreshPaymentState && (
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-primary/50 py-3 text-sm font-medium text-theme-secondary transition-colors hover:bg-theme-secondary hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        {isFetching ? 'Revisando estado...' : lifecycleView?.refreshLabel ?? 'Revisar estado de pago'}
                    </button>
                )}

                {order ? (
                    <Link
                        to={`/orders/${order.id}`}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 ${ui.primaryLink}`}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {lifecycleView?.orderCtaLabel ?? 'Ver pedido y revisar pago'}
                    </Link>
                ) : (
                    <Link
                        to="/orders"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:bg-red-500"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Ver historial de pedidos
                    </Link>
                )}

                <Link
                    to="/"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-primary/50 py-3 text-sm font-medium text-theme-secondary transition-colors hover:bg-theme-secondary hover:text-white"
                >
                    <Home className="h-4 w-4" />
                    Volver a la tienda
                </Link>
                </div>
            </div>
        </div>
    );
}
