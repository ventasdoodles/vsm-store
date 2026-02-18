// Wrapper que distingue entre categoría y producto usando la misma ruta - VSM Store
// Dado que /vape/:slug puede ser una categoría o un producto,
// intentamos primero como categoría; si no existe, renderizamos como producto.
import { useParams, useLocation } from 'react-router-dom';
import { useCategoryBySlug } from '@/hooks/useCategories';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductDetail } from '@/pages/ProductDetail';
import { SECTIONS } from '@/types/constants';
import type { Section } from '@/types/constants';

function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? SECTIONS.CANNABIS : SECTIONS.VAPE;
}

/**
 * Resuelve si un slug es categoría o producto.
 * Primero busca categoría por slug; si existe → CategoryPage, si no → ProductDetail.
 */
export function SectionSlugResolver() {
    const { slug } = useParams<{ slug: string }>();
    const section = useSectionFromPath();

    const {
        data: category,
        isLoading,
    } = useCategoryBySlug(slug ?? '', section);

    // Mientras carga, no sabemos aún qué renderizar
    if (isLoading) {
        return (
            <div className="container-vsm py-8">
                <div className="space-y-4 animate-pulse">
                    <div className="h-6 w-40 rounded-lg bg-primary-800/50" />
                    <div className="h-10 w-2/3 rounded-lg bg-primary-800/50" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 rounded-2xl bg-primary-800/40" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Si encontramos una categoría → CategoryPage
    if (category) {
        return <CategoryPage />;
    }

    // Si no es categoría → ProductDetail
    return <ProductDetail />;
}
