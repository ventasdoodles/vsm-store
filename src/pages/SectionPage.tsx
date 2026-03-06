/**
 * SectionPage — Colección completa de una sección (vape o 420).
 * Página de alta conversión con hero, categorías, ordenamiento y grid.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { Flame, Leaf, ArrowUpDown, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sortProducts, SORT_OPTIONS, type SortKey } from '@/lib/product-sorting';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ProductBreadcrumbs } from '@/components/products/ProductBreadcrumbs';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategorySkeleton } from '@/components/ui/CategorySkeleton';
import { SEO } from '@/components/seo/SEO';
import { SocialProof } from '@/components/home/SocialProof';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { useSectionFromPath } from '@/hooks/useSectionFromPath';

const SECTION_CONFIG = {
    vape: {
        title: 'Vape Collection',
        subtitle: 'Pods, líquidos, accesorios y todo lo que necesitas para vapear.',
        seoDesc: 'Explora toda nuestra colección de vapeo: pods, líquidos, accesorios y más.',
        icon: Flame,
        accent: 'vape',
        gradient: 'from-vape-500/30 via-purple-500/10 to-transparent',
        blob: 'bg-vape-500',
        badge: 'text-vape-400 bg-vape-500/10 border-vape-500/20',
        sortActive: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
        sortHighlight: 'bg-vape-500/10 font-semibold text-vape-400',
    },
    '420': {
        title: '420 Zone',
        subtitle: 'Herbal, grinders, papel, accesorios y más para tu sesión perfecta.',
        seoDesc: 'Descubre nuestra selección completa de productos 420: herbal, accesorios y más.',
        icon: Leaf,
        accent: 'herbal',
        gradient: 'from-herbal-500/30 via-emerald-500/10 to-transparent',
        blob: 'bg-herbal-500',
        badge: 'text-herbal-400 bg-herbal-500/10 border-herbal-500/20',
        sortActive: 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
        sortHighlight: 'bg-herbal-500/10 font-semibold text-herbal-400',
    },
} as const;

export function SectionPage() {
    const section = useSectionFromPath();
    const cfg = SECTION_CONFIG[section];
    const Icon = cfg.icon;
    const isVape = section === 'vape';

    const [sort, setSort] = useState<SortKey>('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const sortRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Scroll to grid on category change
    useEffect(() => {
        if (activeCategory && gridRef.current) {
            setTimeout(() => {
                gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [activeCategory]);

    // Click-outside handler para cerrar dropdown de sort
    useEffect(() => {
        if (!sortOpen) return;
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [sortOpen]);

    const { data: products = [], isLoading } = useProducts({ section });
    const { data: categories = [], isLoading: categoriesLoading } = useCategories(section);
    const rootCategories = categories.filter(c => c.parent_id === null);

    // Filtrar por categoría activa y ordenar
    const filteredProducts = useMemo(() => {
        const result = activeCategory
            ? products.filter(p => p.category_id === activeCategory)
            : products;
        return sortProducts(result, sort);
    }, [products, activeCategory, sort]);

    // Stats
    const onSaleCount = products.filter(p => p.compare_at_price && p.compare_at_price > p.price).length;

    return (
        <div className="min-h-screen pb-20 bg-theme-primary">
            <SEO title={cfg.title} description={cfg.seoDesc} />

            {/* ═══ HERO BANNER ═══ */}
            <div className="relative overflow-hidden">
                {/* Blobs decorativos */}
                <div className={cn('absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full blur-[100px] opacity-30', cfg.blob)} />
                <div className={cn('absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full blur-[80px] opacity-20', cfg.blob)} />

                <div className={cn('relative bg-gradient-to-br py-12 sm:py-16', cfg.gradient)}>
                    <div className="container-vsm">
                        {/* Breadcrumbs */}
                        <div className="mb-6">
                            <ProductBreadcrumbs
                                section={section!}
                                productName={cfg.title}
                            />
                        </div>

                        <div className="flex items-center gap-5">
                            <div className={cn('p-4 rounded-2xl border', cfg.badge)}>
                                <Icon className="h-10 w-10" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tight">
                                    {cfg.title}
                                </h1>
                                <p className="mt-1 text-sm text-theme-secondary max-w-lg">
                                    {cfg.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Stats rápidos */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-theme bg-theme-primary/60 px-3 py-1.5 text-xs font-semibold text-theme-secondary backdrop-blur-sm">
                                <Sparkles className="h-3.5 w-3.5" />
                                {products.length} productos
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-theme bg-theme-primary/60 px-3 py-1.5 text-xs font-semibold text-theme-secondary backdrop-blur-sm">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {rootCategories.length} categorías
                            </span>
                            {onSaleCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">
                                    <Zap className="h-3.5 w-3.5" />
                                    {onSaleCount} en oferta
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-vsm py-8 space-y-8">
                {/* ═══ CATEGORÍAS como chips navegables ═══ */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-theme-tertiary">Explorar por categoría</h2>
                    {categoriesLoading ? (
                        <CategorySkeleton variant="chips" count={6} />
                    ) : rootCategories.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin snap-x">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={cn(
                                    'flex-shrink-0 snap-start rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                                    !activeCategory
                                        ? cfg.sortActive
                                        : 'border-theme bg-theme-primary/60 text-theme-secondary hover:bg-theme-secondary/20'
                                )}
                            >
                                Todos
                            </button>
                            {rootCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                    className={cn(
                                        'flex-shrink-0 snap-start rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                                        activeCategory === cat.id
                                            ? cfg.sortActive
                                            : 'border-theme bg-theme-primary/60 text-theme-secondary hover:bg-theme-secondary/20'
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ SUBCATEGORÍAS como cards (si no hay filtro activo) ═══ */}
                {!activeCategory && (
                    <>
                        {categoriesLoading ? (
                            <CategorySkeleton variant="cards" count={3} />
                        ) : rootCategories.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {rootCategories.map(cat => (
                                    <CategoryCard key={cat.id} category={cat} section={section} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ═══ TOOLBAR: Contador + Sort ═══ */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-theme-secondary">
                        <span className="font-bold text-theme-primary">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''}
                        {activeCategory && (
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={cn('ml-2 text-xs font-medium underline', isVape ? 'text-vape-400' : 'text-herbal-400')}
                            >
                                Limpiar filtro
                            </button>
                        )}
                    </p>
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setSortOpen(o => !o)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all',
                                sortOpen ? cfg.sortActive : 'border-theme bg-theme-primary/60 text-theme-secondary hover:border-theme-strong'
                            )}
                        >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
                            <span className="sm:hidden">Ordenar</span>
                        </button>

                        {/* Desktop dropdown */}
                        {sortOpen && (
                            <div className="hidden sm:block absolute right-0 top-full z-10 mt-1 w-52 rounded-xl border border-theme bg-theme-primary shadow-xl">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                        className={cn(
                                            'w-full px-4 py-2.5 text-left text-xs transition-colors first:rounded-t-xl last:rounded-b-xl',
                                            sort === opt.value ? cfg.sortHighlight : 'text-theme-secondary hover:bg-theme-secondary/30'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Mobile bottom sheet */}
                        <div className="sm:hidden">
                            <BottomSheet isOpen={sortOpen} onClose={() => setSortOpen(false)} title="Ordenar por">
                                <div className="flex flex-col gap-2">
                                    {SORT_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                            className={cn(
                                                'w-full rounded-xl px-4 py-4 text-left text-sm font-medium transition-all',
                                                sort === opt.value
                                                    ? cn(cfg.sortActive, 'border')
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
                </div>

                {/* ═══ PRODUCT GRID ═══ */}
                <div ref={gridRef} className="scroll-mt-4">
                    <ProductGrid
                        products={filteredProducts}
                        isLoading={isLoading}
                        onClearFilter={activeCategory ? () => setActiveCategory(null) : undefined}
                    />
                </div>

                {/* ═══ SOCIAL PROOF ═══ */}
                <SectionErrorBoundary name="SocialProof" resetKey={section}>
                    <SocialProof section={section} variant="compact" limit={4} />
                </SectionErrorBoundary>
            </div>
        </div>
    );
}
