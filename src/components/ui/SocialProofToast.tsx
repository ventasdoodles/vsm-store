import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useRealtimeOrders, type RealtimeOrderEvent } from '@/hooks/useRealtimeOrders';

/**
 * SocialProofToast - Real-time purchase notifications.
 * 
 * @architecture Independent Functional Lego
 * @design Glassmorphism, Staggered entry, Auto-hide.
 * @policy Zero Fakes - Only shows real orders from Supabase Realtime.
 */
export const SocialProofToast = () => {
    const [event, setEvent] = useState<RealtimeOrderEvent | null>(null);

    const handleNewOrder = useCallback((newOrder: RealtimeOrderEvent) => {
        setEvent(newOrder);
        // Auto-hide after 6 seconds
        setTimeout(() => {
            setEvent(null);
        }, 6000);
    }, []);

    useRealtimeOrders(handleNewOrder);

    return (
        <AnimatePresence>
            {event && (
                <motion.div
                    initial={{ opacity: 0, x: -100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="fixed bottom-6 left-6 z-[100] max-w-sm w-full sm:w-[320px]"
                >
                    <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-3xl p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] spotlight-container">
                        {/* Interactive Spotlight Effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(59,130,246,0.1)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex gap-4 items-center">
                            {/* Product Thumbnail with Glow */}
                            <div className="relative h-14 w-14 flex-shrink-0">
                                <div className="absolute -inset-1 bg-vape-500/20 blur-md rounded-lg animate-pulse" />
                                <div className="relative h-full w-full rounded-lg border border-white/10 overflow-hidden bg-white/5">
                                    {event.product_image ? (
                                        <img 
                                            src={event.product_image} 
                                            alt={event.product_name} 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400 mb-0.5">
                                    ¡Alguien acaba de comprar!
                                </p>
                                <p className="text-xs font-bold text-white truncate leading-tight">
                                    <span className="text-vape-300">{event.customer_name}</span> de {event.city}
                                </p>
                                <p className="text-[11px] text-white/50 truncate mt-1">
                                    Compró: <span className="text-white/80 font-medium italic">{event.product_name}</span>
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setEvent(null)}
                                className="absolute top-2 right-2 p-1 text-white/20 hover:text-white transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Progress bar timer */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-vape-500 to-herbal-500 origin-left"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


