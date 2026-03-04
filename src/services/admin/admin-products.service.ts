// ─── Admin Products Service ──────────────────────
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

export interface ProductFormData {
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    sku: string;
    section: Section;
    category_id: string;
    tags: string[];
    status: string;
    images: string[];
    cover_image: string | null;
    is_featured: boolean;
    is_featured_until: string | null;
    is_new: boolean;
    is_new_until: string | null;
    is_bestseller: boolean;
    is_bestseller_until: string | null;
    is_active: boolean;
}

export async function getAllProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Product[]) ?? [];
}

export async function createProduct(product: ProductFormData) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

export async function updateProduct(id: string, product: Partial<ProductFormData>) {
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

export async function deleteProduct(id: string) {
    // Soft delete: marcar como inactivo
    const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

export async function toggleProductFlag(id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', value: boolean) {
    const { error } = await supabase
        .from('products')
        .update({ [flag]: value })
        .eq('id', id);

    if (error) throw error;
}

export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Product;
}

/**
 * Sube una imagen al bucket público de productos en Supabase Storage
 * Genera un nombre único basado en timestamp para evitar colisiones.
 */
export async function uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `raw/${fileName}`;

    const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading image to Supabase:', error);
        throw error;
    }

    // Obtener la URL pública de la imagen usando el método getPublicUrl
    const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}
