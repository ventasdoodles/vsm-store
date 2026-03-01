import { supabase } from '@/lib/supabase';

export interface PublicBrand {
    id: string;
    name: string;
    logo_url: string;
}

export async function getPublicBrands(): Promise<PublicBrand[]> {
    const { data, error } = await supabase
        .from('brands')
        .select('id, name, logo_url')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) throw error;
    return data as PublicBrand[];
}
