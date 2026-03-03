// Hooks de pedidos - VSM Store
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersService from '@/services/orders.service';
import type { CreateOrderData } from '@/types/order';

// Re-export types for consumers
export type { OrderRecord, OrderItem, CreateOrderData } from '@/types/order';
export { STOREFRONT_ORDER_STATUS as ORDER_STATUS } from '@/lib/domain/orders';
export type { StorefrontOrderStatus as OrderStatus } from '@/lib/domain/orders';

// Orders: staleTime=2min (estado cambia con frecuencia)
const ORDERS_STALE_TIME = 1000 * 60 * 2;
const ORDER_DETAIL_STALE_TIME = 1000 * 60;
const POINTS_STALE_TIME = 1000 * 60 * 5;

export function useCustomerOrders(customerId: string | undefined) {
    return useQuery({
        queryKey: ['orders', customerId],
        queryFn: () => ordersService.getCustomerOrders(customerId!),
        enabled: !!customerId,
        staleTime: ORDERS_STALE_TIME,
    });
}

export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ['orders', 'detail', orderId],
        queryFn: () => ordersService.getOrderById(orderId!),
        enabled: !!orderId,
        staleTime: ORDER_DETAIL_STALE_TIME,
    });
}

export function useCreateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderData) => ordersService.createOrder(data),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['orders', variables.customer_id] });
        },
    });
}

export function usePointsBalance(customerId: string | undefined) {
    return useQuery({
        queryKey: ['points', customerId],
        queryFn: () => ordersService.getPointsBalance(customerId!),
        enabled: !!customerId,
        staleTime: POINTS_STALE_TIME,
    });
}
