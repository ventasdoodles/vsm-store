import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, AlertTriangle, ShieldAlert, Info, CheckCircle } from 'lucide-react';
import { useNotificationsStore } from '@/stores/notifications.store';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface UserNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
    is_read: boolean;
    created_at: string;
}

export function Notifications() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();
    const navigate = useNavigate();

    // Query: Get Notifications
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('user_notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as UserNotification[];
        },
        enabled: !!user,
    });

    // Mutation: Mark as Read
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('user_notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            addNotification({ type: 'success', title: 'Enterado', message: 'Notificación marcada como leída.' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo actualizar la notificación.' });
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <ShieldAlert className="h-6 w-6 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-6 w-6 text-orange-500" />;
            case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
            default: return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'alert': return 'border-red-500/50 bg-red-950/20';
            case 'warning': return 'border-orange-500/50 bg-orange-950/20';
            case 'success': return 'border-green-500/50 bg-green-950/20';
            default: return 'border-primary-800 bg-primary-900/40';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-primary-400">Cargando avisos...</div>;
    }

    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
            <header className="py-6 border-b border-primary-800/50">
                <h1 className="text-3xl font-bold text-primary-100 flex items-center gap-3">
                    <Bell className="h-8 w-8 text-vape-400" />
                    Mis Avisos
                </h1>
                <p className="text-primary-400 mt-2">
                    Bandeja de mensajes y alertas importantes del administrador.
                </p>
            </header>

            {/* Unread Section */}
            {unread.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-primary-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-vape-500 animate-pulse" />
                        Por Leer ({unread.length})
                    </h2>

                    <div className="space-y-4">
                        {unread.map(notif => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "rounded-2xl border p-6 transition-all hover:shadow-lg hover:shadow-primary-900/50",
                                    getTypeStyles(notif.type)
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className="shrink-0 p-2 rounded-xl bg-primary-950/50 h-fit">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-primary-100">{notif.title}</h3>
                                            <span className="text-xs text-primary-500 font-mono">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-primary-300 leading-relaxed">
                                            {notif.message}
                                        </p>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                onClick={() => markAsReadMutation.mutate(notif.id)}
                                                className="flex items-center gap-2 bg-primary-100 hover:bg-white text-primary-950 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-black/20 hover:scale-105 active:scale-95"
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
                    <h2 className="text-sm font-semibold text-primary-500 uppercase tracking-wider">
                        Historial de Leídos
                    </h2>
                    <div className="space-y-2 opacity-75">
                        {read.map(notif => (
                            <div key={notif.id} className="rounded-xl border border-primary-800/50 bg-primary-950/30 p-4 flex gap-4 items-center">
                                <div className="shrink-0 opacity-50 scale-75">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-primary-400">{notif.title}</h4>
                                    <p className="text-xs text-primary-600 line-clamp-1">{notif.message}</p>
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
                <div className="text-center py-20 bg-primary-900/20 rounded-3xl border border-primary-800/50 border-dashed">
                    <Bell className="h-12 w-12 text-primary-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-primary-400">Sin avisos pendientes</h3>
                    <p className="text-sm text-primary-600">Estás al día con todas las notificaciones.</p>
                </div>
            )}
        </div>
    );
}
