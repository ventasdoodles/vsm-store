// Barra de búsqueda con dropdown de resultados - VSM Store
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';

interface SearchBarProps {
    className?: string;
    expandable?: boolean;
}

export function SearchBar({ className, expandable = false }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(!expandable);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { data: results = [], isLoading } = useSearch(query);

    // Auto-focus input when expanded
    useEffect(() => {
        if (isExpanded && expandable && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded, expandable]);

    // Cerrar dropdown al clickear afuera
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                // Collapse if expandable and empty
                if (expandable && !query) {
                    setIsExpanded(false);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [expandable, query]);

    // Mostrar dropdown cuando hay resultados o está cargando
    useEffect(() => {
        if (query.trim().length >= 3) {
            // eslint-disable-next-line
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [query, results]);

    const handleSelect = (section: string, slug: string) => {
        navigate(`/${section}/${slug}`);
        setQuery('');
        setIsOpen(false);
        if (expandable) setIsExpanded(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 1) {
            navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
            if (expandable) setIsExpanded(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
        if (expandable) setIsExpanded(false);
    };

    const displayResults = results.slice(0, 5);

    if (expandable && !isExpanded) {
        return (
            <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="rounded-lg p-2 text-primary-400 hover:bg-primary-800/50 hover:text-primary-200 transition-all"
                aria-label="Buscar"
            >
                <Search className="h-5 w-5" />
            </button>
        );
    }

    return (
        <div ref={wrapperRef} className={cn('relative', className)}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                    <input
                        ref={inputRef}
                        type="search"
                        role="combobox"
                        aria-expanded={isOpen && results.length > 0}
                        aria-controls="search-results"
                        aria-autocomplete="list"
                        aria-label="Buscar productos"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full rounded-xl border border-primary-800 bg-primary-900 py-2 pl-9 pr-8 text-sm text-primary-200 placeholder:text-primary-600 outline-none transition-colors focus:border-vape-500/50 focus:ring-1 focus:ring-vape-500/20"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Limpiar búsqueda"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-primary-500 hover:text-primary-300 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : expandable ? (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            aria-label="Cerrar búsqueda"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-primary-500 hover:text-primary-300 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : null}
                </div>
            </form>

            {/* Dropdown de resultados */}
            {isOpen && (
                <div
                    id="search-results"
                    role="listbox"
                    aria-label="Resultados de búsqueda"
                    className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-primary-800 bg-primary-950 shadow-2xl shadow-black/50"
                >
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
                                        role="option"
                                        aria-selected={false}
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
