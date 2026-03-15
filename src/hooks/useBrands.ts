/**
 * useBrands - VSM Store
 * 
 * Custom hook para la lógica y gestión de Brands.
 * @module hooks/useBrands
 */

import { useQuery } from '@tanstack/react-query';
import { getPublicBrands } from '@/services';

export type { PublicBrand } from '@/services';

/**
 * Hook para obtener marcas activas.
 * Cachea con TanStack Query (staleTime: 5 min).
 */
export function useBrands() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: getPublicBrands,
        staleTime: 1000 * 60 * 5,
    });
}
