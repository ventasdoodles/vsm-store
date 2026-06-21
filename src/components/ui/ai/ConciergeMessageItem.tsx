import React from 'react';
import { m } from 'framer-motion';
import { ShoppingBag, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypewriterBubble } from './TypewriterBubble';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { resolveCesarinCartAssemblyEligibility } from '@/lib/cesarin-cart-assembly';
import { buildConciergeCatalogGate, type ConciergeMessage, type ConciergeCatalogGate } from '@/services';
import { getCesarinApproximateRecoveryHint, isCesarinApproximateMatchStrategy } from '@/lib/cesarin-stage1';
import { isMeaningfullyDistinct } from '@/lib/cesarin-text-utils';
import type { Product } from '@/types/product';
import type { CartConversionContext } from '@/stores/cart.store';
import { CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS } from '@/lib/customer-intelligence-no-write-smoke';
import {
    getSuggestionGroupLabel,
    formatSmokeAuditList,
    getVisibleHelpToneClasses,
    shouldShowSelectorNeededGuidance,
    getNextStepActions,
    getCartAssemblyProduct,
    getNextStepFamilyLabel,
    getNextStepTrustNote,
    getVisibleHelpSurface,
    getNextStepActionKey,
    getAddActionLabel,
    getAdvisoryActionLabel,
    emitCtaMeasurement,
    getOrderIdFromUrl,
    type CartAssemblyFeedback,
    getProductPriceLabel
} from './helpers';

export interface ConciergeMessageItemProps {
    message: ConciergeMessage;
    latestCatalogGate: ConciergeCatalogGate | null;
    shouldShowCatalogSurfacesNow: boolean;
    cartAssemblyProducts: Record<string, Product>;
    cartAssemblyFeedback: Record<string, CartAssemblyFeedback>;
    cesarinSessionId: string;
    isLoading: boolean;
    activeRecovery: { messageId?: string } | null;
    lastAssistantId: string | null;
    scrollRef: React.RefObject<HTMLDivElement>;
    handleRecoverySelection?: (kind: 'closest' | 'none', productId?: string) => Promise<void> | void;
    handleAddProductToCart?: (product: { id: string; name: string; quantity?: number; variantToken?: { id: string; name: string } | null; messageId?: string }) => Promise<void> | void;
    handleOpenProduct?: (product: { slug: string; section?: string }) => void;
    sendMessage: (msg: string) => Promise<void>;
    openCart: (opts?: CartConversionContext) => void;
    navigate: (path: string) => void;
}

/** Product with optional AI-enriched display fields from the suggestion pipeline. */
type SuggestedProduct = Product & { status_signal?: string; badge_text?: string };

export const ConciergeMessageItem: React.FC<ConciergeMessageItemProps> = ({
    message,
    latestCatalogGate,
    shouldShowCatalogSurfacesNow,
    cartAssemblyProducts,
    cartAssemblyFeedback,
    cesarinSessionId,
    isLoading,
    activeRecovery,
    lastAssistantId,
    scrollRef,
    handleRecoverySelection,
    handleAddProductToCart,
    handleOpenProduct,
    sendMessage,
    openCart,
    navigate,
}) => {

    const turnAnalysis = message.turn_analysis ?? message.capsule_contract?.turn_analysis ?? null;
    const catalogGate = latestCatalogGate ?? message.catalog_gate ?? buildConciergeCatalogGate({
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
    <m.div
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
                'relative rounded-2xl px-4 py-3 text-sm shadow-2xl backdrop-blur-md',
                message.role === 'user'
                    ? 'bg-gradient-to-br from-vape-500 to-vape-600 text-white font-medium rounded-tr-sm border border-vape-400/20'
                    : 'bg-[#1a1b26]/80 text-white/90 border border-white/10 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
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
            <m.button
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
            </m.button>
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
                                const product = p as SuggestedProduct;
                                return (
                                <m.div
                                    key={product.id}
                                    layoutId={`suggested-product-${product.id}`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-vape-500/30 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] relative overflow-hidden"
                                    onClick={() => navigate(`/${product.section ?? 'vape'}/${product.slug}`)}
                                >
                                    {/* Subtly animated glow behind the card on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-vape-500/0 via-vape-500/5 to-vape-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5 relative z-10">
                                        <OptimizedImage
                                            src={product.cover_image || product.images?.[0] || ''}
                                            alt={product.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                                            if (handleAddProductToCart) {
                                                await handleAddProductToCart({ id: product.id, name: product.name, messageId: message.id });
                                            }
                                        }}
                                        className="h-9 w-9 rounded-xl bg-vape-500/10 text-vape-400 flex items-center justify-center hover:bg-vape-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] relative z-10 hover:-translate-y-0.5 active:scale-95 group/btn"
                                    >
                                        <ShoppingBag className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </m.div>
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
                                const product = p as SuggestedProduct;
                                return (
                                <button
                                    key={`recovery-${product.id}`}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleRecoverySelection?.('closest', product.id)}
                                    className="w-full rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-left text-[11px] font-semibold text-white/80 hover:border-vape-400/40 hover:text-white transition-all disabled:opacity-60"
                                >
                                    Esta se parece mas: {product.name}
                                </button>
                                );
                            })}
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleRecoverySelection?.('none')}
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
                                                    if (handleAddProductToCart) {
                                                        void handleAddProductToCart({
                                                            ...action.product,
                                                            quantity: eligibility?.safeQuantity ?? action.quantity,
                                                            variantToken: action.variantToken ?? null,
                                                            messageId: message.id,
                                                        });
                                                    }
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

                                                if (handleOpenProduct) handleOpenProduct(action.product);
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
    </m.div>
    );
};