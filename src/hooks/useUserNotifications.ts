import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserNotifications, markNotificationAsRead } from '@/services';
import { useNotificationsStore } from '@/stores/notifications.store';

export function useUserNotifications(userId: string | undefined) {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();

    const notificationsQuery = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => getUserNotifications(userId!),
        enabled: !!userId,
    });

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
            addNotification({ type: 'success', title: 'Enterado', message: 'Notificación marcada como leída.' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo actualizar la notificación.' });
        }
    });

    return {
        notifications: notificationsQuery.data || [],
        isLoading: notificationsQuery.isLoading,
        error: notificationsQuery.error,
        markAsRead: markAsReadMutation.mutate,
        isMarkingRead: markAsReadMutation.isPending
    };
}
