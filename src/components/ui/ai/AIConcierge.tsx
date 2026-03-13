import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, ShoppingBag, Loader2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAIConcierge } from '@/hooks/useAIConcierge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';

export const AIConcierge: React.FC = () => {
    const { isOpen, messages, isLoading, sendMessage, toggleOpen } = useAIConcierge();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const addItem = useCartStore((s) => s.addItem);
    const notify = useNotification();

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
                            className="pointer-events-auto mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] max-h-[70vh] glass-premium rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col isolation-auto"
                        >
                            {/* Abstract Quantum Background */}
                            <div className="absolute inset-x-0 -top-20 -z-10 flex justify-center">
                                <div className="h-40 w-full bg-vape-500/20 blur-[100px] rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-vape-500 to-vape-600 flex items-center justify-center shadow-lg">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0f1d] bg-emerald-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.15em] italic">VSM Concierge</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-vape-400 uppercase tracking-widest">IA en línea</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleOpen}
                                    className="p-2.5 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
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

                                        {/* Suggested Products in Chat */}
                                        {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                            <div className="mt-2 w-full space-y-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400/60 mb-1">Recomendaciones para ti</p>
                                                <div className="flex flex-col gap-2">
                                                    {msg.suggestedProducts.map((prod) => (
                                                        <motion.div 
                                                            key={prod.id}
                                                            whileHover={{ x: 5 }}
                                                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
                                                        >
                                                            <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                                                                <OptimizedImage 
                                                                    src={prod.images?.[0] || ''} 
                                                                    alt={prod.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                                                                <p className="text-[10px] font-black text-vape-400">{formatPrice(prod.price)}</p>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addItem(prod, 1);
                                                                    notify.success('Agregado', `${prod.name} al carrito`);
                                                                }}
                                                                className="h-8 w-8 rounded-lg bg-vape-500/10 text-vape-400 flex items-center justify-center hover:bg-vape-500 hover:text-white transition-all"
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
                                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Analizando...</span>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSubmit} className="p-6 bg-white/[0.02] border-t border-white/5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Pregúntame lo que sea..."
                                        disabled={isLoading}
                                        className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-vape-500/50 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="h-12 w-12 rounded-2xl bg-vape-500 flex items-center justify-center text-white shadow-lg shadow-vape-500/20 hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
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
                    <div className="absolute inset-0 bg-vape-500 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
                    <div className={cn(
                        "relative h-full w-full rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500",
                        isOpen ? "bg-white text-slate-900 rotate-90" : "bg-gradient-to-br from-vape-500 to-vape-600 text-white"
                    )}>
                        {isOpen ? <X className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
                    </div>

                    {/* Notification Dot */}
                    {!isOpen && (
                        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#0a0f1d] shadow-lg">
                            <Bot className="h-3 w-3 text-white" />
                        </div>
                    )}
                </motion.button>
            </div>
        </>
    );
};
