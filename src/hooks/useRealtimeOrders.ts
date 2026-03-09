/**
 * // ─── HOOK: useRealtimeOrders ───
 * // Arquitectura: Independent Infrastructure Lego (Lego Master)
 * // Proposito principal: Escucha cambios en 'orders' via Supabase Realtime para Social Proof.
 *    Design: Suscripción reactiva, enriquecimiento de datos de perfil/dirección.
 * // Regla / Notas: "Zero Fakes Policy" - Solo datos reales de la BD.
 */
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface RealtimeOrderEvent {
    id: string;
    customer_name: string;
    city: string;
    product_name: string;
    product_image: string;
}

/**
 * useRealtimeOrders - Hook to listen for new orders and trigger social proof.
 */
export function useRealtimeOrders(onNewOrder: (order: RealtimeOrderEvent) => void) {
    useEffect(() => {
        const channel = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                async (payload) => {
                    const newOrder = payload.new;
                    
                    // Fetch details to make the notification "Human"
                    // We need the customer name from profiles and the product name from the order's items
                    const { data: orderDetails, error } = await supabase
                        .from('orders')
                        .select(`
                            id,
                            items,
                            customer_profiles:customer_id(full_name),
                            shipping_address:addresses!shipping_address_id(colony, city)
                        `)
                        .eq('id', newOrder.id)
                        .single();

                    if (error || !orderDetails) return;

                    const items = orderDetails.items as Array<{ name?: string, product_name?: string, image?: string }> | null;
                    const item = items?.[0];
                    if (!item) return;

                    // Support both single and array (Supabase join quirk)
                    const cp = Array.isArray(orderDetails.customer_profiles) 
                        ? orderDetails.customer_profiles[0] 
                        : orderDetails.customer_profiles;
                    
                    const sa = Array.isArray(orderDetails.shipping_address) 
                        ? orderDetails.shipping_address[0] 
                        : orderDetails.shipping_address;

                    // Type guards for the joined data
                    const profile = cp as { full_name: string } | null;
                    const address = sa as { city?: string, colony?: string } | null;

                    onNewOrder({
                        id: orderDetails.id,
                        customer_name: profile?.full_name || 'Alguien',
                        city: address?.city || address?.colony || 'México',
                        product_name: item.name || item.product_name || 'un producto',
                        product_image: item.image || '',
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [onNewOrder]);
}
