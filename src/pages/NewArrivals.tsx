import { Sparkles } from 'lucide-react';
import { useRecentProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { SEO } from '@/components/seo/SEO';


export function NewArrivals() {
    const { data: products = [], isLoading: loading } = useRecentProducts(40);

    return (
        <div className="min-h-screen pb-20 pt-10 px-4">
            <SEO 
                title="Lo Nuevo - VSM Store" 
                description="Descubre los lanzamientos más recientes en VSM Store. Lo último en vapeo y cultura 420."
            />
            
            <header className="container-vsm mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-black text-xs tracking-widest uppercase mb-6 animate-pulse">
                    <Sparkles size={14} className="fill-current" />
                    Últimas 2 Semanas
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                    Lo <span className="text-accent-primary">Nuevo</span>
                </h1>
                <p className="text-theme-tertiary font-bold uppercase tracking-widest text-xs max-w-lg mx-auto">
                    Explora los drops más recientes y mantente a la vanguardia de la tecnología y el estilo.
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
                        <Sparkles size={48} className="text-white/10 mb-6" />
                        <h3 className="text-xl font-bold text-white uppercase mb-2">Próximamente más drops</h3>
                        <p className="text-sm text-theme-tertiary font-medium">Estamos preparando los nuevos lanzamientos. ¡Vuelve pronto!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
