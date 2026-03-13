// ─── Admin Categories Service ────────────────────
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';

export interface CategoryFormData {
    name: string;
    slug: string;
    section: Section;
    parent_id: string | null;
    is_active: boolean;
    description?: string;
    image_url?: string | null;
    is_popular?: boolean;
    order_index?: number;
}

export async function getAllCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, section, parent_id, is_active, description, image_url, is_popular, order_index, created_at')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

    if (error) throw error;
    return (data as Category[]) ?? [];
}

export async function createCategory(category: CategoryFormData) {
    const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

    if (error) throw error;
    return data as Category;
}

export async function updateCategory(id: string, category: Partial<CategoryFormData>) {
    const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Category;
}

/**
 * Elimina una categoría de forma permanente.
 * El trigger trg_category_delete_protect en la DB se encarga de:
 *   - Mover los productos huérfanos a "Sin Categoría" (misma sección)
 *   - Re-parentear las categorías hijas al abuelo
 *   - Bloquear la eliminación de la categoría de respaldo
 */
export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function toggleCategoryActive(id: string, flag: boolean) {
    const { error } = await supabase
        .from('categories')
        .update({ is_active: flag })
        .eq('id', id);

    if (error) throw error;
}
