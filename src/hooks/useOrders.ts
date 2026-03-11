/**
 * // ─── HOOK: useOrders ───
 * // Arquitectura: Custom Hook (Data Fetching)
 * // Proposito principal: Hooks para gestión de pedidos del cliente y balance de puntos.
 * // Regla / Notas: Usa React Query para caching y sincronización.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersService from '@/services/orders.service';
import type { CreateOrderData } from '@/types/order';

// Tiempos de frescura de datos
const ORDERS_STALE_TIME = 1000 * 60 * 2; // 2 min
const ORDER_DETAIL_STALE_TIME = 1000 * 60; // 1 min
const POINTS_STALE_TIME = 1000 * 60 * 5; // 5 min

// Re-exports para compatibilidad con la UI
export { ORDER_STATUS } from '@/services/orders.service';
export type { OrderStatus, OrderRecord, OrderItem } from '@/services/orders.service';

/**
 * Obtiene todos los pedidos de un cliente.
 */
export function useCustomerOrders(customerId: string | undefined) {
    return useQuery({
        queryKey: ['orders', customerId],
        queryFn: () => ordersService.getCustomerOrders(customerId!),
        enabled: !!customerId,
        staleTime: ORDERS_STALE_TIME,
    });
}

/**
 * Obtiene el detalle de un pedido específico.
 */
export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ['orders', 'detail', orderId],
        queryFn: () => ordersService.getOrderById(orderId!),
        enabled: !!orderId,
        staleTime: ORDER_DETAIL_STALE_TIME,
    });
}

/**
 * Hook para crear un nuevo pedido. Invalida la lista de pedidos al completar.
 */
export function useCreateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderData) => ordersService.createOrder(data),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['orders', variables.customer_id] });
        },
    });
}

/**
 * Obtiene el balance de puntos de lealtad de un cliente.
 */
export function usePointsBalance(customerId: string | undefined) {
    return useQuery({
        queryKey: ['points', customerId],
        queryFn: () => ordersService.getPointsBalance(customerId!),
        enabled: !!customerId,
        staleTime: POINTS_STALE_TIME,
    });
}
