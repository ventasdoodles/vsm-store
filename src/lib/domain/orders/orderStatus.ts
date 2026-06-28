export const STOREFRONT_ORDER_STATUS = {
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    processing: { label: 'Procesando', color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-theme/30' },
    shipped: { label: 'Enviado', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    delivered: { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
} as const;

export type StorefrontOrderStatus = keyof typeof STOREFRONT_ORDER_STATUS;

export const ADMIN_ORDER_STATUS = {
    pending: { label: 'Pendiente', color: 'warning' },
    confirmed: { label: 'Confirmado', color: 'info' },
    processing: { label: 'Preparando', color: 'accent' },
    shipped: { label: 'Enviado', color: 'vape' },
    delivered: { label: 'Entregado', color: 'success' },
    cancelled: { label: 'Cancelado', color: 'destructive' },
} as const;

export type AdminOrderStatus = keyof typeof ADMIN_ORDER_STATUS;

export const ADMIN_ORDER_STATUSES_LIST: { value: AdminOrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pendiente', color: 'warning' },
    { value: 'confirmed', label: 'Confirmado', color: 'info' },
    { value: 'processing', label: 'Preparando', color: 'accent' },
    { value: 'shipped', label: 'Enviado', color: 'vape' },
    { value: 'delivered', label: 'Entregado', color: 'success' },
    { value: 'cancelled', label: 'Cancelado', color: 'destructive' },
];

export const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

export function canTransitionTo(
    currentStatus: AdminOrderStatus,
    targetStatus: AdminOrderStatus,
): boolean {
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions?.includes(targetStatus) ?? false;
}

export function isTerminalStatus(status: AdminOrderStatus): boolean {
    const transitions = ORDER_STATUS_TRANSITIONS[status];
    return !transitions || transitions.length === 0;
}
