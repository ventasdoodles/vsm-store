/**
 * SearchBar — Barra de búsqueda principal con autocompletado.
 * Incluye: búsqueda de productos, historial reciente, navegación por teclado.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, TrendingUp, History, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useSearch } from '@/hooks/useSearch';
import { cn, formatPrice } from '@/lib/utils';

// ── Constantes ───────────────────────────────────────────────
const STORAGE_KEY = 'vsm-recent-searches';
const MAX_RECENT_SEARCHES = 5;
const MAX_SEARCH_RESULTS = 5;

interface SearchBarProps {
    className?: string;
}

/** Escapa caracteres especiales de regex para evitar inyección */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const SearchBar = ({ className }: SearchBarProps = {}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Búsqueda vía hook (debounce + TanStack Query incluidos)
    const { data: searchData, isLoading } = useSearch(query);
    const products = useMemo(
        () => (searchData ?? []).slice(0, MAX_SEARCH_RESULTS),
        [searchData],
    );

    // Cargar búsquedas recientes de localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { setRecentSearches(JSON.parse(saved)); } catch { /* corrupted */ }
        }
    }, []);

    /** Guardar búsqueda en el historial reciente */
    const saveRecentSearch = useCallback((searchQuery: string) => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        const updated = [
            trimmed,
            ...recentSearches.filter((s) => s !== trimmed),
        ].slice(0, MAX_RECENT_SEARCHES);

        setRecentSearches(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }, [recentSearches]);

    /** Limpiar todo el historial */
    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    /** Enviar búsqueda y navegar a resultados */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            saveRecentSearch(query);
            navigate(`/buscar?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
            setQuery('');
            inputRef.current?.blur();
        }
    };

    /** Click en búsqueda reciente */
    const handleRecentClick = (search: string) => {
        setQuery(search);
        inputRef.current?.focus();
    };

    /** Navegación por teclado en el dropdown */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const totalItems = products.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    const product = products[selectedIndex];
                    if (product) {
                        saveRecentSearch(query);
                        navigate(`/${product.section}/${product.slug}`);
                    }
                    setIsOpen(false);
                    setQuery('');
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /** Resalta el texto que coincide con la búsqueda (con escape de regex) */
    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;

        const regex = new RegExp(`(${escapeRegex(highlight)})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-vape-500/30 text-white font-semibold rounded-sm">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const hasResults = products.length > 0;
    const showRecent = isOpen && !query && recentSearches.length > 0;
    const showResults = isOpen && query && hasResults;
    const showEmpty = isOpen && query && !hasResults && !isLoading;

    return (
        <div ref={searchRef} role="search" aria-label="Buscar productos" className={cn("relative w-full", className)}>
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative group flex items-center w-full h-full">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="¿Qué estás buscando hoy?"
                    className="w-full h-12 pl-5 pr-36 bg-transparent text-base font-medium text-white placeholder:text-white/50 focus:outline-none transition-all"
                />

                {/* Right side: clear + search CTA button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {isLoading ? (
                        <div className="w-9 h-9 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-gradient-to-r from-accent-primary to-blue-500 text-white text-sm font-bold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:scale-[1.02] transition-all duration-200 flex-shrink-0"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Buscar</span>
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown */}
            {(showRecent || showResults || showEmpty) && (
                <div
                    className="absolute top-full mt-2 w-full bg-theme-primary border border-theme rounded-xl shadow-2xl overflow-hidden z-[100] max-h-[80vh] overflow-y-auto scrollbar-hide animate-fadeIn"
                >
                    {/* Recent Searches */}
                    {showRecent && (
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2 mb-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                                    <History className="w-3.5 h-3.5" />
                                    Búsquedas recientes
                                </div>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-theme-secondary hover:text-vape-400 transition-colors"
                                >
                                    Borrar todo
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentClick(search)}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-theme-secondary transition-colors text-sm text-theme-primary flex items-center justify-between group"
                                    >
                                        <span>{search}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-theme-secondary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {showResults && (
                        <>
                            {/* Products */}
                            {products.length > 0 && (
                                <div className="p-2 border-b border-theme">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Productos
                                    </div>
                                    <div className="space-y-1">
                                        {products.map((product, idx) => (
                                            <Link
                                                key={product.id}
                                                to={`/${product.section}/${product.slug}`}
                                                onClick={() => {
                                                    saveRecentSearch(query);
                                                    setIsOpen(false);
                                                    setQuery('');
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-lg transition-all border border-transparent",
                                                    selectedIndex === idx
                                                        ? "bg-vape-500/10 border-vape-500/20"
                                                        : "hover:bg-theme-secondary"
                                                )}
                                            >
                                                {/* Product Image */}
                                                <div className="w-10 h-10 flex-shrink-0 bg-theme-tertiary rounded-md overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-accent-primary">
                                                            <Search className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-theme-primary truncate">
                                                        {highlightText(product.name, query)}
                                                    </p>
                                                    <p className="text-xs font-medium text-vape-400">
                                                        {formatPrice(product.price)}
                                                    </p>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-theme-secondary flex-shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View All Results */}
                            <button
                                onClick={handleSubmit}
                                className="w-full p-3 text-center text-sm font-medium text-vape-400 hover:bg-theme-secondary/50 transition-colors border-t border-theme"
                            >
                                Ver todos los resultados
                            </button>
                        </>
                    )}

                    {/* Empty State */}
                    {showEmpty && (
                        <div className="p-8 text-center">
                            <Search className="w-10 h-10 text-theme-secondary/50 mx-auto mb-3" />
                            <p className="text-theme-secondary font-medium mb-1">
                                No encontramos resultados
                            </p>
                            <p className="text-sm text-theme-secondary">
                                Intenta con otro término de búsqueda
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
