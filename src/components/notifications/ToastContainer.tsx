import { useNotificationsStore } from '@/stores/notifications.store';
import { Toast } from './Toast';

export function ToastContainer() {
    const notifications = useNotificationsStore((s) => s.notifications);


    // Solo mostrar las últimas 3 no leídas (o todas, pero en el toast container solemos mostrar las recientes)
    // El store guarda todo para el centro de notificaciones, pero aquí mostramos las recientes que no han sido cerradas manualmente
    // Para simplificar, mostraremos las primeras 3 del array (que son las más recientes según nuestra lógica de addNotification unshift)
    // pero idealmente deberíamos tener un estado de "visto en toast" separado de "leído".
    // Por ahora, mostraremos las top 3 recientes. El usuario las cierra y desaparecen de la vista (removeNotification elimina del store).
    // Espera, removeNotification elimina del store, lo cual significa que no saldrían en el centro de notificaciones.
    // Esto es un conflicto. El Toast debe ocultarse visualmente pero persistir en el store.
    // MODIFICACION: El store tiene removeNotification (borrar) y markAsRead.
    // Necesitamos una forma de "descartar toast" sin borrar la notificación.
    // Solución: El ToastContainer gestionará su propia lista de IDs visibles, o simplemente mostraremos las notificaciones creadas
    // en los últimos X segundos.
    // Alternativa mejor: El store podría tener un flag `toastShown` o similar.
    // PERO, para cumplir con el requerimiento simple:
    // "removeNotification(id) - Remover" del store.
    // Si el usuario cierra el toast, ¿queremos que desaparezca del historial?
    // Usualmente sí, o se marca como leída.
    // El requerimiento dice "Centro de notificaciones persistente".
    // Entonces cerrar el toast NO debe borrarla del store.
    // Voy a asumir que el Toast solo se muestra para notificaciones RECIENTES (creadas hace poco) y que no han sido leídas.
    // O mejor: Agregaré un estado local al ToastContainer para gestionar cuáles se renderizan.
    // Cuando entra una nueva notificación al store, se agrega aquí. Cuando se cierra, se quita de aquí.

    // Vamos a usar un enfoque más simple compatible con Zustand:
    // Mostramos notificaciones que tengan `read: false` y sean recientes (timestamp < 5s).
    // O mejor, agregamos `toastDismissed` al store? No, mantengamos el store limpio.

    // Enfoque funcional simple:
    // El ToastContainer se suscribe a nuevas notificaciones.
    // Usaremos un selector que obtenga las notificaciones no leídas creadas hace menos de 7 segundos.
    // Y el "Close" del toast marcará como leída la notificación.

    const unreadRecent = notifications
        .filter((n) => !n.read && (new Date().getTime() - new Date(n.timestamp).getTime() < 7000))
        .slice(0, 3);

    // Problema: Si el usuario no la ve, desaparece del toast (por el filtro de tiempo) pero queda en el centro. Correcto.
    // Problema: Si el usuario la cierra manualmente en el toast, ¿qué pasa?
    // Deberíamos marcarla como leída.

    const { markAsRead } = useNotificationsStore();

    return (
        <div className="fixed right-0 top-0 z-50 flex w-full flex-col items-end p-4 sm:max-w-[420px] pointer-events-none">
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
