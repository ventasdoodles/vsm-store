// Constantes de dominio - VSM Store
// Single source of truth para valores que aparecen en múltiples archivos

export const SECTIONS = {
    VAPE: 'vape',
    CANNABIS: '420',
} as const;

export type Section = typeof SECTIONS[keyof typeof SECTIONS];

export const PRODUCT_STATUS = {
    ACTIVE: 'active',
    LEGACY: 'legacy',
    DISCONTINUED: 'discontinued',
    COMING_SOON: 'coming_soon',
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
