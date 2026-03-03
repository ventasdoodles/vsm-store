import { useQuery } from '@tanstack/react-query';
import { getPublicBrands } from '@/services/brands.service';

export type { PublicBrand } from '@/services/brands.service';

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
