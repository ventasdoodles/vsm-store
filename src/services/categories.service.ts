// Servicio de categorías - VSM Store
// Consultas a Supabase para la tabla categories
import { supabase } from '@/lib/supabase';
import type { Category, CategoryWithChildren } from '@/types/category';
import type { Section } from '@/types/product';

/**
 * Obtiene categorías con filtro opcional de sección
 */
export async function getCategories(section?: Section): Promise<Category[]> {
    try {
        let query = supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (section) {
            query = query.eq('section', section);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error al obtener categorías: ${error.message}`);
        }

        return (data as Category[]) ?? [];
    } catch (err) {
        console.error('[categories.service] getCategories:', err);
        throw err;
    }
}

/**
 * Obtiene categorías raíz (sin parent_id) con sus subcategorías anidadas
 */
export async function getCategoriesWithChildren(section?: Section): Promise<CategoryWithChildren[]> {
    try {
        const allCategories = await getCategories(section);

        // Separar raíz y subcategorías
        const rootCategories = allCategories.filter((c) => c.parent_id === null);
        const subCategories = allCategories.filter((c) => c.parent_id !== null);

        // Anidar subcategorías dentro de sus padres
        const categoriesWithChildren: CategoryWithChildren[] = rootCategories.map((root) => ({
            ...root,
            children: subCategories.filter((sub) => sub.parent_id === root.id),
        }));

        return categoriesWithChildren;
    } catch (err) {
        console.error('[categories.service] getCategoriesWithChildren:', err);
        throw err;
    }
}

/**
 * Obtiene una categoría por slug y sección
 */
export async function getCategoryBySlug(slug: string, section: Section): Promise<Category | null> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .eq('section', section)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No encontrada
            throw new Error(`Error al obtener categoría: ${error.message}`);
        }

        return data as Category;
    } catch (err) {
        console.error('[categories.service] getCategoryBySlug:', err);
        throw err;
    }
}

/**
 * Obtiene una categoría por ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error al obtener categoría: ${error.message}`);
        }

        return data as Category;
    } catch (err) {
        console.error('[categories.service] getCategoryById:', err);
        throw err;
    }
}
