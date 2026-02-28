import { useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationsStore } from '@/stores/notifications.store';
import { cn, formatTimeAgo } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const EmptyState = () => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
    >
        <div className="mb-4 rounded-full bg-theme-secondary/30 p-4">
            <Bell className="h-8 w-8 text-theme-secondary" />
        </div>
        <h3 className="text-lg font-medium text-theme-primary">Sin notificaciones</h3>
        <p className="mt-1 text-sm text-theme-secondary">
            Te avisaremos cuando haya actualizaciones importantes.
        </p>
    </motion.div>
);

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
    const ref = useRef<HTMLDivElement>(null);
    const notifications = useNotificationsStore((s) => s.notifications);
    const markAsRead = useNotificationsStore((s) => s.markAsRead);
    const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
    const clearAll = useNotificationsStore((s) => s.clearAll);

    // Cerrar con click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-full z-40 mt-3 w-80 max-w-[calc(100vw-2rem)] sm:w-96 origin-top-right rounded-3xl border border-white/10 bg-[#111]/90 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-theme-secondary" />
                            <h3 className="text-sm font-bold text-theme-primary tracking-wide">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }}
                                    className="rounded-full bg-blue-500/20 box-border border border-blue-500/30 px-2 py-0.5 text-[10px] font-black tracking-widest uppercase text-blue-400"
                                >
                                    {unreadCount} nuevas
                                </motion.span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={markAllAsRead}
                                title="Marcar todas como leídas"
                                className="rounded-lg p-1.5 text-theme-secondary transition-colors"
                            >
                                <Check className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={clearAll}
                                title="Limpiar todo"
                                className="rounded-lg p-1.5 text-theme-secondary hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-theme-secondary sm:hidden"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="max-h-[60vh] overflow-y-auto scrollbar-none">
                        {notifications.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {notifications.map((notification, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={notification.id}
                                            className={cn(
                                                'relative block p-5 cursor-pointer transition-colors hover:bg-white/[0.03]',
                                                !notification.read && 'bg-white/[0.02]'
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    'mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]',
                                                    notification.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                                        notification.type === 'error' ? 'bg-red-500 shadow-red-500/50' :
                                                            notification.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-500 shadow-blue-500/50'
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        'text-sm font-bold tracking-tight',
                                                        !notification.read ? 'text-white' : 'text-theme-secondary'
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-theme-secondary/80 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="mt-2 text-[10px] font-medium tracking-widest uppercase text-theme-secondary/50">
                                                        {formatTimeAgo(new Date(notification.timestamp))}
                                                    </p>

                                                    {notification.actionUrl && (
                                                        <Link
                                                            to={notification.actionUrl}
                                                            className="mt-3 inline-block rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onClose();
                                                                markAsRead(notification.id);
                                                            }}
                                                        >
                                                            {notification.actionLabel || 'Ver detalles'} →
                                                        </Link>
                                                    )}
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 5 && (
                        <div className="border-t border-white/5 bg-white/[0.01] p-3 text-center">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-theme-secondary/50">Mostrando últimas 50</p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
