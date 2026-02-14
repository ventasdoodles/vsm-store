// Servicio de productos - VSM Store
// Consultas a Supabase para la tabla products
import { supabase } from '@/lib/supabase';
import type { Product, Section } from '@/types/product';

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

        // Apply pagination only when no filter (filters usually return small sets)
        if (!filter) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }

        return (data as Product[]) ?? [];
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

        return data as Product;
    } catch (err) {
        console.error('[products.service] getProductBySlug:', err);
        throw err;
    }
}
