import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';

interface RelatedProductsProps {
    product: Product;
}

/**
 * Sección horizontal con scroll de productos recomendados inteligentemente
 */
export function RelatedProducts({ product }: RelatedProductsProps) {
    const { data: related = [], isLoading } = useSmartRecommendations(product, 8);

    // No mostrar si está cargando o no hay relacionados
    if (isLoading || related.length === 0) return null;

    return (
        <section className="mt-4">
            {/* Grid horizontal con scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                {related.map((item) => (
                    <div
                        key={item.id}
                        className="w-56 flex-shrink-0 snap-start"
                    >
                        <ProductCard product={item} className="h-full" />
                    </div>
                ))}
            </div>
        </section>
    );
}
