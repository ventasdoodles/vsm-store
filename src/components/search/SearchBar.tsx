// Barra de búsqueda con dropdown de resultados - VSM Store
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';

interface SearchBarProps {
    className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { data: results = [], isLoading } = useSearch(query);

    // Cerrar dropdown al clickear afuera
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mostrar dropdown cuando hay resultados o está cargando
    useEffect(() => {
        if (query.trim().length >= 3) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [query, results]);

    const handleSelect = (section: string, slug: string) => {
        navigate(`/${section}/${slug}`);
        setQuery('');
        setIsOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 1) {
            navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const displayResults = results.slice(0, 5);

    return (
        <div ref={wrapperRef} className={cn('relative', className)}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full rounded-xl border border-primary-800 bg-primary-900 py-2 pl-9 pr-8 text-sm text-primary-200 placeholder:text-primary-600 outline-none transition-colors focus:border-vape-500/50 focus:ring-1 focus:ring-vape-500/20"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-primary-500 hover:text-primary-300 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown de resultados */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-primary-800 bg-primary-950 shadow-2xl shadow-black/50">
                    {isLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-700 border-t-vape-500" />
                            <span className="text-xs text-primary-500">Buscando...</span>
                        </div>
                    ) : displayResults.length > 0 ? (
                        <>
                            {displayResults.map((product) => {
                                const isVape = product.section === 'vape';
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSelect(product.section, product.slug)}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary-900"
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className={cn(
                                                'flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg',
                                                isVape ? 'bg-vape-500/10' : 'bg-herbal-500/10'
                                            )}
                                        >
                                            {product.images.length > 0 ? (
                                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[8px] font-bold text-primary-700">VSM</span>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-primary-200 truncate">{product.name}</p>
                                            <p
                                                className={cn(
                                                    'text-xs font-semibold',
                                                    isVape ? 'text-vape-400' : 'text-herbal-400'
                                                )}
                                            >
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                            {/* Ver todos los resultados */}
                            {results.length > 5 && (
                                <button
                                    onClick={() => {
                                        navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
                                        setIsOpen(false);
                                    }}
                                    className="block w-full border-t border-primary-800 px-4 py-2.5 text-center text-xs font-medium text-vape-400 hover:bg-primary-900 transition-colors"
                                >
                                    Ver los {results.length} resultados
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="px-4 py-3 text-center text-xs text-primary-500">
                            No se encontraron resultados
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
