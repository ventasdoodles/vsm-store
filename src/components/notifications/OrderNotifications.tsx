import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { supabase } from '@/lib/supabase';

export function OrderNotifications() {
    const { user } = useAuth();
    // No usamos el hook useCustomerOrders para no hacer fetch constante, 
    // sino que nos suscribimos a cambios en tiempo real vía Supabase Realtime si fuera posible.
    // Como no tenemos garantizado Realtime activado, usaremos un polling suave o simplemente
    // escucharemos cambios cuando la app esté activa.
    // Para cumplir el requerimiento de "escucha cambios", usaremos supabase.channel

    const { success, info } = useNotification();

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('orders-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_id=eq.${user.id}`,
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    const oldStatus = payload.old.status;
                    const orderId = payload.new.id;
                    const orderUrl = `/orders/${orderId}`;

                    if (newStatus !== oldStatus) {
                        switch (newStatus) {
                            case 'confirmed':
                                success('Pedido confirmado', 'Tu pago ha sido verificado y el pedido está confirmado.', { actionUrl: orderUrl });
                                break;
                            case 'processing':
                                info('Pedido en proceso', 'Estamos preparando tu paquete.', { actionUrl: orderUrl });
                                break;
                            case 'shipped':
                                success('¡Pedido enviado!', 'Tu pedido ha salido de nuestro almacén.', { actionUrl: orderUrl });
                                break;
                            case 'delivered':
                                success('Pedido entregado', 'Que lo disfrutes. ¡Gracias por tu compra!', { actionUrl: orderUrl });
                                break;
                            case 'cancelled':
                                info('Pedido cancelado', 'El pedido ha sido cancelado.', { actionUrl: orderUrl });
                                break;
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, success, info]);

    return null; // Componente lógico, no renderiza nada visual
}
