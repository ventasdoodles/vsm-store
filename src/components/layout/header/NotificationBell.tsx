// NotificationBell — Botón campana + badge + panel de notificaciones
// Independiente: lee store y gestiona su propio estado de apertura
import { lazy, Suspense, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '@/stores/notifications.store';

// Lazy-load NotificationCenter (incluye framer-motion, solo se descarga al abrir)
const NotificationCenter = lazy(() =>
    import('@/components/notifications/NotificationCenter').then(m => ({ default: m.NotificationCenter }))
);

export function NotificationBell() {
    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = useNotificationsStore((s) => s.notifications);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full text-theme-secondary hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-90 bg-white/5 border border-white/5"
            >
                <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                    <span 
                        className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary text-[9px] font-bold text-white ring-2 ring-black shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-in zoom-in-50 duration-200"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {showNotifications && (
                <Suspense fallback={null}>
                    <NotificationCenter
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}
