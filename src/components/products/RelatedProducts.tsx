import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { getSmartRecommendations } from '@/services/products.service';
import type { Product } from '@/types/product';

interface RelatedProductsProps {
    product: Product;
}

/**
 * Sección horizontal con scroll de productos recomendados inteligentemente
 */
export function RelatedProducts({ product }: RelatedProductsProps) {
    const [related, setRelated] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSmartRelated = async () => {
            setIsLoading(true);
            try {
                const recommendations = await getSmartRecommendations(product, 8);
                setRelated(recommendations);
            } catch (error) {
                console.error('Error loading smart related products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (product) loadSmartRelated();
    }, [product]);

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
