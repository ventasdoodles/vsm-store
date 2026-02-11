// Grid de productos - VSM Store
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    className?: string;
}

/**
 * Grid responsive de productos con estados de carga y vacío
 */
export function ProductGrid({ products, isLoading = false, className }: ProductGridProps) {
    // Estado: cargando
    if (isLoading) {
        return (
            <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4', className)}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Estado: sin productos
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-800 py-16 text-center">
                <PackageOpen className="mb-3 h-12 w-12 text-primary-700" />
                <p className="text-sm font-medium text-primary-500">
                    No hay productos disponibles
                </p>
                <p className="mt-1 text-xs text-primary-600">
                    Intenta con otra categoría o sección
                </p>
            </div>
        );
    }

    // Estado: con productos
    return (
        <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4', className)}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
