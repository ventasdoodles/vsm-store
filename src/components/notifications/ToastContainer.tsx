import { useNotificationsStore } from '@/stores/notifications.store';
import { Toast } from './Toast';

/**
 * ToastContainer — Muestra las notificaciones recientes como toasts flotantes.
 *
 * Lógica: muestra las últimas 3 notificaciones no leídas creadas hace menos de 7 segundos.
 * Cerrar el toast marca la notificación como leída (no la elimina del centro de notificaciones).
 * Pasados los 7s, el toast desaparece visualmente pero la notificación persiste en el store.
 */
export function ToastContainer() {
    const notifications = useNotificationsStore((s) => s.notifications);
    const { markAsRead } = useNotificationsStore();

    const unreadRecent = notifications
        .filter((n) => !n.read && (new Date().getTime() - new Date(n.timestamp).getTime() < 7000))
        .slice(0, 3);

    return (
        <div className="fixed right-0 bottom-0 z-50 flex w-full flex-col-reverse items-end p-6 sm:max-w-[420px] pointer-events-none">
            {unreadRecent.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onClose={(id) => markAsRead(id)}
                />
            ))}
        </div>
    );
}
