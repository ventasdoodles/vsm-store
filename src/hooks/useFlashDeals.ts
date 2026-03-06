/**
 * useFlashDeals — Hook para obtener ofertas relámpago activas.
 * 
 * @module useFlashDeals
 */
import { useQuery } from '@tanstack/react-query';
import { flashDealsService } from '@/services/flash-deals.service';

export function useFlashDeals() {
    return useQuery({
        queryKey: ['flash-deals', 'active'],
        queryFn: () => flashDealsService.getActiveDeals(),
        staleTime: 1000 * 60 * 5, // 5 minutos de cache
        refetchInterval: 1000 * 60, // Refrescar cada minuto para actualizar contadores
    });
}
