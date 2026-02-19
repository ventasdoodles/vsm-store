import { useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotificationsStore } from '@/stores/notifications.store';
import { cn, formatTimeAgo } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-theme-secondary/30 p-4">
            <Bell className="h-8 w-8 text-theme-secondary" />
        </div>
        <h3 className="text-lg font-medium text-theme-primary">Sin notificaciones</h3>
        <p className="mt-1 text-sm text-theme-secondary">
            Te avisaremos cuando haya actualizaciones importantes.
        </p>
    </div>
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

    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full z-40 mt-3 w-80 max-w-[calc(100vw-2rem)] sm:w-96 origin-top-right rounded-2xl border border-theme/60 bg-theme-primary/95 backdrop-blur-xl shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-theme px-4 py-3">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-theme-secondary" />
                    <h3 className="text-sm font-semibold text-theme-primary">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <span className="rounded-full bg-herbal-500/20 px-2 py-0.5 text-[10px] font-bold text-herbal-400">
                            {unreadCount} nuevas
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={markAllAsRead}
                        title="Marcar todas como leídas"
                        className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        onClick={clearAll}
                        title="Limpiar todo"
                        className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary hover:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary sm:hidden"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Lista */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="divide-y divide-theme">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    'relative block p-4 transition-colors hover:bg-theme-secondary/50',
                                    !notification.read && 'bg-theme-secondary/20'
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        'mt-1 h-2 w-2 rounded-full flex-shrink-0',
                                        notification.type === 'success' ? 'bg-herbal-500' :
                                            notification.type === 'error' ? 'bg-red-500' :
                                                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            'text-sm font-medium',
                                            !notification.read ? 'text-theme-primary' : 'text-theme-secondary'
                                        )}>
                                            {notification.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-theme-secondary line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1.5 text-[10px] text-theme-secondary">
                                            {formatTimeAgo(new Date(notification.timestamp))}
                                        </p>

                                        {notification.actionUrl && (
                                            <Link
                                                to={notification.actionUrl}
                                                className="mt-2 inline-block text-xs font-medium text-vape-400 hover:text-vape-300"
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
                                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
                <div className="border-t border-theme p-2 text-center">
                    <p className="text-[10px] text-theme-secondary">Mostrando últimas 50</p>
                </div>
            )}
        </div>
    );
}
