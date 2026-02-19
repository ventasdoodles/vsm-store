// Página de resultados de búsqueda - VSM Store
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { ProductGrid } from '@/components/products/ProductGrid';

export function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') ?? '';

    const { data: products = [], isLoading } = useSearch(query);

    return (
        <div className="container-vsm py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/"
                    className="mb-4 inline-flex items-center gap-1.5 text-xs text-theme-primary0 hover:text-theme-secondary transition-colors"
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
                    <p className="mt-1 text-sm text-theme-primary0">
                        {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                    </p>
                )}
            </div>

            {/* Resultados */}
            {query.length < 3 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <SearchX className="mb-3 h-12 w-12 text-primary-800" />
                    <p className="text-sm text-theme-primary0">
                        Escribe al menos 3 caracteres para buscar
                    </p>
                </div>
            ) : (
                <ProductGrid products={products} isLoading={isLoading} />
            )}
        </div>
    );
}
