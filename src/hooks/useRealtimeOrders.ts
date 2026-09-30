/**
 * // ─── HOOK: useRealtimeOrders ───
 * // Arquitectura: Independent Infrastructure Lego (Lego Master)
 * // Proposito principal: Escucha cambios en 'orders' via Supabase Realtime para Social Proof (Social Pulse).
 * // Regla / Notas: Desacoplado de infraestructura (§1.1). Delega el enriquecimiento de datos al servicio.
 */

import { useEffect } from 'react';
import { subscribeToRealtimeOrders } from '@/services/orders.service';
import type { RealtimeOrderEvent } from '@/types/order';

/**
 * Escucha la creación de nuevos pedidos en tiempo real.
 * @param onNewOrder Callback que recibe el evento enriquecido del pedido.
 */
export function useRealtimeOrders(onNewOrder: (order: RealtimeOrderEvent) => void) {
    useEffect(() => {
        const unsubscribe = subscribeToRealtimeOrders(onNewOrder);
        return () => {
            unsubscribe();
        };
    }, [onNewOrder]);
}
