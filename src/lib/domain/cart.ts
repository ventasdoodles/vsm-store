import { getStorefrontProductPurchaseability } from '@/lib/domain/products';
import type { CartValidationIssue, CartValidationResult } from '@/stores/cart.store';
import type { CartItem } from '@/types/cart';

export type StorefrontCheckoutTransitionStatus = 'ready' | 'review' | 'blocked';

export interface StorefrontCheckoutTransitionView {
    status: StorefrontCheckoutTransitionStatus;
    headline: string;
    detail: string;
    actionLabel: string;
    canProceedToCheckout: boolean;
    canSubmitCheckout: boolean;
    purchasableItemsCount: number;
    totalItemsCount: number;
    blockingIssueCount: number;
    warningIssueCount: number;
    hasAutomaticCorrections: boolean;
}

const BLOCKING_ISSUE_TYPES: CartValidationIssue['type'][] = [
    'removed',
    'out_of_stock',
    'variant_removed',
];

export function isBlockingCartValidationIssue(issue: CartValidationIssue): boolean {
    return BLOCKING_ISSUE_TYPES.includes(issue.type);
}

export function getStorefrontCheckoutTransitionView(
    items: CartItem[],
    validationResult: CartValidationResult | null,
): StorefrontCheckoutTransitionView {
    const issues = validationResult?.issues ?? [];
    const purchasableItemsCount = items.filter((item) =>
        item.quantity > 0 && getStorefrontProductPurchaseability(item.product, {
            selectedVariantId: item.variant_id ?? null,
        }).canAddToCart,
    ).length;

    const blockingIssueCount = issues.filter(isBlockingCartValidationIssue).length;
    const warningIssueCount = issues.length - blockingIssueCount;
    const hasAutomaticCorrections = issues.length > 0;

    if (purchasableItemsCount === 0) {
        return {
            status: 'blocked',
            headline: 'Tu carrito no esta listo para checkout',
            detail: 'Ya no quedan articulos comprables vigentes. Vuelve al catalogo y confirma tu seleccion actual antes de continuar.',
            actionLabel: 'Volver al catalogo',
            canProceedToCheckout: false,
            canSubmitCheckout: false,
            purchasableItemsCount,
            totalItemsCount: items.length,
            blockingIssueCount,
            warningIssueCount,
            hasAutomaticCorrections,
        };
    }

    if (hasAutomaticCorrections) {
        const correctionSummary = [
            blockingIssueCount > 0 ? `${blockingIssueCount} cambio${blockingIssueCount === 1 ? '' : 's'} critico${blockingIssueCount === 1 ? '' : 's'}` : null,
            warningIssueCount > 0 ? `${warningIssueCount} ajuste${warningIssueCount === 1 ? '' : 's'} automatico${warningIssueCount === 1 ? '' : 's'}` : null,
        ].filter(Boolean).join(' y ');

        return {
            status: 'review',
            headline: 'Revisa tu carrito actualizado',
            detail: correctionSummary
                ? `Aplicamos ${correctionSummary} segun el catalogo vigente. Revisa el resumen antes de confirmar tu pedido.`
                : 'Aplicamos correcciones automaticas segun el catalogo vigente. Revisa el resumen antes de confirmar tu pedido.',
            actionLabel: 'Revisar cambios',
            canProceedToCheckout: true,
            canSubmitCheckout: true,
            purchasableItemsCount,
            totalItemsCount: items.length,
            blockingIssueCount,
            warningIssueCount,
            hasAutomaticCorrections,
        };
    }

    return {
        status: 'ready',
        headline: 'Listo para continuar',
        detail: 'Tu carrito actual coincide con la compra vigente y puede pasar a checkout sin cambios pendientes.',
        actionLabel: 'Continuar al checkout',
        canProceedToCheckout: true,
        canSubmitCheckout: true,
        purchasableItemsCount,
        totalItemsCount: items.length,
        blockingIssueCount: 0,
        warningIssueCount: 0,
        hasAutomaticCorrections: false,
    };
}
