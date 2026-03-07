// Tipos para carrito y checkout - VSM Store
import type { Product } from './product';

export interface CartItem {
    product: Product;
    quantity: number;
    variant_id?: string | null;
    variant_name?: string | null;
}

export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'whatsapp' | 'mercadopago' | 'cash' | 'transfer' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CheckoutFormData {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address: string; // Requerido solo si deliveryType === 'delivery'
    paymentMethod: PaymentMethod;
}

export interface MercadoPagoPaymentData {
    id: string;
    status: string;
    status_detail: string;
    payment_method_id: string;
    payment_type_id: string;
    external_reference?: string;
    preference_id?: string;
    transaction_amount: number;
    currency_id: string;
    date_approved?: string;
    [key: string]: any; // Permitir campos adicionales de la API de MP pero con base tipada
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
    mp_payment_data?: MercadoPagoPaymentData | null;
}

