import { supabase } from '@/lib/supabase';

export interface Brand {
    id: string;
    name: string;
    logo_url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export async function getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) throw error;
    return data as Brand[];
}

export async function getActiveBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) throw error;
    return data as Brand[];
}

export async function createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
    const { data, error } = await supabase
        .from('brands')
        .insert([brand])
        .select()
        .single();

    if (error) throw error;
    return data as Brand;
}

export async function updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Brand;
}

export async function deleteBrand(id: string): Promise<void> {
    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function duplicateBrand(id: string): Promise<Brand> {
    // 1. Fetch original
    const { data: original, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();
    
    if (fetchError) throw fetchError;

    // 2. Create copy
    const { id: _id, created_at, updated_at, name, ...rest } = original;
    const { data: newBrand, error: insertError } = await supabase
        .from('brands')
        .insert([{
            ...rest,
            name: `${name} (Copia)`
        }])
        .select()
        .single();

    if (insertError) throw insertError;
    return newBrand as Brand;
}

export async function uploadBrandLogo(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(filePath);

    return publicUrl;
}
