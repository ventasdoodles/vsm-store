// Tipos para carrito y checkout - VSM Store
import type { Product } from './product';

export interface CartItem {
    product: Product;
    quantity: number;
}

export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'transfer';

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
}
