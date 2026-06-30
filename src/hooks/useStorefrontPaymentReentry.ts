import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useNotification } from '@/hooks/useNotification';
import { getStorefrontPaymentReentryView } from '@/lib/domain/orders';
import { getOrderById } from '@/services';
import { mercadopagoService } from '@/services/payments/mercadopago.service';
import type { OrderRecord } from '@/types/order';

export function useStorefrontPaymentReentry() {
    const navigate = useNavigate();
    const { warning, error } = useNotification();
    const [continuingOrderId, setContinuingOrderId] = useState<string | null>(null);

    const continuePayment = useCallback(async (order: OrderRecord) => {
        if (continuingOrderId === order.id) return;

        const currentView = getStorefrontPaymentReentryView(order);
        if (!currentView.canReenter) {
            warning('Pago no disponible', currentView.blockedAttemptDetail);
            navigate({ to: `/orders/${order.id}` as any });
            return;
        }

        try {
            setContinuingOrderId(order.id);

            const freshOrder = await getOrderById(order.id);
            if (!freshOrder) {
                setContinuingOrderId(null);
                warning(
                    'Pedido no disponible',
                    'No pudimos confirmar el estado actual del pedido. Revisa el detalle persistido antes de intentar otro pago.',
                );
                navigate({ to: '/orders' });
                return;
            }

            const freshView = getStorefrontPaymentReentryView(freshOrder);
            if (!freshView.canReenter) {
                setContinuingOrderId(null);
                warning('Pago no disponible', freshView.blockedAttemptDetail);
                navigate({ to: `/orders/${freshOrder.id}` as any });
                return;
            }

            const payment = await mercadopagoService.createPayment(freshOrder.id);
            window.location.assign(payment.init_point);
        } catch {
            error(
                'No se pudo retomar el pago',
                'Tu pedido sigue registrado, pero Mercado Pago no pudo abrirse en este momento.',
            );
            setContinuingOrderId(null);
        }
    }, [continuingOrderId, error, navigate, warning]);

    return {
        continuingOrderId,
        continuePayment,
    };
}
