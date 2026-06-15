import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, ShoppingBag, Loader2, Search, Mic, MicOff, RefreshCw } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAIConcierge } from '@/hooks/useAIConcierge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProductsByIds } from '@/services/products.service';
import { buildConciergeCatalogGate, type ConciergeCatalogGate, type ConciergeMessage } from '@/services';
import { getCesarinApproximateRecoveryHint, isCesarinApproximateMatchStrategy } from '@/lib/cesarin-stage1';
import { normalizeCompactText, isMeaningfullyDistinct } from '@/lib/cesarin-text-utils';
import type { Product } from '@/types/product';
import { getVariantDisplayName } from '@/lib/domain/products';
import {
    resolveCesarinCartAssemblyEligibility,
    type CesarinCartAssemblyEligibility,
} from '@/lib/cesarin-cart-assembly';
import { emitConversationConversionEvent } from '@/lib/conversion-measurement';
import { CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS } from '@/lib/customer-intelligence-no-write-smoke';
import { useTypewriter } from '@/hooks/useTypewriter';

function getLatestCatalogGate(messages: ConciergeMessage[]): ConciergeCatalogGate | null {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const candidate = messages[index] as ConciergeMessage & { catalog_gate?: ConciergeCatalogGate };
        if (candidate.catalog_gate) {
            return candidate.catalog_gate;
        }
    }

    return null;
}


function getSuggestionGroupLabel(matchStrategy: string | undefined) {
    switch (matchStrategy) {
        case 'OUT_OF_STOCK_ALTERNATIVE':
            return 'Alternativas Disponibles';
        case 'FEATURED_FALLBACK':
            return 'Recomendaciones Destacadas';
        case 'TOKEN_RECOVERY':
            return 'Coincidencias por Nombre';
        case 'SEMANTIC':
            return 'Sugerencias Cercanas';
        case 'EXACT':
            return 'Coincidencias Encontradas';
        default:
            return 'Coincidencias Encontradas';
    }
}

type CesarinVisibleHelpTone = 'direct' | 'public' | 'catalog' | 'action';

function getVisibleHelpToneClasses(tone: CesarinVisibleHelpTone): string {
    switch (tone) {
        case 'public':
            return 'border-sky-400/20 bg-sky-400/10 text-sky-200/80';
        case 'catalog':
            return 'border-vape-400/20 bg-vape-400/10 text-vape-200/85';
        case 'action':
            return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200/85';
        default:
            return 'border-white/10 bg-white/[0.04] text-white/65';
    }
}

function getNextStepFamilyLabel(family: unknown): string | null {
    switch (family) {
        case 'REVIEW_ONE':
            return 'Revisa primero';
        case 'COMPARE_TWO':
            return 'Compara estas dos';
        case 'ADD_READY':
            return 'Listo para avanzar';
        case 'KEEP_EXPLORING':
            return 'Sigue explorando';
        default:
            return null;
    }
}

import type { CesarinStorefrontNextStepView, CesarinStorefrontActionButtonView } from '@/lib/cesarin-stage5';

function formatSmokeAuditList(value: unknown): string {
    return Array.isArray(value) && value.length > 0
        ? value.filter((item): item is string => typeof item === 'string').join(', ')
        : 'none';
}

function getNextStepTrustNote(nextStepView: CesarinStorefrontNextStepView | null): string | null {
    switch (nextStepView?.family) {
        case 'KEEP_EXPLORING':
            return 'Todavia estamos afinando';
        case 'COMPARE_TWO':
            return 'Las dos traen buen caso';
        case 'ADD_READY':
            return 'Ya esta bastante claro';
        case 'REVIEW_ONE':
            return normalizeCompactText(nextStepView?.guidance ?? '').includes('por ahora')
                ? 'Es la mejor pista por ahora'
                : 'Es la ruta mas clara';
        default:
            return null;
    }
}

function shouldShowSelectorNeededGuidance(messageContent: string, nextStepView: CesarinStorefrontNextStepView | null): boolean {
    if (nextStepView?.family !== 'SELECTOR_NEEDED' || !nextStepView?.guidance) {
        return false;
    }

    const normalizedMessage = normalizeCompactText(messageContent);
    const normalizedSelector = normalizeCompactText(nextStepView?.missingSelector ?? '');
    if (!normalizedSelector) {
        return isMeaningfullyDistinct(messageContent, nextStepView.guidance);
    }

    return !normalizedMessage.includes(normalizedSelector);
}

