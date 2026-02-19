// Home Page - VSM Store
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { MegaHero } from '@/components/home/MegaHero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FlashDeals } from '@/components/home/FlashDeals';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';
import { SocialProof } from '@/components/home/SocialProof';
import { TrustBadges } from '@/components/home/TrustBadges';
import { SEO } from '@/components/seo/SEO';

export function Home() {
    return (
        <div className="min-h-screen pb-20 pt-6 bg-theme-primary transition-colors duration-300">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />

            <div className="container-vsm space-y-12 md:space-y-16">
                {/* 1. MEGA HERO */}
                <MegaHero />

                {/* 2. CATEGORY SHOWCASE */}
                <CategoryShowcase />

                {/* 3. FLASH DEALS ⚡ NUEVO */}
                <FlashDeals />

                {/* 4. BRANDS CAROUSEL 🏆 NUEVO */}
                <BrandsCarousel />

                {/* 5. NEW ARRIVALS */}
                <ProductRail
                    type="new"
                    title="🔥 Nuevos Lanzamientos"
                />

                {/* 6. PROMO BANNER */}
                <PromoSection />

                {/* 7. BESTSELLERS */}
                <ProductRail
                    type="bestseller"
                    title="🏆 Los Más Vendidos"
                />

                {/* 8. SOCIAL PROOF ⭐ NUEVO */}
                <SocialProof />

                {/* 9. TRUST BADGES 🔒 NUEVO */}
                <TrustBadges />
            </div>
        </div>
    );
}
