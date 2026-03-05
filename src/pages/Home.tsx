/**
 * Home Page — VSM Store
 *
 * Composición pura de secciones modulares e independientes.
 * Cada sección está envuelta en un SectionErrorBoundary para aislamiento:
 * si una sección falla, las demás siguen funcionando.
 *
 * Para agregar/quitar una sección: simplemente agrega o comenta la línea correspondiente.
 * Ninguna sección depende de otra.
 *
 * Secciones (en orden de aparición):
 * 1. MegaHero        — Slider de banners promocionales
 * 2. CategoryShowcase — Grid de categorías destacadas
 * 3. FlashDeals       — Ofertas flash con countdown
 * 4. BrandsCarousel   — Carrusel infinito de marcas
 * 5. ProductRail (new)       — Nuevos lanzamientos
 * 6. PromoSection     — Banner de envío gratis
 * 7. ProductRail (bestseller) — Los más vendidos
 * 8. SocialProof      — Testimonios de clientes
 * 9. TrustBadges      — Insignias de confianza
 */
import { lazy, Suspense } from 'react';
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { MegaHero } from '@/components/home/MegaHero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FlashDeals } from '@/components/home/FlashDeals';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';
import { TrustBadges } from '@/components/home/TrustBadges';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { DeferredSection } from '@/components/ui/DeferredSection';
import { SEO } from '@/components/seo/SEO';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';

// O6: Lazy-load SocialProof (633-line module) — only fetched when scrolled into view
const SocialProof = lazy(() => import('@/components/home/SocialProof').then(m => ({ default: m.SocialProof })));

export function Home() {
    return (
        <div className="min-h-screen pb-20 pt-0 bg-theme-primary transition-colors duration-300">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />
            <OrganizationJsonLd />

            {/* Visually hidden h1 for SEO and screen readers */}
            <h1 className="sr-only">VSM Store — Tu tienda de vapeo y productos 420 en Xalapa</h1>

            <div className="space-y-12 md:space-y-16">
                {/* 1. MEGA HERO — Slider de banners (Full Width at top) */}
                <SectionErrorBoundary name="MegaHero">
                    <MegaHero />
                </SectionErrorBoundary>

                {/* Main Container for rest of content */}
                <div className="container-vsm space-y-12 md:space-y-16">
                    {/* 2. CATEGORY SHOWCASE — Grid de categorías */}
                    <SectionErrorBoundary name="CategoryShowcase">
                        <CategoryShowcase />
                    </SectionErrorBoundary>

                    {/* 3. BRANDS CAROUSEL 🏆 — Logos de marcas (Autoridad temprana) */}
                    <DeferredSection minHeight="160px">
                        <SectionErrorBoundary name="BrandsCarousel">
                            <BrandsCarousel />
                        </SectionErrorBoundary>
                    </DeferredSection>

                    {/* 4. FLASH DEALS ⚡ — Ofertas con countdown (Urgencia) */}
                    <DeferredSection minHeight="300px">
                        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 300px' }}>
                            <SectionErrorBoundary name="FlashDeals">
                                <FlashDeals />
                            </SectionErrorBoundary>
                        </section>
                    </DeferredSection>

                    {/* 5. BESTSELLERS 🏆 — Los más vendidos (Prueba social implícita) */}
                    <DeferredSection minHeight="320px">
                        <SectionErrorBoundary name="ProductRail:bestseller">
                            <div id="mas-vendidos">
                                <ProductRail
                                    type="bestseller"
                                    title="Los Más Vendidos"
                                />
                            </div>
                        </SectionErrorBoundary>
                    </DeferredSection>

                    {/* 6. PROMO BANNER — Envío gratis (Respiro visual y empuje de venta) */}
                    <DeferredSection minHeight="200px">
                        <SectionErrorBoundary name="PromoSection">
                            <PromoSection />
                        </SectionErrorBoundary>
                    </DeferredSection>

                    {/* 7. NEW ARRIVALS 🔥 — Nuevos lanzamientos (Para recurrentes) */}
                    <DeferredSection minHeight="320px">
                        <SectionErrorBoundary name="ProductRail:new">
                            <ProductRail
                                type="new"
                                title="Nuevos Lanzamientos"
                            />
                        </SectionErrorBoundary>
                    </DeferredSection>

                    {/* 8. SOCIAL PROOF ⭐ — Testimonios (Cierre de confianza) */}
                    <DeferredSection minHeight="400px">
                        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
                            <SectionErrorBoundary name="SocialProof">
                                <Suspense fallback={<div className="h-[400px] skeleton-shimmer rounded-2xl" />}>
                                    <SocialProof limit={6} />
                                </Suspense>
                            </SectionErrorBoundary>
                        </section>
                    </DeferredSection>

                    {/* 9. TRUST BADGES 🔒 — Insignias de confianza (Despedida segura) */}
                    <DeferredSection minHeight="120px">
                        <SectionErrorBoundary name="TrustBadges">
                            <TrustBadges />
                        </SectionErrorBoundary>
                    </DeferredSection>
                </div>
            </div>
        </div>
    );
}
