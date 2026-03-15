import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

export function OrderNotifications() {
    const { user } = useAuth();
    const { success, info } = useNotification();

    const handleStatusChange = useCallback((orderId: string, _oldStatus: string, newStatus: string) => {
        const orderUrl = `/orders/${orderId}`;
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
    }, [success, info]);

    useOrderNotifications(user?.id, handleStatusChange);

    return null; // Componente lógico, no renderiza nada visual
}
