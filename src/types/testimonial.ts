// Tipos para testimonios/reseñas - VSM Store

import type { Section } from '@/types/constants';

export interface Testimonial {
    id: string;
    customer_name: string;
    customer_location: string | null;
    avatar_url: string | null;
    rating: number;
    title: string | null;
    body: string;
    section: Section | null;
    category_id: string | null;
    product_id: string | null;
    verified_purchase: boolean;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
    review_date: string;
    created_at: string;
    updated_at: string;
}

export type TestimonialInsert = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'> & {
    /** Campos con defaults en DB — opcionales al insertar */
    verified_purchase?: boolean;
    is_featured?: boolean;
    is_active?: boolean;
    sort_order?: number;
};
export type TestimonialUpdate = Partial<TestimonialInsert>;
