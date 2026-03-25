/**
 * // ─── HOOK: useOrders ───
 * // Arquitectura: Custom Hook (Data Fetching)
 * // Proposito principal: Hooks para gestión de pedidos del cliente y balance de puntos.
 * // Regla / Notas: Usa React Query para caching y sincronización.
 */

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersService from '@/services';
import type { CreateOrderData } from '@/types/order';

// Tiempos de frescura de datos
const ORDERS_STALE_TIME = 1000 * 60 * 2; // 2 min
const ORDER_DETAIL_STALE_TIME = 1000 * 60; // 1 min
const POINTS_STALE_TIME = 1000 * 60 * 5; // 5 min

// Re-exports para compatibilidad con la UI
export { ORDER_STATUS } from '@/services';
export type { OrderStatus, OrderRecord, OrderItem } from '@/services';

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

interface BoundedOrderStatusRefreshOptions {
    enabled: boolean;
    refetch: () => Promise<unknown>;
    intervalMs?: number;
    maxAttempts?: number;
}

export function useBoundedOrderStatusRefresh({
    enabled,
    refetch,
    intervalMs = 2500,
    maxAttempts = 3,
}: BoundedOrderStatusRefreshOptions) {
    const attempts = useRef(0);

    useEffect(() => {
        if (!enabled) {
            attempts.current = 0;
            return;
        }

        attempts.current = 0;

        const interval = window.setInterval(() => {
            if (attempts.current >= maxAttempts) {
                window.clearInterval(interval);
                return;
            }

            attempts.current += 1;
            void refetch();
        }, intervalMs);

        return () => window.clearInterval(interval);
    }, [enabled, intervalMs, maxAttempts, refetch]);
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
            qc.invalidateQueries({ queryKey: ['loyalty', 'balance', variables.customer_id] });
            qc.invalidateQueries({ queryKey: ['loyalty', 'tier', variables.customer_id] });
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

/**
 * Hook para rastrear el envío de un pedido usando su número de guía.
 */
export function useOrderTracking() {
    return useMutation({
        mutationFn: (trackingNumber: string) => ordersService.getTrackingInfo(trackingNumber),
    });
}
