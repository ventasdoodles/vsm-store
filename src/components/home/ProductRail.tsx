// Riel de Productos - VSM Store
// Scroll horizontal de productos (Featured, New, Bestseller)
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { useFeaturedProducts, useNewProducts, useBestsellerProducts } from '@/hooks/useProducts';
import type { Section } from '@/types/product';

interface ProductRailProps {
    type: 'featured' | 'new' | 'bestseller';
    title: string;
    section?: Section;
    className?: string;
}

export function ProductRail({ type, title, section, className }: ProductRailProps) {
    // Select hook based on type
    const useHook = type === 'featured'
        ? useFeaturedProducts
        : type === 'new'
            ? useNewProducts
            : useBestsellerProducts;

    const { data: products = [], isLoading } = useHook(section);

    const getIcon = () => {
        switch (type) {
            case 'featured': return <Sparkles className="h-4 w-4 text-amber-400" />;
            case 'new': return <Flame className="h-4 w-4 text-vape-400" />;
            case 'bestseller': return <TrendingUp className="h-4 w-4 text-emerald-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className={cn('py-6', className)}>
                <div className="mb-4 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="h-6 w-32 animate-pulse rounded-lg bg-theme-secondary/40" />
                    <div className="h-4 w-16 animate-pulse rounded-lg bg-theme-secondary/40" />
                </div>
                <div className="flex gap-4 overflow-hidden px-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[160px] h-64 animate-pulse rounded-2xl bg-theme-secondary/30" />
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className={cn('py-2', className)}>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <h2 className="text-xl font-bold text-theme-primary">{title}</h2>
                </div>
                <Link
                    to={section ? `/${section}` : '/buscar'}
                    className="flex items-center gap-1 text-sm font-medium text-vape-400 hover:text-vape-300 transition-colors"
                >
                    Ver todo
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Rail */}
            <div className="scrollbar-hide flex overflow-x-auto pb-4 gap-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 max-w-full">
                {products.map((product, i) => (
                    <div key={product.id} className="min-w-[170px] max-w-[170px] snap-start sm:min-w-[200px] sm:max-w-[200px]">
                        <ProductCard product={product} index={i} compact />
                    </div>
                ))}
            </div>
        </section>
    );
}
