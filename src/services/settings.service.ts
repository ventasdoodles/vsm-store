/**
 * settings.service - VSM Store
 * 
 * Servicio para la lógica y gestión de settings.
 * @module services/settings.service
 */

import { supabase } from '@/lib/supabase';

export interface HeroSlider {
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    image?: string;
    tag?: string;
    ctaText: string;
    ctaLink: string;
    bgGradient: string;
    bgGradientLight: string;
    active: boolean;
    order?: number;
}

export interface FeaturedCategory {
    id: string; // Slot '1', '2', '3', '4'
    name: string; // e.g. "Líquidos"
    slug: string; // e.g. "liquidos"
    section: 'vape' | '420';
    iconName: string; // e.g. "Flame"
    image: string;
    presetId: string; // e.g. "orange-red"
}

export interface LoyaltyTier {
    id: 'bronze' | 'silver' | 'gold' | 'platinum';
    name: string;
    threshold: number;
    multiplier: number;
    color: string;
    benefits: string[];
}

export interface LoyaltyConfig {
    points_per_currency: number;
    currency_per_point: number;
    min_points_to_redeem: number;
    max_points_per_order: number;
    points_expiry_days: number;
    enable_loyalty: boolean;
}

export interface StoreSettings {
    id: number;
    site_name: string;
    description: string | null;
    logo_url: string | null;
    whatsapp_number: string;
    whatsapp_default_message: string | null;
    social_links: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    } | null;
    location_address: string | null;
    location_city: string | null;
    location_map_url: string | null;
    bank_account_info: string | null;
    payment_methods: {
        transfer: boolean;
        mercadopago: boolean;
        cash: boolean;
    } | null;
    hero_sliders: HeroSlider[] | null;
    featured_categories: FeaturedCategory[] | null;
    loyalty_config: LoyaltyConfig | null;
    loyalty_tiers_config: LoyaltyTier[] | null;
    flash_deals_end: string | null;  // ISO timestamp — hora de fin de ofertas flash
}

export async function uploadSliderImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('slider-images')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('slider-images')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function getStoreSettings() {
    const { data, error } = await supabase
        .from('store_settings')
        .select('id, site_name, description, logo_url, whatsapp_number, whatsapp_default_message, social_links, location_address, location_city, location_map_url, bank_account_info, payment_methods, hero_sliders, featured_categories, loyalty_config, loyalty_tiers_config, flash_deals_end')
        .eq('id', 1)
        .single();

    if (error) {
        // If table doesn't exist or row missing, return null or throw
        console.warn('Error fetching store settings:', error);
        return null;
    }

    return data as StoreSettings;
}

export async function updateStoreSettings(settings: Partial<StoreSettings>) {
    // Strip id from payload — it's the primary key used in the WHERE, not a column to update
    const { ...payload } = settings;
    delete payload.id;
    const { data, error } = await supabase
        .from('store_settings')
        .update(payload)
        .eq('id', 1)
        .select()
        .single();

    if (error) throw error;
    return data as StoreSettings;
}
