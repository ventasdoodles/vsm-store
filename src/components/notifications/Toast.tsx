import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/stores/notifications.store';

interface ToastProps {
    notification: Notification;
    onClose: (id: string) => void;
}

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const STYLES = {
    success: 'border-l-herbal-500 bg-herbal-500/5',
    error: 'border-l-red-500 bg-red-500/5',
    warning: 'border-l-yellow-500 bg-yellow-500/5',
    info: 'border-l-blue-500 bg-blue-500/5',
};

const PROGRESS_STYLES = {
    success: 'bg-herbal-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
};

export function Toast({ notification, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);

    const Icon = ICONS[notification.type];
    const duration = 5000;
    const intervalTime = 50;

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(notification.id);
        }, 300);
    }, [notification.id, onClose]);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleClose();
                    return 0;
                }
                return prev - (intervalTime / duration) * 100;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [isPaused, duration, handleClose]);

    return (
        <div
            className={cn(
                'pointer-events-auto relative mb-3 w-full max-w-sm overflow-hidden rounded-lg border border-primary-800 bg-primary-950 shadow-xl transition-all duration-300',
                STYLES[notification.type],
                isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
                'animate-in slide-in-from-right-full'
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex p-4">
                <div className="flex-shrink-0">
                    <Icon className={cn('h-5 w-5', {
                        'text-herbal-500': notification.type === 'success',
                        'text-red-500': notification.type === 'error',
                        'text-yellow-500': notification.type === 'warning',
                        'text-blue-500': notification.type === 'info',
                    })} />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-primary-100">{notification.title}</p>
                    <p className="mt-1 text-sm text-primary-400">{notification.message}</p>
                    {notification.actionUrl && (
                        <a
                            href={notification.actionUrl}
                            className="mt-2 text-sm font-medium text-primary-300 hover:text-primary-100"
                        >
                            {notification.actionLabel || 'Ver más'} →
                        </a>
                    )}
                </div>
                <div className="ml-4 flex flex-shrink-0">
                    <button
                        type="button"
                        className="inline-flex rounded-md text-primary-400 hover:text-primary-200 focus:outline-none"
                        onClick={handleClose}
                    >
                        <span className="sr-only">Cerrar</span>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-primary-900/50">
                <div
                    className={cn('h-full transition-all ease-linear', PROGRESS_STYLES[notification.type])}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