function getNextStepActions(nextStepView: CesarinStorefrontNextStepView | null): CesarinStorefrontActionButtonView[] {
    return [nextStepView?.primaryAction, nextStepView?.secondaryAction].filter((a): a is CesarinStorefrontActionButtonView => Boolean(a));
}

function isFullStorefrontProduct(value: unknown): value is Product {
    const product = value as Partial<Product> | null | undefined;
    return Boolean(
        product
        && typeof product.id === 'string'
        && typeof product.slug === 'string'
        && typeof product.name === 'string'
        && typeof product.stock === 'number'
        && typeof product.is_active === 'boolean'
        && typeof product.status === 'string'
        && typeof product.price === 'number',
    );
}

function getCartAssemblyProduct(
    productId: string | undefined,
    suggestedProducts: ConciergeMessage['suggestedProducts'],
    fetchedProducts: Record<string, Product>,
): Product | null {
    if (!productId) return null;

    const suggested = suggestedProducts?.find((product) => product.id === productId);
    if (isFullStorefrontProduct(suggested)) return suggested;

    return fetchedProducts[productId] ?? null;
}

function collectCartAssemblyProductIds(messages: ConciergeMessage[], fetchedProducts: Record<string, Product>): string[] {
    const ids = new Set<string>();

    for (const message of messages) {
        const nextStepView = message.capsule_contract?.next_step_view;
        for (const action of getNextStepActions(nextStepView)) {
            if (action?.kind !== 'ADD_TO_CART') continue;
            const productId = action.product?.id;
            if (typeof productId !== 'string' || fetchedProducts[productId]) continue;
            const suggested = message.suggestedProducts?.find((product) => product.id === productId);
            if (isFullStorefrontProduct(suggested)) continue;
            ids.add(productId);
        }
    }

    return [...ids];
}

function getNextStepActionKey(action: CesarinStorefrontActionButtonView | null, index: number): string {
    const productId = typeof action?.product?.id === 'string' ? action.product.id : 'cart';
    return `${action?.kind ?? 'action'}-${productId}-${index}`;
}

function getAdvisoryActionLabel(action: CesarinStorefrontActionButtonView | null, eligibility: CesarinCartAssemblyEligibility | null): string {
    const productName = action?.product?.name ?? 'producto';
    if (eligibility?.requiresVariantSelection) return `Elegir opcion de ${productName}`;
    return `Revisar ${productName}`;
}

function getAddActionLabel(action: CesarinStorefrontActionButtonView | null, eligibility: CesarinCartAssemblyEligibility): string {
    const productName = action?.product?.name ?? 'producto';
    if (eligibility.safeQuantity > 1 && eligibility.safeQuantity < eligibility.requestedQuantity) {
        return `Agregar ${eligibility.safeQuantity} x ${productName}`;
    }
    return action?.label ?? `Agregar ${productName}`;
}

function getOrderIdFromUrl(url: string | undefined): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://vsm.local');
        return parsed.searchParams.get('order_id');
    } catch {
        const match = url.match(/[?&]order_id=([^&]+)/);
        return match?.[1] ? decodeURIComponent(match[1]) : null;
    }
}

function emitCtaMeasurement(input: {
    sessionId: string;
    eventType: 'ai_cta_rendered' | 'ai_cta_clicked';
    messageId: string;
    ctaKind: 'ADD_TO_CART' | 'OPEN_CART' | 'LINK';
    label: string;
    productId?: string | null;
    orderId?: string | null;
    source?: 'cesarin';
}): void {
    emitConversationConversionEvent({
        sessionId: input.sessionId,
        eventType: input.eventType,
        metadata: {
            message_id: input.messageId,
            cta_kind: input.ctaKind,
            label: input.label,
            product_id: input.productId ?? null,
            order_id: input.orderId ?? null,
            ...(input.source ? { source: input.source } : {}),
        },
    });
}

