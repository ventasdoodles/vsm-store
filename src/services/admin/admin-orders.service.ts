// ─── Admin Orders Service ────────────────────────
import { supabase } from '@/lib/supabase';
import {
    type AdminOrderStatus,
    ADMIN_ORDER_STATUSES_LIST,
} from '@/lib/domain/orders';

// Re-export domain types for backward compatibility
export type OrderStatus = AdminOrderStatus;
export const ORDER_STATUSES = ADMIN_ORDER_STATUSES_LIST;

export interface OrderItem {
    product_id?: string;
    name?: string;
    product_name?: string;
    quantity: number;
    price: number;
    image?: string;
}

export interface AdminOrder {
    id: string;
    created_at: string;
    status: OrderStatus;
    total: number;
    customer_name: string | null;
    customer_phone?: string | null;
    delivery_address?: string | null;
    payment_method?: string | null;
    delivery_method?: string | null;
    coupon_code?: string | null;
    tracking_number?: string | null;
    items?: OrderItem[];
}

export async function getAllOrders(statusFilter?: OrderStatus) {
    let query = supabase
        .from('orders')
        .select('*, customer_profiles!customer_id(full_name, phone)')
        .order('created_at', { ascending: false });

    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Map joined customer_profiles data into flat AdminOrder fields
    return (data ?? []).map((row) => {
        const cp = row.customer_profiles as { full_name?: string; phone?: string } | null;
        return {
            ...row,
            customer_profiles: undefined, // remove nested object
            customer_name: cp?.full_name ?? null,
            customer_phone: cp?.phone ?? null,
        } as AdminOrder;
    });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) throw error;
}

export async function updateOrderTracking(orderId: string, trackingNumber: string) {
    const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) throw error;
}
