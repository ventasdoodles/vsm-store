// Servicio de testimonios (storefront) - VSM Store
// Consultas públicas a Supabase para la tabla testimonials

import { supabase } from '@/lib/supabase';
import type { Testimonial } from '@/types/testimonial';
import type { Section } from '@/types/constants';

interface GetTestimonialsOptions {
    section?: Section | null;
    categoryId?: string | null;
    productId?: string | null;
    featured?: boolean;
    limit?: number;
}

/**
 * Obtiene testimonios activos con filtros de contexto.
 * Lógica de prioridad:
 *   1. Testimonios que coinciden con product_id (si se pasa)
 *   2. Testimonios que coinciden con category_id
 *   3. Testimonios que coinciden con section
 *   4. Testimonios generales (section = null)
 * Si no hay suficientes del contexto específico, rellena con generales.
 */
export async function getTestimonials(
    options: GetTestimonialsOptions = {},
): Promise<Testimonial[]> {
    const { section, categoryId, productId, featured, limit = 12 } = options;

    try {
        let query = supabase
            .from('testimonials')
            .select('id, customer_name, customer_location, avatar_url, rating, title, body, section, category_id, product_id, verified_purchase, is_featured, is_active, sort_order, review_date, created_at, updated_at')
            .eq('is_active', true)
            .order('is_featured', { ascending: false })
            .order('sort_order', { ascending: true })
            .order('review_date', { ascending: false })
            .limit(limit);

        if (featured) {
            query = query.eq('is_featured', true);
        }

        // Filtro por contexto: section OR null (generales aplican siempre)
        if (section) {
            query = query.or(`section.eq.${section},section.is.null`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) return [];

        // Ordenar por relevancia de contexto
        return sortByRelevance(data as Testimonial[], { productId, categoryId, section });
    } catch (err) {
        console.error('[testimonials.service] getTestimonials error:', err);
        return [];
    }
}

/**
 * Obtiene solo los testimonios destacados (para homepage hero / badges).
 */
export async function getFeaturedTestimonials(limit = 6): Promise<Testimonial[]> {
    return getTestimonials({ featured: true, limit });
}

/**
 * Calcula estadísticas agregadas de testimonios.
 */
export async function getTestimonialsStats(): Promise<{
    count: number;
    avgRating: number;
}> {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('rating')
            .eq('is_active', true);

        if (error) throw error;
        if (!data || data.length === 0) return { count: 0, avgRating: 0 };

        const sum = data.reduce((acc, t) => acc + t.rating, 0);
        return {
            count: data.length,
            avgRating: parseFloat((sum / data.length).toFixed(1)),
        };
    } catch (err) {
        console.error('[testimonials.service] getStats error:', err);
        return { count: 0, avgRating: 0 };
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Ordena testimonios poniendo los más relevantes al contexto actual primero.
 */
function sortByRelevance(
    testimonials: Testimonial[],
    context: { productId?: string | null; categoryId?: string | null; section?: Section | null },
): Testimonial[] {
    const { productId, categoryId, section } = context;

    return [...testimonials].sort((a, b) => {
        const scoreA = getRelevanceScore(a, productId, categoryId, section);
        const scoreB = getRelevanceScore(b, productId, categoryId, section);
        // Mayor score = más relevante = va primero
        if (scoreB !== scoreA) return scoreB - scoreA;
        // Si empatan en relevancia, featured primero
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        // Luego por sort_order
        return a.sort_order - b.sort_order;
    });
}

function getRelevanceScore(
    t: Testimonial,
    productId?: string | null,
    categoryId?: string | null,
    section?: Section | null,
): number {
    let score = 0;
    if (productId && t.product_id === productId) score += 100;
    if (categoryId && t.category_id === categoryId) score += 50;
    if (section && t.section === section) score += 20;
    if (t.verified_purchase) score += 10;
    if (t.is_featured) score += 5;
    return score;
}
