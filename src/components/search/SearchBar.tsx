import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, History, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useDebounce } from '@/hooks/useDebounce';
import { searchProducts } from '@/services/search.service';
import type { Product } from '@/types/product';
import { cn, formatPrice } from '@/lib/utils';

interface SearchResult {
    products: Product[];
    categories: Array<{ name: string; slug: string; section: string }>;
}

interface SearchBarProps {
    className?: string;
    expandable?: boolean;
}

export const SearchBar = ({ className, expandable: _expandable }: SearchBarProps = {}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult>({ products: [], categories: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const debouncedQuery = useDebounce(query, 300);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vsm-recent-searches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Save search to recent
    const saveRecentSearch = (searchQuery: string) => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        const updated = [
            trimmed,
            ...recentSearches.filter((s) => s !== trimmed),
        ].slice(0, 5); // Keep only 5 most recent

        setRecentSearches(updated);
        localStorage.setItem('vsm-recent-searches', JSON.stringify(updated));
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('vsm-recent-searches');
    };

    // Search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim()) {
            performSearch(debouncedQuery);
        } else {
            setResults({ products: [], categories: [] });
        }
    }, [debouncedQuery]);

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);
        try {
            // Get products
            const products = await searchProducts(searchQuery);

            // Mock categories (replace with real category search if available)
            const categories = [
                { name: 'Líquidos', slug: 'liquidos', section: 'vape' },
                { name: 'Pods Desechables', slug: 'pods', section: 'vape' },
                { name: 'Kits', slug: 'kits', section: 'vape' },
                { name: 'Resistencias', slug: 'resistencias', section: 'vape' },
            ].filter((cat) =>
                cat.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setResults({ products: products.slice(0, 5), categories });
        } catch (error) {
            console.error('Search error:', error);
            setResults({ products: [], categories: [] });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search submit
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

    // Handle recent search click
    const handleRecentClick = (search: string) => {
        setQuery(search);
        performSearch(search);
        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const totalItems = results.products.length + results.categories.length;

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
                    // Navigate to selected item
                    if (selectedIndex < results.products.length) {
                        const product = results.products[selectedIndex];
                        if (product) {
                            saveRecentSearch(query);
                            navigate(`/${product.section}/${product.slug}`);
                        }
                    } else {
                        const category =
                            results.categories[selectedIndex - results.products.length];
                        if (category) {
                            navigate(`/${category.section}/${category.slug}`);
                        }
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

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Highlight matching text
    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;

        const regex = new RegExp(`(${highlight})`, 'gi');
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

    const hasResults = results.products.length > 0 || results.categories.length > 0;
    const showRecent = isOpen && !query && recentSearches.length > 0;
    const showResults = isOpen && query && hasResults;
    const showEmpty = isOpen && query && !hasResults && !isLoading;

    return (
        <div ref={searchRef} className={cn("relative w-full max-w-2xl mx-auto", className)}>
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar productos..."
                    className="w-full h-12 pl-12 pr-12 bg-primary-900/50 border border-primary-800 rounded-xl text-primary-100 placeholder:text-primary-500 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-transparent transition-all backdrop-blur-sm group-hover:bg-primary-900/80"
                />

                {/* Search Icon */}
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />

                {/* Clear Button */}
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:bg-primary-800 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-primary-400" />
                    </button>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-vape-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
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
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                                    <History className="w-3.5 h-3.5" />
                                    Búsquedas recientes
                                </div>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-primary-500 hover:text-vape-400 transition-colors"
                                >
                                    Borrar todo
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentClick(search)}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary-900 transition-colors text-sm text-primary-200 flex items-center justify-between group"
                                    >
                                        <span>{search}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {showResults && (
                        <>
                            {/* Products */}
                            {results.products.length > 0 && (
                                <div className="p-2 border-b border-primary-900">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Productos
                                    </div>
                                    <div className="space-y-1">
                                        {results.products.map((product, idx) => (
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
                                                        : "hover:bg-primary-900"
                                                )}
                                            >
                                                {/* Product Image */}
                                                <div className="w-10 h-10 flex-shrink-0 bg-primary-800 rounded-md overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-primary-600">
                                                            <Search className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-primary-100 truncate">
                                                        {highlightText(product.name, query)}
                                                    </p>
                                                    <p className="text-xs font-medium text-vape-400">
                                                        {formatPrice(product.price)}
                                                    </p>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {results.categories.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                                        Categorías
                                    </div>
                                    <div className="space-y-1">
                                        {results.categories.map((category, idx) => (
                                            <Link
                                                key={`${category.section}-${category.slug}`}
                                                to={`/${category.section}/${category.slug}`}
                                                onClick={() => {
                                                    saveRecentSearch(query);
                                                    setIsOpen(false);
                                                    setQuery('');
                                                }}
                                                className={cn(
                                                    "block px-3 py-2.5 rounded-lg transition-colors border border-transparent",
                                                    selectedIndex === results.products.length + idx
                                                        ? "bg-vape-500/10 border-vape-500/20"
                                                        : "hover:bg-primary-900"
                                                )}
                                            >
                                                <span className="text-sm text-primary-200">
                                                    {highlightText(category.name, query)}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View All Results */}
                            <button
                                onClick={handleSubmit}
                                className="w-full p-3 text-center text-sm font-medium text-vape-400 hover:bg-primary-900/50 transition-colors border-t border-primary-800/50"
                            >
                                Ver todos los resultados
                            </button>
                        </>
                    )}

                    {/* Empty State */}
                    {showEmpty && (
                        <div className="p-8 text-center">
                            <Search className="w-10 h-10 text-primary-700 mx-auto mb-3" />
                            <p className="text-primary-300 font-medium mb-1">
                                No encontramos resultados
                            </p>
                            <p className="text-sm text-primary-500">
                                Intenta con otro término de búsqueda
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
