// Servicio de cupones - VSM Store
import { supabase } from '@/lib/supabase';

export interface CouponValidation {
    valid: boolean;
    discount: number;
    message: string;
    coupon_id?: string;
    discount_type?: 'percentage' | 'fixed';
}

interface CouponRow {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    valid_from: string | null;
    valid_until: string | null;
}

// ─── Validar cupón ───────────────────────────────
export async function validateCoupon(
    code: string,
    total: number,
    customerId?: string
): Promise<CouponValidation> {
    // Buscar cupón
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

    if (error || !coupon) {
        return { valid: false, discount: 0, message: 'Cupón no encontrado o inválido' };
    }

    const c = coupon as CouponRow;

    // Verificar fechas
    const now = new Date();
    if (c.valid_from && new Date(c.valid_from) > now) {
        return { valid: false, discount: 0, message: 'Este cupón aún no está vigente' };
    }
    if (c.valid_until && new Date(c.valid_until) < now) {
        return { valid: false, discount: 0, message: 'Este cupón ha expirado' };
    }

    // Verificar usos máximos
    if (c.max_uses !== null && c.current_uses >= c.max_uses) {
        return { valid: false, discount: 0, message: 'Este cupón ha alcanzado su límite de usos' };
    }

    // Verificar compra mínima
    if (total < c.min_purchase) {
        return {
            valid: false,
            discount: 0,
            message: `Compra mínima de $${c.min_purchase} requerida para este cupón`,
        };
    }

    // Verificar si el cliente ya lo usó
    if (customerId) {
        const { data: used } = await supabase
            .from('customer_coupons')
            .select('id')
            .eq('customer_id', customerId)
            .eq('coupon_id', c.id)
            .limit(1);

        if (used && used.length > 0) {
            return { valid: false, discount: 0, message: 'Ya has utilizado este cupón' };
        }
    }

    // Calcular descuento
    let discount = 0;
    if (c.discount_type === 'percentage') {
        discount = Math.round((total * c.discount_value) / 100 * 100) / 100;
    } else {
        discount = Math.min(c.discount_value, total);
    }

    const typeLabel = c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`;

    return {
        valid: true,
        discount,
        message: `Cupón aplicado: ${typeLabel} de descuento`,
        coupon_id: c.id,
        discount_type: c.discount_type,
    };
}

// ─── Aplicar cupón (marcar como usado) ──────────
export async function applyCoupon(code: string, customerId: string, orderId: string) {
    // Buscar el cupón
    const { data: coupon } = await supabase
        .from('coupons')
        .select('id, current_uses')
        .eq('code', code.toUpperCase().trim())
        .single();

    if (!coupon) return;

    // Registrar uso
    await supabase.from('customer_coupons').insert({
        customer_id: customerId,
        coupon_id: coupon.id,
        order_id: orderId,
    });

    // Incrementar contador
    await supabase
        .from('coupons')
        .update({ current_uses: (coupon.current_uses ?? 0) + 1 })
        .eq('id', coupon.id);
}

// ─── Obtener cupones activos (públicos) ─────────
export async function getActiveCoupons() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('coupons')
        .select('id, code, description, discount_type, discount_value, min_purchase, valid_until')
        .eq('is_active', true)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}
