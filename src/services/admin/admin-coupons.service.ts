// ─── Admin Coupons Service ───────────────────────
import { supabase } from '@/lib/supabase';

export interface AdminCoupon {
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
    created_at?: string;
    customer_id?: string | null; // Optional target customer
}

export interface CouponFormData {
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    is_active: boolean;
    valid_from: string | null;
    valid_until: string | null;
    customer_id?: string | null;
}

export async function getAllCoupons() {
    const { data, error } = await supabase
        .from('coupons')
        .select('code, description, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, valid_from, valid_until, created_at')
        .order('code', { ascending: true }); // Use code as fallback for ordering

    if (error) {
        if (import.meta.env.DEV) {
            console.error('SUPABASE ERROR in getAllCoupons:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }
        throw error;
    }
    return (data as AdminCoupon[]) ?? [];
}

export async function createCoupon(coupon: CouponFormData) {
    // Omit customer_id if it's not in the database schema
    const { customer_id: _customer_id, ...couponData } = coupon;
    
    const { data, error } = await supabase
        .from('coupons')
        .insert({ ...couponData, used_count: 0 })
        .select('code, description, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, valid_from, valid_until, created_at')
        .single();

    if (error) throw error;
    return data as AdminCoupon;
}

export async function updateCoupon(code: string, coupon: Partial<CouponFormData>) {
    // Omit customer_id if it's not in the database schema
    const { customer_id: _customer_id, ...couponData } = coupon;

    const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('code', code)
        .select('code, description, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, valid_from, valid_until, created_at')
        .single();

    if (error) throw error;
    return data as AdminCoupon;
}

export async function deleteCoupon(code: string) {
    const { error } = await supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('code', code);

    if (error) throw error;
}

/**
 * System Marketing Helper — Heuristic Coupon Suggestion
 * Genera sugerencias de códigos y montos de descuento basados en objetivos.
 * Reparación A65: Heurística local (Reality Repair) para evitar dependencia de backend inexistente.
 */
export async function generateCouponSystem(goal: 'conversion' | 'retention' | 'clearance'): Promise<{ code: string; discount_value: number; description: string }> {
    if (import.meta.env.DEV) {
        console.log(`[SYSTEM_SUGGESTION] Generating coupon for goal: ${goal}`);
    }

    // Heurísticas de negocio locales
    const prefix = goal === 'conversion' ? 'BIENVENIDO' : goal === 'retention' ? 'VUELVE' : 'LIQUIDA';
    const discount = goal === 'conversion' ? 10 : goal === 'retention' ? 15 : 25;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    
    const descriptions = {
        conversion: "Incentivo de primera compra para maximizar conversión inmediata.",
        retention: "Premio de lealtad para incentivar la recompra de clientes existentes.",
        clearance: "Descuento agresivo para rotación rápida de inventario estancado."
    };

    // Simulamos latencia mínima de "pensamiento" del sistema
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
        code: `${prefix}${randomSuffix}`,
        discount_value: discount,
        description: descriptions[goal]
    };
}

/**
 * System Marketing Helper — Heuristic Impact Estimation
 * Analiza el impacto potencial de un cupón antes de lanzarlo.
 * Reparación A65: Estimación basada en reglas de negocio (Reality Repair).
 */
export async function forecastCouponImpact(coupon: CouponFormData): Promise<{ reach: number; potential_revenue: number; recommendation: string }> {
    if (import.meta.env.DEV) {
        console.log(`[SYSTEM_SUGGESTION] Forecasting impact for coupon: ${coupon.code}`);
    }

    // Heurística de alcance basada en el valor del descuento
    const baseReach = 150;
    const reachMultiplier = coupon.discount_type === 'percentage' 
        ? (coupon.discount_value / 5) 
        : (coupon.discount_value / 100);
    
    const estimatedReach = Math.round(baseReach * Math.max(1, reachMultiplier));
    const estimatedRevenue = Math.round(estimatedReach * 450 * 0.12); // Suposición de ticket promedio y conversión

    // Simulamos latencia
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        reach: estimatedReach,
        potential_revenue: estimatedRevenue,
        recommendation: coupon.discount_value > 20 
            ? "Este descuento es muy atractivo. El volumen de ventas compensará el margen."
            : "Impacto moderado. Ideal para una campaña de mantenimiento de marca."
    };
}

