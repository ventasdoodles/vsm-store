// Productos relacionados - VSM Store
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import type { Section } from '@/types/product';

interface RelatedProductsProps {
    currentProductId: string;
    categoryId: string;
    section: Section;
}

/**
 * Sección horizontal con scroll de productos de la misma categoría
 */
export function RelatedProducts({ currentProductId, categoryId, section }: RelatedProductsProps) {
    const { data: products = [], isLoading } = useProducts({
        section,
        categoryId,
        limit: 9, // Traer uno extra por si se excluye el actual
    });

    // Excluir producto actual y limitar a 8
    const related = products
        .filter((p) => p.id !== currentProductId)
        .slice(0, 8);

    // No mostrar si está cargando o no hay relacionados
    if (isLoading || related.length === 0) return null;

    return (
        <section className="mt-12 border-t border-theme pt-10">
            <h2 className="mb-6 text-lg font-bold text-theme-primary">
                También te puede interesar
            </h2>

            {/* Grid horizontal con scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                {related.map((product) => (
                    <Link
                        key={product.id}
                        to={`/${product.section}/${product.slug}`}
                        className="w-56 flex-shrink-0 snap-start"
                    >
                        <ProductCard product={product} className="h-full" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
