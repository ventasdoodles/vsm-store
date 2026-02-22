// ─── Lógica de dominio: Precios y Descuentos ─────
// Reglas de negocio puras (sin dependencias de infraestructura)

export type DiscountType = 'percentage' | 'fixed';

export interface CouponData {
    discount_type: DiscountType;
    discount_value: number;
    min_purchase: number;
}

/**
 * Calcula el monto de descuento aplicable.
 * @param subtotal - Subtotal antes de descuento
 * @param coupon - Datos del cupón a aplicar
 * @returns Monto del descuento (nunca mayor al subtotal, nunca negativo)
 *
 * @example
 * calculateDiscount(500, { discount_type: 'percentage', discount_value: 10, min_purchase: 100 })
 * // → 50 (10% de 500)
 *
 * calculateDiscount(500, { discount_type: 'fixed', discount_value: 200, min_purchase: 100 })
 * // → 200
 */
export function calculateDiscount(subtotal: number, coupon: CouponData | null): number {
    if (!coupon) return 0;
    if (subtotal < coupon.min_purchase) return 0;

    let discount: number;

    if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100);
    } else {
        discount = coupon.discount_value;
    }

    // El descuento nunca puede ser mayor al subtotal ni negativo
    return Math.max(0, Math.min(discount, subtotal));
}

/**
 * Calcula el total final de una orden.
 * @param subtotal - Suma de (precio × cantidad) de todos los items
 * @param discount - Monto del descuento a aplicar
 * @param shippingCost - Costo de envío
 * @returns Total final (nunca negativo)
 */
export function calculateOrderTotal(
    subtotal: number,
    discount: number = 0,
    shippingCost: number = 0
): number {
    return Math.max(0, subtotal - discount + shippingCost);
}

/**
 * Calcula el porcentaje de ahorro respecto al precio original.
 * @param price - Precio actual
 * @param compareAtPrice - Precio anterior / tachado
 * @returns Porcentaje de descuento (0-100), o null si no hay descuento
 */
export function calculateSavingsPercentage(
    price: number,
    compareAtPrice: number | null
): number | null {
    if (!compareAtPrice || compareAtPrice <= price) return null;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
