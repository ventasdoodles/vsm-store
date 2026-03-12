/**
 * // ─── HOOK: useOrderNotifications ───
 * // Arquitectura: Custom Hook (Listener)
 * // Propósito central: Subscribirse a actualizaciones de pedido para el usuario actual.
 * // Cumple con regla §1.1.
 */
import { useEffect } from 'react';
import { subscribeToOrderUpdates } from '@/services/notifications.service';

export function useOrderNotifications(
    userId: string | undefined,
    onStatusChange: (orderId: string, oldStatus: string, newStatus: string) => void
) {
    useEffect(() => {
        if (!userId) return;

        const channel = subscribeToOrderUpdates(userId, (payload) => {
            const newStatus = (payload.new as Record<string, unknown>).status as string;
            const oldStatus = (payload.old as Record<string, unknown>).status as string;
            const orderId = (payload.new as Record<string, unknown>).id as string;

            if (newStatus !== oldStatus) {
                onStatusChange(orderId, oldStatus, newStatus);
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [userId, onStatusChange]);
}
