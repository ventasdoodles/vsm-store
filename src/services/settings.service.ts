import { supabase } from '@/lib/supabase';

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
}

export async function getStoreSettings() {
    const { data, error } = await supabase
        .from('store_settings')
        .select('*')
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
    const { data, error } = await supabase
        .from('store_settings')
        .update(settings)
        .eq('id', 1)
        .select()
        .single();

    if (error) throw error;
    return data as StoreSettings;
}
