// Servicio de búsqueda de productos - VSM Store
/**
 * Search Service — VSM Store
 *
 * Servicio core para la búsqueda de productos en la base de datos.
 * Implementa filtros por sección y límites de resultados.
 *
 * @author VSM Store
 * @version 1.0.1
 */
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

interface SearchOptions {
    section?: Section;
    limit?: number;
}

/**
 * Busca productos por múltiples campos (nombre, descripción, tags, SKU)
 * 
 * @param query — Término de búsqueda
 * @param options — Filtros opcionales (sección, límite)
 * @returns Lista de productos coincidentes
 */
export async function searchProducts(
    query: string,
    options: SearchOptions = {}
): Promise<Product[]> {
    const { section, limit = 20 } = options;

    if (!query.trim()) return [];

    try {
        // Escape special ILIKE chars (% and _) in user input
        const escaped = query.replace(/%/g, '\\%').replace(/_/g, '\\_');
        const pattern = `%${escaped}%`;

        let dbQuery = supabase
            .from('products')
            .select(`
                id, name, slug, description, short_description, price, compare_at_price, 
                stock, sku, section, category_id, tags, status, images, cover_image, 
                is_featured, is_featured_until, is_new, is_new_until, is_bestseller, 
                is_bestseller_until, is_active, created_at, updated_at
            `)
            .eq('is_active', true)
            .eq('status', 'active');

        // Búsqueda multi-campo incluyendo SKU
        dbQuery = dbQuery.or(`name.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern},sku.ilike.${pattern},tags.cs.{${query}}`);

        dbQuery = dbQuery
            .order('is_featured', { ascending: false })
            .order('name', { ascending: true })
            .limit(limit);

        if (section) {
            dbQuery = dbQuery.eq('section', section);
        }

        const { data, error } = await dbQuery;

        if (error) {
            throw new Error(`Error al buscar productos: ${error.message}`);
        }

        return data ?? [];
    } catch (err) {
        console.error('[search.service] searchProducts:', err);
        throw err;
    }
}
