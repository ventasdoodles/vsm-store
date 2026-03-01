// Admin service para testimonios — VSM Store
// CRUD completo para la tabla testimonials

import { supabase } from '@/lib/supabase';
import type { Testimonial, TestimonialInsert, TestimonialUpdate } from '@/types/testimonial';

export type { Testimonial, TestimonialInsert, TestimonialUpdate };

export interface TestimonialFormData {
    customer_name: string;
    customer_location: string;
    avatar_url: string;
    rating: number;
    title: string;
    body: string;
    section: string;
    category_id: string;
    product_id: string;
    verified_purchase: boolean;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
    review_date: string;
}

/**
 * Obtiene todos los testimonios (incluidos inactivos) para el admin.
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Testimonial[];
}

/**
 * Crea un nuevo testimonio.
 */
export async function createTestimonial(formData: TestimonialFormData): Promise<Testimonial> {
    const insert = cleanFormData(formData);

    const { data, error } = await supabase
        .from('testimonials')
        .insert(insert)
        .select()
        .single();

    if (error) throw error;
    return data as Testimonial;
}

/**
 * Actualiza un testimonio existente.
 */
export async function updateTestimonial(
    id: string,
    formData: Partial<TestimonialFormData>,
): Promise<Testimonial> {
    const update = cleanFormData(formData);

    const { data, error } = await supabase
        .from('testimonials')
        .update(update)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Testimonial;
}

/**
 * Elimina (soft-delete) un testimonio.
 */
export async function deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
        .from('testimonials')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Toggle featured status.
 */
export async function toggleTestimonialFeatured(id: string, featured: boolean): Promise<void> {
    const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: featured })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Toggle active status.
 */
export async function toggleTestimonialActive(id: string, active: boolean): Promise<void> {
    const { error } = await supabase
        .from('testimonials')
        .update({ is_active: active })
        .eq('id', id);

    if (error) throw error;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Limpia form data: convierte strings vacíos a null para campos opcionales */
function cleanFormData(
    formData: Partial<TestimonialFormData>,
): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(formData)) {
        if (value === '' || value === undefined) {
            // Campos opcionales → null
            if (['avatar_url', 'title', 'customer_location', 'section', 'category_id', 'product_id'].includes(key)) {
                cleaned[key] = null;
            }
            // No incluir campos vacíos que son required
        } else {
            cleaned[key] = value;
        }
    }

    return cleaned;
}
