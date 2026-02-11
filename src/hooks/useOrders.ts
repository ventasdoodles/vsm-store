// Hooks de pedidos - VSM Store
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersService from '@/services/orders.service';
import type { CreateOrderData } from '@/services/orders.service';

export function useCustomerOrders(customerId: string | undefined) {
    return useQuery({
        queryKey: ['orders', customerId],
        queryFn: () => ordersService.getCustomerOrders(customerId!),
        enabled: !!customerId,
    });
}

export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ['orders', 'detail', orderId],
        queryFn: () => ordersService.getOrderById(orderId!),
        enabled: !!orderId,
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
    });
}
