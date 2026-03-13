// ─── Admin Products Service ──────────────────────
import { supabase } from '@/lib/supabase';

import type { Section, ProductStatus } from '@/types/constants';
import type { ProductVariant } from '@/types/variant';

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
    status: ProductStatus;
    images: string[];
    cover_image: string | null;
    is_featured: boolean;
    is_featured_until: string | null;
    is_new: boolean;

    is_new_until: string | null;
    is_bestseller: boolean;
    variants?: ProductVariant[];
    is_bestseller_until: string | null;
    is_active: boolean;
}

export async function getAllProducts() {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, slug, description, short_description, price, compare_at_price, 
            stock, sku, section, category_id, status, tags, images, cover_image, 
            is_featured, is_featured_until, is_new, is_new_until, 
            is_bestseller, is_bestseller_until, is_active, created_at, updated_at
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * AI Product Intelligence — "Magic Pencil"
 * Genera copys, descripciones y sugerencias de SEO para un producto.
 */
export async function generateProductCopy(name: string, currentDesc?: string): Promise<{ description: string; short_description: string; tags: string[] }> {
    try {
        const { data, error } = await supabase.functions.invoke('product-intelligence', {
            body: { name, description: currentDesc, action: 'generate_copy' }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error generating product copy:', error);
        }
        throw error;
    }
}

export async function createProduct(product: ProductFormData) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select('id, name, slug, price, stock, sku, section, category_id, is_active')
        .single();

    if (error) throw error;
    return data;
}

export async function updateProduct(id: string, product: Partial<ProductFormData>) {
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select('id, name, slug, price, stock, sku, section, category_id, is_active')
        .single();

    if (error) throw error;
    return data;
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
        .select(`
            id, name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, cover_image, is_featured, is_featured_until, is_new, is_new_until, is_bestseller, is_bestseller_until, is_active, created_at, updated_at,
            variants:product_variants(
                id, product_id, sku, price, stock, images, is_active, created_at, updated_at,
                options:product_variant_options(
                    variant_id, attribute_value_id,
                    attribute_value:product_attribute_values(
                        id, attribute_id, value,
                        attribute:product_attributes(name)
                    )
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;

    // Aplanamiento opcional de opciones para la UI
    interface VariantOptionRoot {
        options?: { attribute_value?: { attribute?: { name?: string } } }[];
        [key: string]: unknown;
    }

    if (data?.variants) {
        data.variants = ((data.variants as unknown as VariantOptionRoot[]).map((v) => ({
            ...v,
            options: v.options?.map((opt) => ({
                ...opt,
                attribute_name: opt.attribute_value?.attribute?.name
            }))
        }))) as unknown as typeof data.variants;
    }

    return data;
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
        if (import.meta.env.DEV) {
            console.error('Error uploading image to Supabase:', error);
        }
        throw error;
    }

    // Obtener la URL pública de la imagen usando el método getPublicUrl
    const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

/**
 * Actualiza múltiples productos en un solo bloque.
 * Optimizado para el Batch Manager.
 */
export async function bulkUpdateProducts(updates: { id: string; updates: Partial<ProductFormData> }[]) {
    try {
        // Enfoque: Transacción tipo Promise.all para actualizaciones individuales
        // Supabase no tiene una sintaxis de "bulk update with different values per row" nativa fácil
        // más allá de usar RPC, así que usamos Promise.all para mayor simplicidad y claridad tipada.
        const results = await Promise.all(
            updates.map(u => 
                supabase.from('products').update(u.updates).eq('id', u.id).select('id').single()
            )
        );

        const errors = results.filter(r => r.error).map(r => r.error);
        if (errors.length > 0) throw errors[0];

        return results.map(r => r.data);
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error in bulkUpdateProducts:', error);
        }
        throw error;
    }
}
