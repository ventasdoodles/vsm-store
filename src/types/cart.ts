// Tipos para carrito y checkout - VSM Store
import type { Product } from './product';

export interface CartItem {
    product: Product;
    quantity: number;
}

export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'whatsapp' | 'mercadopago' | 'cash' | 'transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CheckoutFormData {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address: string; // Requerido solo si deliveryType === 'delivery'
    paymentMethod: PaymentMethod;
}

export interface Order extends CheckoutFormData {
    id: string;
    items: CartItem[];
    subtotal: number;
    total: number;
    createdAt: string;
    payment_status?: PaymentStatus;
    mp_preference_id?: string | null;
    mp_payment_id?: string | null;
    mp_payment_data?: Record<string, any> | null;
}
