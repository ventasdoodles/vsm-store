import { useCallback, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import {
    buildStorefrontOrderReorderPlan,
    getStorefrontOrderReorderFeedback,
    type StorefrontOrderReorderPlan,
} from '@/lib/domain/orders';
import { getProductsByIds } from '@/services/products.service';
import { useCartStore } from '@/stores/cart.store';
import type { OrderItem, OrderRecord } from '@/types/order';

interface ReorderableOrder {
    id: OrderRecord['id'];
    items: OrderItem[];
}

export function useAuthenticatedOrderReorder() {
    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);
    const notify = useNotification();
    const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

    const reorderOrder = useCallback(async (order: ReorderableOrder): Promise<StorefrontOrderReorderPlan | null> => {
        if (!order.id || reorderingOrderId) return null;

        try {
            setReorderingOrderId(order.id);

            const productIds = Array.from(
                new Set(
                    order.items
                        .map((item) => item.product_id)
                        .filter((productId): productId is string => Boolean(productId)),
                ),
            );

            const catalogProducts = await getProductsByIds(productIds);
            const plan = buildStorefrontOrderReorderPlan(order.items, catalogProducts, cartItems);

            for (const item of plan.addableItems) {
                addItem(item.product, item.quantityToAdd, item.variantToken);
            }

            if (plan.addedLineCount > 0) {
                openCart();
            }

            const feedback = getStorefrontOrderReorderFeedback(plan);
            notify[feedback.type](feedback.title, feedback.message);

            return plan;
        } catch {
            notify.error(
                'No se pudo reordenar',
                'No se pudo reconstruir este pedido contra el catalogo actual. Intenta de nuevo en unos momentos.',
            );
            return null;
        } finally {
            setReorderingOrderId(null);
        }
    }, [addItem, cartItems, notify, openCart, reorderingOrderId]);

    return {
        reorderOrder,
        reorderingOrderId,
    };
}
