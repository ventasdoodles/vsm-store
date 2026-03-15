/**
 * // ─── HOOK: useRealtimeOrders ───
 * // Arquitectura: Independent Infrastructure Lego (Lego Master)
 * // Proposito principal: Escucha cambios en 'orders' via Supabase Realtime para Social Proof (Social Pulse).
 * // Regla / Notas: Desacoplado de infraestructura (§1.1). Delega el enriquecimiento de datos al servicio.
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getOrderNotificationDetails } from '@/services';
import type { RealtimeOrderEvent } from '@/types/order';

/**
 * Escucha la creación de nuevos pedidos en tiempo real.
 * @param onNewOrder Callback que recibe el evento enriquecido del pedido.
 */
export function useRealtimeOrders(onNewOrder: (order: RealtimeOrderEvent) => void) {
    useEffect(() => {
        const channel = supabase
            .channel('public:orders_pulse')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                async (payload) => {
                    const newOrder = payload.new;
                    if (!newOrder?.id) return;
                    
                    try {
                        // Delega el enriquecimiento de datos al SERVICE layer (§1.1)
                        const eventData = await getOrderNotificationDetails(newOrder.id);
                        
                        if (eventData) {
                            onNewOrder(eventData);
                        }
                    } catch (error) {
                        console.error('[useRealtimeOrders] Error enriching order event:', error);
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    console.error('[useRealtimeOrders] Realtime connection error');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [onNewOrder]);
}
