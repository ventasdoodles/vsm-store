// Constantes de la aplicación - VSM Store
// Centraliza "Magic Strings" para evitar errores de tipo y facilitar refactorización

export const SECTIONS = {
    VAPE: 'vape',
    HERBAL: '420',
} as const;

export const PRODUCT_FLAGS = {
    IS_FEATURED: 'is_featured',
    IS_NEW: 'is_new',
    IS_BESTSELLER: 'is_bestseller',
    IS_ACTIVE: 'is_active',
} as const;

export const ORDER_STATUS = {
    PENDING: 'pendiente',
    PROCESSING: 'procesando',
    SHIPPED: 'enviado',
    DELIVERED: 'entregado',
    CANCELLED: 'cancelado',
} as const;

// Roles de usuario (basado en database.types)
export const USER_ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    DRIVER: 'driver',
} as const;
