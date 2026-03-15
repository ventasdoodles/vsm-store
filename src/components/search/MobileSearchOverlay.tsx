import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ChevronRight, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import { useSearch } from '@/hooks/useSearch';
import { useSearchOverlay } from '@/stores/search-overlay.store';
import { formatPrice, cn, optimizeImage } from '@/lib/utils';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { VoiceSearchOverlay } from './VoiceSearchOverlay';
import { useVoiceIntelligence } from '@/hooks/useVoiceIntelligence';
import { useStorefrontTactical } from '@/hooks/useStorefrontTactical';
import type { Product } from '@/types/product';

export function MobileSearchOverlay() {
    const { isOpen, close } = useSearchOverlay();
    const [query, setQuery] = useState('');
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { trigger } = useHaptic();
    const { triggerSensory } = useStorefrontTactical();
    const { mutateAsync: processTranscript } = useVoiceIntelligence();

    // Gestión de Voz
    const { isListening, isDiagnosing, transcript, error: voiceError, startListening, stopListening } = useVoiceSearch({
        onResult: async (text) => {
            const shouldAIProcess = text.split(' ').length > 2;
            if (shouldAIProcess) {
                setTimeout(async () => {
                    const { searchQuery } = await processTranscript(text);
                    setQuery(searchQuery);
                    setIsVoiceOpen(false);
                    setTimeout(() => handleSubmitForm(searchQuery), 200);
                }, 800);
            } else {
                setQuery(text);
                setTimeout(() => {
                    setIsVoiceOpen(false);
                    handleSubmitForm(text);
                }, 800);
            }
        }
    });

    // Búsqueda vía hook (debounce + TanStack Query incluidos)
    const { data: searchData, isLoading: isSearching } = useSearch(query);
    const results = searchData ?? [];

    // Auto-focus al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
            triggerSensory('search-open');
        } else {
            document.body.style.overflow = '';
            setQuery('');
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, triggerSensory]);

    const handleResultClick = (product: Product) => {
        trigger('light');
        triggerSensory('nav-click');
        navigate(`/${product.section}/${product.slug}`);
        close();
    };

    const handleSubmitForm = (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        trigger('medium');
        navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
        close();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmitForm(query);
    };

    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" aria-label="Buscar productos" className="fixed inset-0 z-[60] flex flex-col bg-theme-primary/95 backdrop-blur-3xl animate-in fade-in duration-300">
            {/* Header Search */}
            <div className="flex items-center gap-3 border-b border-white/5 p-4">
                <form onSubmit={handleSubmit} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-secondary" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full rounded-2xl border-none bg-white/5 py-3 pl-10 pr-12 text-theme-primary placeholder:text-theme-secondary focus:bg-white/10 focus:ring-2 focus:ring-vape-500/30 transition-all font-medium"
                    />
                    
                    <button
                        type="button"
                        onClick={() => {
                            triggerSensory('voice-listen');
                            setIsVoiceOpen(true);
                            startListening();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-vape-400 hover:bg-vape-500/10 active:scale-90 transition-all"
                    >
                        <Mic className="h-5 w-5" />
                    </button>

                    {isSearching && (
                        <Loader2 className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-vape-500" />
                    )}
                </form>
                <button
                    onClick={close}
                    className="rounded-full p-2 text-theme-secondary hover:bg-white/5 active:scale-95 transition-all"
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
                            <div className="text-center py-10 text-theme-secondary">
                                <p>No se encontraron productos.</p>
                            </div>
                        )}

                        {results.map((product) => (
                            <SearchResultItem
                                key={product.id}
                                product={product}
                                onClick={handleResultClick}
                            />
                        ))}
                    </div>
                ) : (
                    /* Sugerencias (estado vacío) */
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <h3 className="mb-3 text-xs font-semibold text-theme-secondary uppercase tracking-wider">
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
                                        className="rounded-full border border-theme bg-theme-secondary/50 px-3 py-1.5 text-sm text-theme-primary hover:border-vape-500/30 hover:text-vape-400 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Voice Search Overlay (Wave 133) */}
            <VoiceSearchOverlay
                isOpen={isVoiceOpen}
                onClose={() => {
                    setIsVoiceOpen(false);
                    stopListening();
                }}
                transcript={transcript}
                isListening={isListening}
                isDiagnosing={isDiagnosing}
                error={voiceError}
            />
        </div>
    );
}

function SearchResultItem({ product, onClick }: { product: Product; onClick: (p: Product) => void }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onClick(product)}
            onMouseMove={handleMouseMove}
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/5 bg-theme-secondary/20 p-4 transition-all hover:border-white/20 active:scale-[0.98] active:bg-theme-secondary/60"
        >
            {/* 🔦 Spotlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            150px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.08),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="relative z-10 h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-theme-tertiary shadow-inner border border-white/5 group-hover:scale-105 transition-transform duration-500">
                {product.images?.[0] ? (
                    <img
                        src={optimizeImage(product.images[0], { width: 150, height: 150, quality: 80, format: 'webp' })}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-theme-secondary uppercase font-bold tracking-tighter">No img</div>
                )}
            </div>
            <div className="relative z-10 flex-1 min-w-0">
                <h4 className="font-bold text-white truncate text-sm sm:text-base tracking-tight">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                        "text-sm font-black",
                        product.section === 'vape' ? 'text-vape-400' : 'text-herbal-400'
                    )}>
                        {formatPrice(product.price)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/5">
                        {product.section === 'vape' ? 'Vape' : 'Nature'}
                    </span>
                </div>
            </div>
            <ChevronRight className="relative z-10 h-5 w-5 text-theme-secondary group-hover:translate-x-1 group-hover:text-vape-400 transition-all duration-300" />
        </motion.div>
    );
}
