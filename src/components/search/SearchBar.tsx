/**
 * // ─── COMPONENT: SearchBar (Visual Omni-Search) ───
 * // Arquitectura: Independent Visual Lego (Lego Master)
 * // Proposito principal: Búsqueda global con historial, categorías sugeridas y CTA de IA.
 *    Design: Glassmorphism, Spring animations, High-Contrast Highlighting.
 * // Integración: useSearch (Supabase) + useCategories + LocalStorage.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, History, ArrowRight, Sparkles, ChevronRight, Mic } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearch } from '@/hooks/useSearch';
import { useCategories } from '@/hooks/useCategories';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { VoiceSearchOverlay } from './VoiceSearchOverlay';
import { useVoiceIntelligence } from '@/hooks/useVoiceIntelligence';
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
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync: processTranscript } = useVoiceIntelligence();
    const navigate = useNavigate();

    // Búsqueda vía hook (debounce + TanStack Query incluidos)
    const { data: searchData, isLoading } = useSearch(query);
    const { data: allCategories = [] } = useCategories();

    // Gestión de Voz (IA - Wave 23)
    const { isListening, transcript, error: voiceError, startListening, stopListening } = useVoiceSearch({
        onResult: async (text) => {
            // Si la frase es larga o compleja, pedimos ayuda a la IA
            const shouldAIProcess = text.split(' ').length > 2;
            
            if (shouldAIProcess) {
                // Pequeña pausa visual para mostrar el transcript original antes del AI Magic
                setTimeout(async () => {
                    const { searchQuery } = await processTranscript(text);
                    setQuery(searchQuery);
                    setIsVoiceOpen(false);
                    // Disparamos la búsqueda automáticamente tras el procesamiento de la IA
                    setTimeout(() => handleSubmit(), 200);
                }, 800);
            } else {
                setQuery(text);
                setTimeout(() => {
                    setIsVoiceOpen(false);
                    handleSubmit();
                }, 800);
            }
        }
    });

    const products = useMemo(
        () => (searchData ?? []).slice(0, MAX_SEARCH_RESULTS),
        [searchData],
    );

    // Filtrar categorías que coincidan con la búsqueda
    const categories = useMemo(() => {
        if (!query.trim()) return [];
        const normalizedQuery = query.toLowerCase().trim();
        return allCategories
            .filter(cat => 
                cat.name.toLowerCase().includes(normalizedQuery) || 
                cat.slug.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, 3);
    }, [allCategories, query]);

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
    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
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
                } else if (query.trim()) {
                    handleSubmit();
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

    const hasResults = products.length > 0 || categories.length > 0;
    const showRecent = isOpen && !query && recentSearches.length > 0;
    const showAIHints = isOpen && !query && recentSearches.length === 0;
    const showResults = isOpen && query && hasResults;
    const showAIInsight = isOpen && query && query.length > 2;
    const showEmpty = isOpen && query && !hasResults && !isLoading;

    const aiSuggestions = [
        "Vapes desechables más vendidos",
        "E-liquids de menta y frutales",
        "Ofertas relámpago del día",
        "Nuevos accesorios premium"
    ];

    return (
        <div ref={searchRef} role="search" aria-label="Buscar productos" className={cn("relative w-full", className)}>
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative group flex items-center w-full h-full">
                {/* ✨ Aura de Foco (Aura Effect) */}
                <motion.div 
                    animate={isOpen ? {
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.02, 1],
                    } : { opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-primary/40 to-blue-500/40 blur-md pointer-events-none z-0" 
                />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Busca productos, marcas o categorías..."
                    className="w-full h-14 pl-12 pr-44 bg-transparent text-base font-medium text-white placeholder:text-white/40 focus:outline-none transition-all relative z-10"
                />
                
                {/* Fixed Search Icon on left */}
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />

                {/* Right side: shortcut + clear + search CTA button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                    <button
                        type="button"
                        onClick={() => {
                            setIsVoiceOpen(true);
                            startListening();
                        }}
                        className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-vape-400 hover:bg-vape-500/10 rounded-full transition-all group/mic"
                        title="Búsqueda por voz"
                    >
                        <Mic className="w-4 h-4 group-hover/mic:scale-110 transition-transform" />
                    </button>

                    {!query && !isLoading && (
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-widest">
                            <span className="text-[12px]">/</span>
                        </div>
                    )}
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
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
                            className="flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-r from-accent-primary to-blue-600 text-white text-sm font-black tracking-wide shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)] hover:scale-[1.05] active:scale-95 transition-all duration-200 flex-shrink-0"
                        >
                            <Search className="w-4 h-4" />
                            <span className="hidden sm:inline">Buscar</span>
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown con Spring Physics */}
            <AnimatePresence>
                {(showRecent || showResults || showEmpty) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed left-4 right-4 top-[140px] md:absolute md:left-0 md:right-0 md:top-full md:mt-2 bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden z-[100] max-h-[70vh] md:max-h-[80vh] overflow-y-auto scrollbar-hide"
                    >
                    {/* Recent Searches or AI Suggestions */}
                    {(showRecent || showAIHints) && (
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2 mb-1">
                                <div className="flex items-center gap-2 text-xs font-black text-theme-secondary uppercase tracking-[0.2em]">
                                    {showRecent ? <History className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-accent-primary" />}
                                    {showRecent ? 'Historial Reciente' : 'Sugerencias VSM AI'}
                                </div>
                                {showRecent && (
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-[10px] font-black uppercase tracking-widest text-theme-secondary hover:text-vape-400 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {(showRecent ? recentSearches : aiSuggestions).map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentClick(search)}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-theme-primary flex items-center justify-between group border border-transparent hover:border-white/5"
                                    >
                                        <span className="truncate">{search}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-accent-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {showResults && (
                        <div className="p-2 space-y-4">
                            {/* Categories Suggestion (Omni-Pulse Power) */}
                            {categories.length > 0 && (
                                <div className="px-1">
                                    <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em]">
                                        Categorías
                                    </div>
                                    <div className="flex flex-wrap gap-2 px-2">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                to={`/${cat.section}/${cat.slug}`}
                                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-vape-500 hover:text-slate-950 hover:border-vape-400 transition-all duration-300"
                                            >
                                                {highlightText(cat.name, query)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Products */}
                            {products.length > 0 && (
                                <div className="px-1">
                                    <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em]">
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
                                                    "flex items-center gap-4 p-3 rounded-xl transition-all border border-transparent group/item relative overflow-hidden",
                                                    selectedIndex === idx
                                                        ? "bg-vape-500/10 border-vape-500/20"
                                                        : "hover:bg-white/5"
                                                )}
                                            >
                                                {/* ✨ Glint Effect on Hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/item:animate-glint" />

                                                {/* Product Image with Aura */}
                                                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover/item:border-vape-500/30 transition-colors shadow-inner">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0].startsWith('http') ? product.images[0] : `https://qngbixmyydpypmgsnxhp.supabase.co/storage/v1/object/public/products/${product.images[0]}`}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-vape-500">
                                                            <Search className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-white truncate group-hover/item:text-vape-400 transition-colors">
                                                        {highlightText(product.name, query)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">{product.section}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span className="text-xs font-bold text-herbal-400">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-white/20 group-hover/item:text-vape-400 group-hover/item:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View All CTA */}
                            <button
                                onClick={() => handleSubmit()}
                                className="w-full p-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-vape-400 hover:bg-vape-500/5 transition-all border-t border-white/5"
                            >
                                Ver todos los resultados
                            </button>

                            {/* AI Search Insights CTA */}
                            {showAIInsight && (
                                <Link
                                    to={`/chat?q=${encodeURIComponent(query)}`}
                                    className="block m-2 p-4 rounded-xl bg-gradient-to-br from-accent-primary/10 to-blue-600/10 border border-accent-primary/20 hover:border-accent-primary/40 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-glint" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-accent-primary uppercase tracking-widest">IA Insight: {query}</p>
                                            <p className="text-[11px] text-white/60">¿Buscas algo específico? Deja que VSM AI lo encuentre por ti.</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-accent-primary group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {showEmpty && (
                        <div className="p-12 text-center">
                            <div className="relative w-16 h-16 mx-auto mb-6">
                                <Search className="w-16 h-16 text-white/5" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <X className="w-6 h-6 text-red-500/20" />
                                </div>
                            </div>
                            <p className="text-white font-bold mb-2 tracking-tight">
                                Sin coincidencias directas
                            </p>
                            <p className="text-xs text-white/40 mb-8 max-w-[200px] mx-auto leading-relaxed">
                                Intenta con otros términos o usa nuestra búsqueda inteligente.
                            </p>
                            
                            <button
                                onClick={() => navigate(`/chat?q=${encodeURIComponent(query)}`)}
                                className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-vape-500 hover:text-slate-950 transition-all"
                            >
                                Consultar con VSM AI
                            </button>
                        </div>
                    )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice Search Overlay (Wave 23) */}
            <VoiceSearchOverlay
                isOpen={isVoiceOpen}
                onClose={() => {
                    setIsVoiceOpen(false);
                    stopListening();
                }}
                transcript={transcript}
                isListening={isListening}
                error={voiceError}
            />
        </div>
    );
};
