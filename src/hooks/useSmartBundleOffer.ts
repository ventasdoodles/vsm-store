/**
 * // ─── HOOK: useSmartBundleOffer ───
 * // Arquitectura: Custom Hook
 * // Propósito central: Obtener la oferta dinámica de Bundle basada en los items del carrito.
 * // Cumple con regla §1.1.
 */
import { useQuery } from '@tanstack/react-query';
import { getSmartBundleOffer } from '@/services';
import type { Product } from '@/types/product';

export function useSmartBundleOffer(product: Product | undefined, subtotal: number) {
    return useQuery({
        queryKey: ['smart-bundle-offer', product?.id, subtotal],
        queryFn: async () => {
            if (!product) return null;
            return await getSmartBundleOffer(product, subtotal);
        },
        enabled: !!product,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché para bundles
    });
}
