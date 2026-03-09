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
        .select('*')
        .order('code', { ascending: true }); // Use code as fallback for ordering

    if (error) {
        console.error('SUPABASE ERROR in getAllCoupons:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
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
        .select()
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
        .select()
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
 * AI Marketing Forecaster — "Magic Coupon"
 * Genera sugerencias de códigos y montos de descuento basados en objetivos.
 */
export async function generateCouponMagic(goal: 'conversion' | 'retention' | 'clearance'): Promise<{ code: string; discount_value: number; description: string }> {
    try {
        const { data, error } = await supabase.functions.invoke('marketing-intelligence', {
            body: { goal, action: 'generate_coupon' }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error generating coupon magic:', error);
        throw error;
    }
}

/**
 * AI Marketing Forecaster — "Impact Forecast"
 * Analiza el impacto potencial de un cupón antes de lanzarlo.
 */
export async function forecastCouponImpact(coupon: CouponFormData): Promise<{ reach: number; potential_revenue: number; recommendation: string }> {
    try {
        const { data, error } = await supabase.functions.invoke('marketing-intelligence', {
            body: { coupon, action: 'forecast_impact' }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error forecasting coupon impact:', error);
        throw error;
    }
}
