import { useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useSmartBundleOffer } from '@/hooks/useSmartBundleOffer';
import type { Product } from '@/types/product';

/**
 * Componente interno para Smart Upselling en el carrito
 * EVOLUCIÓN WAVE 21: Smart Dynamic Bundles con IA
 */
export const CartSmartUpsell = memo(({ product }: { product: Product }) => {
    const { bundleOffer, setBundleOffer, applyBundle } = useCartStore();
    const subtotal = useCartStore(selectSubtotal);
    const { playSuccess, triggerHaptic } = useTacticalUI();
    const notify = useNotification();
    const { data: offer } = useSmartBundleOffer(product, subtotal);

    useEffect(() => {
        if (offer && !bundleOffer) {
            setBundleOffer(offer);
        }
    }, [offer, bundleOffer, setBundleOffer]);

    if (!bundleOffer || !bundleOffer.suggestedProduct) return null;

    const { bundleName, suggestedProduct, couponCode, discountPercentage } = bundleOffer;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 border-t border-white/5 pt-6"
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vape-500/20 text-vape-500 shadow-[0_0_15px_rgba(234,88,12,0.3)] animate-pulse">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
                        IA Suggestion
                    </h3>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[9px] font-black text-vape-400 uppercase tracking-widest">
                        Ahorra {discountPercentage}%
                    </span>
                </div>
            </div>

            <motion.div
                whileHover={{ y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl rounded-[2rem] p-6 border border-white/10 group"
            >
                {/* Abyssal Glow Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-vape-500/20 blur-[60px] rounded-full -z-10 group-hover:bg-vape-500/30 transition-colors" />
                
                <div className="flex gap-5">
                    <div className="relative flex-shrink-0">
                        <div className="h-28 w-28 overflow-hidden rounded-2xl bg-black/40 border border-white/10 shadow-2xl relative z-10">
                            <OptimizedImage
                                src={suggestedProduct.images?.[0] || suggestedProduct.cover_image || ''}
                                alt={suggestedProduct.name || ''}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        {/* Connecting Plus Sign */}
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center z-20 shadow-lg">
                            <Plus className="h-3 w-3 text-white" />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center flex-1">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">
                            {bundleName}
                        </h4>
                        <h3 className="text-sm font-bold text-white mb-3 line-clamp-1">
                            {suggestedProduct.name}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-white/50 line-through">
                                    {formatPrice(suggestedProduct.price || 0)}
                                </span>
                                <span className="text-lg font-black text-white">
                                    {formatPrice((suggestedProduct.price || 0) * (1 - discountPercentage/100))}
                                </span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (suggestedProduct) {
                                        applyBundle(suggestedProduct as Product, couponCode);
                                        playSuccess();
                                        triggerHaptic([10, 30, 10]);
                                        notify.success('Bundle Creado', `¡${bundleName} listo! Descuento aplicado.`);
                                    }
                                }}
                                className="px-4 py-2 rounded-xl bg-vape-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(234,88,12,0.3)] border border-white/20"
                            >
                                Armar Combo
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer-slow bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </motion.div>

            <p className="mt-4 px-2 text-[9px] font-medium text-white/30 italic text-center">
                * Basado en tus gustos y existencias actuales.
            </p>
        </motion.div>
    );
});
