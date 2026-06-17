import { formatPrice } from '@/lib/utils';
import { type ConciergeCatalogGate, type ConciergeMessage } from '@/services';
import { isMeaningfullyDistinct, normalizeCompactText } from '@/lib/cesarin-text-utils';
import type { Product } from '@/types/product';
import type { CesarinCartAssemblyEligibility } from '@/lib/cesarin-cart-assembly';
import { emitConversationConversionEvent } from '@/lib/conversion-measurement';
import type { CesarinStorefrontNextStepView, CesarinStorefrontActionButtonView } from '@/lib/cesarin-stage5';

export function getLatestCatalogGate(messages: ConciergeMessage[]): ConciergeCatalogGate | null {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const candidate = messages[index] as ConciergeMessage & { catalog_gate?: ConciergeCatalogGate };
        if (candidate.catalog_gate) {
            return candidate.catalog_gate;
        }
    }
    return null;
}

export function getSuggestionGroupLabel(matchStrategy: string | undefined) {
    switch (matchStrategy) {
        case 'OUT_OF_STOCK_ALTERNATIVE': return 'Alternativas Disponibles';
        case 'FEATURED_FALLBACK': return 'Recomendaciones Destacadas';
        case 'TOKEN_RECOVERY': return 'Coincidencias por Nombre';
        case 'SEMANTIC': return 'Sugerencias Cercanas';
        case 'EXACT': return 'Coincidencias Encontradas';
        default: return 'Coincidencias Encontradas';
    }
}

export type CesarinVisibleHelpTone = 'direct' | 'public' | 'catalog' | 'action';

export function getVisibleHelpToneClasses(tone: CesarinVisibleHelpTone): string {
    switch (tone) {
        case 'public': return 'border-sky-400/20 bg-sky-400/10 text-sky-200/80';
        case 'catalog': return 'border-vape-400/20 bg-vape-400/10 text-vape-200/85';
        case 'action': return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200/85';
        default: return 'border-white/10 bg-white/[0.04] text-white/65';
    }
}

export function getNextStepFamilyLabel(family: unknown): string | null {
    switch (family) {
        case 'REVIEW_ONE': return 'Revisa primero';
        case 'COMPARE_TWO': return 'Compara estas dos';
        case 'ADD_READY': return 'Listo para avanzar';
        case 'KEEP_EXPLORING': return 'Sigue explorando';
        default: return null;
    }
}

export function formatSmokeAuditList(value: unknown): string {
    return Array.isArray(value) && value.length > 0
        ? value.filter((item): item is string => typeof item === 'string').join(', ')
        : 'none';
}

export function getNextStepTrustNote(nextStepView: CesarinStorefrontNextStepView | null): string | null {
    switch (nextStepView?.family) {
        case 'KEEP_EXPLORING': return 'Todavia estamos afinando';
        case 'COMPARE_TWO': return 'Las dos traen buen caso';
        case 'ADD_READY': return 'Ya esta bastante claro';
        case 'REVIEW_ONE':
            return normalizeCompactText(nextStepView?.guidance ?? '').includes('por ahora')
                ? 'Es la mejor pista por ahora'
                : 'Es la ruta mas clara';
        default: return null;
    }
}

