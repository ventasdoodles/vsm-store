/**
 * Merchandising Page — VSM Store
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowUpDown, Flame } from 'lucide-react';
import { useBestsellerProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SEO } from '@/components/seo/SEO';
import { cn } from '@/lib/utils';
import { sortProducts, SORT_OPTIONS, type SortKey } from '@/lib/product-sorting';
import { BottomSheet } from '@/components/ui/BottomSheet';

export function BestsellersPage() {
    const { data: products = [], isLoading: loading } = useBestsellerProducts({ limit: 50 });

    const [sort, setSort] = useState<SortKey>('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sortOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setSortOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sortOpen]);

    const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

    return (
        <div className="min-h-screen pb-20 pt-10 px-4">
            <SEO 
                title="M�s Vendidos - VSM Store" 
                description="Los productos favoritos de nuestra comunidad. Lo m�s vendido en VSM Store."
            />
            
            <header className="container-vsm mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vape-500/10 border border-vape-500/20 text-vape-400 font-black text-xs tracking-widest uppercase mb-6 animate-pulse"><Flame size={14} className="fill-current" />Top 50 Hist�rico</div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">M�s <span className="text-vape-400">Vendidos</span></h1>
                <p className="text-theme-tertiary font-bold uppercase tracking-widest text-xs max-w-lg mx-auto">Los favoritos indiscutibles. Calidad y potencia validadas por nuestra comunidad �lite.</p>
            </header>

            <main className="container-vsm">
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm font-medium text-theme-secondary">
                        {loading ? 'Cargando...' : `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`}
                    </p>
                    
                    {!loading && products.length > 0 && (
                        <div className="relative" ref={sortRef}>
                            <button
                                onClick={() => setSortOpen((o) => !o)}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all',
                                    sortOpen
                                        ? 'border-white/50 bg-white/10 text-white'
                                        : 'border-theme bg-theme-primary/60 text-theme-secondary hover:border-theme-strong'
                                )}
                            >
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
                                <span className="sm:hidden">Ordenar</span>
                            </button>

                            {sortOpen && (
                                <div className="hidden sm:block absolute right-0 top-full z-10 mt-1 w-52 rounded-xl border border-theme bg-theme-primary shadow-xl">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                            className={cn(
                                                'w-full px-4 py-2.5 text-left text-xs transition-colors first:rounded-t-xl last:rounded-b-xl',
                                                sort === opt.value
                                                    ? 'font-semibold bg-white/10 text-white'
                                                    : 'text-theme-secondary hover:bg-theme-secondary/30'
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="sm:hidden">
                                <BottomSheet
                                    isOpen={sortOpen}
                                    onClose={() => setSortOpen(false)}
                                    title="Ordenar por"
                                >
                                    <div className="flex flex-col gap-2">
                                        {SORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                                className={cn(
                                                    'w-full rounded-xl px-4 py-4 text-left text-sm font-medium transition-all',
                                                    sort === opt.value
                                                        ? 'border bg-white/10 text-white border-white/20'
                                                        : 'bg-theme-secondary/10 text-theme-secondary border border-transparent hover:bg-theme-secondary/20'
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </BottomSheet>
                            </div>
                        </div>
                    )}
                </div>

                <ProductGrid 
                    products={sortedProducts} 
                    isLoading={loading} 
                    emptyStateTitle="Cat�logo en rotaci�n"
                    emptyStateSubtext="Estamos actualizando nuestro top ventas. �Explora el resto de categor�as!"
                />
            </main>
        </div>
    );
}