function getVisibleHelpSurface(input: {
    message: ConciergeMessage;
    showProductSurfaces: boolean;
    nextStepView: CesarinStorefrontNextStepView | null;
    turnAnalysis: unknown;
    hasEligibleCartAssemblyAction?: boolean;
}): { label: string; note?: string; tone: CesarinVisibleHelpTone } | null {
    const { message, showProductSurfaces, nextStepView, turnAnalysis, hasEligibleCartAssemblyAction = false } = input;
    if (message.role !== 'assistant') return null;

    const capsuleName = message.capsule_contract?.capsule_name ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primaryIntent = (turnAnalysis as any)?.primary_intent ?? message.catalog_gate?.primary_intent ?? null;

    if (message.source_context) {
        const brief = message.source_context.brief;

        return {
            label: message.source_context.label,
            note: brief && isMeaningfullyDistinct(message.content, brief) ? brief : undefined,
            tone: 'public',
        };
    }

    if (
        showProductSurfaces
        && (
            (nextStepView?.surfaceKind === 'ACTIONABLE' && hasEligibleCartAssemblyAction)
            || (!nextStepView?.surfaceKind && nextStepView?.family === 'ADD_READY' && nextStepView?.primaryAction?.kind === 'ADD_TO_CART' && hasEligibleCartAssemblyAction)
            || nextStepView?.primaryAction?.kind === 'OPEN_CART'
        )
    ) {
        return {
            label: 'Paso accionable',
            tone: 'action',
        };
    }

    if (
        showProductSurfaces
        && (
            nextStepView?.surfaceKind === 'CATALOG_HELP'
            || (!nextStepView?.surfaceKind && nextStepView)
        )
    ) {
        return {
            label: 'Ayuda de producto',
            tone: 'catalog',
        };
    }

    if (showProductSurfaces && message.suggestedProducts?.length) {
        return {
            label: 'Ayuda de producto',
            note: getSuggestionGroupLabel(message.capsule_contract?.match_strategy),
            tone: 'catalog',
        };
    }

    if (!showProductSurfaces && ((message.suggestedProducts?.length ?? 0) > 0 || nextStepView)) {
        return null;
    }

    if (
        message.action
        || capsuleName === 'cart_operator'
        || primaryIntent === 'CART_OPERATION'
        || primaryIntent === 'ORDER_TRACKING'
    ) {
        return {
            label: 'Paso accionable',
            tone: 'action',
        };
    }

    return {
        label: 'Guia directa',
        tone: 'direct',
    };
}

type CartAssemblyFeedback = {
    tone: 'success' | 'warning' | 'error';
    text: string;
};

