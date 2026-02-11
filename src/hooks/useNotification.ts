import { useNotificationsStore } from '@/stores/notifications.store';
import type { NotificationType } from '@/stores/notifications.store';

export const useNotification = () => {
    const addNotification = useNotificationsStore((s) => s.addNotification);

    const notify = (
        type: NotificationType,
        title: string,
        message: string,
        options?: { actionUrl?: string; actionLabel?: string }
    ) => {
        addNotification({ type, title, message, ...options });
    };

    return {
        success: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string }) =>
            notify('success', title, message, options),
        error: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string }) =>
            notify('error', title, message, options),
        warning: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string }) =>
            notify('warning', title, message, options),
        info: (title: string, message: string, options?: { actionUrl?: string; actionLabel?: string }) =>
            notify('info', title, message, options),
    };
};
