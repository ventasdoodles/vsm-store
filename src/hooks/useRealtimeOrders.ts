/**
 * // ─── HOOK: useRealtimeOrders ───
 * // Arquitectura: Independent Infrastructure Lego (Lego Master)
 * // Proposito principal: Escucha cambios en 'orders' via Supabase Realtime para Social Proof (Social Pulse).
 * // Regla / Notas: Desacoplado de infraestructura (§1.1). Delega el enriquecimiento de datos al servicio.
 * // Resiliencia: Utiliza useRef para estabilizar callbacks y evitar reconexiones/churn innecesarios.
 */

import { useEffect, useRef } from 'react';
import { subscribeToRealtimeOrders } from '@/services/orders.service';
import type { RealtimeOrderEvent } from '@/types/order';

/**
 * Escucha la creación de nuevos pedidos en tiempo real.
 * @param onNewOrder Callback que recibe el evento enriquecido del pedido.
 * @param onError Callback opcional para gestionar errores de conexión realtime.
 */
export function useRealtimeOrders(
    onNewOrder: (order: RealtimeOrderEvent) => void,
    onError?: (err: unknown) => void
) {
    const callbackRef = useRef(onNewOrder);
    const errorRef = useRef(onError);

    useEffect(() => {
        callbackRef.current = onNewOrder;
        errorRef.current = onError;
    });

    useEffect(() => {
        const unsubscribe = subscribeToRealtimeOrders(
            (order) => callbackRef.current?.(order),
            (err) => errorRef.current?.(err)
        );
        return () => {
            unsubscribe();
        };
    }, []);
}
