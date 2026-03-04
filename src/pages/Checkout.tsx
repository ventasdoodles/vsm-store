import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { SEO } from '@/components/seo/SEO';
import { useCartStore } from '@/stores/cart.store';
import { useEffect, useRef } from 'react';

export function Checkout() {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const checkoutStarted = useRef(false);

    // Mark that checkout is in progress once we have items
    useEffect(() => {
        if (items.length > 0) checkoutStarted.current = true;
    }, [items]);

    // Redirect if cart is empty on initial load (not after successful checkout)
    useEffect(() => {
        if (items.length === 0 && !checkoutStarted.current) {
            navigate('/');
        }
    }, [items, navigate]);

    return (
        <div className="min-h-screen bg-theme-main pb-20 pt-20 md:pt-24">
            <SEO title="Finalizar Compra" description="Completa tu pedido en VSM Store - Vape & Smoke Shop en Xalapa." />

            <div className="container-vsm max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-xl bg-theme-secondary/20 p-2 text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-theme-primary">Finalizar Compra</h1>
                </div>

                {/* Main Content */}
                <div className="rounded-2xl border border-theme bg-theme-secondary/10 p-4 md:p-6 backdrop-blur-sm">
                    <CheckoutForm
                        onSuccess={() => {
                            // Navigation handled inside CheckoutForm on success usually (to /orders/:id)
                            // But we can add extra logic here if needed
                        }}
                        onBack={() => navigate(-1)}
                    />
                </div>
            </div>
        </div>
    );
}
