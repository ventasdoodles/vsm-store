// Página de categoría - VSM Store
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home, FolderOpen, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sortProducts, SORT_OPTIONS, type SortKey } from '@/lib/product-sorting';
import { useProducts } from '@/hooks/useProducts';
import { useCategoryBySlug, useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { SEO } from '@/components/seo/SEO';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useSectionFromPath } from '@/hooks/useSectionFromPath';

export function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const section = useSectionFromPath();
    const [sort, setSort] = useState<SortKey>('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera (desktop)
    useEffect(() => {
        if (!sortOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setSortOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sortOpen]);

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

    // Solo fetch productos si la categoría ya cargó y NO tiene hijos (categoría hoja)
    const shouldFetchProducts = !!category && !hasChildren;
    const {
        data: products = [],
        isLoading: productsLoading,
    } = useProducts(
        shouldFetchProducts
            ? { section, categoryId: category.id }
            : { section, categoryId: undefined }
    );

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
                    to={`/${section}`}
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
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setSortOpen(o => !o)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all',
                                sortOpen
                                    ? cn('border-opacity-50 bg-opacity-10', isVape ? 'border-vape-500 bg-vape-500/10 text-vape-400' : 'border-herbal-500 bg-herbal-500/10 text-herbal-400')
                                    : 'border-theme bg-theme-primary/60 text-theme-secondary hover:border-theme-strong'
                            )}
                        >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
                            <span className="sm:hidden">Ordenar</span>
                        </button>

                        {/* Dropdown Desktop */}
                        {sortOpen && (
                            <div className="hidden sm:block absolute right-0 top-full z-10 mt-1 w-52 rounded-xl border border-theme bg-theme-primary shadow-xl">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                        className={cn(
                                            'w-full px-4 py-2.5 text-left text-xs transition-colors first:rounded-t-xl last:rounded-b-xl',
                                            sort === opt.value
                                                ? cn('font-semibold', isVape ? 'bg-vape-500/10 text-vape-400' : 'bg-herbal-500/10 text-herbal-400')
                                                : 'text-theme-secondary hover:bg-theme-secondary/30'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Bottom Sheet Mobile */}
                        <div className="sm:hidden">
                            <BottomSheet
                                isOpen={sortOpen}
                                onClose={() => setSortOpen(false)}
                                title="Ordenar por"
                            >
                                <div className="flex flex-col gap-2">
                                    {SORT_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                            className={cn(
                                                'w-full rounded-xl px-4 py-4 text-left text-sm font-medium transition-all',
                                                sort === opt.value
                                                    ? cn('border', isVape ? 'bg-vape-500/10 text-vape-400 border-vape-500/20' : 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20')
                                                    : 'bg-theme-secondary/10 text-theme-secondary border border-transparent hover:bg-theme-secondary/20'
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </BottomSheet>
                        </div>
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
