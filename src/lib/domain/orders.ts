// ─── Lógica de dominio: Pedidos ──────────────────
// Reglas de negocio para validación de estados y transiciones

/**
 * Estados posibles de un pedido.
 * Nota: En la DB admin se usan en español ('pendiente', 'confirmado', etc.)
 * y en el storefront en inglés ('pending', 'confirmed', etc.)
 * Este archivo unifica la fuente de verdad.
 */

// Storefront status keys (used in orders.service.ts)
export const STOREFRONT_ORDER_STATUS = {
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    processing: { label: 'Procesando', color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-theme/30' },
    shipped: { label: 'Enviado', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    delivered: { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
} as const;

export type StorefrontOrderStatus = keyof typeof STOREFRONT_ORDER_STATUS;

// Admin status keys — English values matching the actual DB schema
export const ADMIN_ORDER_STATUS = {
    pending: { label: 'Pendiente', color: '#f59e0b' },
    confirmed: { label: 'Confirmado', color: '#3b82f6' },
    processing: { label: 'Preparando', color: '#8b5cf6' },
    shipped: { label: 'Enviado', color: '#06b6d4' },
    delivered: { label: 'Entregado', color: '#10b981' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
} as const;

export type AdminOrderStatus = keyof typeof ADMIN_ORDER_STATUS;

export const ADMIN_ORDER_STATUSES_LIST: { value: AdminOrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
    { value: 'confirmed', label: 'Confirmado', color: '#3b82f6' },
    { value: 'processing', label: 'Preparando', color: '#8b5cf6' },
    { value: 'shipped', label: 'Enviado', color: '#06b6d4' },
    { value: 'delivered', label: 'Entregado', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelado', color: '#ef4444' },
];

/**
 * Mapa de transiciones válidas de estado.
 * Define a qué estados puede transicionar cada estado.
 */
export const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [], // Estado terminal
    cancelled: [], // Estado terminal
};

/**
 * Verifica si una transición de estado es válida.
 */
export function canTransitionTo(
    currentStatus: AdminOrderStatus,
    targetStatus: AdminOrderStatus
): boolean {
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions?.includes(targetStatus) ?? false;
}

/**
 * Verifica si un estado es terminal (no se puede cambiar).
 */
export function isTerminalStatus(status: AdminOrderStatus): boolean {
    const transitions = ORDER_STATUS_TRANSITIONS[status];
    return !transitions || transitions.length === 0;
}

export type StorefrontPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type StorefrontPaymentTone = 'warning' | 'success' | 'danger' | 'neutral';

export interface StorefrontOrderPaymentInput {
    status?: string | null;
    payment_status?: string | null;
    payment_method?: string | null;
}

export interface StorefrontOrderPaymentView {
    paymentStatus: StorefrontPaymentStatus;
    paymentLabel: string;
    paymentTone: StorefrontPaymentTone;
    headline: string;
    detail: string;
}

export function normalizePaymentStatus(status: string | null | undefined): StorefrontPaymentStatus {
    switch (status) {
        case 'paid':
        case 'failed':
        case 'refunded':
            return status;
        default:
            return 'pending';
    }
}

export function getStorefrontOrderPaymentView(
    input: StorefrontOrderPaymentInput,
): StorefrontOrderPaymentView {
    const paymentStatus = normalizePaymentStatus(input.payment_status);
    const paymentMethod = input.payment_method ?? '';
    const orderStatus = input.status ?? '';

    if (paymentStatus === 'paid') {
        return {
            paymentStatus,
            paymentLabel: 'Liquidado',
            paymentTone: 'success',
            headline: 'Pago confirmado',
            detail: 'El pago ya quedo confirmado en tu pedido. Desde aqui veras el avance real de preparacion y entrega.',
        };
    }

    if (paymentStatus === 'refunded') {
        return {
            paymentStatus,
            paymentLabel: 'Reembolsado',
            paymentTone: 'neutral',
            headline: 'Pago reembolsado',
            detail: 'Este pedido ya figura con reembolso en el sistema. Si necesitas mas detalle, revisa el pedido o contacta soporte.',
        };
    }

    if (paymentStatus === 'failed' || orderStatus === 'cancelled') {
        return {
            paymentStatus: paymentStatus === 'failed' ? 'failed' : 'pending',
            paymentLabel: paymentStatus === 'failed' ? 'No aprobado' : 'Cancelado',
            paymentTone: 'danger',
            headline: 'Pago no confirmado',
            detail: paymentMethod === 'mercadopago'
                ? 'La orden sigue registrada, pero el pago no aparece como aprobado. Revisa el detalle antes de intentar pagar de nuevo.'
                : 'La orden no tiene un pago confirmado. Revisa el detalle antes de continuar.',
        };
    }

    if (paymentMethod === 'mercadopago') {
        return {
            paymentStatus,
            paymentLabel: 'En revision',
            paymentTone: 'warning',
            headline: 'Pago iniciado, pendiente de confirmacion',
            detail: 'Tu pedido ya fue creado, pero Mercado Pago todavia no confirma el cobro. No lo tomes como liquidado hasta que este estado cambie.',
        };
    }

    if (paymentMethod === 'transfer') {
        return {
            paymentStatus,
            paymentLabel: 'Pendiente por validar',
            paymentTone: 'warning',
            headline: 'Pedido recibido, pago pendiente de validacion',
            detail: 'Tu pedido ya fue registrado. El pago seguira pendiente hasta que la validacion correspondiente se refleje en el sistema.',
        };
    }

    if (paymentMethod === 'cash') {
        return {
            paymentStatus,
            paymentLabel: 'Pendiente al entregar',
            paymentTone: 'warning',
            headline: 'Pedido recibido',
            detail: 'Tu pedido ya fue registrado. El pago sigue pendiente porque se liquida al momento de la entrega.',
        };
    }

    return {
        paymentStatus,
        paymentLabel: 'En espera',
        paymentTone: 'warning',
        headline: 'Pedido recibido',
        detail: 'Tu pedido ya fue registrado, pero el estado de pago sigue pendiente.',
    };
}
