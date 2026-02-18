// Home Page - VSM Store
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { MegaHero } from '@/components/home/MegaHero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { SEO } from '@/components/seo/SEO';

export function Home() {
    return (
        <div className="min-h-screen pb-20 pt-6 bg-theme-primary transition-colors duration-300">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />

            <div className="container-vsm space-y-10 md:space-y-16">
                {/* 1. MEGA HERO */}
                <MegaHero />

                {/* 2. CATEGORY SHOWCASE */}
                <CategoryShowcase />

                {/* 3. NEW ARRIVALS */}
                <ProductRail
                    type="new"
                    title="🔥 Nuevos Lanzamientos"
                />

                {/* 4. PROMO BANNER */}
                <PromoSection
                    title="Envíos Gratis en Xalapa"
                    subtitle="Recibe tus productos favoritos en la puerta de tu casa sin costo adicional en compras mayores a $500."
                    cta="Ver zonas de entrega"
                    link="/referencias"
                    bgImage="https://images.unsplash.com/photo-1615550280562-b1fc56e18f87?q=80&w=2670&auto=format&fit=crop"
                />

                {/* 5. BESTSELLERS */}
                <ProductRail
                    type="bestseller"
                    title="🏆 Los Más Vendidos"
                />

                {/* 6. Featured Rail 420 */}
                <ProductRail
                    type="featured"
                    section="420"
                    title="🌿 Top 420 Selection"
                />

            </div>
        </div>
    );
}

