/**
 * // ─── COMPONENTE: PaymentSuccess ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Pagina de celebracion inmersiva tras pago exitoso.
 *    Efectos: Confetti cinematico, Receipt Glass-Pro, Fondo liquido animado.
 * // Regla / Notas: Animaciones escalonadas con Framer Motion. SEO optimizado.
 */
import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cart.store';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, Home, Package, Calendar } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import { SEO } from '@/components/seo/SEO';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
};

export function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const clearCart = useCartStore((s) => s.clearCart);
    const processed = useRef(false);

    const { data: order } = useOrder(orderId ?? undefined);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        clearCart();

        // Premium Confetti Burst
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: ReturnType<typeof setInterval> = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, [clearCart]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] selection:bg-vape-500/30">
            <SEO title="¡Gracias por tu compra!" description="Tu pedido ha sido procesado con éxito en VSM Store." />

            {/* 🌌 Animated Liquid Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-vape-600/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-herbal-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[20%] h-[30%] w-[30%] rounded-full bg-vape-400/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-2xl text-center space-y-8"
                >
                    {/* 🏆 Success Icon */}
                    <motion.div variants={item} className="relative inline-block">
                        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                            <CheckCircle2 className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute -inset-4 z-0 rounded-[2.5rem] bg-green-500/20 blur-xl animate-pulse" />
                    </motion.div>

                    {/* 📝 Header Text */}
                    <motion.div variants={item} className="space-y-3">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase italic">
                            ¡Misión Cumplida!
                        </h1>
                        <p className="text-lg font-bold text-white/60 uppercase tracking-[0.2em]">
                            Tu pedido está en camino
                        </p>
                    </motion.div>

                    {/* 🧾 Glass-Pro Receipt */}
                    <motion.div variants={item} className="relative group">
                        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-vape-500/20 to-herbal-500/20 opacity-50 blur transition duration-1000 group-hover:opacity-100" />
                        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-2xl p-8 text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Número de pedido</span>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                        {order?.order_number || 'Procesando...'}
                                    </h3>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-sm font-black text-vape-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                                        {order ? formatPrice(order.total) : '---'}
                                    </span>
                                </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                        <Calendar className="h-5 w-5 text-white/40" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Fecha</p>
                                        <p className="text-sm font-bold text-white/80 truncate">
                                            {order ? new Date(order.created_at).toLocaleDateString('es-MX', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            }) : 'Cargando...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                        <Package className="h-5 w-5 text-white/40" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Items</p>
                                        <p className="text-sm font-bold text-white/80 truncate">
                                            {order?.items?.length || 0} producto(s) confirmados
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-8 p-4 rounded-2xl bg-vape-500/5 border border-vape-500/10">
                                <p className="text-xs font-bold text-vape-400 leading-relaxed italic">
                                    "Te hemos enviado un correo de confirmación con los detalles del seguimiento. ¡Gracias por confiar en VSM!"
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 🚀 Actions */}
                    <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        {orderId && (
                            <Link
                                to={`/orders/${orderId}`}
                                className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-vape-600 px-8 py-4 text-sm font-black text-white uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Ver Pedido Completo
                                </div>
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="group w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black text-white/70 uppercase tracking-widest backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Home className="h-4 w-4" />
                                Volver al Inicio
                            </div>
                        </Link>
                    </motion.div>

                    {/* 🏷️ Note */}
                    <motion.p variants={item} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                        VSM Store &copy; {new Date().getFullYear()} — Premium Tech & Herbs
                    </motion.p>
                </motion.div>
            </main>
        </div>
    );
}
