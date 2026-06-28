import type { CartItem } from '@/types/cart';

import type { OrderItem } from '@/types/order';

import type { Product } from '@/types/product';

import type { ProductVariant } from '@/types/variant';

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
