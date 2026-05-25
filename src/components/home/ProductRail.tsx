/**
 * ProductRail — Riel horizontal de productos (Featured, New, Bestseller).
 *
 * @module ProductRail
 * @independent Componente 100% independiente. Obtiene productos via hooks useProducts.
 * @props type: 'featured' | 'new' | 'bestseller', title, section?, className?
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { useFeaturedProducts, useNewProducts, useBestsellerProducts } from '@/hooks/useProducts';
import type { Section } from '@/types/constants';
import { getVape420StorefrontRenderabilityConfig } from '@/config/productization';

interface ProductRailProps {
    type: 'featured' | 'new' | 'bestseller';
    title: string;
    section?: Section;
    className?: string;
}

const railVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export function ProductRail({ type, title, section, className }: ProductRailProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const renderabilityConfig = getVape420StorefrontRenderabilityConfig(section);

    // Select hook based on type
    const useHook = type === 'featured'
        ? useFeaturedProducts
        : type === 'new'
            ? useNewProducts
            : useBestsellerProducts;

    const { data: products = [], isLoading } = useHook(section);
    const theme = getIconInfo();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 350;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    function getIconInfo() {
        switch (type) {
            case 'featured': return { icon: <Sparkles className="h-6 w-6 text-white" />, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/40' };
            case 'new': return { icon: <Flame className="h-6 w-6 text-white" />, gradient: 'from-vape-400 to-vape-600', shadow: 'shadow-vape-500/40' };
            case 'bestseller': return { icon: <TrendingUp className="h-6 w-6 text-white" />, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/40' };
        }
    }

    if (isLoading) {
        return (
            <div className={cn('py-6', className)}>
                <div className="mb-6 flex items-center justify-between px-4 sm:px-0">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-theme-secondary/40" />
                        <div className="h-8 w-48 animate-pulse rounded-lg bg-theme-secondary/40" />
                    </div>
                </div>
                <div className="flex gap-4 overflow-hidden px-4 sm:px-0">
                    {Array.from({ length: renderabilityConfig.rail.loadingSkeletonCount }).map((_, i) => (
                        <div key={i} className="min-w-[200px] h-72 sm:min-w-[240px] rounded-[2rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 overflow-hidden flex flex-col skeleton-shimmer">
                            <div className="aspect-square bg-white/5 w-full" />
                            <div className="p-6 flex-1 flex flex-col justify-end gap-3 bg-gradient-to-b from-transparent to-black/30">
                                <div className="w-12 h-3 bg-white/10 rounded-full" />
                                <div className="w-full h-4 bg-white/10 rounded-full" />
                                <div className="flex justify-between items-end mt-4">
                                    <div className="w-16 h-5 bg-white/10 rounded-full" />
                                    <div className="w-10 h-10 bg-white/10 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <section className={cn('py-4 group/section', className)}>
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center shadow-lg ${theme.shadow}`}>
                            {theme.icon}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tighter uppercase italic drop-shadow-sm">
                            {title}
                        </h2>
                    </div>

                    <Link
                        to={renderabilityConfig.rail.emptyStateCtaHref}
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-theme-secondary/40 hover:bg-theme-secondary/60 backdrop-blur-md text-sm font-bold text-theme-primary uppercase tracking-wider transition-all duration-300 hover:scale-105"
                    >
                        {renderabilityConfig.rail.emptyStateCtaLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] px-6 py-8 sm:px-8 sm:py-10">
                    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg ${theme.shadow}`}>
                            {theme.icon}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">
                            {renderabilityConfig.rail.emptyStateTitle}
                        </h3>
                        <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-theme-secondary">
                            {renderabilityConfig.rail.emptyStateDescription}
                        </p>
                        <Link
                            to={renderabilityConfig.rail.emptyStateCtaHref}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:scale-105"
                        >
                            {renderabilityConfig.rail.emptyStateCtaLabel}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id={type === 'bestseller' ? 'mas-vendidos' : undefined} className={cn('py-4 group/section', className)}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                className="mb-8 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center shadow-lg ${theme.shadow}`}>
                        {theme.icon}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tighter uppercase italic drop-shadow-sm">
                        {title}
                    </h2>
                </div>

                <Link
                    to={renderabilityConfig.rail.emptyStateCtaHref}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-theme-secondary/40 hover:bg-theme-secondary/60 backdrop-blur-md text-sm font-bold text-theme-primary uppercase tracking-wider transition-all duration-300 hover:scale-105"
                >
                    {renderabilityConfig.rail.emptyStateCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </motion.div>

            {/* Riel */}
            <div className="relative">
                {/* Controles de Navegación Custom (Desktop) */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-theme-primary/80 backdrop-blur-xl border border-theme/20 hover:border-theme-strong rounded-full hidden items-center justify-center shadow-2xl opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 sm:flex"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-6 h-6 text-theme-primary" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-theme-primary/80 backdrop-blur-xl border border-theme/20 hover:border-theme-strong rounded-full hidden items-center justify-center shadow-2xl opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 sm:flex"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-6 h-6 text-theme-primary" />
                </button>

                {/* Lista de productos animada */}
                <motion.div
                    ref={scrollRef}
                    variants={railVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-5%' }}
                    className="scrollbar-hide flex overflow-x-auto pb-8 gap-5 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 max-w-full"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            className="min-w-[200px] max-w-[200px] sm:min-w-[240px] sm:max-w-[240px] snap-start"
                        >
                            <ProductCard product={product} compact />
                        </motion.div>
                    ))}

                    {/* Botón ver más dinámico (Mobile) */}
                    <div className="sm:hidden min-w-[150px] flex items-center justify-center snap-start pr-4">
                        <Link
                            to={renderabilityConfig.rail.emptyStateCtaHref}
                            className="flex flex-col items-center gap-3 text-theme-secondary hover:text-theme-primary transition-colors"
                        >
                            <div className="w-14 h-14 rounded-full bg-theme-secondary/20 flex items-center justify-center border border-theme/30 backdrop-blur-md">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">
                                {renderabilityConfig.rail.emptyStateCtaLabel}
                            </span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