const TypewriterBubble: React.FC<{ text: string; isLatest: boolean; onTick?: () => void }> = ({ text, isLatest, onTick }) => {
    const { displayedText, isTyping } = useTypewriter(text, isLatest, 3, 12);

    useEffect(() => {
        if (isTyping && onTick) {
            onTick();
        }
    }, [displayedText, isTyping, onTick]);

    return (
        <>
            {displayedText}
            {isTyping && (
                <span className="inline-block w-[3px] h-[1em] ml-0.5 bg-vape-400/70 animate-pulse align-text-bottom" />
            )}
        </>
    );
};

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
                            ? product.variantToken.name
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

    const getProductPriceLabel = (product: { price?: unknown; display_price?: unknown }) => {
        if (typeof product.price === 'number' && Number.isFinite(product.price)) {
            return formatPrice(product.price);
        }

        if (typeof product.display_price === 'string' && product.display_price.trim().length > 0) {
            return product.display_price;
        }

        return 'Ver ficha';
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
                                {(() => {
                                    const lastAssistantId = [...messages].reverse().find(m => m.role === 'assistant')?.id ?? null;
                                    return messages.map((message) => {
                                    const turnAnalysis = (message as ConciergeMessage).turn_analysis ?? message.capsule_contract?.turn_analysis ?? null;
                                    const catalogGate = latestCatalogGate ?? (message as ConciergeMessage).catalog_gate ?? buildConciergeCatalogGate({
                                        query: message.content,
                                        turnAnalysis,
                                        intent: message.intent,
                                        assistantMessage: message.content,
                                        capsuleContract: message.capsule_contract,
                                        has_catalog_content: Boolean(message.suggestedProducts?.length || message.capsule_contract?.next_step_view),
                                    });
                                    const showProductSurfaces = shouldShowCatalogSurfacesNow && catalogGate.is_open;
                                    const nextStepView = message.capsule_contract?.next_step_view ?? null;
                                    const recoveryHint = isCesarinApproximateMatchStrategy(message.capsule_contract?.match_strategy)
                                        ? getCesarinApproximateRecoveryHint(message.capsule_contract?.match_strategy)
                                        : null;
                                    const hasSuggestedProducts = (message.suggestedProducts?.length ?? 0) > 0;
                                    const showRecoveryHint = Boolean(
                                        recoveryHint
                                        && showProductSurfaces
                                        && isMeaningfullyDistinct(message.content, recoveryHint),
                                    );
                                    const showNextStepGuidance = Boolean(
                                        nextStepView?.guidance
                                        && showProductSurfaces
                                        && (
                                            isMeaningfullyDistinct(message.content, nextStepView.guidance)
                                            || shouldShowSelectorNeededGuidance(message.content, nextStepView)
                                        ),
                                    );
                                    const nextStepActions = getNextStepActions(nextStepView);
                                    const hasEligibleCartAssemblyAction = nextStepActions.some((action) => {
                                        if (action?.kind !== 'ADD_TO_CART') return false;
                                        const product = getCartAssemblyProduct(action.product?.id, message.suggestedProducts, cartAssemblyProducts);
                                        return resolveCesarinCartAssemblyEligibility({
                                            product,
                                            variantToken: action.variantToken ?? null,
                                            quantityIntent: action.quantity ?? 1,
                                        }).canAdd;
                                    });
                                    const showNextStepAssistAction = Boolean(nextStepView?.assistAction);
                                    const nextStepFamilyLabel = getNextStepFamilyLabel(nextStepView?.family);
                                    const nextStepTrustNote = getNextStepTrustNote(nextStepView);
                                    const showNextStepTrustNote = Boolean(
                                        nextStepTrustNote
                                        && nextStepView?.family === 'KEEP_EXPLORING'
                                        && (!nextStepView?.guidance || isMeaningfullyDistinct(nextStepTrustNote, nextStepView.guidance))
                                        && isMeaningfullyDistinct(nextStepTrustNote, message.content)
                                    );
                                    const hasRenderableNextStep = Boolean(
                                        showProductSurfaces
                                        && nextStepView
                                        && (showNextStepGuidance || showNextStepTrustNote || nextStepActions.length > 0 || showNextStepAssistAction),
                                    );
                                    const helpSurface = getVisibleHelpSurface({
                                        message,
                                        showProductSurfaces,
                                        nextStepView: hasRenderableNextStep ? nextStepView : null,
                                        turnAnalysis,
                                        hasEligibleCartAssemblyAction,
                                    });
                                    const cartFeedback = cartAssemblyFeedback[message.id];
                                    const noWriteSmokeAudit = (message as ConciergeMessage & {
                                        capsule_contract?: { no_write_smoke_audit?: Record<string, unknown> };
                                    }).capsule_contract?.[CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.auditField] ?? null;

                                    return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={cn(
                                            'flex flex-col gap-2 max-w-[85%]',
                                            message.role === 'user' ? 'ml-auto items-end' : 'items-start',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'relative rounded-2xl px-4 py-3 text-sm shadow-xl',
                                                message.role === 'user'
                                                    ? 'bg-vape-500 text-white font-medium rounded-tr-none'
                                                    : 'bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none',
                                            )}
                                        >
                                            {message.role === 'assistant' ? (
                                                <TypewriterBubble
                                                    text={message.content}
                                                    isLatest={message.id === lastAssistantId}
                                                    onTick={() => {
                                                        if (scrollRef.current) {
                                                            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                message.content
                                            )}
                                        </div>

                                        {message.role === 'assistant' && noWriteSmokeAudit && (
                                            <div
                                                data-testid="ci-no-write-smoke-audit"
                                                className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] text-emerald-100/85"
                                            >
                                                <div className="font-black uppercase tracking-[0.16em] text-emerald-300">
                                                    No-write smoke audit
                                                </div>
                                                <div className="mt-1 grid grid-cols-1 gap-1">
                                                    <span>prompt: {String(noWriteSmokeAudit.prompt_category ?? 'none')}</span>
                                                    <span>status: {String(noWriteSmokeAudit.status ?? 'none')}</span>
                                                    <span>metadata: {noWriteSmokeAudit.metadata_present ? 'present' : 'missing'}</span>
                                                    <span>contract: {String(noWriteSmokeAudit.contract ?? 'none')}</span>
                                                    <span>writes: {formatSmokeAuditList(noWriteSmokeAudit.suppressed_writes)}</span>
                                                    <span>calls: {formatSmokeAuditList(noWriteSmokeAudit.suppressed_calls)}</span>
                                                    <span>capsule: {String(noWriteSmokeAudit.capsule_name ?? 'none')}</span>
                                                    <span>answer: {noWriteSmokeAudit.knowledge_answer_present ? 'present' : 'missing'}</span>
                                                    <span>main message: {noWriteSmokeAudit.main_message_present ? 'present' : 'missing'}</span>
                                                    <span>match: {String(noWriteSmokeAudit.match_strategy ?? 'none')}</span>
                                                    <span>chunks: {Number(noWriteSmokeAudit.resolved_chunk_count ?? 0)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {message.role === 'assistant' && helpSurface && (
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em]',
                                                        getVisibleHelpToneClasses(helpSurface.tone),
                                                    )}
                                                >
                                                    {helpSurface.label}
                                                </span>
                                                {helpSurface.note ? (
                                                    <span className="text-[10px] font-medium text-white/45">
                                                        {helpSurface.note}
                                                    </span>
                                                ) : null}
                                                {message.source_context?.sources.length ? (
                                                    message.source_context.sources.slice(0, 2).map((source) => (
                                                        <a
                                                            key={source.url}
                                                            href={source.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] font-medium text-white/50 underline decoration-white/20 underline-offset-2 hover:text-white/75"
                                                        >
                                                            {source.title}
                                                        </a>
                                                    ))
                                                ) : message.source_context?.brief && !helpSurface.note ? (
                                                    <span className="text-[10px] font-medium text-white/45">
                                                        {message.source_context.brief}
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}

                                        {message.action && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    if (message.action) {
                                                        emitCtaMeasurement({
                                                            sessionId: cesarinSessionId,
                                                            eventType: 'ai_cta_clicked',
                                                            messageId: message.id,
                                                            ctaKind: 'LINK',
                                                            label: message.action.label,
                                                            orderId: getOrderIdFromUrl(message.action.url),
                                                            source: 'cesarin',
                                                        });
                                                    }
                                                    window.open(message.action?.url, '_blank');
                                                }}
                                                className={cn(
                                                    'mt-1 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg',
                                                    message.action.type === 'whatsapp'
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                                        : 'bg-vape-500 text-white hover:bg-vape-600 shadow-vape-500/20',
                                                )}
                                            >
                                                {message.action.type === 'whatsapp' && <Send className="h-3.5 w-3.5" />}
                                                {message.action.label}
                                            </motion.button>
                                        )}

                                        {message.capsule_contract?.capsule_name === 'knowledge_rag_foundation' &&
                                            message.capsule_contract?.resolved_chunks?.length > 0 && (
                                            <div className="mt-2 w-full space-y-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400/60 mb-1">
                                                    {message.capsule_contract?.match_strategy === 'HIGH_CONFIDENCE_POLICY_MATCH'
                                                        ? 'Politica Oficial'
                                                        : message.capsule_contract?.match_strategy === 'MODERATE_CONFIDENCE_MULTI_SOURCE'
                                                            ? 'Manual y Guias'
                                                            : message.capsule_contract?.match_strategy === 'LOW_CONFIDENCE_FALLBACK'
                                                                ? 'Info Relacionada'
                                                                : 'Base de Conocimiento'}
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    {message.capsule_contract.resolved_chunks.map((chunk: { id: string; title: string; category: string; content: string }, index: number) => (
                                                        <div
                                                            key={`${chunk.id}-${index}`}
                                                            className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-left relative overflow-hidden"
                                                        >
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-vape-500/50 to-vape-600/10" />
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <h4 className="text-[11px] font-bold text-white tracking-wide">{chunk.title}</h4>
                                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 uppercase tracking-[0.1em]">
                                                                    {chunk.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11.5px] text-white/80 leading-relaxed font-medium">
                                                                {chunk.content}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {showProductSurfaces && (hasSuggestedProducts || hasRenderableNextStep || cartFeedback) && (
                                            <div className="mt-2 w-full space-y-3">
                                                {hasSuggestedProducts && (
                                                    <>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400/60 mb-1">
                                                            {getSuggestionGroupLabel(message.capsule_contract?.match_strategy)}
                                                        </p>
                                                        {showRecoveryHint && recoveryHint && (
                                                            <p className="text-[10px] text-white/45 leading-relaxed font-medium">
                                                                {recoveryHint}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-col gap-2">
                                                            {message.suggestedProducts?.map((p) => {
                                                                const product = p as Product & { status_signal?: string; badge_text?: string };
                                                                return (
                                                                <motion.div
                                                                    key={product.id}
                                                                    whileHover={{ x: 5 }}
                                                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group cursor-pointer"
                                                                    onClick={() => navigate(`/${product.section ?? 'vape'}/${product.slug}`)}
                                                                >
                                                                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                                                                        <OptimizedImage
                                                                            src={product.cover_image || product.images?.[0] || ''}
                                                                            alt={product.name}
                                                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold text-white truncate group-hover:text-vape-400 transition-colors">
                                                                            {product.name}
                                                                        </p>
                                                                        <div className="mt-0.5 flex items-center gap-2">
                                                                            <p className="text-[10px] font-black text-vape-400">
                                                                                {getProductPriceLabel(product)}
                                                                            </p>
                                                                            {product.status_signal === 'LOW_STOCK' && (
                                                                                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-amber-300">
                                                                                    Pocas piezas
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {product.ai_sales_note && (
                                                                            <p className="text-[9px] text-white/40 truncate mt-0.5 font-medium italic leading-tight">
                                                                                {product.ai_sales_note}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={async (event) => {
                                                                            event.stopPropagation();
                                                                            await handleAddProductToCart({ id: product.id, name: product.name, messageId: message.id });
                                                                        }}
                                                                        className="h-8 w-8 rounded-lg bg-vape-500/10 text-vape-400 flex items-center justify-center hover:bg-vape-500 hover:text-white transition-all shadow-lg"
                                                                    >
                                                                        <ShoppingBag className="h-4 w-4" />
                                                                    </button>
                                                                </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                                {hasSuggestedProducts && showProductSurfaces && activeRecovery?.messageId === message.id && (
                                                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 space-y-2">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                                                            Afinemos esto
                                                        </p>
                                                        <div className="flex flex-col gap-2">
                                                            {message.suggestedProducts?.slice(0, 3).map((p) => {
                                                                const product = p as Product & { status_signal?: string; badge_text?: string };
                                                                return (
                                                                <button
                                                                    key={`recovery-${product.id}`}
                                                                    type="button"
                                                                    disabled={isLoading}
                                                                    onClick={() => handleRecoverySelection('closest', product.id)}
                                                                    className="w-full rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-left text-[11px] font-semibold text-white/80 hover:border-vape-400/40 hover:text-white transition-all disabled:opacity-60"
                                                                >
                                                                    Esta se parece mas: {product.name}
                                                                </button>
                                                                );
                                                            })}
                                                            <button
                                                                type="button"
                                                                disabled={isLoading}
                                                                onClick={() => handleRecoverySelection('none')}
                                                                className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/65 hover:border-white/20 hover:text-white transition-all disabled:opacity-60"
                                                            >
                                                                Ninguna
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {hasRenderableNextStep && (
                                                    <div className="rounded-2xl border border-vape-400/20 bg-vape-500/[0.06] p-3 space-y-3">
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-vape-300/70">
                                                                    Siguiente paso
                                                                </p>
                                                                {nextStepFamilyLabel && (
                                                                    <span className="rounded-full border border-vape-400/20 bg-vape-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-vape-200/80">
                                                                        {nextStepFamilyLabel}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {showNextStepTrustNote && (
                                                                <p className="text-[10px] font-semibold text-vape-100/55 leading-relaxed">
                                                                    {nextStepTrustNote}
                                                                </p>
                                                            )}
                                                            {showNextStepGuidance && (
                                                                <p className="text-[11px] font-medium text-white/80 leading-relaxed">
                                                                    {nextStepView.guidance}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {(() => {
                                                                const actions = nextStepActions;

                                                                return actions.map((action, index: number) => {
                                                                    const productId = action?.product?.id;
                                                                    const actionProduct = getCartAssemblyProduct(
                                                                        productId,
                                                                        message.suggestedProducts,
                                                                        cartAssemblyProducts,
                                                                    );
                                                                    const eligibility = action.kind === 'ADD_TO_CART'
                                                                        ? resolveCesarinCartAssemblyEligibility({
                                                                            product: actionProduct,
                                                                            variantToken: action.variantToken ?? null,
                                                                            quantityIntent: action.quantity ?? 1,
                                                                        })
                                                                        : null;
                                                                    const shouldRenderAddToCart = action.kind === 'ADD_TO_CART' && eligibility?.canAdd === true;
                                                                    const renderedKind = shouldRenderAddToCart ? 'ADD_TO_CART' : action.kind === 'OPEN_CART' ? 'OPEN_CART' : 'OPEN_PDP';
                                                                    const label = shouldRenderAddToCart
                                                                        ? getAddActionLabel(action, eligibility!)
                                                                        : renderedKind === 'OPEN_CART'
                                                                            ? action.label ?? 'Abrir carrito'
                                                                            : action.kind === 'ADD_TO_CART'
                                                                                ? getAdvisoryActionLabel(action, eligibility)
                                                                                : action.label;

                                                                    return (
                                                                        <button
                                                                            key={getNextStepActionKey(action, index)}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (renderedKind === 'ADD_TO_CART') {
                                                                                    emitCtaMeasurement({
                                                                                        sessionId: cesarinSessionId,
                                                                                        eventType: 'ai_cta_clicked',
                                                                                        messageId: message.id,
                                                                                        ctaKind: 'ADD_TO_CART',
                                                                                        label,
                                                                                        productId: action.product?.id ?? null,
                                                                                        source: 'cesarin',
                                                                                    });
                                                                                    void handleAddProductToCart({
                                                                                        ...action.product,
                                                                                        quantity: eligibility?.safeQuantity ?? action.quantity,
                                                                                        variantToken: action.variantToken ?? null,
                                                                                        messageId: message.id,
                                                                                    });
                                                                                    return;
                                                                                }

                                                                                if (renderedKind === 'OPEN_CART') {
                                                                                    emitCtaMeasurement({
                                                                                        sessionId: cesarinSessionId,
                                                                                        eventType: 'ai_cta_clicked',
                                                                                        messageId: message.id,
                                                                                        ctaKind: 'OPEN_CART',
                                                                                        label,
                                                                                        source: 'cesarin',
                                                                                    });
                                                                                    openCart({
                                                                                        source: 'cesarin',
                                                                                        sessionId: cesarinSessionId,
                                                                                    });
                                                                                    return;
                                                                                }

                                                                                handleOpenProduct(action.product);
                                                                            }}
                                                                            className={cn(
                                                                                'w-full rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition-all',
                                                                                index === 0
                                                                                    ? renderedKind === 'ADD_TO_CART'
                                                                                        ? 'border-vape-400/25 bg-vape-500/15 text-white hover:border-vape-300/50 hover:bg-vape-500/22'
                                                                                        : 'border-vape-400/20 bg-vape-500/[0.08] text-white/90 hover:border-vape-300/40 hover:text-white'
                                                                                    : 'border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:text-white',
                                                                            )}
                                                                        >
                                                                            {label}
                                                                        </button>
                                                                    );
                                                                });
                                                            })()}
                                                            {showNextStepAssistAction && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isLoading}
                                                                    onClick={() => void sendMessage(nextStepView.assistAction.message)}
                                                                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-[11px] font-semibold text-white/75 transition-all hover:border-white/20 hover:text-white disabled:opacity-60"
                                                                >
                                                                    {nextStepView.assistAction.label}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {cartFeedback && (
                                                    <div
                                                        className={cn(
                                                            'rounded-2xl border px-3 py-2 text-[11px] font-semibold leading-relaxed',
                                                            cartFeedback.tone === 'success'
                                                                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100/85'
                                                                : cartFeedback.tone === 'warning'
                                                                    ? 'border-amber-400/25 bg-amber-500/10 text-amber-100/85'
                                                                    : 'border-red-400/25 bg-red-500/10 text-red-100/85',
                                                        )}
                                                    >
                                                        {cartFeedback.text}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                    );
                                });
                                })()}

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

