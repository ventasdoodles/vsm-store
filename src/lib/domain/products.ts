import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

export type StorefrontPurchaseabilityReason =
    | 'purchasable'
    | 'inactive'
    | 'discontinued'
    | 'out_of_stock'
    | 'requires_variant_selection'
    | 'variant_unavailable';

export interface StorefrontProductPurchaseabilityView {
    reason: StorefrontPurchaseabilityReason;
    canAddToCart: boolean;
    requiresVariantSelection: boolean;
    hasVariants: boolean;
    maxQuantity: number;
    selectedVariant: ProductVariant | null;
    ctaLabel: string;
    detail: string;
}

interface StorefrontProductPurchaseabilityOptions {
    selectedVariant?: ProductVariant | null;
    selectedVariantId?: string | null;
}

export function getVariantDisplayName(variant: ProductVariant | null): string {
    if (!variant) return 'Variante';

    const labels = variant.options
        ?.map((option) => option.attribute_value?.value)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? [];

    return labels.join(' / ') || 'Variante';
}

export function getProductVariantById(product: Product, variantId?: string | null): ProductVariant | null {
    if (!variantId) return null;
    return product.variants?.find((variant) => variant.id === variantId) ?? null;
}

export function getStorefrontProductPurchaseability(
    product: Product,
    options: StorefrontProductPurchaseabilityOptions = {},
): StorefrontProductPurchaseabilityView {
    const variants = product.variants ?? [];
    const hasVariants = variants.length > 0;
    const selectedVariant = options.selectedVariant
        ?? getProductVariantById(product, options.selectedVariantId ?? null);
    const availableVariants = variants.filter((variant) => variant.is_active && variant.stock > 0);

    if (!product.is_active) {
        return {
            reason: 'inactive',
            canAddToCart: false,
            requiresVariantSelection: false,
            hasVariants,
            maxQuantity: 0,
            selectedVariant,
            ctaLabel: 'No disponible',
            detail: 'Este producto ya no esta disponible para compra.',
        };
    }

    if (product.status === 'discontinued') {
        return {
            reason: 'discontinued',
            canAddToCart: false,
            requiresVariantSelection: false,
            hasVariants,
            maxQuantity: 0,
            selectedVariant,
            ctaLabel: 'No disponible',
            detail: 'Este producto ya no esta disponible para compra.',
        };
    }

    if (!hasVariants) {
        if (product.stock <= 0) {
            return {
                reason: 'out_of_stock',
                canAddToCart: false,
                requiresVariantSelection: false,
                hasVariants: false,
                maxQuantity: 0,
                selectedVariant: null,
                ctaLabel: 'Agotado',
                detail: 'Este producto no tiene stock disponible en este momento.',
            };
        }

        return {
            reason: 'purchasable',
            canAddToCart: true,
            requiresVariantSelection: false,
            hasVariants: false,
            maxQuantity: product.stock,
            selectedVariant: null,
            ctaLabel: 'Anadir al carrito',
            detail: 'Disponible para compra con el catalogo actual.',
        };
    }

    if (availableVariants.length === 0) {
        return {
            reason: 'variant_unavailable',
            canAddToCart: false,
            requiresVariantSelection: false,
            hasVariants: true,
            maxQuantity: 0,
            selectedVariant,
            ctaLabel: 'No disponible',
            detail: 'Este producto ya no tiene opciones vigentes disponibles para compra.',
        };
    }

    if (!selectedVariant) {
        return {
            reason: 'requires_variant_selection',
            canAddToCart: false,
            requiresVariantSelection: true,
            hasVariants: true,
            maxQuantity: 0,
            selectedVariant: null,
            ctaLabel: 'Elige una opcion',
            detail: 'Selecciona una opcion vigente antes de agregar este producto al carrito.',
        };
    }

    if (!selectedVariant.is_active || selectedVariant.stock <= 0) {
        return {
            reason: 'variant_unavailable',
            canAddToCart: false,
            requiresVariantSelection: false,
            hasVariants: true,
            maxQuantity: 0,
            selectedVariant,
            ctaLabel: 'Opcion no disponible',
            detail: `${getVariantDisplayName(selectedVariant)} ya no esta disponible. Elige otra opcion vigente.`,
        };
    }

    return {
        reason: 'purchasable',
        canAddToCart: true,
        requiresVariantSelection: false,
        hasVariants: true,
        maxQuantity: selectedVariant.stock,
        selectedVariant,
        ctaLabel: 'Anadir al carrito',
        detail: `${getVariantDisplayName(selectedVariant)} esta disponible para compra con el catalogo actual.`,
    };
}
