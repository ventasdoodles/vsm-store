import React, { useState, useRef, useEffect } from 'react';
import { ConciergeMessageItem } from './ConciergeMessageItem';
import { collectCartAssemblyProductIds } from './helpers';
import { resolveCesarinCartAssemblyEligibility } from '@/lib/cesarin-cart-assembly';
import { getVariantDisplayName } from '@/lib/domain/products';

import {
    CartAssemblyFeedback,
    emitCtaMeasurement,
    getOrderIdFromUrl,
    getNextStepActions,
    getCartAssemblyProduct,
    getAddActionLabel
} from './helpers';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader2, Search, Mic, MicOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIConcierge } from '@/hooks/useAIConcierge';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProductsByIds } from '@/services/products.service';
import { type ConciergeCatalogGate, type ConciergeMessage } from '@/services';
import type { Product } from '@/types/product';

function getLatestCatalogGate(messages: ConciergeMessage[]): ConciergeCatalogGate | null {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const candidate = messages[index] as ConciergeMessage & { catalog_gate?: ConciergeCatalogGate };
        if (candidate.catalog_gate) {
            return candidate.catalog_gate;
        }
    }

    return null;
}


export const AIConcierge: React.FC = () => {
    const {
        isOpen,
        messages,
        isLoading,
        isSlowResponse,
        isListening,
        error,
        activeRecovery,
        sendMessage,
        handleRecoverySelection,
        sendProactiveMessage,
        toggleOpen,
        retryLastMessage,
        startRecording,
        stopRecording,
        cesarinSessionId,
    } = useAIConcierge();
    const [input, setInput] = useState('');
    const [cartAssemblyProducts, setCartAssemblyProducts] = useState<Record<string, Product>>({});
    const [cartAssemblyFeedback, setCartAssemblyFeedback] = useState<Record<string, CartAssemblyFeedback>>({});
    const scrollRef = useRef<HTMLDivElement>(null);
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);
    const notify = useNotification();
    const location = useLocation();
    const navigate = useNavigate();
    const latestCatalogGate = getLatestCatalogGate(messages);
    const renderedCtaKeysRef = useRef<Set<string>>(new Set());

    const handleOpenProduct = (product: { slug: string; section?: string }) => {
        navigate(`/${product.section ?? 'vape'}/${product.slug}`);
    };

    useEffect(() => {
        const ids = collectCartAssemblyProductIds(messages, cartAssemblyProducts);
        if (ids.length === 0) return;

        let cancelled = false;
        Promise.resolve(getProductsByIds(ids))
            .then((products) => {
                if (cancelled) return;
                if (!Array.isArray(products)) return;
                if (products.length === 0) return;
                setCartAssemblyProducts((current) => {
                    const next = { ...current };
                    let changed = false;
                    for (const product of products) {
                        if (next[product.id]) continue;
                        next[product.id] = product;
                        changed = true;
                    }
                    return changed ? next : current;
                });
            })
            .catch(() => {
                // The CTA will remain advisory until product truth can be loaded.
            });

        return () => {
            cancelled = true;
        };
    }, [messages, cartAssemblyProducts]);

    const handleAddProductToCart = async (product: {
        id: string;
        name: string;
        quantity?: number;
        variantToken?: { id: string; name: string } | null;
        messageId?: string;
    }) => {
        const setFeedback = (feedback: CartAssemblyFeedback) => {
            if (!product.messageId) return;
            setCartAssemblyFeedback((current) => ({
                ...current,
                [product.messageId!]: feedback,
            }));
        };

        try {
            const full = await getProductsByIds([product.id]);
            if (full[0]) {
                const eligibility = resolveCesarinCartAssemblyEligibility({
                    product: full[0],
                    variantToken: product.variantToken ?? null,
                    quantityIntent: product.quantity ?? 1,
                });

                if (!eligibility.canAdd) {
                    const text = eligibility.requiresVariantSelection
                        ? `Todavia falta elegir una opcion de ${product.name} antes de agregarlo.`
                        : `${product.name} no se agrego porque no esta disponible para carrito.`;
                    setFeedback({
                        tone: eligibility.requiresVariantSelection ? 'warning' : 'error',
                        text,
                    });
                    notify.error('No agregado', text);
                    return;
                }

                const variantToken = eligibility.selectedVariant
                    ? {
                        id: eligibility.selectedVariant.id,
                        name: product.variantToken?.id === eligibility.selectedVariant.id
                            ? product.variantToken!.name
                            : getVariantDisplayName(eligibility.selectedVariant),
                    }
                    : product.variantToken ?? null;
                const beforeItems = useCartStore.getState().items;
                const beforeQuantity = beforeItems.find(
                    (item) => item.product.id === full[0]!.id && (item.variant_id ?? null) === (variantToken?.id ?? null),
                )?.quantity ?? 0;
                const remainingQuantity = Math.max(0, eligibility.maxQuantity - beforeQuantity);

                if (remainingQuantity <= 0) {
                    const text = `${product.name} no se agrego: el carrito ya trae el stock disponible.`;
                    setFeedback({ tone: 'warning', text });
                    notify.error('No agregado', text);
                    return;
                }

                const executionQuantity = Math.min(eligibility.safeQuantity, remainingQuantity);
                addItem(full[0], executionQuantity, variantToken, {
                    source: 'cesarin',
                    sessionId: cesarinSessionId,
                });

                const afterItems = useCartStore.getState().items;
                const afterQuantity = afterItems.find(
                    (item) => item.product.id === full[0]!.id && (item.variant_id ?? null) === (variantToken?.id ?? null),
                )?.quantity ?? 0;

                if (afterQuantity <= beforeQuantity) {
                    const text = `${product.name} no se agrego; el carrito no cambio.`;
                    setFeedback({ tone: 'warning', text });
                    notify.error('No agregado', text);
                    return;
                }

                const addedQuantity = afterQuantity - beforeQuantity;
                const adjusted = addedQuantity < eligibility.requestedQuantity;
                const text = adjusted
                    ? `Agregue ${addedQuantity} de ${product.name}; ajuste la cantidad al stock disponible.`
                    : `Agregue ${addedQuantity} de ${product.name} al carrito.`;
                setFeedback({ tone: adjusted ? 'warning' : 'success', text });
                notify.success(adjusted ? 'Cantidad ajustada' : 'Agregado', text);
            } else {
                const text = 'Producto no disponible';
                setFeedback({ tone: 'error', text });
                notify.error('Error', text);
            }
        } catch {
            const text = 'No se pudo agregar al carrito';
            setFeedback({ tone: 'error', text });
            notify.error('Error', text);
        }
    };

    

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (location.pathname.includes('/vape/') || location.pathname.includes('/420/')) {
            timer = setTimeout(() => {
                const productName = location.pathname.split('/').pop()?.replace(/-/g, ' ');
                sendProactiveMessage(`Vi que andas viendo ${productName}. Te digo rapido por que destaca o te saco algo parecido.`);
            }, 15000);
        }

        return () => clearTimeout(timer);
    }, [location.pathname, sendProactiveMessage]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => {
        for (const message of messages) {
            if (message.role !== 'assistant') continue;

            if (message.action) {
                const label = message.action.label;
                const key = `${message.id}:LINK:${label}:${message.action.url}`;
                if (!renderedCtaKeysRef.current.has(key)) {
                    renderedCtaKeysRef.current.add(key);
                    emitCtaMeasurement({
                        sessionId: cesarinSessionId,
                        eventType: 'ai_cta_rendered',
                        messageId: message.id,
                        ctaKind: 'LINK',
                        label,
                        orderId: getOrderIdFromUrl(message.action.url),
                    });
                }
            }

            const nextStepView = message.capsule_contract?.next_step_view ?? null;
            const actions = getNextStepActions(nextStepView);
            for (const [index, action] of actions.entries()) {
                if (action?.kind !== 'ADD_TO_CART' && action?.kind !== 'OPEN_CART') continue;

                const product = getCartAssemblyProduct(action.product?.id, message.suggestedProducts, cartAssemblyProducts);
                const eligibility = action.kind === 'ADD_TO_CART'
                    ? resolveCesarinCartAssemblyEligibility({
                        product,
                        variantToken: action.variantToken ?? null,
                        quantityIntent: action.quantity ?? 1,
                    })
                    : null;
                if (action.kind === 'ADD_TO_CART' && !eligibility?.canAdd) continue;

                const ctaKind = action.kind === 'ADD_TO_CART' ? 'ADD_TO_CART' : 'OPEN_CART';
                const label = ctaKind === 'ADD_TO_CART'
                    ? getAddActionLabel(action, eligibility!)
                    : action.label ?? 'Abrir carrito';
                const key = `${message.id}:${ctaKind}:${action.product?.id ?? 'cart'}:${index}:${label}`;
                if (renderedCtaKeysRef.current.has(key)) continue;

                renderedCtaKeysRef.current.add(key);
                emitCtaMeasurement({
                    sessionId: cesarinSessionId,
                    eventType: 'ai_cta_rendered',
                    messageId: message.id,
                    ctaKind,
                    label,
                    productId: action.product?.id ?? null,
                });
            }
        }
    }, [cartAssemblyProducts, cesarinSessionId, messages]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!input.trim() || isLoading) return;
        void sendMessage(input);
        setInput('');
    };

    const latestAssistantCatalogGate = [...messages]
        .reverse()
        .find((message) => message.role === 'assistant')
        ?.catalog_gate;
    const shouldShowCatalogSurfacesNow = latestAssistantCatalogGate?.is_open ?? true;

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
                            <div className="absolute inset-x-0 -top-20 -z-10 flex justify-center">
                                <div className="h-40 w-full blur-[64px] rounded-full bg-vape-500/20" />
                            </div>

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
                                                IA en linea
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

                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar"
                            >
{messages.map((message) => (
                                    <ConciergeMessageItem
                                        key={message.id}
                                        message={message as any}
                                        latestCatalogGate={latestCatalogGate}
                                        shouldShowCatalogSurfacesNow={shouldShowCatalogSurfacesNow}
                                        cartAssemblyProducts={cartAssemblyProducts}
                                        cartAssemblyFeedback={cartAssemblyFeedback}
                                        cesarinSessionId={cesarinSessionId}
                                        isLoading={isLoading}
                                        activeRecovery={activeRecovery}
                                        lastAssistantId={[...messages].reverse().find(m => m.role === 'assistant')?.id ?? null}
                                        scrollRef={scrollRef}
                                        handleRecoverySelection={handleRecoverySelection}
                                        handleAddProductToCart={handleAddProductToCart}
                                        handleOpenProduct={handleOpenProduct}
                                        sendMessage={sendMessage}
                                        openCart={openCart}
                                        navigate={navigate}
                                    />
                                ))}

                                {isLoading && (
                                    <div className="flex items-center gap-2 text-vape-400/50">
                                        <Loader2 className="h-4 w-4 animate-spin text-vape-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            {isSlowResponse ? 'Sigo pensando...' : 'Analizando...'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!isLoading && !error && messages.length <= 2 && (
                                <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                                    {['Relajacion total', 'Sabor intenso', 'Para el dia', 'Extractos 420'].map((hint) => (
                                        <button
                                            key={hint}
                                            onClick={() => void sendMessage(hint)}
                                            className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/5 text-[10px] font-bold text-white/50 hover:bg-vape-500/20 hover:text-vape-400 transition-all whitespace-nowrap"
                                        >
                                            {hint}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
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

                            <form onSubmit={handleSubmit} className="p-6 bg-white/[0.02] border-t border-white/5">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(event) => setInput(event.target.value)}
                                            placeholder="Preguntame lo que sea..."
                                            disabled={isLoading || !!error}
                                            className="w-full bg-black/40 border border-white/5 focus:border-vape-500/50 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none transition-all font-medium"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={isListening ? stopRecording : startRecording}
                                                className={cn(
                                                    'p-1.5 rounded-lg transition-all',
                                                    isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-white/10 hover:text-vape-400',
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

                <motion.button
                    onClick={toggleOpen}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="pointer-events-auto group relative h-16 w-16"
                >
                    <div className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity bg-vape-500" />
                    <div
                        className={cn(
                            'relative h-full w-full rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500',
                            isOpen ? 'bg-white text-slate-900 rotate-90' : 'bg-gradient-to-br from-vape-500 to-vape-600 text-white',
                        )}
                    >
                        {isOpen ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
                    </div>

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

