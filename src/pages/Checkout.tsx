import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ChevronDown } from 'lucide-react';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { SEO } from '@/components/seo/SEO';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useEffect, useRef, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { cn, formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export function Checkout() {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore(selectSubtotal);
    const checkoutStarted = useRef(false);
    const initialItems = useRef(items);
    const initialSubtotal = useRef(subtotal);
    
    const displayItems = items.length > 0 ? items : initialItems.current;
    const displaySubtotal = items.length > 0 ? subtotal : initialSubtotal.current;

    const { warning } = useNotification();
    const [showSummaryMobile, setShowSummaryMobile] = useState(false);

    // Mark that checkout is in progress once we have items
    useEffect(() => {
        if (items.length > 0) checkoutStarted.current = true;
    }, [items]);

    // Redirect if cart is empty on initial load
    useEffect(() => {
        if (items.length === 0 && !checkoutStarted.current) {
            warning('Carrito vacío', 'Agrega productos para continuar con tu compra.');
            navigate('/');
        }
    }, [items, navigate, warning]);

    return (
        <div className="min-h-screen bg-theme-main pb-20 pt-20 md:pt-24 lg:pt-28">
            <SEO title="Finalizar Compra" description="Completa tu pedido en VSM Store - Vape & Smoke Shop en Xalapa." />

            <div className="container-vsm max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-20">

                    {/* LEFTSIDE: Checkout Form */}
                    <div className="flex-1 lg:max-w-xl">
                        {/* Header */}
                        <div className="mb-8 flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-theme-secondary hover:bg-vape-500/10 hover:border-vape-500/30 hover:text-vape-400 transition-all active:scale-95"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-white">Checkout</h1>
                                <p className="text-xs font-bold uppercase tracking-widest text-vape-400 opacity-70">Finalizar compra</p>
                            </div>
                        </div>

                        {/* Order Summary Mobile Trigger */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => setShowSummaryMobile(!showSummaryMobile)}
                                className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="h-5 w-5 text-vape-400" />
                                    <span className="text-sm font-bold text-white">Ver resumen del pedido</span>
                                    <ChevronDown className={cn("h-4 w-4 text-theme-tertiary transition-transform", showSummaryMobile && "rotate-180")} />
                                </div>
                                <span className="font-black text-white">{formatPrice(displaySubtotal)}</span>
                            </button>

                            <AnimatePresence>
                                {showSummaryMobile && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-x border-b border-white/5 bg-white/[0.01] rounded-b-2xl mx-1"
                                    >
                                        <div className="p-4 space-y-4">
                                            {displayItems.map(item => (
                                                <div key={item.product.id} className="flex gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                                                        <OptimizedImage 
                                                            src={item.product.images?.[0] || ''} 
                                                            width={100} 
                                                            alt={item.product.name}
                                                            containerClassName="h-full w-full"
                                                            className="h-full w-full object-cover" 
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                                                        <p className="text-[10px] text-theme-tertiary">Cantidad: {item.quantity}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-white">{formatPrice(item.product.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Main Form container */}
                        <CheckoutForm
                            onSuccess={() => { }}
                            onBack={() => navigate(-1)}
                        />
                    </div>

                    {/* RIGHTSIDE: Sticky Summary (Desktop) */}
                    <div className="hidden lg:block w-full lg:w-[400px] xl:w-[450px]">
                        <div className="sticky top-28 xl:top-32 space-y-6">
                            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-2xl">
                                <div className="border-b border-white/5 bg-white/[0.02] px-8 py-6">
                                    <h3 className="text-lg font-black tracking-tight text-white uppercase italic">Tu Pedido</h3>
                                </div>

                                <div className="max-h-[40vh] overflow-y-auto scrollbar-thin px-8 py-6 space-y-6">
                                    {displayItems.map((item) => (
                                        <motion.div
                                            key={item.product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-5"
                                        >
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 group">
                                                <OptimizedImage
                                                    src={item.product.images?.[0] || ''}
                                                    alt={item.product.name}
                                                    width={150}
                                                    height={150}
                                                    containerClassName="h-full w-full"
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-vape-500 text-[10px] font-black text-slate-900 shadow-lg z-10">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h4 className="text-sm font-bold leading-tight text-white truncate">{item.product.name}</h4>
                                                {item.variant_name && (
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-vape-400">{item.variant_name}</p>
                                                )}
                                                <p className="text-xs font-medium text-theme-tertiary">{formatPrice(item.product.price)} c/u</p>
                                            </div>
                                            <span className="text-sm font-black text-white">{formatPrice(item.product.price * item.quantity)}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="border-t border-white/5 bg-black/20 p-8 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-theme-tertiary">Subtotal</span>
                                        <span className="font-bold text-white">{formatPrice(displaySubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-theme-tertiary">Envío</span>
                                        <span className="font-bold text-herbal-400 underline decoration-dotted underline-offset-4 cursor-help">Calculado al enviar</span>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400 mb-1">Total Final</p>
                                            <p className="text-3xl font-black text-white tracking-tighter">{formatPrice(displaySubtotal)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-vape-500/10 px-3 py-1 text-[10px] font-bold text-vape-400 border border-vape-500/20">
                                                Pagarás en MXN
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center">
                                <p className="text-[10px] font-medium text-theme-tertiary leading-relaxed italic">
                                    Estás en una zona segura de VSM Store. Todos tus datos están encriptados y protegidos por Supabase 256-bit SSL.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
