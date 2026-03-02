/**
 * // ─── TIPOS: Settings Module ───
 * // Arquitectura: Shared Types
 * // Proposito principal: Interfaces tipadas compartidas por todos los Lego components del modulo
 *    de configuracion. Elimina `any` y centraliza la forma del formulario.
 * // Regla / Notas: Importar LoyaltyConfig del servicio para mantener single source of truth.
 */
import type { LoyaltyConfig } from '@/services/settings.service';

/** Forma completa del formulario de configuracion */
export interface SettingsFormData {
    site_name: string;
    description: string;
    whatsapp_number: string;
    whatsapp_default_message: string;
    social_links: {
        facebook: string;
        instagram: string;
        youtube: string;
        tiktok: string;
    };
    location_address: string;
    location_city: string;
    location_map_url: string;
    bank_account_info: string;
    payment_methods: {
        transfer: boolean;
        mercadopago: boolean;
        cash: boolean;
    };
    loyalty_config: LoyaltyConfig;
}

/** Handler generico para inputs del formulario */
export type SettingsChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => void;
