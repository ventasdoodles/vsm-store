import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { subscribeToOrderUpdates } from '@/services/notifications.service';

export function OrderNotifications() {
    const { user } = useAuth();
    const { success, info } = useNotification();

    useEffect(() => {
        if (!user) return;

        const channel = subscribeToOrderUpdates(user.id, (payload) => {
            const newStatus = (payload.new as Record<string, unknown>).status;
            const oldStatus = (payload.old as Record<string, unknown>).status;
            const orderId = (payload.new as Record<string, unknown>).id;
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
        });

        return () => {
            channel.unsubscribe();
        };
    }, [user, success, info]);

    return null; // Componente lógico, no renderiza nada visual
}
