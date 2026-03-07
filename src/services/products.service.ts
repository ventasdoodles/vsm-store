// Servicio de productos - VSM Store
// Consultas a Supabase para la tabla products
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

interface GetProductsOptions {
    section?: Section;
    categoryId?: string | string[];
    limit?: number;
    offset?: number;
    filter?: 'featured' | 'new' | 'bestseller';
}

/**
 * Obtiene productos con filtros opcionales
 */
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    const { section, categoryId, limit = 50, offset = 0, filter } = options;

    try {
        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'active')
            .gt('stock', 0) // Hide out-of-stock from storefront
            .order('created_at', { ascending: false });

        // Apply filter
        if (filter === 'featured') query = query.eq('is_featured', true);
        if (filter === 'new') query = query.eq('is_new', true);
        if (filter === 'bestseller') query = query.eq('is_bestseller', true);

        // Apply section
        if (section) query = query.eq('section', section);

        // Apply category
        if (categoryId) {
            if (Array.isArray(categoryId)) {
                query = query.in('category_id', categoryId);
            } else {
                query = query.eq('category_id', categoryId);
            }
        }

        // Apply pagination (always limit to prevent fetching entire table)
        if (!filter) {
            query = query.range(offset, offset + limit - 1);
        } else {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }

        return data ?? [];
    } catch (err) {
        console.error('[products.service] getProducts:', err);
        throw err;
    }
}

/**
 * Obtiene productos destacados (is_featured = true)
 */
export async function getFeaturedProducts(section?: Section): Promise<Product[]> {
    return getProducts({ section, filter: 'featured' });
}

/**
 * Obtiene productos nuevos (is_new = true)
 */
export async function getNewProducts(section?: Section): Promise<Product[]> {
    return getProducts({ section, filter: 'new' });
}

/**
 * Obtiene productos bestseller (is_bestseller = true)
 */
export async function getBestsellerProducts(section?: Section): Promise<Product[]> {
    return getProducts({ section, filter: 'bestseller' });
}

/**
 * Obtiene un producto por slug y sección
 */
export async function getProductBySlug(slug: string, section: Section): Promise<Product | null> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('slug', slug)
            .eq('section', section)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No encontrado
            throw new Error(`Error al obtener producto: ${error.message}`);
        }

        return data;
    } catch (err) {
        console.error('[products.service] getProductBySlug:', err);
        throw err;
    }
}

/**
 * Obtiene productos por sus IDs (para validación del carrito).
 * Retorna todos los productos que coincidan — el llamador filtra is_active/stock.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', ids);

        if (error) throw error;
        return data ?? [];
    } catch (err) {
        console.error('[products.service] getProductsByIds:', err);
        throw err;
    }
}

/**
 * Busca productos por nombre o descripción (Live Search)
 */
export async function searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) return [];

    try {
        // Escape special ILIKE chars (% and _) to prevent filter injection
        const escaped = query.replace(/%/g, '\\%').replace(/_/g, '\\_');
        const pattern = `%${escaped}%`;

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'active')
            .gt('stock', 0) // Only show available products
            .or(`name.ilike.${pattern},short_description.ilike.${pattern}`)
            .limit(10);

        if (error) throw error;
        return data ?? [];
    } catch (err) {
        console.error('[products.service] searchProducts:', err);
        throw err;
    }
}
/**
 * Obtiene recomendaciones inteligentes basadas en lógica de compatibilidad (Smart Upselling)
 */
export async function getSmartRecommendations(product: Product, limit: number = 4): Promise<Product[]> {
    try {
        // 1. Obtener el slug de la categoría actual si no lo tenemos
        const { data: categoryData } = await supabase
            .from('categories')
            .select('slug')
            .eq('id', product.category_id)
            .single();

        if (!categoryData) return [];

        // 2. Obtener categorías compatibles del motor de lógica
        const { getCompatibleCategorySlugs } = await import('@/lib/upsell-logic');
        const compatibleSlugs = getCompatibleCategorySlugs(categoryData.slug);

        // Si no hay reglas, fallback a productos de la misma categoría
        if (compatibleSlugs.length === 0) {
            return getProducts({
                categoryId: product.category_id,
                section: product.section,
                limit: limit + 1
            }).then(pcs => pcs.filter(p => p.id !== product.id).slice(0, limit));
        }

        // 3. Obtener IDs de categorías compatibles
        const { data: categories } = await supabase
            .from('categories')
            .select('id')
            .in('slug', compatibleSlugs)
            .eq('section', product.section);

        const categoryIds = categories?.map(c => c.id) || [];

        // 4. Buscar productos en esas categorías
        const query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'active')
            .in('category_id', [...categoryIds, product.category_id]) // Incluir actual por si faltan complementos
            .neq('id', product.id)
            .gt('stock', 0)
            .order('is_bestseller', { ascending: false }) // Priorizar populares
            .limit(limit);

        const { data, error } = await query;

        if (error) throw error;
        return data ?? [];
    } catch (err) {
        console.error('[products.service] getSmartRecommendations:', err);
        return [];
    }
}
