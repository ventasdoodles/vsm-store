// Home Page - VSM Store
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryRail } from '@/components/home/CategoryRail';
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { SEO } from '@/components/seo/SEO';

export function Home() {
    // Para el grid final "Explora todo"
    const { data: allProducts = [], isLoading } = useProducts({ limit: 8 });

    return (
        <div className="min-h-screen pb-20 pt-6">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />
            <div className="container-vsm space-y-6 sm:space-y-10">
                {/* 1. Hero Carousel */}
                <HeroBanner />

                {/* 2. Visual Category Nav */}
                <CategoryRail />

                {/* 3. New Arrivals Rail */}
                <ProductRail
                    type="new"
                    title="🔥 Nuevos Lanzamientos"
                />

                {/* 4. Promo Banner */}
                <PromoSection
                    title="Envíos Gratis en Xalapa"
                    subtitle="Recibe tus productos favoritos en la puerta de tu casa sin costo adicional en compras mayores a $500."
                    cta="Ver zonas de entrega"
                    link="/referencias"
                    bgImage="https://images.unsplash.com/photo-1615550280562-b1fc56e18f87?q=80&w=2670&auto=format&fit=crop"
                />

                {/* 5. Bestsellers Rail */}
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

                {/* 7. Grid for "Explore All" */}
                <section className="space-y-6 pt-4 border-t border-primary-800/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-primary-100">Explora todo</h2>
                        <div className="h-px flex-1 bg-primary-800/50" />
                    </div>
                    <ProductGrid products={allProducts} isLoading={isLoading} />
                </section>
            </div>
        </div>
    );
}

