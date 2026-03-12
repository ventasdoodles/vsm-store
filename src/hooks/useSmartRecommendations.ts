/**
 * // ─── HOOK: useSmartRecommendations ───
 * // Arquitectura: Custom Hook
 * // Propósito central: Obtener productos relacionados basados en IA y comportamiento.
 * // Cumple con regla §1.1.
 */
import { useQuery } from '@tanstack/react-query';
import { getSmartRecommendations } from '@/services/products.service';
import type { Product } from '@/types/product';

export function useSmartRecommendations(product: Product | undefined, limit = 4) {
    return useQuery<Product[]>({
        queryKey: ['smart-recommendations', product?.id, limit],
        queryFn: async () => {
            if (!product) return [];
            return await getSmartRecommendations(product, limit);
        },
        enabled: !!product,
        staleTime: 1000 * 60 * 15, // 15 minutos de caché para recomendaciones estáticas
    });
}
