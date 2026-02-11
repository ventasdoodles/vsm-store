// Hooks de React Query para categorías - VSM Store
import { useQuery } from '@tanstack/react-query';
import {
    getCategories,
    getCategoriesWithChildren,
    getCategoryBySlug,
} from '@/services/categories.service';
import type { Section } from '@/types/product';

/**
 * Hook para obtener categorías con filtro opcional de sección
 */
export function useCategories(section?: Section) {
    return useQuery({
        queryKey: ['categories', section],
        queryFn: () => getCategories(section),
    });
}

/**
 * Hook para obtener categorías raíz con subcategorías anidadas
 */
export function useCategoriesWithChildren(section?: Section) {
    return useQuery({
        queryKey: ['categories', 'withChildren', section],
        queryFn: () => getCategoriesWithChildren(section),
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
    });
}
