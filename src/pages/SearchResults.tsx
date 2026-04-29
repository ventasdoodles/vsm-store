// Página de resultados de búsqueda - VSM Store
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, SearchX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@/hooks/useSearch';
import { getProducts } from '@/services/products.service';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SEO } from '@/components/seo/SEO';
import type { Section } from '@/types/constants';

interface BroadSectionSearch {
    section: Section;
    href: string;
    title: string;
    eyebrow: string;
    description: string;
    accentClass: string;
    buttonClass: string;
}

const BROAD_SECTION_SEARCHES: Record<string, BroadSectionSearch> = {
    vape: {
        section: 'vape',
        href: '/vape',
        title: 'Vape Collection',
        eyebrow: 'Categoria completa',
        description: 'Explora pods, liquidos, mods, coils y accesorios de vapeo en la coleccion correcta.',
        accentClass: 'text-vape-400',
        buttonClass: 'bg-vape-500 hover:bg-vape-600 shadow-vape-500/20',
    },
    vapes: {
        section: 'vape',
        href: '/vape',
        title: 'Vape Collection',
        eyebrow: 'Categoria completa',
        description: 'Explora pods, liquidos, mods, coils y accesorios de vapeo en la coleccion correcta.',
        accentClass: 'text-vape-400',
        buttonClass: 'bg-vape-500 hover:bg-vape-600 shadow-vape-500/20',
    },
    vapeo: {
        section: 'vape',
        href: '/vape',
        title: 'Vape Collection',
        eyebrow: 'Categoria completa',
        description: 'Explora pods, liquidos, mods, coils y accesorios de vapeo en la coleccion correcta.',
        accentClass: 'text-vape-400',
        buttonClass: 'bg-vape-500 hover:bg-vape-600 shadow-vape-500/20',
    },
    '420': {
        section: '420',
        href: '/420',
        title: '420 Zone',
        eyebrow: 'Categoria completa',
        description: 'Explora vaporizadores, comestibles, concentrados y accesorios 420 en la coleccion correcta.',
        accentClass: 'text-herbal-400',
        buttonClass: 'bg-herbal-500 hover:bg-herbal-600 shadow-herbal-500/20',
    },
};

function getBroadSectionSearch(query: string): BroadSectionSearch | null {
    const normalized = query.trim().toLowerCase();
    return BROAD_SECTION_SEARCHES[normalized] ?? null;
}

export function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const broadSectionSearch = getBroadSectionSearch(query);

    const { data: searchProducts = [], isLoading: isSearchLoading } = useSearch(broadSectionSearch ? '' : query);
    const { data: sectionProducts = [], isLoading: isSectionLoading } = useQuery({
        queryKey: ['search', 'broad-section', broadSectionSearch?.section],
        queryFn: () => getProducts({ section: broadSectionSearch!.section, limit: 20 }),
        enabled: !!broadSectionSearch,
        staleTime: 1000 * 60,
    });

    const products = broadSectionSearch ? sectionProducts : searchProducts;
    const isLoading = broadSectionSearch ? isSectionLoading : isSearchLoading;

    return (
        <div className="container-vsm py-8">
            <SEO title={query ? `"${query}" - Buscar` : 'Buscar'} description="Busca productos en VSM Store." />
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/"
                    className="mb-4 inline-flex items-center gap-1.5 text-xs text-theme-secondary hover:text-theme-secondary transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al inicio
                </Link>
                <h1 className="text-2xl font-bold text-theme-primary">
                    {query ? (
                        <>
                            Resultados para: <span className="text-vape-400">"{query}"</span>
                        </>
                    ) : (
                        'Buscar productos'
                    )}
                </h1>
                {!isLoading && products.length > 0 && (
                    <p className="mt-1 text-sm text-theme-secondary">
                        {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                    </p>
                )}
            </div>

            {broadSectionSearch && (
                <section className="mb-8 rounded-2xl border border-theme bg-theme-secondary/40 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                    <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${broadSectionSearch.accentClass}`}>
                            {broadSectionSearch.eyebrow}
                        </p>
                        <h2 className="mt-2 text-xl font-black text-theme-primary">
                            {broadSectionSearch.title}
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm text-theme-secondary">
                            {broadSectionSearch.description}
                        </p>
                    </div>
                    <Link
                        to={broadSectionSearch.href}
                        className={`mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 sm:mt-0 ${broadSectionSearch.buttonClass}`}
                    >
                        Ver coleccion
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            )}

            {/* Resultados */}
            {query.length < 3 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <SearchX className="mb-3 h-12 w-12 text-accent-primary" />
                    <p className="text-sm text-theme-secondary">
                        Escribe al menos 3 caracteres para buscar
                    </p>
                </div>
            ) : (
                <ProductGrid products={products} isLoading={isLoading} />
            )}
        </div>
    );
}
