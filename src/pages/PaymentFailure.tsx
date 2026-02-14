import { Link, useSearchParams } from 'react-router-dom'
import { XCircle, RefreshCw, Home } from 'lucide-react'

export function PaymentFailure() {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order_id')

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-primary-950 px-4 text-center">
            <div className="mb-6 rounded-full bg-red-500/10 p-6 ring-1 ring-red-500/30">
                <XCircle className="h-16 w-16 text-red-500" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">Pago Rechazado</h1>
            <p className="mb-8 max-w-md text-primary-400">
                Hubo un problema al procesar tu pago. No se ha realizado ningún cobro.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                {orderId ? (
                    <Link
                        to={`/orders/${orderId}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:-translate-y-0.5"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Ver pedido e intentar de nuevo
                    </Link>
                ) : (
                    <button
                        onClick={() => window.history.back()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:-translate-y-0.5"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Intentar nuevamente
                    </button>
                )}

                <Link
                    to="/"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-800 bg-primary-900/50 py-3 text-sm font-medium text-primary-300 transition-colors hover:bg-primary-800 hover:text-white"
                >
                    <Home className="h-4 w-4" />
                    Volver a la tienda
                </Link>
            </div>
        </div>
    )
}
