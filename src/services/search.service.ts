// Servicio de búsqueda de productos - VSM Store
import { supabase } from '@/lib/supabase';
import type { Product, Section } from '@/types/product';

interface SearchOptions {
    section?: Section;
    limit?: number;
}

/**
 * Busca productos por nombre, descripción y tags
 * Usa .ilike() para búsqueda case-insensitive
 */
export async function searchProducts(
    query: string,
    options: SearchOptions = {}
): Promise<Product[]> {
    const { section, limit = 20 } = options;

    try {
        const pattern = `%${query}%`;

        let dbQuery = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'active')
            .or(`name.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern}`)
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

        return (data as Product[]) ?? [];
    } catch (err) {
        console.error('[search.service] searchProducts:', err);
        throw err;
    }
}
