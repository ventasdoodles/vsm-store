// Tipos de cliente/perfil - VSM Store

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AccountStatus = 'active' | 'suspended' | 'banned';

/**
 * Perfil del cliente autenticado (tabla customer_profiles).
 * Fuente de verdad para el storefront; AuthContext la consume.
 */
export interface CustomerProfile {
    id: string;
    full_name: string;
    phone: string | null;
    whatsapp: string | null;
    birthdate: string | null;
    customer_tier: CustomerTier;
    account_status: AccountStatus;
    suspension_end: string | null;
    total_orders: number;
    total_spent: number;
    avatar_url: string | null;
    favorite_category_id: string | null;
    referral_code: string | null;
    created_at: string;
    updated_at: string;
}
