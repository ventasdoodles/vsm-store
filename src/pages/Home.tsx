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
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { MegaHero } from '@/components/home/MegaHero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FlashDeals } from '@/components/home/FlashDeals';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';
import { SocialProof } from '@/components/home/SocialProof';
import { TrustBadges } from '@/components/home/TrustBadges';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { SEO } from '@/components/seo/SEO';

export function Home() {
    return (
        <div className="min-h-screen pb-20 pt-6 bg-theme-primary transition-colors duration-300">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />

            <div className="container-vsm space-y-12 md:space-y-16">
                {/* 1. MEGA HERO — Slider de banners */}
                <SectionErrorBoundary name="MegaHero">
                    <MegaHero />
                </SectionErrorBoundary>

                {/* 2. CATEGORY SHOWCASE — Grid de categorías */}
                <SectionErrorBoundary name="CategoryShowcase">
                    <CategoryShowcase />
                </SectionErrorBoundary>

                {/* 3. FLASH DEALS ⚡ — Ofertas con countdown */}
                <SectionErrorBoundary name="FlashDeals">
                    <FlashDeals />
                </SectionErrorBoundary>

                {/* 4. BRANDS CAROUSEL 🏆 — Logos de marcas */}
                <SectionErrorBoundary name="BrandsCarousel">
                    <BrandsCarousel />
                </SectionErrorBoundary>

                {/* 5. NEW ARRIVALS 🔥 — Nuevos lanzamientos */}
                <SectionErrorBoundary name="ProductRail:new">
                    <ProductRail
                        type="new"
                        title="Nuevos Lanzamientos"
                    />
                </SectionErrorBoundary>

                {/* 6. PROMO BANNER — Envío gratis */}
                <SectionErrorBoundary name="PromoSection">
                    <PromoSection />
                </SectionErrorBoundary>

                {/* 7. BESTSELLERS 🏆 — Los más vendidos */}
                <SectionErrorBoundary name="ProductRail:bestseller">
                    <ProductRail
                        type="bestseller"
                        title="Los Más Vendidos"
                    />
                </SectionErrorBoundary>

                {/* 8. SOCIAL PROOF ⭐ — Testimonios */}
                <SectionErrorBoundary name="SocialProof">
                    <SocialProof limit={6} />
                </SectionErrorBoundary>

                {/* 9. TRUST BADGES 🔒 — Insignias de confianza */}
                <SectionErrorBoundary name="TrustBadges">
                    <TrustBadges />
                </SectionErrorBoundary>
            </div>
        </div>
    );
}
