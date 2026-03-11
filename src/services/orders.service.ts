/**
 * // ─── SERVICE: Orders ───
 * // Arquitectura: Data Access Layer (Service)
 * // Proposito principal: Gestión de pedidos, creación y recuperación de historial.
 * // Regla / Notas: Selectores explícitos en todas las consultas (§1.2). Desacoplamiento de infraestructura (§1.1).
 */

import { supabase } from '@/lib/supabase';
import { calculateLoyaltyPoints } from '@/lib/domain/loyalty';
import { addLoyaltyPoints } from '@/services/loyalty.service';
import type { OrderRecord, CreateOrderData, RealtimeOrderEvent, OrderItem } from '@/types/order';

// Re-exports para backward compat
export type { OrderItem, OrderRecord, CreateOrderData } from '@/types/order';
export { STOREFRONT_ORDER_STATUS as ORDER_STATUS } from '@/lib/domain/orders';
export type { StorefrontOrderStatus as OrderStatus } from '@/lib/domain/orders';
export { getPointsBalance } from '@/services/loyalty.service';
export { calculateLoyaltyPoints } from '@/lib/domain/loyalty';

const ORDER_SELECT = 'id, order_number, customer_id, items, subtotal, shipping_cost, discount, total, status, payment_method, payment_status, shipping_address_id, billing_address_id, tracking_notes, whatsapp_sent, whatsapp_sent_at, created_at, updated_at';

/**
 * Crea un nuevo pedido con lógica de lealtad integrada.
 * @param data Datos del pedido
 * @returns El registro del pedido creado
 * @policy Data Integrity §1.2
 */
export async function createOrder(data: CreateOrderData): Promise<OrderRecord> {
    const { data: result, error } = await supabase
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
        })
        .select(ORDER_SELECT)
        .single();

    if (error || !result) throw error || new Error('Error al crear la orden');
    const order = result as unknown as OrderRecord;

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

    return order;
}

/**
 * Obtiene el historial de pedidos de un cliente.
 */
export async function getCustomerOrders(customerId: string): Promise<OrderRecord[]> {
    const { data, error } = await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as OrderRecord[];
}

/**
 * Obtiene un pedido específico por su ID.
 */
export async function getOrderById(id: string): Promise<OrderRecord | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as OrderRecord | null;
}

/**
 * Obtiene detalles enriquecidos para notificaciones Social Proof.
 * §1.1 Architecture: Mueve la lógica de infraestructura fuera de los hooks.
 */
export async function getOrderNotificationDetails(orderId: string): Promise<RealtimeOrderEvent | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            items,
            customer_profiles:customer_id(full_name),
            shipping_address:addresses!shipping_address_id(city, colony)
        `)
        .eq('id', orderId)
        .single();

    if (error || !data) return null;

    const items = data.items as OrderItem[] | null;
    const item = items?.[0];
    if (!item) return null;

    // Manejo de joins de Supabase (pueden venir como objeto o array de 1 elemento)
    const profile = (Array.isArray(data.customer_profiles) ? data.customer_profiles[0] : data.customer_profiles) as { full_name: string } | null;
    const address = (Array.isArray(data.shipping_address) ? data.shipping_address[0] : data.shipping_address) as { city?: string, colony?: string } | null;

    return {
        id: data.id,
        customer_name: profile?.full_name || 'Alguien',
        city: address?.city || address?.colony || 'México',
        product_name: item.name || 'un producto',
        product_image: item.image || '',
    };
}

/**
 * Actualiza el estado de envío de WhatsApp para un pedido.
 */
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
