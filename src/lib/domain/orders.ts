import type { CartItem } from '@/types/cart';
import type { OrderItem } from '@/types/order';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

export const STOREFRONT_ORDER_STATUS = {
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    processing: { label: 'Procesando', color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-theme/30' },
    shipped: { label: 'Enviado', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    delivered: { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
} as const;

export type StorefrontOrderStatus = keyof typeof STOREFRONT_ORDER_STATUS;

export const ADMIN_ORDER_STATUS = {
    pending: { label: 'Pendiente', color: '#f59e0b' },
    confirmed: { label: 'Confirmado', color: '#3b82f6' },
    processing: { label: 'Preparando', color: '#8b5cf6' },
    shipped: { label: 'Enviado', color: '#06b6d4' },
    delivered: { label: 'Entregado', color: '#10b981' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
} as const;

export type AdminOrderStatus = keyof typeof ADMIN_ORDER_STATUS;

export const ADMIN_ORDER_STATUSES_LIST: { value: AdminOrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
    { value: 'confirmed', label: 'Confirmado', color: '#3b82f6' },
    { value: 'processing', label: 'Preparando', color: '#8b5cf6' },
    { value: 'shipped', label: 'Enviado', color: '#06b6d4' },
    { value: 'delivered', label: 'Entregado', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelado', color: '#ef4444' },
];

export const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

export function canTransitionTo(
    currentStatus: AdminOrderStatus,
    targetStatus: AdminOrderStatus,
): boolean {
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions?.includes(targetStatus) ?? false;
}

export function isTerminalStatus(status: AdminOrderStatus): boolean {
    const transitions = ORDER_STATUS_TRANSITIONS[status];
    return !transitions || transitions.length === 0;
}

export type StorefrontPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type StorefrontPaymentTone = 'warning' | 'success' | 'danger' | 'neutral';

export interface StorefrontOrderPaymentInput {
    status?: string | null;
    payment_status?: string | null;
    payment_method?: string | null;
}

export interface StorefrontOrderPaymentView {
    paymentStatus: StorefrontPaymentStatus;
    paymentLabel: string;
    paymentTone: StorefrontPaymentTone;
    headline: string;
    detail: string;
}

export interface StorefrontPaymentContinuationView {
    canContinue: boolean;
    detail: string;
}

export interface StorefrontOrderVisibilityView {
    headline: string;
    detail: string;
}

export interface StorefrontOrderLifecycleView {
    paymentView: StorefrontOrderPaymentView;
    continuationView: StorefrontPaymentContinuationView;
    visibilityView: StorefrontOrderVisibilityView;
    statusEyebrow: string;
    continuityNote: string;
    orderCtaLabel: string;
    refreshLabel: string;
    canRefresh: boolean;
    shouldAutoRefresh: boolean;
}

export interface StorefrontOrdersIndexActionView {
    actionHeadline: string;
    actionDetail: string;
    detailLabel: string;
    showContinuePayment: boolean;
    showReorder: boolean;
}

export type StorefrontReorderBlockedReason =
    | 'missing_product'
    | 'inactive_product'
    | 'out_of_stock'
    | 'variant_mapping_changed'
    | 'variant_inactive'
    | 'variant_out_of_stock'
    | 'already_in_cart';

export interface StorefrontReorderReadyItem {
    orderItem: OrderItem;
    product: Product;
    variantToken: { id: string; name: string } | null;
    requestedQuantity: number;
    quantityToAdd: number;
    skippedQuantity: number;
}

export interface StorefrontReorderBlockedItem {
    orderItem: OrderItem;
    reason: StorefrontReorderBlockedReason;
    detail: string;
}

export interface StorefrontOrderReorderPlan {
    addableItems: StorefrontReorderReadyItem[];
    blockedItems: StorefrontReorderBlockedItem[];
    requestedQuantity: number;
    addableQuantity: number;
    addedLineCount: number;
    blockedLineCount: number;
    partialLineCount: number;
}

export interface StorefrontOrderReorderFeedback {
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
}

export function normalizePaymentStatus(status: string | null | undefined): StorefrontPaymentStatus {
    switch (status) {
        case 'paid':
        case 'failed':
        case 'refunded':
            return status;
        default:
            return 'pending';
    }
}

export function getStorefrontOrderPaymentView(
    input: StorefrontOrderPaymentInput,
): StorefrontOrderPaymentView {
    const paymentStatus = normalizePaymentStatus(input.payment_status);
    const paymentMethod = input.payment_method ?? '';
    const orderStatus = input.status ?? '';

    if (paymentStatus === 'paid') {
        return {
            paymentStatus,
            paymentLabel: 'Liquidado',
            paymentTone: 'success',
            headline: 'Pago confirmado',
            detail: 'El pago ya quedo confirmado en tu pedido. Desde aqui veras el avance real de preparacion y entrega.',
        };
    }

    if (paymentStatus === 'refunded') {
        return {
            paymentStatus,
            paymentLabel: 'Reembolsado',
            paymentTone: 'neutral',
            headline: 'Pago reembolsado',
            detail: 'Este pedido ya figura con reembolso en el sistema. Si necesitas mas detalle, revisa el pedido o contacta soporte.',
        };
    }

    if (paymentStatus === 'failed' || orderStatus === 'cancelled') {
        return {
            paymentStatus: paymentStatus === 'failed' ? 'failed' : 'pending',
            paymentLabel: paymentStatus === 'failed' ? 'No aprobado' : 'Cancelado',
            paymentTone: 'danger',
            headline: 'Pago no confirmado',
            detail: paymentMethod === 'mercadopago'
                ? 'La orden sigue registrada, pero el pago no aparece como aprobado. Revisa el detalle antes de intentar pagar de nuevo.'
                : 'La orden no tiene un pago confirmado. Revisa el detalle antes de continuar.',
        };
    }

    if (paymentMethod === 'mercadopago') {
        return {
            paymentStatus,
            paymentLabel: 'En revision',
            paymentTone: 'warning',
            headline: 'Pago iniciado, pendiente de confirmacion',
            detail: 'Tu pedido ya fue creado, pero Mercado Pago todavia no confirma el cobro. No lo tomes como liquidado hasta que este estado cambie.',
        };
    }

    if (paymentMethod === 'transfer') {
        return {
            paymentStatus,
            paymentLabel: 'Pendiente por validar',
            paymentTone: 'warning',
            headline: 'Pedido recibido, pago pendiente de validacion',
            detail: 'Tu pedido ya fue registrado. El pago seguira pendiente hasta que la validacion correspondiente se refleje en el sistema.',
        };
    }

    if (paymentMethod === 'cash') {
        return {
            paymentStatus,
            paymentLabel: 'Pendiente al entregar',
            paymentTone: 'warning',
            headline: 'Pedido recibido',
            detail: 'Tu pedido ya fue registrado. El pago sigue pendiente porque se liquida al momento de la entrega.',
        };
    }

    return {
        paymentStatus,
        paymentLabel: 'En espera',
        paymentTone: 'warning',
        headline: 'Pedido recibido',
        detail: 'Tu pedido ya fue registrado, pero el estado de pago sigue pendiente.',
    };
}

export function getStorefrontPaymentContinuationView(
    input: StorefrontOrderPaymentInput,
): StorefrontPaymentContinuationView {
    const paymentStatus = normalizePaymentStatus(input.payment_status);
    const paymentMethod = input.payment_method ?? '';
    const orderStatus = input.status ?? '';

    if (paymentMethod === 'mercadopago' && paymentStatus === 'pending' && orderStatus !== 'cancelled') {
        return {
            canContinue: true,
            detail: 'Tu pedido sigue pagable en Mercado Pago. Si cerraste o interrumpiste el cobro, puedes retomarlo desde esta vista y luego volver al pedido para confirmar el estado persistido.',
        };
    }

    if (paymentMethod === 'mercadopago' && (paymentStatus === 'failed' || orderStatus === 'cancelled')) {
        return {
            canContinue: false,
            detail: 'Este pedido ya no figura como pagable en Mercado Pago. Revisa el estado persistido antes de intentar otra accion.',
        };
    }

    if (paymentMethod === 'mercadopago' && paymentStatus === 'paid') {
        return {
            canContinue: false,
            detail: 'El pago ya figura confirmado en el estado persistido. No necesitas retomar Mercado Pago desde esta vista.',
        };
    }

    return {
        canContinue: false,
        detail: 'Este pedido no usa una continuidad activa en Mercado Pago. La referencia valida sigue siendo el estado persistido del pedido.',
    };
}

export function getStorefrontOrderVisibilityView(
    input: StorefrontOrderPaymentInput,
): StorefrontOrderVisibilityView {
    const paymentView = getStorefrontOrderPaymentView(input);
    const continuationView = getStorefrontPaymentContinuationView(input);
    const orderStatus = input.status ?? '';
    const paymentMethod = input.payment_method ?? '';

    if (continuationView.canContinue) {
        return {
            headline: 'Pedido registrado, pago por retomar',
            detail: continuationView.detail,
        };
    }

    if (paymentView.paymentStatus === 'paid') {
        return {
            headline: orderStatus === 'delivered'
                ? 'Pedido liquidado y cerrado'
                : 'Pedido liquidado y en curso',
            detail: 'El pago ya esta confirmado. Usa el detalle del pedido como referencia para seguir el avance persistido.',
        };
    }

    if (paymentView.paymentStatus === 'refunded') {
        return {
            headline: 'Pedido con reembolso registrado',
            detail: paymentView.detail,
        };
    }

    if (orderStatus === 'cancelled') {
        return {
            headline: 'Pedido cancelado o sin continuidad activa',
            detail: continuationView.detail,
        };
    }

    if (paymentView.paymentTone === 'danger') {
        return {
            headline: 'Pedido registrado, pago no confirmado',
            detail: continuationView.detail,
        };
    }

    if (paymentMethod === 'transfer') {
        return {
            headline: 'Pedido registrado, validacion pendiente',
            detail: paymentView.detail,
        };
    }

    if (paymentMethod === 'cash') {
        return {
            headline: 'Pedido registrado, pago al entregar',
            detail: paymentView.detail,
        };
    }

    return {
        headline: 'Pedido registrado, estado en revision',
        detail: paymentView.detail,
    };
}

export function getStorefrontOrderLifecycleView(
    input: StorefrontOrderPaymentInput,
): StorefrontOrderLifecycleView {
    const paymentView = getStorefrontOrderPaymentView(input);
    const continuationView = getStorefrontPaymentContinuationView(input);
    const visibilityView = getStorefrontOrderVisibilityView(input);
    const paymentMethod = input.payment_method ?? '';

    const statusEyebrow = paymentView.paymentStatus === 'paid'
        ? 'Pedido existente y pago confirmado'
        : continuationView.canContinue
            ? 'Pedido existente, pago por retomar'
            : paymentView.paymentTone === 'danger'
                ? 'Pedido existente, pago no confirmado'
                : paymentMethod === 'transfer'
                    ? 'Pedido existente, validacion pendiente'
                    : paymentMethod === 'cash'
                        ? 'Pedido existente, pago al entregar'
                        : 'Pedido existente, confirmacion de pago pendiente';

    const orderCtaLabel = paymentView.paymentStatus === 'paid'
        ? 'Ver pedido y seguimiento'
        : paymentView.paymentTone === 'danger'
            ? 'Ver pedido y revisar pago'
            : 'Ver pedido y estado real';

    const refreshLabel = paymentView.paymentTone === 'danger'
        ? 'Revisar si el pago cambio'
        : 'Revisar estado de pago';

    return {
        paymentView,
        continuationView,
        visibilityView,
        statusEyebrow,
        continuityNote: visibilityView.detail,
        orderCtaLabel,
        refreshLabel,
        canRefresh: paymentView.paymentStatus !== 'paid',
        shouldAutoRefresh: paymentView.paymentStatus === 'pending',
    };
}

export function getStorefrontOrdersIndexActionView(
    input: StorefrontOrderPaymentInput & { items?: OrderItem[] | null },
): StorefrontOrdersIndexActionView {
    const lifecycleView = getStorefrontOrderLifecycleView(input);
    const paymentView = lifecycleView.paymentView;
    const continuationView = lifecycleView.continuationView;
    const orderStatus = input.status ?? '';
    const hasItems = Array.isArray(input.items) && input.items.length > 0;

    if (continuationView.canContinue) {
        return {
            actionHeadline: 'Retomar pago pendiente',
            actionDetail: 'Este pedido sigue pagable en Mercado Pago. Si necesitas contexto antes de continuar, abre el detalle persistido.',
            detailLabel: 'Ver pedido y revisar pago',
            showContinuePayment: true,
            showReorder: false,
        };
    }

    if (paymentView.paymentStatus === 'paid') {
        return {
            actionHeadline: orderStatus === 'delivered'
                ? 'Pedido cerrado'
                : 'Seguir pedido liquidado',
            actionDetail: hasItems
                ? 'El pago ya esta confirmado. Revisa el detalle para seguir el pedido o vuelve a comprar usando el catalogo actual.'
                : 'El pago ya esta confirmado. Revisa el detalle para seguir el pedido persistido.',
            detailLabel: lifecycleView.orderCtaLabel,
            showContinuePayment: false,
            showReorder: hasItems,
        };
    }

    if (paymentView.paymentStatus === 'refunded') {
        return {
            actionHeadline: 'Revisar pedido reembolsado',
            actionDetail: hasItems
                ? 'El reembolso ya aparece en el estado persistido. Revisa el detalle y, si te sirve, vuelve a comprar desde el catalogo actual.'
                : 'El reembolso ya aparece en el estado persistido. Revisa el detalle antes de hacer otra accion.',
            detailLabel: 'Ver pedido y estado real',
            showContinuePayment: false,
            showReorder: hasItems,
        };
    }

    if (paymentView.paymentTone === 'danger') {
        return {
            actionHeadline: 'Revisar antes de actuar',
            actionDetail: hasItems
                ? 'Este pedido ya no figura con pago confirmado ni continuidad activa. Revisa el detalle y, si te conviene, inicia una nueva compra desde el catalogo actual.'
                : 'Este pedido ya no figura con pago confirmado ni continuidad activa. Revisa el detalle antes de hacer otra accion.',
            detailLabel: lifecycleView.orderCtaLabel,
            showContinuePayment: false,
            showReorder: hasItems,
        };
    }

    if (input.payment_method === 'transfer') {
        return {
            actionHeadline: 'Esperar validacion',
            actionDetail: 'La accion valida sigue siendo revisar el detalle persistido mientras la validacion del pago se refleja en el sistema.',
            detailLabel: lifecycleView.orderCtaLabel,
            showContinuePayment: false,
            showReorder: false,
        };
    }

    if (input.payment_method === 'cash') {
        return {
            actionHeadline: 'Esperar entrega',
            actionDetail: 'El pago sigue pendiente porque se liquida al entregar. Revisa el detalle del pedido para confirmar el avance real.',
            detailLabel: lifecycleView.orderCtaLabel,
            showContinuePayment: false,
            showReorder: false,
        };
    }

    return {
        actionHeadline: 'Revisar estado persistido',
        actionDetail: 'La accion valida es revisar el detalle del pedido antes de intentar otra cosa.',
        detailLabel: lifecycleView.orderCtaLabel,
        showContinuePayment: false,
        showReorder: false,
    };
}

function getVariantDisplayName(variant: ProductVariant): string {
    const values = variant.options
        ?.map((option) => option.attribute_value?.value)
        .filter((value): value is string => Boolean(value));

    return values && values.length > 0 ? values.join(' / ') : 'Variante';
}

function getRequestedVariant(
    product: Product,
    item: OrderItem,
): { variant: ProductVariant | null; blocked?: StorefrontReorderBlockedItem } {
    if (item.variant_id) {
        const variant = product.variants?.find((candidate) => candidate.id === item.variant_id) ?? null;

        if (!variant) {
            return {
                variant: null,
                blocked: {
                    orderItem: item,
                    reason: 'variant_mapping_changed',
                    detail: 'La version comprada ya no se puede mapear con seguridad en el catalogo actual. Revisa el producto manualmente antes de volver a comprarlo.',
                },
            };
        }

        if (!variant.is_active) {
            return {
                variant: null,
                blocked: {
                    orderItem: item,
                    reason: 'variant_inactive',
                    detail: 'La version comprada ya no esta activa en el catalogo actual. Revisa manualmente si existe una alternativa vigente.',
                },
            };
        }

        if (variant.stock <= 0) {
            return {
                variant: null,
                blocked: {
                    orderItem: item,
                    reason: 'variant_out_of_stock',
                    detail: 'La version comprada existe, pero ya no tiene disponibilidad para volver a agregarse al carrito.',
                },
            };
        }

        return { variant };
    }

    if (item.variant_name) {
        return {
            variant: null,
            blocked: {
                orderItem: item,
                reason: 'variant_mapping_changed',
                detail: 'La variante original no tiene un identificador persistido reutilizable. Revisa manualmente el producto en el catalogo actual antes de agregarlo.',
            },
        };
    }

    return { variant: null };
}

function getCartQuantityForSelection(
    items: CartItem[],
    productId: string,
    variantId: string | null,
): number {
    return items.reduce((sum, item) => {
        if (item.product.id !== productId) return sum;
        if ((item.variant_id ?? null) !== variantId) return sum;
        return sum + item.quantity;
    }, 0);
}

export function buildStorefrontOrderReorderPlan(
    orderItems: OrderItem[],
    catalogProducts: Product[],
    cartItems: CartItem[],
): StorefrontOrderReorderPlan {
    const productMap = new Map(catalogProducts.map((product) => [product.id, product]));
    const addableItems: StorefrontReorderReadyItem[] = [];
    const blockedItems: StorefrontReorderBlockedItem[] = [];

    for (const item of orderItems) {
        const product = productMap.get(item.product_id);

        if (!product) {
            blockedItems.push({
                orderItem: item,
                reason: 'missing_product',
                detail: 'Este articulo ya no existe en el catalogo actual y no se puede reconstruir desde el pedido.',
            });
            continue;
        }

        if (!product.is_active || product.status === 'discontinued') {
            blockedItems.push({
                orderItem: item,
                reason: 'inactive_product',
                detail: 'Este articulo ya no esta activo en el catalogo actual, asi que no se volvera a agregar automaticamente.',
            });
            continue;
        }

        const requestedVariant = getRequestedVariant(product, item);
        if (requestedVariant.blocked) {
            blockedItems.push(requestedVariant.blocked);
            continue;
        }

        const stockLimit = requestedVariant.variant
            ? Math.min(product.stock, requestedVariant.variant.stock)
            : product.stock;

        if (stockLimit <= 0) {
            blockedItems.push({
                orderItem: item,
                reason: 'out_of_stock',
                detail: 'Este articulo sigue registrado, pero hoy no tiene disponibilidad para reordenarse desde el catalogo actual.',
            });
            continue;
        }

        const variantId = requestedVariant.variant?.id ?? null;
        const quantityAlreadyInCart = getCartQuantityForSelection(cartItems, product.id, variantId);
        const remainingCapacity = Math.max(stockLimit - quantityAlreadyInCart, 0);

        if (remainingCapacity <= 0) {
            blockedItems.push({
                orderItem: item,
                reason: 'already_in_cart',
                detail: 'Tu carrito ya ocupa el cupo actual disponible para este articulo. Revisa el carrito antes de intentar agregar mas.',
            });
            continue;
        }

        const quantityToAdd = Math.min(item.quantity, remainingCapacity);
        const skippedQuantity = Math.max(item.quantity - quantityToAdd, 0);

        addableItems.push({
            orderItem: item,
            product,
            variantToken: requestedVariant.variant
                ? {
                    id: requestedVariant.variant.id,
                    name: item.variant_name ?? getVariantDisplayName(requestedVariant.variant),
                }
                : null,
            requestedQuantity: item.quantity,
            quantityToAdd,
            skippedQuantity,
        });
    }

    return {
        addableItems,
        blockedItems,
        requestedQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        addableQuantity: addableItems.reduce((sum, item) => sum + item.quantityToAdd, 0),
        addedLineCount: addableItems.length,
        blockedLineCount: blockedItems.length,
        partialLineCount: addableItems.filter((item) => item.skippedQuantity > 0).length,
    };
}

export function getStorefrontOrderReorderFeedback(
    plan: StorefrontOrderReorderPlan,
): StorefrontOrderReorderFeedback {
    if (plan.addedLineCount === 0) {
        return {
            type: 'error',
            title: 'No se pudo reconstruir el pedido',
            message: 'Ningun articulo pudo agregarse con seguridad desde el catalogo actual. Revisa el pedido y el catalogo antes de volver a comprar.',
        };
    }

    if (plan.blockedLineCount > 0 || plan.partialLineCount > 0) {
        return {
            type: 'warning',
            title: 'Reorden parcial',
            message: `Se agregaron ${plan.addedLineCount} articulo(s) al carrito, pero ${plan.blockedLineCount + plan.partialLineCount} requieren revision o ya no estan disponibles como en el pedido original. Revisa tu carrito antes de continuar.`,
        };
    }

    return {
        type: 'success',
        title: 'Carrito actualizado',
        message: 'Los articulos vigentes del pedido se agregaron usando el catalogo actual. Revisa tu carrito antes de continuar.',
    };
}
