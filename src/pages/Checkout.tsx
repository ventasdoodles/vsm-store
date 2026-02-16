import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { SEO } from '@/components/seo/SEO';
import { useCartStore } from '@/stores/cart.store';
import { useEffect } from 'react';

export function Checkout() {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            navigate('/');
        }
    }, [items, navigate]);

    return (
        <div className="min-h-screen bg-primary-950 pb-20 pt-20 md:pt-24">
            <SEO title="Finalizar Compra" description="Completa tu pedido en VSM Store - Vape & Smoke Shop en Xalapa." />

            <div className="container-vsm max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-xl bg-primary-900/50 p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-primary-100">Finalizar Compra</h1>
                </div>

                {/* Main Content */}
                <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-4 md:p-6 backdrop-blur-sm">
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
