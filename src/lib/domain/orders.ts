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

// Admin status keys (used in admin.service.ts — Spanish values in DB)
export const ADMIN_ORDER_STATUS = {
    pendiente: { label: 'Pendiente', color: '#f59e0b' },
    confirmado: { label: 'Confirmado', color: '#3b82f6' },
    preparando: { label: 'Preparando', color: '#8b5cf6' },
    enviado: { label: 'Enviado', color: '#06b6d4' },
    entregado: { label: 'Entregado', color: '#10b981' },
    cancelado: { label: 'Cancelado', color: '#ef4444' },
} as const;

export type AdminOrderStatus = keyof typeof ADMIN_ORDER_STATUS;

export const ADMIN_ORDER_STATUSES_LIST: { value: AdminOrderStatus; label: string; color: string }[] = [
    { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
    { value: 'confirmado', label: 'Confirmado', color: '#3b82f6' },
    { value: 'preparando', label: 'Preparando', color: '#8b5cf6' },
    { value: 'enviado', label: 'Enviado', color: '#06b6d4' },
    { value: 'entregado', label: 'Entregado', color: '#10b981' },
    { value: 'cancelado', label: 'Cancelado', color: '#ef4444' },
];

/**
 * Mapa de transiciones válidas de estado.
 * Define a qué estados puede transicionar cada estado.
 */
export const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
    pendiente: ['confirmado', 'cancelado'],
    confirmado: ['preparando', 'cancelado'],
    preparando: ['enviado', 'cancelado'],
    enviado: ['entregado'],
    entregado: [], // Estado terminal
    cancelado: [], // Estado terminal
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

/**
 * Verifica si un pedido puede ser cancelado por el cliente.
 * Solo pedidos en estados iniciales pueden ser cancelados.
 */
export function canCustomerCancel(status: AdminOrderStatus): boolean {
    return ['pendiente', 'confirmado'].includes(status);
}
