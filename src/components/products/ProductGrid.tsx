// Grid de productos - VSM Store
import { PackageOpen, RotateCcw, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { getVape420StorefrontRenderabilityConfig } from '@/config/productization';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    className?: string;
    onClearFilter?: () => void;
    emptyStateTitle?: string;
    emptyStateSubtext?: string;
}

/**
 * Grid responsive de productos con animaciones stagger, carga y estado vacío
 */
export function ProductGrid({ products, isLoading = false, className, onClearFilter, emptyStateTitle, emptyStateSubtext }: ProductGridProps) {
    const { config } = useActiveVerticalPack();
    const renderabilityConfig = config 
        ? getVape420StorefrontRenderabilityConfig(config)
        : null;

    // Estado: cargando — skeleton shimmer
    if (isLoading || !renderabilityConfig) {
        return (
            <div className={cn('grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4', className)}>
                {Array.from({ length: renderabilityConfig?.grid.loadingSkeletonCount ?? 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-2xl border border-theme bg-theme-secondary/30"
                        style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                    >
                        <div className="h-52 skeleton-shimmer" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
                            <div className="h-3 w-full rounded-lg skeleton-shimmer" />
                            <div className="h-5 w-1/3 rounded-lg skeleton-shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Estado: sin productos
    if (products.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-12 py-20 text-center shadow-2xl backdrop-blur-xl" 
                role="status" 
                aria-live="polite"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-theme-secondary/20 rounded-full blur-[60px] pointer-events-none" />
                <motion.div 
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                    className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-theme-secondary/20 to-transparent border border-white/10 shadow-inner"
                >
                    <PackageOpen className="h-10 w-10 text-white drop-shadow-md" />
                </motion.div>
                
                <h3 className="relative z-10 text-xl font-black text-white uppercase tracking-tight drop-shadow-sm">
                    {emptyStateTitle || renderabilityConfig.grid.emptyStateTitle}
                </h3>
                <p className="relative z-10 mt-3 max-w-sm text-sm font-medium text-theme-secondary/80">
                    {emptyStateSubtext || renderabilityConfig.grid.emptyStateSubtext}
                </p>
                
                {onClearFilter ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClearFilter}
                        className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-white/10 hover:shadow-lg"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Limpiar filtro
                    </motion.button>
                ) : (
                    <Link to={renderabilityConfig.grid.emptyStateCtaHref}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative z-10 mt-8 overflow-hidden inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-primary/80 to-accent-primary px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-black shadow-xl transition-all hover:shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.4)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                            <ShoppingBag className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">{renderabilityConfig.grid.emptyStateCtaLabel}</span>
                        </motion.button>
                    </Link>
                )}
            </motion.div>
        );
    }

    // Estado: con productos — stagger animation
    return (
        <div className={cn('grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4', className)}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    className="animate-slide-up"
                />
            ))}
        </div>
    );
}
