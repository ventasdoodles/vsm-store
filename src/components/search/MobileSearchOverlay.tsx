import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { useHaptic } from '@/hooks/useHaptic';
import { searchProducts } from '@/services/products.service';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types/product';

// Store para controlar la visibilidad desde cualquier lado (especialmente BottomNav)
interface SearchOverlayStore {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useSearchOverlay = create<SearchOverlayStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export function MobileSearchOverlay() {
    const { isOpen, close } = useSearchOverlay();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { trigger } = useHaptic();
    const debounceRef = useRef<NodeJS.Timeout>();

    // Auto-focus al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Live search con debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            const hits = await searchProducts(query);
            setResults(hits);
            setIsSearching(false);
        }, 400); // 400ms debounce
    }, [query]);

    const handleResultClick = (product: Product) => {
        trigger('light');
        navigate(`/${product.section}/${product.slug}`);
        close();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        trigger('medium');
        if (results.length > 0) {
            handleResultClick(results[0]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-primary-950/95 backdrop-blur-xl animate-in fade-in duration-200">
            {/* Header Search */}
            <div className="flex items-center gap-3 border-b border-primary-800/50 p-4">
                <form onSubmit={handleSubmit} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full rounded-xl border-none bg-primary-800/50 py-3 pl-10 pr-10 text-primary-100 placeholder:text-primary-500 focus:bg-primary-800 focus:ring-2 focus:ring-vape-500/50 transition-all font-medium"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-vape-500" />
                    )}
                </form>
                <button
                    onClick={close}
                    className="rounded-full p-2 text-primary-400 hover:bg-primary-800 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {query.trim().length > 0 ? (
                    /* Resultados de búsqueda */
                    <div className="space-y-4">
                        {!isSearching && results.length === 0 && (
                            <div className="text-center py-10 text-primary-500">
                                <p>No se encontraron productos.</p>
                            </div>
                        )}

                        {results.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleResultClick(product)}
                                className="flex items-center gap-4 rounded-xl border border-primary-800/30 bg-primary-900/40 p-3 transition-all active:scale-[0.98] active:bg-primary-800/60"
                            >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-primary-800">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-primary-600">No img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-primary-100 truncate text-sm sm:text-base">{product.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            product.section === 'vape' ? 'text-vape-400' : 'text-herbal-400'
                                        )}>
                                            {formatPrice(product.price)}
                                        </span>
                                        {/* Tag section */}
                                        <span className="text-[10px] uppercase tracking-wider text-primary-500 bg-primary-950/50 px-1.5 py-0.5 rounded">
                                            {product.section === 'vape' ? 'VAPE' : '420'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-primary-600" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Sugerencias (estado vacío) */
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <h3 className="mb-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                                Sugerencias Populares
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Vapes Desechables', 'Bongs', 'Papelillos', 'CBD', 'Pipas'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => {
                                            setQuery(term);
                                            trigger('light');
                                        }}
                                        className="rounded-full border border-primary-800 bg-primary-900/50 px-3 py-1.5 text-sm text-primary-300 hover:border-vape-500/30 hover:text-vape-400 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
