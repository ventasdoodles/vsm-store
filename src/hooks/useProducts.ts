// Hooks de React Query para productos - VSM Store
import { useQuery } from '@tanstack/react-query';
import {
    getProducts,
    getFeaturedProducts,
    getProductBySlug,
    getNewProducts,
    getBestsellerProducts,
} from '@/services/products.service';
import type { Section } from '@/types/constants';

/**
 * Hook para obtener productos con filtros opcionales
 */
export function useProducts(options?: {
    section?: Section;
    categoryId?: string | string[];
    limit?: number;
}) {
    return useQuery({
        queryKey: ['products', options?.section, options?.categoryId, options?.limit],
        queryFn: () => getProducts(options),
    });
}

/**
 * Hook para obtener productos destacados
 */
export function useFeaturedProducts(section?: Section) {
    return useQuery({
        queryKey: ['products', 'featured', section],
        queryFn: () => getFeaturedProducts(section),
    });
}

/**
 * Hook para obtener un producto por slug y sección
 */
export function useProductBySlug(slug: string, section: Section) {
    return useQuery({
        queryKey: ['products', 'detail', section, slug],
        queryFn: () => getProductBySlug(slug, section),
        enabled: !!slug && !!section,
    });
}

/**
 * Hook para obtener productos nuevos
 */
export function useNewProducts(section?: Section) {
    return useQuery({
        queryKey: ['products', 'new', section],
        queryFn: () => getNewProducts(section),
    });
}

/**
 * Hook para obtener productos bestseller
 */
export function useBestsellerProducts(section?: Section) {
    return useQuery({
        queryKey: ['products', 'bestseller', section],
        queryFn: () => getBestsellerProducts(section),
    });
}
