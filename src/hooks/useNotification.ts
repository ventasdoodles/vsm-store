import { useCallback, useMemo } from 'react';
import { useNotificationsStore } from '@/stores/notifications.store';
import type { NotificationType } from '@/stores/notifications.store';

/**
 * useNotification - VSM Store
 * 
 * Custom hook para la lógica y gestión de Notification.
 * Memoizado para evitar re-renders globales y thrashing de suscripciones.
 * @module hooks/useNotification
 */
export const useNotification = () => {
    const addNotification = useNotificationsStore((s) => s.addNotification);

    const notify = useCallback((
        type: NotificationType,
        title: string,
        message: string,
        options?: { actionUrl?: string; actionLabel?: string; actionCallback?: () => void }
    ) => {
        addNotification({ type, title, message, ...options });
    }, [addNotification]);

    return useMemo(() => ({
        success: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string; actionCallback?: () => void }) =>
            notify('success', title, message, options),
        error: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string; actionCallback?: () => void }) =>
            notify('error', title, message, options),
        warning: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string; actionCallback?: () => void }) =>
            notify('warning', title, message, options),
        info: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string; actionCallback?: () => void }) =>
            notify('info', title, message, options),
    }), [notify]);
};
