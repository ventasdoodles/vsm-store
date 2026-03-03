// Servicio de pedidos - VSM Store
import { supabase } from '@/lib/supabase';
import { calculateLoyaltyPoints } from '@/lib/domain/loyalty';
import { addLoyaltyPoints } from '@/services/loyalty.service';
import type { StorefrontOrderStatus } from '@/lib/domain/orders';
import type { OrderRecord, CreateOrderData } from '@/types/order';

// Re-exports para backward compat (preferir importar desde types/order y domain/orders)
export type { OrderItem, OrderRecord, CreateOrderData } from '@/types/order';
export { STOREFRONT_ORDER_STATUS as ORDER_STATUS } from '@/lib/domain/orders';
export type { StorefrontOrderStatus as OrderStatus } from '@/lib/domain/orders';
// getPointsBalance vive en loyalty.service.ts — re-export para backward compat
export { getPointsBalance } from '@/services/loyalty.service';

// ─── Crear pedido ────────────────────────────────
export async function createOrder(data: CreateOrderData): Promise<OrderRecord> {
    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            customer_id: data.customer_id,
            items: data.items,
            subtotal: data.subtotal,
            shipping_cost: data.shipping_cost ?? 0,
            discount: data.discount ?? 0,
            total: data.total,
            payment_method: data.payment_method,
            shipping_address_id: data.shipping_address_id ?? null,
            billing_address_id: data.billing_address_id ?? null,
            tracking_notes: data.tracking_notes ?? null,
            // order_number es generado automáticamente por trigger SQL
        })
        .select()
        .single();

    if (error) throw error;

    // Calcular y agregar puntos de lealtad
    const points = data.earned_points ?? calculateLoyaltyPoints(data.total);
    if (points > 0) {
        try {
            await addLoyaltyPoints(
                data.customer_id,
                points,
                order.id,
                `Compra #${order.order_number}`
            );
        } catch (loyaltyError) {
            console.error('[VSM] Loyalty points failed for order:', {
                orderId: order.id,
                orderNumber: order.order_number,
                pointsExpected: points,
                error: loyaltyError,
            });
        }
    }

    return order as OrderRecord;
}

// ─── Obtener pedidos del cliente ─────────────────
export async function getCustomerOrders(customerId: string): Promise<OrderRecord[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as OrderRecord[];
}

// ─── Obtener pedido por ID ───────────────────────
export async function getOrderById(id: string): Promise<OrderRecord | null> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as OrderRecord | null;
}

// ─── Actualizar status del pedido ────────────────
export async function updateOrderStatus(id: string, status: StorefrontOrderStatus, notes?: string) {
    const updateData: Record<string, unknown> = { status };
    if (notes) updateData.tracking_notes = notes;

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
}

// ─── Marcar WhatsApp como enviado ────────────────
export async function markWhatsAppSent(orderId: string) {
    const { error } = await supabase
        .from('orders')
        .update({
            whatsapp_sent: true,
            whatsapp_sent_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (error) throw error;
}

// ─── Calcular puntos de lealtad ──────────────────
// Re-exportar desde módulo de dominio para mantener compatibilidad
export { calculateLoyaltyPoints } from '@/lib/domain/loyalty';
