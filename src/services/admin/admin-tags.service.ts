// ─── Admin Tags Service ─────────────────────────
import { supabase } from '@/lib/supabase';

export interface ProductTag {
    name: string;   // Clave primaria, lowercase (ej. "base-libre")
    label: string;  // Display label (ej. "Base Libre")
    created_at: string;
    product_count?: number; // Calculado en el frontend
}

// Obtener todos los tags con conteo de productos
export async function getAllTags(): Promise<ProductTag[]> {
    const [tagsRes, productsRes] = await Promise.all([
        supabase.from('product_tags').select('*').order('name'),
        supabase.from('products').select('tags'),
    ]);

    if (tagsRes.error) throw tagsRes.error;
    if (productsRes.error) throw productsRes.error;

    // Conteo de usos por tag (client-side, más eficiente que una RPC)
    const counts: Record<string, number> = {};
    for (const product of productsRes.data ?? []) {
        for (const tag of product.tags ?? []) {
            counts[tag] = (counts[tag] ?? 0) + 1;
        }
    }

    return (tagsRes.data ?? []).map(t => ({
        ...t,
        product_count: counts[t.name] ?? 0,
    }));
}

// Crear nuevo tag
export async function createTag(name: string, label: string): Promise<ProductTag> {
    const { data, error } = await supabase
        .from('product_tags')
        .insert({ name: name.toLowerCase().trim(), label: label.trim() })
        .select()
        .single();

    if (error) throw error;
    return data as ProductTag;
}

// Renombrar tag: actualiza product_tags Y todos los TEXT[] en products
export async function renameTag(oldName: string, newName: string, newLabel: string): Promise<void> {
    const { error } = await supabase.rpc('rename_product_tag', {
        old_name: oldName,
        new_name: newName.toLowerCase().trim(),
        new_label: newLabel.trim(),
    });

    if (error) throw error;
}

// Eliminar tag del catálogo (NO lo borra de products.tags — solo del catálogo)
export async function deleteTag(name: string): Promise<void> {
    const { error } = await supabase
        .from('product_tags')
        .delete()
        .eq('name', name);

    if (error) throw error;
}

// Obtener solo los nombres para autocompletar (ligero)
export async function getTagNames(): Promise<string[]> {
    const { data, error } = await supabase
        .from('product_tags')
        .select('name')
        .order('name');

    if (error) throw error;
    return (data ?? []).map(t => t.name);
}
