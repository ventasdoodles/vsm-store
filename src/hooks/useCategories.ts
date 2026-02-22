// Hooks de React Query para categorías - VSM Store
import { useQuery } from '@tanstack/react-query';
import {
    getCategories,
    getCategoriesWithChildren,
    getCategoryBySlug,
    getCategoryById,
} from '@/services/categories.service';
import type { Section } from '@/types/constants';

// Categorías: staleTime=10min (estructura casi nunca cambia)
const CATEGORIES_STALE_TIME = 1000 * 60 * 10;

/**
 * Hook para obtener categorías con filtro opcional de sección
 */
export function useCategories(section?: Section) {
    return useQuery({
        queryKey: ['categories', section],
        queryFn: () => getCategories(section),
        staleTime: CATEGORIES_STALE_TIME,
    });
}

/**
 * Hook para obtener categorías raíz con subcategorías anidadas
 */
export function useCategoriesWithChildren(section?: Section) {
    return useQuery({
        queryKey: ['categories', 'withChildren', section],
        queryFn: () => getCategoriesWithChildren(section),
        staleTime: CATEGORIES_STALE_TIME,
    });
}

/**
 * Hook para obtener una categoría por slug y sección
 */
export function useCategoryBySlug(slug: string, section: Section) {
    return useQuery({
        queryKey: ['categories', 'detail', section, slug],
        queryFn: () => getCategoryBySlug(slug, section),
        enabled: !!slug && !!section,
        staleTime: CATEGORIES_STALE_TIME,
    });
}

/**
 * Hook para obtener una categoría por ID
 */
export function useCategoryById(id?: string) {
    return useQuery({
        queryKey: ['categories', 'byId', id],
        queryFn: () => getCategoryById(id!),
        enabled: !!id,
        staleTime: CATEGORIES_STALE_TIME,
    });
}
