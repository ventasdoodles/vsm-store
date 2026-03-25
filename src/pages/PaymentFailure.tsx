import { Link, useSearchParams } from 'react-router-dom';
import { Home, RefreshCw, XCircle } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { getStorefrontOrderPaymentView } from '@/lib/domain/orders';

export function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { data: order, refetch, isFetching } = useOrder(orderId ?? undefined);
    const paymentView = order ? getStorefrontOrderPaymentView(order) : null;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-theme-primary px-4 text-center">
            <div className="mb-6 rounded-full bg-red-500/10 p-6 ring-1 ring-red-500/30">
                <XCircle className="h-16 w-16 text-red-500" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">
                {paymentView?.paymentTone === 'danger'
                    ? paymentView.headline
                    : 'Pago no confirmado'}
            </h1>
            <p className="mb-8 max-w-md text-theme-secondary">
                {paymentView?.paymentTone === 'danger'
                    ? paymentView.detail
                    : 'No pudimos confirmar el pago. Revisa el estado real del pedido antes de intentar otra vez.'}
            </p>

            <div className="flex w-full max-w-xs flex-col gap-3">
                {orderId && (
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-primary/50 py-3 text-sm font-medium text-theme-secondary transition-colors hover:bg-theme-secondary hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        {isFetching ? 'Revisando estado...' : 'Revisar estado de pago'}
                    </button>
                )}

                {orderId ? (
                    <Link
                        to={`/orders/${orderId}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:bg-red-500"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Ver pedido e intentar de nuevo
                    </Link>
                ) : (
                    <button
                        onClick={() => window.history.back()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:bg-red-500"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Intentar nuevamente
                    </button>
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
    );
}
