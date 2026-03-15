/**
 * Offers Page — VSM Store
 * Sección de descuentos y oportunidades exclusivas.
 */
import { Tag } from 'lucide-react';
import { useDiscountedProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { SEO } from '@/components/seo/SEO';


export function OffersPage() {
    const { data: products = [], isLoading: loading } = useDiscountedProducts(50);

    return (
        <div className="min-h-screen pb-20 pt-10 px-4">
            <SEO 
                title="Ofertas Exclusivas - VSM Store" 
                description="Aprovecha los mejores descuentos en VSM Store. Oportunidades únicas en vapeo y cultura 420."
            />
            
            <header className="container-vsm mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-black text-xs tracking-widest uppercase mb-6 animate-pulse">
                    <Tag size={14} className="fill-current" />
                    Oportunidades Flash
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                    Sección <span className="text-red-500">Ofertas</span>
                </h1>
                <p className="text-theme-tertiary font-bold uppercase tracking-widest text-xs max-w-lg mx-auto">
                    Los mejores precios para productos de alta gama. Aprovecha el stock limitado.
                </p>
            </header>

            <main className="container-vsm">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] rounded-3xl bg-theme-secondary/30 skeleton-shimmer" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 animate-fadeIn">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-premium rounded-[3rem] p-12">
                        <Tag size={48} className="text-white/10 mb-6" />
                        <h3 className="text-xl font-bold text-white uppercase mb-2">No hay ofertas activas</h3>
                        <p className="text-sm text-theme-tertiary font-medium">Suscríbete a nuestro newsletter para no perderte el próximo drop de descuentos.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
