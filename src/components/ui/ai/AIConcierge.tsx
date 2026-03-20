import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, ShoppingBag, Loader2, Search, Mic, MicOff, RefreshCw } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAIConcierge } from '@/hooks/useAIConcierge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { useLocation } from 'react-router-dom';
// import type { Product } from '@/types/product';

export const AIConcierge: React.FC = () => {
    const { 
        isOpen, messages, isLoading, isListening, error,
        sendMessage, sendProactiveMessage, toggleOpen, retryLastMessage,
        startRecording, stopRecording 
    } = useAIConcierge();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const addItem = useCartStore((s) => s.addItem);
    const notify = useNotification();
    const location = useLocation();

    // Proactive Triggers [Wave 120]
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        
        // Trigger if user spends time on a product page
        if (location.pathname.includes('/vape/') || location.pathname.includes('/420/')) {
            timer = setTimeout(() => {
                const productName = location.pathname.split('/').pop()?.replace(/-/g, ' ');
                sendProactiveMessage(`He notado que estás viendo el ${productName}. ¿Te gustaría saber por qué es uno de nuestros favoritos o buscas algo con características similares?`);
            }, 15000); // 15 seconds of focus
        }

        return () => clearTimeout(timer);
    }, [location.pathname, sendProactiveMessage]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <>
            <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
                            className="pointer-events-auto mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[580px] max-h-[75vh] glass-premium rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col isolation-auto"
                        >
                            {/* Pulse Background */}
                            <div className="absolute inset-x-0 -top-20 -z-10 flex justify-center">
                                <div className="h-40 w-full blur-[64px] rounded-full bg-vape-500/20" />
                            </div>

                            {/* Header */}
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-vape-500 to-vape-600">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0f1d] bg-emerald-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.15em] italic">
                                            CESAR
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                IA en línea
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleOpen}
                                        className="p-2.5 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Window */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar"
                            >
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={cn(
                                            "flex flex-col gap-2 max-w-[85%]",
                                            msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "relative rounded-2xl px-4 py-3 text-sm shadow-xl",
                                            msg.role === 'user' 
                                                ? "bg-vape-500 text-white font-medium rounded-tr-none" 
                                                : "bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none"
                                        )}>
                                            {msg.content}
                                        </div>

                                        {/* Action Buttons [Wave 154] */}
                                        {msg.action && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => window.open(msg.action?.url, '_blank')}
                                                className={cn(
                                                    "mt-1 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg",
                                                    msg.action.type === 'whatsapp' 
                                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
                                                        : "bg-vape-500 text-white hover:bg-vape-600 shadow-vape-500/20"
                                                )}
                                            >
                                                {msg.action.type === 'whatsapp' && <Send className="h-3.5 w-3.5" />}
                                                {msg.action.label}
                                            </motion.button>
                                        )}
                                        {/* Knowledge RAG Chunks [Wave 186/Foundation] */}
                                        {(msg as any).capsule_contract?.capsule_name === 'knowledge_rag_foundation' && 
                                         (msg as any).capsule_contract?.resolved_chunks?.length > 0 && (
                                            <div className="mt-2 w-full space-y-3">
                                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400/60 mb-1">
                                                     {(msg as any).capsule_contract?.match_strategy === 'HIGH_CONFIDENCE_POLICY_MATCH' ? 'Política Oficial' :
                                                      (msg as any).capsule_contract?.match_strategy === 'MODERATE_CONFIDENCE_MULTI_SOURCE' ? 'Manual y Guías' :
                                                      (msg as any).capsule_contract?.match_strategy === 'LOW_CONFIDENCE_FALLBACK' ? 'Info Relacionada' :
                                                      'Base de Conocimiento'}
                                                 </p>
                                                 <div className="flex flex-col gap-2">
                                                     {(msg as any).capsule_contract.resolved_chunks.map((chunk: any, i: number) => (
                                                        <div 
                                                            key={`${chunk.id}-${i}`}
                                                            className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-left relative overflow-hidden"
                                                        >
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-vape-500/50 to-vape-600/10" />
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <h4 className="text-[11px] font-bold text-white tracking-wide">{chunk.title}</h4>
                                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 uppercase tracking-[0.1em]">{chunk.category}</span>
                                                            </div>
                                                            <p className="text-[11.5px] text-white/80 leading-relaxed font-medium">
                                                                {chunk.content}
                                                            </p>
                                                        </div>
                                                     ))}
                                                 </div>
                                            </div>
                                        )}

                                        {/* Suggested Products in Chat */}
                                        {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                            <div className="mt-2 w-full space-y-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400/60 mb-1">
                                                    {(msg as any).capsule_contract?.match_strategy === 'OUT_OF_STOCK_ALTERNATIVE' ? 'Alternativas Disponibles' :
                                                     (msg as any).capsule_contract?.match_strategy === 'FEATURED_FALLBACK' ? 'Recomendaciones Destacadas' :
                                                     (msg as any).capsule_contract?.match_strategy === 'SEMANTIC_MATCH' ? 'Sugerencias Similares' :
                                                     (msg as any).capsule_contract?.match_strategy === 'AMBIGUOUS' ? 'Opciones Disponibles' :
                                                     'Coincidencias Encontradas'}
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    {(msg.suggestedProducts as any[]).map((prod: any) => (
                                                        <motion.div 
                                                            key={prod.id}
                                                            whileHover={{ x: 5 }}
                                                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group cursor-pointer"
                                                            onClick={() => window.location.href = `/vape/${prod.id}`}
                                                        >
                                                            <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                                                                <OptimizedImage 
                                                                    src={prod.cover_image || prod.images?.[0] || ''} 
                                                                    alt={prod.name}
                                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-white truncate group-hover:text-vape-400 transition-colors">{prod.name}</p>
                                                                <p className="text-[10px] font-black text-vape-400">{formatPrice(prod.price)}</p>
                                                                {prod.ai_sales_note && (
                                                                    <p className="text-[9px] text-white/40 truncate mt-0.5 font-medium italic leading-tight">
                                                                        {prod.ai_sales_note}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addItem(prod as any, 1);
                                                                    notify.success('Agregado', `${prod.name} al carrito`);
                                                                }}
                                                                className="h-8 w-8 rounded-lg bg-vape-500/10 text-vape-400 flex items-center justify-center hover:bg-vape-500 hover:text-white transition-all shadow-lg"
                                                            >
                                                                <ShoppingBag className="h-4 w-4" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <div className="flex items-center gap-2 text-vape-400/50">
                                        <Loader2 className="h-4 w-4 animate-spin text-vape-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            Analizando...
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Smart Hints [Wave 120] */}
                            {!isLoading && !error && messages.length <= 2 && (
                                <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                                    {['Relajación total', 'Sabor intenso', 'Para el día', 'Extractos 420'].map(hint => (
                                        <button
                                            key={hint}
                                            onClick={() => sendMessage(hint)}
                                            className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/5 text-[10px] font-bold text-white/50 hover:bg-vape-500/20 hover:text-vape-400 transition-all whitespace-nowrap"
                                        >
                                            {hint}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ERROR UI [SLICE 2D] */}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="mx-6 mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center text-center backdrop-blur-md"
                                >
                                    <p className="text-xs font-medium text-red-200 mb-3">{error.message}</p>
                                    <button 
                                        type="button"
                                        onClick={retryLastMessage}
                                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10 border border-red-500/20 hover:border-red-500"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        Reintentar
                                    </button>
                                </motion.div>
                            )}

                            {/* Input Area */}
                            <form onSubmit={handleSubmit} className="p-6 bg-white/[0.02] border-t border-white/5">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Pregúntame lo que sea..."
                                            disabled={isLoading || !!error}
                                            className="w-full bg-black/40 border border-white/5 focus:border-vape-500/50 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none transition-all font-medium"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={isListening ? stopRecording : startRecording}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-all",
                                                    isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "text-white/10 hover:text-vape-400"
                                                )}
                                            >
                                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                            </button>
                                            <Search className="h-4 w-4 text-white/10" />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-vape-500/20 hover:scale-105 active:scale-95 disabled:opacity-20 transition-all bg-vape-500"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bubble Trigger */}
                <motion.button
                    onClick={toggleOpen}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="pointer-events-auto group relative h-16 w-16"
                >
                    <div className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity bg-vape-500" />
                    <div className={cn(
                        "relative h-full w-full rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500",
                        isOpen ? "bg-white text-slate-900 rotate-90" : "bg-gradient-to-br from-vape-500 to-vape-600 text-white"
                    )}>
                        {isOpen ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
                    </div>

                    {/* Notification Dot */}
                    {!isOpen && messages.length > 1 && (
                        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#0a0f1d] shadow-lg animate-bounce">
                            <Bot className="h-3 w-3 text-white" />
                        </div>
                    )}
                </motion.button>
            </div>
        </>
    );
};
