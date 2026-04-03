import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resolveStorefrontCartDependencyOffer } from '@/services/storefront-cart-audit.service';
import type { CartItem } from '@/types/cart';

export function useStorefrontCartDependencyOffer(items: CartItem[]) {
    const productIds = useMemo(
        () => [...new Set(items.map((item) => item.product.id).filter((value) => typeof value === 'string' && value.length > 0))].sort(),
        [items],
    );

    return useQuery({
        queryKey: ['storefront-cart-dependency-offer', productIds],
        queryFn: async () => {
            if (productIds.length === 0) return null;
            return await resolveStorefrontCartDependencyOffer(productIds);
        },
        enabled: productIds.length > 0,
        staleTime: 1000 * 60,
    });
}
