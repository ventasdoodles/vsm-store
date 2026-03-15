import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Command, Package, ShoppingCart, 
    Users, Settings, ArrowRight, X, Sparkles,
    Mic, MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useVoiceRecorder } from '@/hooks/admin/useVoiceRecorder';
import { adminNLPService } from '@/services/admin';
import { useTacticalUI } from '@/contexts/TacticalContext';

interface SearchResult {
    id: string;
    type: 'product' | 'order' | 'customer' | 'page';
    title: string;
    subtitle: string;
    url: string;
}

const PAGES = [
    { title: 'Dashboard', url: '/admin', subtitle: 'Métricas y pulso del negocio' },
    { title: 'Productos', url: '/admin/products', subtitle: 'Gestión de catálogo' },
    { title: 'Pedidos', url: '/admin/orders', subtitle: 'Logística y ventas' },
    { title: 'Clientes', url: '/admin/customers', subtitle: 'CRM e inteligencia' },
    { title: 'Cupones', url: '/admin/coupons', subtitle: 'Marketing y descuentos' },
    { title: 'Configuración', url: '/admin/settings', subtitle: 'Ajustes globales' }
];

export function AdminCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [nlpLoading, setNlpLoading] = useState(false);
    const navigate = useNavigate();
    const { playClick, playSuccess, playError, triggerHaptic } = useTacticalUI();
    const { isRecording, transcript, toggleRecording } = useVoiceRecorder();

    // Toggle with Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const performSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults(PAGES.map(p => ({ ...p, type: 'page' as const, id: p.url })));
            return;
        }

        setLoading(true);
        try {
            // Parallel search in different tables
            const [products, orders, customers] = await Promise.all([
                supabase.from('products').select('id, name').ilike('name', `%${q}%`).limit(3),
                supabase.from('orders').select('id, order_number').ilike('id', `%${q}%`).limit(3),
                supabase.from('customer_profiles').select('id, full_name, email').ilike('full_name', `%${q}%`).limit(3)
            ]);

            const dynamicResults: SearchResult[] = [
                ...(products.data || []).map(p => ({
                    id: p.id,
                    type: 'product' as const,
                    title: p.name,
                    subtitle: 'Producto',
                    url: `/admin/products?id=${p.id}`
                })),
                ...(orders.data || []).map((o: { id: string; order_number: string | null }) => ({
                    id: o.id,
                    type: 'order' as const,
                    title: `Pedido ${o.order_number || o.id.slice(0, 8)}`,
                    subtitle: 'Orden logística',
                    url: `/admin/orders?id=${o.id}`
                })),
                ...(customers.data || []).map(c => ({
                    id: c.id,
                    type: 'customer' as const,
                    title: c.full_name || 'Cliente sin nombre',
                    subtitle: c.email || 'CRM',
                    url: `/admin/customers?id=${c.id}`
                }))
            ];

            setResults(dynamicResults);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Search failed:', error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => performSearch(query), 200);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Handle Voice Impact
    useEffect(() => {
        if (transcript && !isRecording) {
            setQuery(transcript);
            handleNLPSearch(transcript);
        }
        if (isRecording) {
            triggerHaptic(10);
            playClick();
        }
    }, [isRecording, transcript]);

    const handleNLPSearch = async (text: string) => {
        setNlpLoading(true);
        try {
            const intent = await adminNLPService.parseAdminIntent(text);
            
            if (intent.action === 'navigate' && intent.target) {
                playSuccess();
                navigate(intent.target);
                setIsOpen(false);
            } else if (intent.action === 'search' && intent.target) {
                setQuery(intent.target);
                // The query change will trigger performSearch via useEffect
            } else {
                // If unknown, just stay with current results
            }
        } catch (error) {
            playError();
        } finally {
            setNlpLoading(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        navigate(result.url);
        setIsOpen(false);
        setQuery('');
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            if (results[selectedIndex]) handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm shadow-2xl"
                />

                {/* Palette Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    onKeyDown={onKeyDown}
                    className="relative z-[101] w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-2xl shadow-2xl"
                >
                    {/* Search Input Section */}
                    <div className="relative flex items-center p-6 border-b border-white/5">
                        <Search className="h-6 w-6 text-white/20 mr-4" />
                        <input 
                            autoFocus
                            placeholder={isRecording ? "Escuchando..." : "Busca o di un comando..."}
                            className={cn(
                                "flex-1 bg-transparent border-none text-white text-lg font-medium placeholder:text-white/10 focus:ring-0 outline-none",
                                isRecording && "text-indigo-400"
                            )}
                            value={isRecording ? transcript : query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    playClick();
                                    toggleRecording();
                                }}
                                className={cn(
                                    "p-3 rounded-2xl transition-all relative group",
                                    isRecording 
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" 
                                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"
                                )}
                            >
                                {isRecording && (
                                    <motion.div 
                                        layoutId="mic-pulse"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="absolute inset-0 rounded-2xl bg-rose-500/30"
                                    />
                                )}
                                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </button>

                            {(loading || nlpLoading) && <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />}
                            
                            <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hidden sm:block">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">ESC</span>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                        {results.length === 0 && !loading && (
                            <div className="py-12 text-center">
                                <X className="h-10 w-10 text-white/5 mx-auto mb-3" />
                                <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No se encontraron resultados</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                        selectedIndex === index ? "bg-white/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 flex items-center justify-center rounded-xl",
                                            result.type === 'page' && "bg-white/5 text-white/40",
                                            result.type === 'product' && "bg-amber-500/10 text-amber-500",
                                            result.type === 'order' && "bg-emerald-500/10 text-emerald-500",
                                            result.type === 'customer' && "bg-indigo-500/10 text-indigo-500"
                                        )}>
                                            {result.type === 'page' && <Command className="h-5 w-5" />}
                                            {result.type === 'product' && <Package className="h-5 w-5" />}
                                            {result.type === 'order' && <ShoppingCart className="h-5 w-5" />}
                                            {result.type === 'customer' && <Users className="h-5 w-5" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white group-hover:text-white transition-colors">
                                                {result.title}
                                            </p>
                                            <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                                                {result.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedIndex === index && (
                                        <div className="text-indigo-400">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                <div className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-black text-white/60">↑↓</div>
                                <span className="text-[9px] font-bold text-white/40 uppercase">Navegar</span>
                            </div>
                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                <div className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-black text-white/60">↵</div>
                                <span className="text-[9px] font-bold text-white/40 uppercase">Seleccionar</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-white/20" />
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">VSM COMMAND ENGINE v1.0</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
