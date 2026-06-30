import { memo } from 'react';
import { m } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useBestsellerProducts } from '@/hooks/useProducts';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';

export const ProactiveAISuggestions = memo(({ 
    title = "Sugerencias Inteligentes",
    limit = 2,
    className = "mt-8 w-full max-w-[280px]"
}: { 
    title?: string, 
    limit?: number,
    className?: string 
}) => {
    const { config } = useActiveVerticalPack();
    const { data: bestsellers } = useBestsellerProducts({ section: config?.id as any || 'vape', limit });
    const closeCart = useCartStore(s => s.closeCart);

    if (!bestsellers || bestsellers.length === 0) return null;

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={className}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-vape-500/20 text-vape-500 shadow-[0_0_15px_rgba(234,88,12,0.3)] animate-pulse">
                    <Zap className="h-3 w-3 fill-current" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                    {title}
                </h4>
            </div>

            <div className="flex flex-col gap-3">
                {bestsellers.map((product, idx) => (
                    <m.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                        <Link
                            to={`/product/${config?.id || 'vape'}/${product.slug}` as any}
                            onClick={closeCart}
                            className="group flex items-center gap-4 rounded-2xl bg-white/[0.03] p-3 pr-4 border border-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                        >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/50 border border-white/10">
                                {product.images[0] && (
                                    <OptimizedImage
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{product.name}</p>
                                <p className="text-[10px] text-vape-400 font-black">{formatPrice(product.price)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>
                    </m.div>
                ))}
            </div>
        </m.div>
    );
});
