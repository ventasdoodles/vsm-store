// NotificationBell — Botón campana + badge + panel de notificaciones
// Independiente: lee store y gestiona su propio estado de apertura
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '@/stores/notifications.store';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function NotificationBell() {
    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = useNotificationsStore((s) => s.notifications);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-2.5 text-text-secondary transition-all hover:bg-theme-secondary/10 hover:text-theme-primary hover:scale-110 active:scale-95"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-black shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse-glow">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
}
