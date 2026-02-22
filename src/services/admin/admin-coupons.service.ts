// ─── Admin Coupons Service ───────────────────────
import { supabase } from '@/lib/supabase';

export interface AdminCoupon {
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
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as AdminCoupon[]) ?? [];
}

export async function createCoupon(coupon: CouponFormData) {
    const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, current_uses: 0 })
        .select()
        .single();

    if (error) throw error;
    return data as AdminCoupon;
}

export async function updateCoupon(id: string, coupon: Partial<CouponFormData>) {
    const { data, error } = await supabase
        .from('coupons')
        .update(coupon)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as AdminCoupon;
}

export async function deleteCoupon(id: string) {
    const { error } = await supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}
