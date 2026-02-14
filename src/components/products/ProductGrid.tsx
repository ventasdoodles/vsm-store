// Grid de productos - VSM Store
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    className?: string;
}

/**
 * Grid responsive de productos con animaciones stagger, carga y estado vacío
 */
export function ProductGrid({ products, isLoading = false, className }: ProductGridProps) {
    // Estado: cargando — skeleton shimmer
    if (isLoading) {
        return (
            <div className={cn('grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4', className)}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-900/30"
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-800/50 py-20 text-center animate-fade-in">
                <div className="mb-4 rounded-2xl bg-primary-800/20 p-5">
                    <PackageOpen className="h-12 w-12 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-primary-400">
                    No hay productos disponibles
                </p>
                <p className="mt-1 text-xs text-primary-600">
                    Intenta con otra categoría o sección
                </p>
            </div>
        );
    }

    // Estado: con productos — stagger animation
    return (
        <div className={cn('grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4', className)}>
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    className="animate-slide-up"
                />
            ))}
        </div>
    );
}
