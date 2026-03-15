// Hooks de React Query para testimonios - VSM Store
import { useQuery } from '@tanstack/react-query';
import {
    getTestimonials,
    getFeaturedTestimonials,
    getTestimonialsStats,
} from '@/services';
import type { Section } from '@/types/constants';

// Testimonios: staleTime=5min (no cambian frecuentemente)
const TESTIMONIALS_STALE_TIME = 1000 * 60 * 5;

/**
 * Hook principal: testimonios con contexto.
 * Filtra por sección/categoría/producto según lo que navega el usuario.
 */
export function useTestimonials(options?: {
    section?: Section | null;
    categoryId?: string | null;
    productId?: string | null;
    limit?: number;
}) {
    return useQuery({
        queryKey: [
            'testimonials',
            options?.section ?? 'all',
            options?.categoryId ?? 'all',
            options?.productId ?? 'all',
            options?.limit,
        ],
        queryFn: () =>
            getTestimonials({
                section: options?.section,
                categoryId: options?.categoryId,
                productId: options?.productId,
                limit: options?.limit,
            }),
        staleTime: TESTIMONIALS_STALE_TIME,
    });
}

/**
 * Hook para testimonios destacados (homepage).
 */
export function useFeaturedTestimonials(limit = 6) {
    return useQuery({
        queryKey: ['testimonials', 'featured', limit],
        queryFn: () => getFeaturedTestimonials(limit),
        staleTime: TESTIMONIALS_STALE_TIME,
    });
}

/**
 * Hook para estadísticas de testimonios.
 */
export function useTestimonialsStats() {
    return useQuery({
        queryKey: ['testimonials', 'stats'],
        queryFn: getTestimonialsStats,
        staleTime: TESTIMONIALS_STALE_TIME,
    });
}
