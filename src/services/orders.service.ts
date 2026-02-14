// Servicio de pedidos - VSM Store
import { supabase } from '@/lib/supabase';

export interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    section?: string;
}

export interface CreateOrderData {
    customer_id: string;
    items: OrderItem[];
    subtotal: number;
    shipping_cost?: number;
    discount?: number;
    total: number;
    payment_method: 'cash' | 'transfer' | 'card' | 'mercadopago' | 'whatsapp';
    shipping_address_id?: string;
    billing_address_id?: string;
    tracking_notes?: string;
}

export interface OrderRecord {
    id: string;
    order_number: string;
    customer_id: string;
    items: OrderItem[];
    subtotal: number;
    shipping_cost: number;
    discount: number;
    total: number;
    status: string;
    payment_method: string;
    payment_status: string;
    shipping_address_id: string | null;
    billing_address_id: string | null;
    tracking_notes: string | null;
    whatsapp_sent: boolean;
    whatsapp_sent_at: string | null;
    created_at: string;
    updated_at: string;
}

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
            order_number: '', // El trigger genera automáticamente
        })
        .select()
        .single();

    if (error) throw error;

    // Calcular y agregar puntos de lealtad
    const points = calculateLoyaltyPoints(data.total);
    if (points > 0) {
        await addLoyaltyPoints(
            data.customer_id,
            points,
            order.id,
            `Compra #${order.order_number}`
        );
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
export async function updateOrderStatus(id: string, status: string, notes?: string) {
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
export function calculateLoyaltyPoints(total: number): number {
    // Cada $100 MXN = 10 puntos
    return Math.floor(total / 100) * 10;
}

// ─── Agregar puntos de lealtad ───────────────────
export async function addLoyaltyPoints(
    customerId: string,
    points: number,
    orderId: string,
    description: string
) {
    const { error } = await supabase
        .from('loyalty_points')
        .insert({
            customer_id: customerId,
            points,
            transaction_type: 'earned',
            description,
            order_id: orderId,
        });

    if (error) {
        console.error('Error agregando puntos:', error);
        // No lanzar para no bloquear el flujo de compra
    }
}

// ─── Obtener balance de puntos ───────────────────
export async function getPointsBalance(customerId: string): Promise<number> {
    const { data, error } = await supabase
        .rpc('get_customer_points_balance', { p_customer_id: customerId });

    if (error) {
        console.error('Error obteniendo balance de puntos:', error);
        return 0;
    }
    return data ?? 0;
}

// ─── Status labels y colores ─────────────────────
export const ORDER_STATUS = {
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    processing: { label: 'Procesando', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
    shipped: { label: 'Enviado', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    delivered: { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;
