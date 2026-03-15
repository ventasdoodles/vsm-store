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
    variant_name?: string | null;
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
    payment_status?: string | null;
    delivery_method?: string | null;
    coupon_code?: string | null;
    tracking_notes?: string | null;
    items?: OrderItem[];
}

export async function getAllOrders(statusFilter?: OrderStatus) {
    let query = supabase
        .from('orders')
        .select(`
            id, created_at, status, total, payment_method, payment_status, tracking_notes, items,
            customer_profiles:customer_id(full_name, phone),
            shipping_address:addresses!shipping_address_id(full_name, phone)
        `)
        .order('created_at', { ascending: false });

    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Map joined data into flat AdminOrder fields
    return (data ?? []).map((row) => {
        // Enforce types safely in case they come as objects or arrays
        const cpArray = Array.isArray(row.customer_profiles) ? row.customer_profiles[0] : row.customer_profiles;
        const saArray = Array.isArray(row.shipping_address) ? row.shipping_address[0] : row.shipping_address;
        
        const cp = cpArray as { full_name?: string; phone?: string } | null;
        const sa = saArray as { full_name?: string; phone?: string } | null;

        return {
            ...row,
            customer_profiles: undefined,
            shipping_address: undefined, // remove nested objects
            customer_name: cp?.full_name || sa?.full_name || 'Sin nombre',
            customer_phone: cp?.phone || sa?.phone || null,
        } as AdminOrder;
    });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const updateData: Partial<AdminOrder> = { status };
    (updateData as Record<string, unknown>).updated_at = new Date().toISOString();
    
    // Automation: If moving away from 'pending' to 'processing' or beyond, 
    // and it's not 'cancelled', assume paid if it was pending.
    const paidStatuses: OrderStatus[] = ['processing', 'shipped', 'delivered'];
    if (paidStatuses.includes(status)) {
        updateData.payment_status = 'paid';
    }


    const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('id')
        .single();

    if (error) throw error;
    if (!data) throw new Error(`Pedido ${orderId} no encontrado`);
}

/**
 * Actualiza manualmente el estado de pago de un pedido.
 */
export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
    const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('id')
        .single();

    if (error) throw error;
    if (!data) throw new Error(`Pedido ${orderId} no encontrado`);
}

export async function updateOrderTracking(orderId: string, trackingNumber: string) {
    const { data, error } = await supabase
        .from('orders')
        .update({ tracking_notes: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('id')
        .single();

    if (error) throw error;
    if (!data) throw new Error(`Pedido ${orderId} no encontrado`);
}

/**
 * Exportación de pedidos a CSV.
 */
export function exportOrdersToCSV(orders: AdminOrder[]) {
    if (!orders.length) return;

    const headers = ['ID Pedido', 'Cliente', 'Telefono', 'Total', 'Status', 'Fecha', 'Metodo Pago', 'Metodo Envio'];
    const rows = orders.map((o: AdminOrder) => [
        o.id,
        o.customer_name || 'Sin nombre',
        o.customer_phone || 'Sin telefono',
        o.total,
        o.status,
        new Date(o.created_at).toLocaleString(),
        o.payment_method || '',
        o.delivery_method || ''
    ]);

    const csvContent = [headers, ...rows]
        .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vsm_pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