export function shouldShowSelectorNeededGuidance(messageContent: string, nextStepView: CesarinStorefrontNextStepView | null): boolean {
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

export function getNextStepActions(nextStepView: CesarinStorefrontNextStepView | null): CesarinStorefrontActionButtonView[] {
    return [nextStepView?.primaryAction, nextStepView?.secondaryAction].filter((a): a is CesarinStorefrontActionButtonView => Boolean(a));
}

export function isFullStorefrontProduct(value: unknown): value is Product {
    const product = value as Partial<Product> | null | undefined;
    return Boolean(
        product && typeof product.id === 'string' && typeof product.slug === 'string' && typeof product.name === 'string' && typeof product.stock === 'number' && typeof product.is_active === 'boolean' && typeof product.status === 'string' && typeof product.price === 'number',
    );
}

export function getCartAssemblyProduct(productId: string | undefined, suggestedProducts: ConciergeMessage['suggestedProducts'], fetchedProducts: Record<string, Product>): Product | null {
    if (!productId) return null;
    const suggested = suggestedProducts?.find((product) => product.id === productId);
    if (isFullStorefrontProduct(suggested)) return suggested;
    return fetchedProducts[productId] ?? null;
}

export function collectCartAssemblyProductIds(messages: ConciergeMessage[], fetchedProducts: Record<string, Product>): string[] {
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

export function getNextStepActionKey(action: CesarinStorefrontActionButtonView | null, index: number): string {
    const productId = typeof action?.product?.id === 'string' ? action.product.id : 'cart';
    return `${action?.kind ?? 'action'}-${productId}-${index}`;
}

export function getAdvisoryActionLabel(action: CesarinStorefrontActionButtonView | null, eligibility: CesarinCartAssemblyEligibility | null): string {
    const productName = action?.product?.name ?? 'producto';
    if (eligibility?.requiresVariantSelection) return `Elegir opcion de ${productName}`;
    return `Revisar ${productName}`;
}

export function getAddActionLabel(action: CesarinStorefrontActionButtonView | null, eligibility: CesarinCartAssemblyEligibility): string {
    const productName = action?.product?.name ?? 'producto';
    if (eligibility.safeQuantity > 1 && eligibility.safeQuantity < eligibility.requestedQuantity) {
        return `Agregar ${eligibility.safeQuantity} x ${productName}`;
    }
    return action?.label ?? `Agregar ${productName}`;
}

export function getOrderIdFromUrl(url: string | undefined): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://vsm.local');
        return parsed.searchParams.get('order_id');
    } catch {
        const match = url.match(/[?&]order_id=([^&]+)/);
        return match?.[1] ? decodeURIComponent(match[1]) : null;
    }
}

export function emitCtaMeasurement(input: {
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

export function getVisibleHelpSurface(input: {
    message: ConciergeMessage;
    showProductSurfaces: boolean;
    nextStepView: CesarinStorefrontNextStepView | null;
    turnAnalysis: unknown;
    hasEligibleCartAssemblyAction?: boolean;
}): { label: string; note?: string; tone: CesarinVisibleHelpTone } | null {
    const { message, showProductSurfaces, nextStepView, turnAnalysis, hasEligibleCartAssemblyAction = false } = input;
    if (message.role !== 'assistant') return null;

    const capsuleName = message.capsule_contract?.capsule_name ?? null;
    const primaryIntent = (turnAnalysis as { primary_intent?: string })?.primary_intent ?? message.catalog_gate?.primary_intent ?? null;

    if (message.source_context) {
        const brief = message.source_context.brief;
        return {
            label: message.source_context.label,
            note: brief && isMeaningfullyDistinct(message.content, brief) ? brief : undefined,
            tone: 'public',
        };
    }

    if (showProductSurfaces && ((nextStepView?.surfaceKind === 'ACTIONABLE' && hasEligibleCartAssemblyAction) || (!nextStepView?.surfaceKind && nextStepView?.family === 'ADD_READY' && nextStepView?.primaryAction?.kind === 'ADD_TO_CART' && hasEligibleCartAssemblyAction) || nextStepView?.primaryAction?.kind === 'OPEN_CART')) {
        return { label: 'Paso accionable', tone: 'action' };
    }

    if (showProductSurfaces && (nextStepView?.surfaceKind === 'CATALOG_HELP' || (!nextStepView?.surfaceKind && nextStepView))) {
        return { label: 'Ayuda de producto', tone: 'catalog' };
    }

    if (showProductSurfaces && message.suggestedProducts?.length) {
        return { label: 'Ayuda de producto', note: getSuggestionGroupLabel(message.capsule_contract?.match_strategy), tone: 'catalog' };
    }

    if (!showProductSurfaces && ((message.suggestedProducts?.length ?? 0) > 0 || nextStepView)) {
        return null;
    }

    if (message.action || capsuleName === 'cart_operator' || primaryIntent === 'CART_OPERATION' || primaryIntent === 'ORDER_TRACKING') {
        return { label: 'Paso accionable', tone: 'action' };
    }

    return { label: 'Guia directa', tone: 'direct' };
}

export type CartAssemblyFeedback = {
    tone: 'success' | 'warning' | 'error';
    text: string;
};

export function getProductPriceLabel(product: { price?: unknown; display_price?: unknown }) {
    if (typeof product.price === 'number' && Number.isFinite(product.price)) {
        return formatPrice(product.price);
    }
    if (typeof product.display_price === 'string' && product.display_price.trim().length > 0) {
        return product.display_price;
    }
    return 'Ver ficha';
}
