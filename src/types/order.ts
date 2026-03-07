// ─── Tipos de dominio: Pedidos ───────────────────
// Fuente de verdad para todos los tipos de Order usados en la app.

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
    tracking_number: string | null;
    whatsapp_sent: boolean;
    whatsapp_sent_at: string | null;
    created_at: string;
    updated_at: string;
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
    earned_points?: number;
}
