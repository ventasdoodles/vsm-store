/**
 * ProductDetail — Página de detalle de producto (Composición).
 * 
 * @module ProductDetail
 * @composition Compone Breadcrumbs, Galería, Info y Productos Relacionados.
 */
import { useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useProductBySlug } from '@/hooks/useProducts';
import { ProductImages } from '@/components/products/ProductImages';
import { ProductInfo } from '@/components/products/ProductInfo';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { ProductBreadcrumbs } from '@/components/products/ProductBreadcrumbs';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { SEO } from '@/components/seo/SEO';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { cn } from '@/lib/utils';
import type { Section } from '@/types/product';

function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? '420' : 'vape';
}

export function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const section = useSectionFromPath();

    const { data: product, isLoading, error } = useProductBySlug(slug ?? '', section);

    // Analytics
    useEffect(() => {
        if (product) {
            import('@/lib/analytics').then(({ trackViewItem }) => {
                trackViewItem(product);
            });
        }
    }, [product]);

    if (isLoading) return <ProductSkeleton />;

    if (error || !product) {
        return (
            <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
                {error ? <AlertTriangle className="mb-4 h-12 w-12 text-red-500" /> : <span className="mb-4 text-5xl">🔍</span>}
                <h2 className="mb-2 text-xl font-bold text-theme-primary">
                    {error ? 'Error al cargar producto' : 'Producto no encontrado'}
                </h2>
                <p className="mb-6 text-sm text-theme-secondary">
                    {error
                        ? 'Hubo un problema al obtener la información del producto.'
                        : 'El producto que buscas no existe o ya no está disponible.'}
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

    const isVape = product.section === 'vape';

    return (
        <div className="relative isolate">
            <SEO
                title={product.name}
                description={product.short_description || product.description || undefined}
                image={product.cover_image || product.images[0]}
                type="product"
            />
            <ProductJsonLd product={product} />

            {/* Background premium accents */}
            <div className={cn(
                "absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none",
                isVape ? "bg-vape-500" : "bg-herbal-500"
            )} />

            <div className="container-vsm py-8">
                {/* 1. BREADCRUMBS */}
                <SectionErrorBoundary name="ProductBreadcrumbs">
                    <ProductBreadcrumbs
                        section={product.section}
                        productName={product.name}
                        categoryId={product.category_id}
                    />
                </SectionErrorBoundary>

                {/* 2. MAIN CONTENT (Images + Info) */}
                <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-start">
                    {/* Galería */}
                    <SectionErrorBoundary name="ProductImages">
                        <ProductImages
                            images={product.images}
                            coverImage={product.cover_image}
                            productName={product.name}
                        />
                    </SectionErrorBoundary>

                    {/* Info */}
                    <SectionErrorBoundary name="ProductInfo">
                        <ProductInfo product={product} />
                    </SectionErrorBoundary>
                </div>

                {/* 3. RELATED PRODUCTS */}
                <div className="mt-20">
                    <SectionErrorBoundary name="RelatedProducts">
                        <RelatedProducts
                            currentProductId={product.id}
                            categoryId={product.category_id}
                            section={product.section}
                        />
                    </SectionErrorBoundary>
                </div>
            </div>
        </div>
    );
}
