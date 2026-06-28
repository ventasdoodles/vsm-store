import type { OrderItem } from '@/types/order';
export type StorefrontPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type StorefrontPaymentTone = 'warning' | 'success' | 'danger' | 'neutral';

export interface StorefrontOrderPaymentInput {
    status?: string | null;
    payment_status?: string | null;
    payment_method?: string | null;
}

export function normalizePaymentStatus(status: string | null | undefined): StorefrontPaymentStatus {
    switch (status) {
        case 'paid':
        case 'failed':
        case 'refunded':
            return status;
        case 'rejected':
        case 'cancelled':
            return 'failed';
        default:
            return 'pending';
    }
}

export function isStorefrontPaymentContinuationAvailable(
    input: StorefrontOrderPaymentInput,
): boolean {
    return (input.payment_method ?? '') === 'mercadopago'
        && (input.payment_status ?? '') === 'pending'
        && (input.status ?? '') !== 'cancelled';
}

export function isStorefrontOpenRecoverableOrder(
    input: StorefrontOrderPaymentInput & { items?: OrderItem[] | null },
): boolean {
    return isStorefrontPaymentContinuationAvailable(input)
        && Array.isArray(input.items)
        && input.items.length > 0;
}
