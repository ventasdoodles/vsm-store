import { useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cart.store'
import confetti from 'canvas-confetti'
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react'

export function PaymentSuccess() {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order_id')
    const clearCart = useCartStore((s) => s.clearCart)
    // Use a ref to track if we've already cleared/confettid to avoid double execution in strict mode
    const processed = useRef(false)

    useEffect(() => {
        if (processed.current) return
        processed.current = true

        clearCart()
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#059669']
        })
    }, [clearCart])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-primary-950 px-4 text-center">
            <div className="mb-6 rounded-full bg-green-500/10 p-6 ring-1 ring-green-500/30">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">¡Pago Exitoso!</h1>
            <p className="mb-8 max-w-md text-primary-400">
                Tu pedido ha sido confirmado y procesado correctamente. Recibirás un correo con los detalles.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                {orderId && (
                    <Link
                        to={`/orders/${orderId}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-vape-600 py-3 text-sm font-semibold text-white shadow-lg shadow-vape-600/20 transition-all hover:bg-vape-500 hover:-translate-y-0.5"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Ver mi pedido
                    </Link>
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
