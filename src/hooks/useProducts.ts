// Hooks de React Query para productos - VSM Store
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
    getProducts,
    getFeaturedProducts,
    getProductBySlug,
    getNewProducts,
    getBestsellerProducts,
    getRecentProducts,
    getDiscountedProducts,
} from '@/services';
import type { Section } from '@/types/constants';

// Productos: staleTime=2min (inventario/stock cambia frecuentemente)
const PRODUCTS_STALE_TIME = 1000 * 60 * 2;
// Detalle: staleTime=1min (necesita datos más frescos para checkout)
const PRODUCT_DETAIL_STALE_TIME = 1000 * 60;

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
        staleTime: PRODUCTS_STALE_TIME,
        placeholderData: keepPreviousData,
    });
}

/**
 * Hook para obtener productos destacados
 */
export function useFeaturedProducts(section?: Section) {
    return useQuery({
        queryKey: ['products', 'featured', section],
        queryFn: () => getFeaturedProducts(section),
        staleTime: PRODUCTS_STALE_TIME,
        placeholderData: keepPreviousData,
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
        staleTime: PRODUCT_DETAIL_STALE_TIME,
    });
}

/**
 * Hook para obtener productos nuevos
 */
export function useNewProducts(section?: Section) {
    return useQuery({
        queryKey: ['products', 'new', section],
        queryFn: () => getNewProducts(section),
        staleTime: PRODUCTS_STALE_TIME,
    });
}

/**
 * Hook para obtener productos bestseller
 */
export function useBestsellerProducts(options?: { section?: Section; limit?: number }) {
    return useQuery({
        queryKey: ['products', 'bestseller', options?.section, options?.limit],
        queryFn: () => getBestsellerProducts(options),
        staleTime: PRODUCTS_STALE_TIME,
    });
}

/**
 * Hook para obtener productos recientes (últimos 14 días)
 */
export function useRecentProducts(limit: number = 20) {
    return useQuery({
        queryKey: ['products', 'recent', limit],
        queryFn: () => getRecentProducts(limit),
        staleTime: PRODUCTS_STALE_TIME,
    });
}

/**
 * Hook para obtener productos con descuento
 */
export function useDiscountedProducts(limit: number = 50) {
    return useQuery({
        queryKey: ['products', 'discounted', limit],
        queryFn: () => getDiscountedProducts(limit),
        staleTime: PRODUCTS_STALE_TIME,
    });
}

