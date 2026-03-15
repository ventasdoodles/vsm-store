// Tipos de cliente/perfil - VSM Store

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AccountStatus = 'active' | 'suspended' | 'banned';

/**
 * Perfil del cliente autenticado (tabla customer_profiles).
 * Fuente de verdad para el storefront; AuthContext la consume.
 */
export interface IAContext {
    last_query?: string;
    last_intent?: string;
    persona_cluster?: string;
    visual_theme_hint?: 'vape' | 'herbal' | 'neutral';
    propensity_score?: number;
    updated_at?: string;
}

export interface AIPreferences {
    preferred_styles?: string[];
    interests?: string[];
    visual_theme_hint?: 'vape' | 'herbal' | 'neutral';
    personality_notes?: string;
}

export interface CustomerProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    birthdate: string | null;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    account_status: AccountStatus;
    suspension_end: string | null;
    total_orders: number;
    total_spent: number;
    avatar_url: string | null;
    favorite_category_id: string | null;
    points: number;
    referral_code: string | null;
    referred_by: string | null;
    /** Preferencias cognitivas extraídas por la IA (ej: sabores, estética, tono) */
    ai_preferences: AIPreferences | null;
    /** Contexto persistente crudo de la IA para futuras interacciones */
    ia_context: IAContext | null;
    segment?: 'Prospecto' | 'Campeón' | 'Leal' | 'En Riesgo' | 'Casi Perdido' | 'Nuevo' | 'Regular';
    health_status?: string;
    last_interactions?: unknown[];
    created_at: string;
    updated_at: string;
}
