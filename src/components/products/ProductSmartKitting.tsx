import { memo } from 'react';
import { m } from 'framer-motion';
import { Plus, Sparkles, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useSmartBundleOffer } from '@/hooks/useSmartBundleOffer';
import { useNotification } from '@/hooks/useNotification';
import { useTacticalUI } from '@/contexts/TacticalContext';
import type { Product } from '@/types/product';

interface ProductSmartKittingProps {
    product: Product;
}

export const ProductSmartKitting = memo(({ product }: ProductSmartKittingProps) => {
    const { applyBundle } = useCartStore();
    const subtotal = useCartStore(selectSubtotal);
    const { playSuccess, triggerHaptic } = useTacticalUI();
    const notify = useNotification();
    const { data: offer, isLoading } = useSmartBundleOffer(product, subtotal);

    if (isLoading || !offer || !offer.suggestedProduct) return null;

    const { bundleName, suggestedProduct, couponCode, discountPercentage } = offer;

    const currentPrice = product.price || 0;
    const suggestedPrice = suggestedProduct.price || 0;
    const originalTotal = currentPrice + suggestedPrice;
    const discountedTotal = originalTotal * (1 - discountPercentage / 100);

    const handleAddBundle = () => {
        applyBundle(suggestedProduct as Product, couponCode);
        playSuccess();
        triggerHaptic([50, 50, 50]);
        notify.success(`¡Kitting Completado!`, `Agregamos ${suggestedProduct.name} con ${discountPercentage}% de descuento.`);
    };

    return (
        <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-vape-500/10 to-transparent border border-vape-500/20 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-vape-500/10 blur-[80px] rounded-full -z-10" />

            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-vape-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Kitting Sugerido</h3>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-vape-500/20 text-vape-400 border border-vape-500/20 text-[10px] font-bold uppercase tracking-widest">
                    Ahorra {discountPercentage}%
                </span>
            </div>

            <p className="text-xs text-theme-tertiary mb-6">
                Nuestra IA "{bundleName}" te sugiere llevar esto junto para la mejor experiencia.
            </p>

            <div className="flex items-center gap-2 sm:gap-4 mb-6">
                {/* Main Product */}
                <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 p-3 flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative">
                        <OptimizedImage 
                            src={product.images?.[0] || product.cover_image || ''} 
                            alt={product.name || ''}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className="text-[10px] font-bold text-center text-white line-clamp-2">{product.name}</span>
                </div>

                <Plus className="w-6 h-6 text-white/20 shrink-0" />

                {/* Suggested Product */}
                <div className="flex-1 rounded-2xl bg-black/40 border border-vape-500/30 p-3 flex flex-col items-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-vape-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative z-10">
                        <OptimizedImage 
                            src={suggestedProduct.images?.[0] || suggestedProduct.cover_image || ''} 
                            alt={suggestedProduct.name || ''}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <span className="text-[10px] font-bold text-center text-vape-100 line-clamp-2 z-10">{suggestedProduct.name}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                    <div className="text-[11px] text-theme-tertiary mb-1">Total del Bundle</div>
                    <div className="flex items-end gap-2">
                        <span className="text-sm text-white/40 line-through">{formatPrice(originalTotal)}</span>
                        <span className="text-xl font-black text-vape-400">{formatPrice(discountedTotal)}</span>
                    </div>
                </div>

                <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddBundle}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-vape-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-vape-400 transition-colors shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                >
                    <span className="hidden sm:inline">Agregar Kit</span>
                    <span className="sm:hidden">Kit</span>
                    <ChevronRight className="w-4 h-4" />
                </m.button>
            </div>
        </m.div>
    );
});
