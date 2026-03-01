// NotificationBell — Botón campana + badge + panel de notificaciones
// Independiente: lee store y gestiona su propio estado de apertura
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationsStore } from '@/stores/notifications.store';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function NotificationBell() {
    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = useNotificationsStore((s) => s.notifications);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full text-theme-secondary hover:bg-white/10 hover:text-white transition-all bg-white/5 border border-white/5"
            >
                <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span 
                            key={unreadCount}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary text-[9px] font-bold text-white ring-2 ring-black shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
            <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
}
