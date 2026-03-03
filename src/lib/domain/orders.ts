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
