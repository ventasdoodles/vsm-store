// Página de categoría - VSM Store
import { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { useCategoryBySlug, useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import type { Section } from '@/types/product';

/**
 * Extrae la sección de la URL: /vape/... → 'vape', /420/... → '420'
 */
function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? '420' : 'vape';
}

export function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const section = useSectionFromPath();

    const {
        data: category,
        isLoading: categoryLoading,
        error: categoryError,
    } = useCategoryBySlug(slug ?? '', section);

    // Obtener todas las categorías para buscar hijos
    const { data: allCategories = [] } = useCategories(section);

    // Buscar subcategorías hijas de la categoría actual
    const childCategories = category
        ? allCategories.filter((c) => c.parent_id === category.id)
        : [];

    const hasChildren = childCategories.length > 0;

    // Solo fetch productos si NO tiene hijos (es categoría hoja)
    const {
        data: products = [],
        isLoading: productsLoading,
    } = useProducts({
        section,
        categoryId: hasChildren ? undefined : category?.id,
    });

    // SEO: título de la página
    useEffect(() => {
        if (category) {
            document.title = `${category.name} | VSM Store`;
        }
        return () => { document.title = 'VSM Store'; };
    }, [category]);

    const isVape = section === 'vape';
    const sectionLabel = isVape ? 'Vape' : '420';
    const isLoading = categoryLoading || (!hasChildren && productsLoading);

    // Error al cargar categoría
    if (categoryError) {
        return (
            <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
                <span className="mb-4 text-5xl">⚠️</span>
                <h2 className="mb-2 text-xl font-bold text-primary-200">Error al cargar categoría</h2>
                <Link
                    to="/"
                    className="mt-4 rounded-xl bg-primary-800 px-6 py-2.5 text-sm font-medium text-primary-300 transition-all hover:bg-primary-700"
                >
                    <Home className="mr-2 inline h-4 w-4" />
                    Ir al inicio
                </Link>
            </div>
        );
    }

    // Categoría no encontrada (ya cargó pero es null)
    if (!categoryLoading && !category) {
        return (
            <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
                <FolderOpen className="mb-4 h-12 w-12 text-primary-800" />
                <h2 className="mb-2 text-xl font-bold text-primary-200">Categoría no encontrada</h2>
                <p className="mb-6 text-sm text-primary-500">
                    La categoría "{slug}" no existe o no está disponible.
                </p>
                <Link
                    to="/"
                    className="rounded-xl bg-primary-800 px-6 py-2.5 text-sm font-medium text-primary-300 transition-all hover:bg-primary-700"
                >
                    <Home className="mr-2 inline h-4 w-4" />
                    Ir al inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="container-vsm py-8">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center gap-1.5 text-xs text-primary-500 overflow-x-auto">
                <Link to="/" className="flex-shrink-0 hover:text-primary-300 transition-colors">
                    Inicio
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-primary-700" />
                <Link
                    to={`/?section=${section}`}
                    className={cn(
                        'flex-shrink-0 transition-colors',
                        isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                    )}
                >
                    {sectionLabel}
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-primary-700" />
                <span
                    className={cn(
                        'truncate font-medium',
                        isVape ? 'text-vape-400' : 'text-herbal-400'
                    )}
                >
                    {category?.name ?? '...'}
                </span>
            </nav>

            {/* Título y descripción */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary-100 sm:text-3xl">
                    {category?.name ?? '...'}
                </h1>
                {category?.description && (
                    <p className="mt-2 text-sm text-primary-400 leading-relaxed max-w-2xl">
                        {category.description}
                    </p>
                )}
            </div>

            {/* Contenido: subcategorías o productos */}
            {hasChildren ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {childCategories.map((child) => (
                        <CategoryCard
                            key={child.id}
                            category={child}
                            section={section}
                        />
                    ))}
                </div>
            ) : (
                <ProductGrid products={products} isLoading={isLoading} />
            )}
        </div>
    );
}
