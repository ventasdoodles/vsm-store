/**
 * ProductDetail — Página de detalle de producto (Composición).
 * 
 * @module ProductDetail
 * @composition Compone Breadcrumbs, Galería, Info y Productos Relacionados.
 */
import { useEffect } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';

import { useProductBySlug } from '@/hooks/useProducts';
import { ProductImages } from '@/components/products/ProductImages';
import { ProductInfo } from '@/components/products/ProductInfo';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { FrequentlyBoughtTogether } from '@/components/products/FrequentlyBoughtTogether';
import { TrustBadges } from '@/components/products/TrustBadges';
import { ProductBreadcrumbs } from '@/components/products/ProductBreadcrumbs';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { cn } from '@/lib/utils';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { SEO } from '@/components/seo/SEO';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { SECTIONS } from '@/types/constants';
import type { Section } from '@/types/constants';
import { motion } from 'framer-motion';
import { SocialProof } from '@/components/home/SocialProof';

function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? SECTIONS.CANNABIS : SECTIONS.VAPE;
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


    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative isolate"
        >
            <SEO
                title={product.name}
                description={product.short_description || product.description || undefined}
                image={product.cover_image || product.images[0]}
                type="product"
            />
            <ProductJsonLd product={product} />

            {/* Background Aesthetic Blobs - Premium Look */}
            <div className={cn(
                "absolute top-0 left-0 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] animate-pulse-slow opacity-20",
                product.section === 'vape' ? "bg-vape-500" : "bg-herbal-500"
            )} />
            <div className="absolute top-[20%] right-0 -z-10 h-[400px] w-[400px] rounded-full bg-theme-secondary/10 blur-[100px] animate-pulse-slow opacity-20" style={{ animationDelay: '2s' }} />

            <div className="container-vsm py-12 relative z-10">
                {/* Breadcrumbs - Spacing improved */}
                <div className="mb-10">
                    <SectionErrorBoundary name="ProductBreadcrumbs">
                        <ProductBreadcrumbs
                            section={product.section}
                            productName={product.name}
                            categoryId={product.category_id}
                        />
                    </SectionErrorBoundary>
                </div>

                                {/* Layout Principal */}
                <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
                    {/* Columna Izquierda: Galería */}
                    <SectionErrorBoundary name="ProductImages">
                        <div className="lg:sticky lg:top-28">
                            <ProductImages
                                images={product.images}
                                coverImage={product.cover_image}
                                productName={product.name}
                            />
                        </div>
                    </SectionErrorBoundary>

                    {/* Columna Derecha: Información */}
                    <div className="flex flex-col gap-8">
                        <SectionErrorBoundary name="ProductInfo">
                            <div className="glass-premium rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
                                <ProductInfo product={product} />
                            </div>
                        </SectionErrorBoundary>
                    </div>
                </div>

                {/* Área de Confianza debajo de la ficha principal */}
                <div className="mt-16 sm:mt-24">
                    <SectionErrorBoundary name="TrustBadges">
                        <TrustBadges />
                    </SectionErrorBoundary>
                </div>

                {/* Social Proof contextual */}
                <div className="mt-12 sm:mt-16">
                    <SectionErrorBoundary name="SocialProof">
                        <SocialProof
                            section={product.section as 'vape' | '420'}
                            productId={product.id}
                            variant="compact"
                            limit={3}
                        />
                    </SectionErrorBoundary>
                </div>

                {/* Comprados juntos habitualmente */}
                <div className="mt-16 sm:mt-24 pt-12 vsm-divider">
                    <SectionErrorBoundary name="FrequentlyBoughtTogether">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-1.5 rounded-full", product.section === 'vape' ? 'bg-vape-500' : 'bg-herbal-500')} />
                                <h2 className="vsm-heading text-white">Comprados juntos habitualmente</h2>
                            </div>
                            <FrequentlyBoughtTogether currentProduct={product} />
                         </div>
                    </SectionErrorBoundary>
                </div>

                {/* Productos Relacionados */} 
                <div className="mt-24 pt-12 vsm-divider">
                    <SectionErrorBoundary name="RelatedProducts">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-1.5 rounded-full", product.section === 'vape' ? 'bg-vape-500' : 'bg-herbal-500')} />
                                <h2 className="vsm-heading text-white">También te gustará</h2>
                            </div>
                            <RelatedProducts
                                currentProductId={product.id}
                                categoryId={product.category_id}
                                section={product.section}
                            />
                        </div>
                    </SectionErrorBoundary>
                </div>
            </div>
        </motion.div>
    );
}
