// Página de detalle de producto - VSM Store
import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, AlertTriangle, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCategoryById } from '@/hooks/useCategories';
import { ProductImages } from '@/components/products/ProductImages';
import { ProductInfo } from '@/components/products/ProductInfo';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { SEO } from '@/components/seo/SEO';
import type { Section } from '@/types/product';

/**
 * Extrae la sección de la URL: /vape/... → 'vape', /420/... → '420'
 */
function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? '420' : 'vape';
}

export function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const section = useSectionFromPath();

    const {
        data: product,
        isLoading,
        error,
    } = useProductBySlug(slug ?? '', section);

    // SEO handled by component

    // Analytics
    useEffect(() => {
        if (product) {
            import('@/lib/analytics').then(({ trackViewItem }) => {
                trackViewItem(product);
            });
        }
    }, [product]);

    // --- ESTADO: Loading ---
    if (isLoading) {
        return (
            <div className="container-vsm py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Skeleton galería */}
                    <div className="space-y-3">
                        <div className="aspect-square rounded-2xl skeleton-shimmer" />
                        <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 w-16 rounded-lg skeleton-shimmer" />
                            ))}
                        </div>
                    </div>
                    {/* Skeleton info */}
                    <div className="space-y-4">
                        <div className="h-5 w-24 rounded-full skeleton-shimmer" />
                        <div className="h-8 w-3/4 rounded-lg skeleton-shimmer" />
                        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
                        <div className="h-4 w-2/3 rounded-lg skeleton-shimmer" />
                        <div className="h-10 w-1/3 rounded-lg skeleton-shimmer" />
                        <hr className="border-theme/50" />
                        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
                        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
                        <div className="h-4 w-1/2 rounded-lg skeleton-shimmer" />
                        <div className="h-12 w-full rounded-xl skeleton-shimmer mt-4" />
                    </div>
                </div>
            </div>
        );
    }

    // --- ESTADO: Error ---
    if (error) {
        console.error('[ProductDetail] Error:', error);
        return (
            <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
                <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
                <h2 className="mb-2 text-xl font-bold text-theme-primary">Error al cargar producto</h2>
                <p className="mb-6 text-sm text-theme-secondary">
                    Hubo un problema al obtener la información del producto.
                </p>
                <Link
                    to="/"
                    className="rounded-xl bg-theme-secondary px-6 py-2.5 text-sm font-medium text-theme-secondary transition-all hover:bg-theme-secondary/80 hover:text-theme-primary"
                >
                    <ArrowLeft className="mr-2 inline h-4 w-4" />
                    Volver al inicio
                </Link>
            </div>
        );
    }

    // --- ESTADO: Not Found ---
    if (!product) {
        return (
            <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
                <span className="mb-4 text-5xl">🔍</span>
                <h2 className="mb-2 text-xl font-bold text-theme-primary">Producto no encontrado</h2>
                <p className="mb-6 text-sm text-theme-secondary">
                    El producto que buscas no existe o ya no está disponible.
                </p>
                <Link
                    to="/"
                    className="rounded-xl bg-theme-secondary px-6 py-2.5 text-sm font-medium text-theme-secondary transition-all hover:bg-theme-secondary/80 hover:text-theme-primary"
                >
                    <Home className="mr-2 inline h-4 w-4" />
                    Ir al inicio
                </Link>
            </div>
        );
    }

    // --- ESTADO: Success ---

    return (
        <div className="container-vsm py-8">
            <SEO
                title={product.name}
                description={product.short_description || product.description || undefined}
                image={product.cover_image || product.images[0]}
                type="product"
            />
            {/* Breadcrumbs */}
            <Breadcrumbs section={product.section} productName={product.name} categoryId={product.category_id} />

            {/* Layout 2 columnas desktop */}
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
                {/* Columna izquierda: Galería */}
                <ProductImages
                    images={product.images}
                    coverImage={product.cover_image}
                    productName={product.name}
                />
                {/* Columna derecha: Info */}
                <ProductInfo product={product} />
            </div>

            {/* Productos relacionados */}
            <RelatedProducts
                currentProductId={product.id}
                categoryId={product.category_id}
                section={product.section}
            />
        </div>
    );
}

// ---------------------------------------------------
// Componente interno: Breadcrumbs
// ---------------------------------------------------

interface BreadcrumbsProps {
    section: Section;
    productName: string;
    categoryId?: string;
}

function Breadcrumbs({ section, productName, categoryId }: BreadcrumbsProps) {
    const isVape = section === 'vape';
    const sectionLabel = isVape ? 'Vape' : '420';

    const { data: category } = useCategoryById(categoryId);

    return (
        <nav className="flex items-center gap-1.5 text-xs text-primary-500 overflow-x-auto">
            <Link
                to="/"
                className="flex-shrink-0 hover:text-theme-secondary transition-colors"
            >
                Inicio
            </Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary" />
            <Link
                to={`/?section=${section}`}
                className={cn(
                    'flex-shrink-0 transition-colors',
                    isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                )}
            >
                {sectionLabel}
            </Link>
            {category && (
                <>
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary" />
                    <Link
                        to={`/${section}/${category.slug}`}
                        className={cn(
                            'flex-shrink-0 transition-colors',
                            isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                        )}
                    >
                        {category.name}
                    </Link>
                </>
            )}
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary" />
            <span className="truncate text-theme-secondary font-medium">
                {productName}
            </span>
        </nav>
    );
}

