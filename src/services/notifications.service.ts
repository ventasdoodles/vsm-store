/**
 * notifications.service - VSM Store
 * 
 * Servicio para la lógica y gestión de notifications.
 * @module services/notifications.service
 */

import { supabase } from '@/lib/supabase';

export interface UserNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
    is_read: boolean;
    created_at: string;
}

/** Obtener todas las notificaciones de un usuario ordenadas por fecha */
export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
    const { data, error } = await supabase
        .from('user_notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserNotification[];
}

/** Marcar una notificación como leída */
export async function markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Suscribirse a cambios en tiempo real de los pedidos de un usuario.
 * Devuelve el channel para poder hacer unsubscribe.
 */
export function subscribeToOrderUpdates(
    userId: string,
    onUpdate: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void,
) {
    const channel = supabase
        .channel('orders-updates')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `customer_id=eq.${userId}`,
            },
            onUpdate,
        )
        .subscribe();

    return channel;
}
