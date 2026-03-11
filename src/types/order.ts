/**
 * // ─── TYPES: Orders & Tracking ───
 * // Arquitectura: Domain Types (Single Source of Truth)
 * // Proposito principal: Definiciones compartidas para pedidos, rastreo y eventos en tiempo real.
 * // Regla / Notas: Sin `any`. Todas las fechas son ISO Strings.
 */

/**
 * Representa un artículo individual dentro de un pedido.
 */
export interface OrderItem {
    product_id: string;
    variant_id?: string | null;
    variant_name?: string | null;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    section?: string;
}

/**
 * Registro completo de un pedido en la base de datos.
 */
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

/**
 * Datos necesarios para crear un nuevo pedido.
 */
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
    earned_points?: number;
}

/**
 * Evento de rastreo individual (historial de envío).
 */
export interface TrackingEvent {
    id: string;
    date: string;
    status: string;
    location: string;
    isCompleted: boolean;
}

/**
 * Información consolidada de rastreo (DHL u otro carrier).
 */
export interface TrackingInfo {
    trackingNumber: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'exception';
    statusText: string;
    estimatedDelivery?: string | null;
    events: TrackingEvent[];
    carrier: string;
}

/**
 * Estructura de evento para notificaciones Social Proof (Social Pulse).
 */
export interface RealtimeOrderEvent {
    id: string;
    customer_name: string;
    city: string;
    product_name: string;
    product_image: string;
}
