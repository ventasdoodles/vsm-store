import { Bell, Check, AlertTriangle, ShieldAlert, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { cn } from '@/lib/utils';

export function Notifications() {
    const { user } = useAuth();
    const { 
        notifications, 
        isLoading, 
        markAsRead 
    } = useUserNotifications(user?.id);


    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <ShieldAlert className="h-6 w-6 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-6 w-6 text-orange-500" />;
            case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
            default: return <Info className="h-6 w-6 text-accent-primary" />;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'alert': return 'border-red-500/50 bg-red-950/20';
            case 'warning': return 'border-orange-500/50 bg-orange-950/20';
            case 'success': return 'border-green-500/50 bg-green-950/20';
            default: return 'border-theme bg-theme-primary/40';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-theme-secondary">Cargando avisos...</div>;
    }

    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
            <header className="py-6 border-b border-theme">
                <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                    <Bell className="h-8 w-8 text-vape-400" />
                    Mis Avisos
                </h1>
                <p className="text-theme-secondary mt-2">
                    Bandeja de mensajes y alertas importantes del administrador.
                </p>
            </header>

            {/* Unread Section */}
            {unread.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-vape-500 animate-pulse" />
                        Por Leer ({unread.length})
                    </h2>

                    <div className="space-y-4">
                        {unread.map(notif => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "rounded-2xl border p-6 transition-all hover:shadow-lg hover:shadow-black/20",
                                    getTypeStyles(notif.type)
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className="shrink-0 p-2 rounded-xl bg-theme-primary/50 h-fit">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-theme-primary">{notif.title}</h3>
                                            <span className="text-xs text-theme-secondary font-mono">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-theme-secondary leading-relaxed">
                                            {notif.message}
                                        </p>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="flex items-center gap-2 bg-theme-secondary hover:bg-theme-tertiary text-theme-primary px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-black/20 hover:scale-105 active:scale-95"
                                            >
                                                <Check className="h-4 w-4" />
                                                Enterado
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Read History */}
            {read.length > 0 && (
                <section className="space-y-4 pt-8">
                    <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">
                        Historial de Leídos
                    </h2>
                    <div className="space-y-2 opacity-75">
                        {read.map(notif => (
                            <div key={notif.id} className="rounded-xl border border-theme bg-theme-primary/30 p-4 flex gap-4 items-center">
                                <div className="shrink-0 opacity-50 scale-75">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-theme-secondary">{notif.title}</h4>
                                    <p className="text-xs text-theme-secondary line-clamp-1">{notif.message}</p>
                                </div>
                                <span className="text-xs text-green-500/50 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Leído
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {notifications.length === 0 && (
                <div className="text-center py-20 bg-theme-primary/20 rounded-3xl border border-theme border-dashed">
                    <Bell className="h-12 w-12 text-theme-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-theme-secondary">Sin avisos pendientes</h3>
                    <p className="text-sm text-theme-secondary">Estás al día con todas las notificaciones.</p>
                </div>
            )}
        </div>
    );
}
