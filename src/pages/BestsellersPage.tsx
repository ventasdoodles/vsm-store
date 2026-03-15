import { Flame } from 'lucide-react';
import { useBestsellerProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { SEO } from '@/components/seo/SEO';


export function BestsellersPage() {
    const { data: products = [], isLoading: loading } = useBestsellerProducts({ limit: 50 });

    return (
        <div className="min-h-screen pb-20 pt-10 px-4">
            <SEO 
                title="Más Vendidos - VSM Store" 
                description="Los productos favoritos de nuestra comunidad. Lo más vendido en VSM Store."
            />
            
            <header className="container-vsm mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vape-500/10 border border-vape-500/20 text-vape-400 font-black text-xs tracking-widest uppercase mb-6 animate-pulse">
                    <Flame size={14} className="fill-current" />
                    Top 50 Histórico
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                    Más <span className="text-vape-400">Vendidos</span>
                </h1>
                <p className="text-theme-tertiary font-bold uppercase tracking-widest text-xs max-w-lg mx-auto">
                    Los favoritos indiscutibles. Calidad y potencia validadas por nuestra comunidad élite.
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 animate-fadeIn">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-premium rounded-[3rem] p-12">
                        <Flame size={48} className="text-white/10 mb-6" />
                        <h3 className="text-xl font-bold text-white uppercase mb-2">Catálogo en rotación</h3>
                        <p className="text-sm text-theme-tertiary font-medium">Estamos actualizando nuestro top ventas. ¡Explora el resto de categorías!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
