import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { useHaptic } from '@/hooks/useHaptic';

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
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { trigger } = useHaptic();

    // Auto-focus al abrir
    useEffect(() => {
        if (isOpen) {
            // Pequeño delay para permitir la animación
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        trigger('medium');
        navigate(`/search?q=${encodeURIComponent(query)}`);
        close();
        setQuery('');
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
                        className="w-full rounded-xl border-none bg-primary-800/50 py-3 pl-10 pr-4 text-primary-100 placeholder:text-primary-500 focus:bg-primary-800 focus:ring-2 focus:ring-vape-500/50"
                    />
                </form>
                <button
                    onClick={close}
                    className="rounded-full p-2 text-primary-400 hover:bg-primary-800"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Suggestions / Recent */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-6">
                    <h3 className="mb-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                        Populares
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
        </div>
    );
}
