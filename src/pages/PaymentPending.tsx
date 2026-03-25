import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Home, ShoppingBag } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { getStorefrontOrderPaymentView } from '@/lib/domain/orders';

export function PaymentPending() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { data: order } = useOrder(orderId ?? undefined);
    const paymentView = order ? getStorefrontOrderPaymentView(order) : null;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-theme-primary px-4 text-center">
            <div className="mb-6 rounded-full bg-yellow-500/10 p-6 ring-1 ring-yellow-500/30">
                <Clock className="h-16 w-16 text-yellow-500" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">
                {paymentView?.headline ?? 'Pago pendiente de confirmacion'}
            </h1>
            <p className="mb-8 max-w-md text-theme-secondary">
                {paymentView?.detail ?? 'Tu pedido fue registrado, pero el pago todavia no aparece como confirmado.'}
            </p>

            <div className="flex w-full max-w-xs flex-col gap-3">
                {orderId && (
                    <Link
                        to={`/orders/${orderId}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-600 py-3 text-sm font-semibold text-white shadow-lg shadow-yellow-600/20 transition-all hover:-translate-y-0.5 hover:bg-yellow-500"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Ver estado del pedido
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
    );
}
