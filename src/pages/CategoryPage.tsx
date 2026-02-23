// Página de categoría - VSM Store
import { useParams, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, FolderOpen, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { useCategoryBySlug, useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { SEO } from '@/components/seo/SEO';
import type { Section } from '@/types/product';
import { useState, useMemo } from 'react';
import type { Product } from '@/types/product';

type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'name_az' | 'newest';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'relevance',  label: 'Relevancia' },
    { value: 'price_asc',  label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'name_az',    label: 'Nombre A–Z' },
    { value: 'newest',     label: 'Más recientes' },
];

function sortProducts(products: Product[], sort: SortKey): Product[] {
    const arr = [...products];
    switch (sort) {
        case 'price_asc':  return arr.sort((a, b) => a.price - b.price);
        case 'price_desc': return arr.sort((a, b) => b.price - a.price);
        case 'name_az':    return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        case 'newest':     return arr.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
        default:           return arr;
    }
}

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
    const [sort, setSort] = useState<SortKey>('relevance');
    const [sortOpen, setSortOpen] = useState(false);

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

    // SEO handled by component

    const isVape = section === 'vape';
    const sectionLabel = isVape ? 'Vape' : '420';
    const isLoading = categoryLoading || (!hasChildren && productsLoading);

    // Sorted products
    const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

    // Error al cargar categoría
    if (categoryError) {
        return (
            <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
                <span className="mb-4 text-5xl">⚠️</span>
                <h2 className="mb-2 text-xl font-bold text-theme-primary">Error al cargar categoría</h2>
                <Link
                    to="/"
                    className="mt-4 rounded-xl bg-theme-secondary/80 px-6 py-2.5 text-sm font-medium text-theme-primary transition-all hover:bg-theme-secondary"
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
                <FolderOpen className="mb-4 h-12 w-12 text-theme-secondary" />
                <h2 className="mb-2 text-xl font-bold text-theme-primary">Categoría no encontrada</h2>
                <p className="mb-6 text-sm text-theme-secondary">
                    La categoría "{slug}" no existe o no está disponible.
                </p>
                <Link
                    to="/"
                    className="rounded-xl bg-theme-secondary/80 px-6 py-2.5 text-sm font-medium text-theme-primary transition-all hover:bg-theme-secondary"
                >
                    <Home className="mr-2 inline h-4 w-4" />
                    Ir al inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="container-vsm py-8">
            <SEO
                title={category?.name}
                description={category?.description || undefined}
                type="website"
            />
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center gap-1.5 text-xs text-theme-secondary overflow-x-auto">
                <Link to="/" className="flex-shrink-0 hover:text-theme-primary transition-colors">
                    Inicio
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary/50" />
                <Link
                    to={`/?section=${section}`}
                    className={cn(
                        'flex-shrink-0 transition-colors',
                        isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                    )}
                >
                    {sectionLabel}
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary/50" />
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
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
                        {category?.name ?? '...'}
                    </h1>
                    {category?.description && (
                        <p className="mt-2 text-sm text-theme-secondary leading-relaxed max-w-2xl">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Sort selector — solo en vistas de hoja (con productos) */}
                {!hasChildren && !isLoading && products.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setSortOpen(o => !o)}
                            onBlur={() => setTimeout(() => setSortOpen(false), 150)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all',
                                sortOpen
                                    ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                    : 'border-theme/40 bg-theme-primary/60 text-theme-secondary hover:border-theme/60'
                            )}
                        >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            {SORT_OPTIONS.find(o => o.value === sort)?.label}
                        </button>
                        {sortOpen && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-xl border border-theme/30 bg-theme-primary shadow-xl">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onMouseDown={() => { setSort(opt.value); setSortOpen(false); }}
                                        className={cn(
                                            'w-full px-4 py-2.5 text-left text-xs transition-colors first:rounded-t-xl last:rounded-b-xl',
                                            sort === opt.value
                                                ? 'bg-vape-500/10 font-semibold text-vape-400'
                                                : 'text-theme-secondary hover:bg-theme-secondary/30'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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
                <ProductGrid products={sortedProducts} isLoading={isLoading} />
            )}
        </div>
    );
}
