/**
 * // ─── COUPONS SERVICE ───
 * // Proposito: Motor de validacion y aplicacion de cupones de descuento.
 * // Arquitectura: Service Layer (§1.1) - Reglas de negocio de precios.
 * // Regla / Notas: Validacion temporal, limites de uso y compra minima.
 */
import { supabase } from '@/lib/supabase';

export interface CouponValidation {
    valid: boolean;
    discount: number;
    message: string;
    coupon_code?: string;
    discount_type?: 'percentage' | 'fixed';
}

/** Interface para el registro de la DB (§1.2) */
const COUPON_SELECT = 'code, description, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, valid_from, valid_until';

export interface CouponRow {
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    used_count: number;
    is_active: boolean;
    valid_from: string | null;
    valid_until: string | null;
}

/**
 * Valida un codigo de cupon contra las reglas de negocio.
 * @policy Data Integrity §1.2
 */
export async function validateCoupon(
    code: string,
    total: number,
    customerId?: string
): Promise<CouponValidation> {
    // Buscar cupon con tipado fuerte
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select(COUPON_SELECT)
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .returns<CouponRow[]>()
        .single();

    if (error || !coupon) {
        return { valid: false, discount: 0, message: 'Cupón no encontrado o inválido' };
    }

    // Verificar fechas
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return { valid: false, discount: 0, message: 'Este cupón aún no está vigente' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return { valid: false, discount: 0, message: 'Este cupón ha expirado' };
    }

    // Verificar usos máximos
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        return { valid: false, discount: 0, message: 'Este cupón ha alcanzado su límite de usos' };
    }

    // Verificar compra mínima
    if (total < coupon.min_purchase) {
        return {
            valid: false,
            discount: 0,
            message: `Compra mínima de $${coupon.min_purchase} requerida para este cupón`,
        };
    }

    // Verificar si el cliente ya lo usó
    if (customerId) {
        const { data: used } = await supabase
            .from('customer_coupons')
            .select('id')
            .eq('customer_id', customerId)
            .eq('coupon_code', coupon.code)
            .limit(1);

        if (used && used.length > 0) {
            return { valid: false, discount: 0, message: 'Ya has utilizado este cupón' };
        }
    }

    // Calcular descuento
    const discount = coupon.discount_type === 'percentage'
        ? Math.round((total * coupon.discount_value) / 100 * 100) / 100
        : Math.min(coupon.discount_value, total);

    const typeLabel = coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`;

    return {
        valid: true,
        discount,
        message: `Cupón aplicado: ${typeLabel} de descuento`,
        coupon_code: coupon.code,
        discount_type: coupon.discount_type,
    };
}

/**
 * Marca un cupon como utilizado por un cliente.
 */
export async function applyCoupon(code: string, customerId: string, orderId: string) {
    const { data: coupon } = await supabase
        .from('coupons')
        .select('code')
        .eq('code', code.toUpperCase().trim())
        .single();

    if (!coupon) return;

    // Registrar uso en tabla relacional
    await supabase.from('customer_coupons').insert({
        customer_id: customerId,
        coupon_code: coupon.code,
        order_id: orderId,
    });

    // Incrementar contador vía RPC (Atómico)
    await supabase.rpc('increment_coupon_uses', { target_coupon_code: coupon.code });
}

// ─── Obtener cupones activos (públicos) ─────────
export async function getActiveCoupons() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('coupons')
        .select('code, description, discount_type, discount_value, min_purchase, valid_until')
        .eq('is_active', true)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}
