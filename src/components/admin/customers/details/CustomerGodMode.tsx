import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Megaphone, Send } from 'lucide-react';
import { updateCustomerStatus, sendCustomerNotification } from '@/services/admin';
import { useNotificationsStore } from '@/stores/notifications.store';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerGodMode({ customer }: Props) {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();

    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');

    const updateStatusMutation = useMutation({
        mutationFn: ({ status, end }: { status: 'active' | 'suspended' | 'banned', end?: string }) =>
            updateCustomerStatus(customer.id, status, end),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            addNotification({ type: 'success', title: 'Estado Actualizado', message: 'El estado del usuario ha cambiado.' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado.' });
        }
    });

    const sendNotificationMutation = useMutation({
        mutationFn: () => sendCustomerNotification(customer.id, notifTitle, notifMessage, 'info'),
        onSuccess: () => {
            setNotifTitle('');
            setNotifMessage('');
            addNotification({ type: 'success', title: 'Mensaje Enviado', message: 'El usuario recibirá la notificación.' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo enviar el mensaje.' });
        }
    });

    const handleSendNotification = () => {
        if (!notifTitle.trim() || !notifMessage.trim()) {
            addNotification({ type: 'error', title: 'Campos vacíos', message: 'Escribe un título y mensaje.' });
            return;
        }
        sendNotificationMutation.mutate();
    };

    return (
        <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-5">
            <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Zona de Dios (Acciones)
            </h3>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                    onClick={() => updateStatusMutation.mutate({ status: 'active' })}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${customer.account_status === 'active' || !customer.account_status ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-theme-primary/40 text-theme-primary0 border-theme hover:text-green-400'}`}
                >
                    Activo
                </button>
                <button
                    onClick={() => updateStatusMutation.mutate({ status: 'suspended' })}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${customer.account_status === 'suspended' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-theme-primary/40 text-theme-primary0 border-theme hover:text-orange-400'}`}
                >
                    Suspender
                </button>
                <button
                    onClick={() => updateStatusMutation.mutate({ status: 'banned' })}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${customer.account_status === 'banned' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-theme-primary/40 text-theme-primary0 border-theme hover:text-red-400'}`}
                >
                    Banear
                </button>
            </div>

            {customer.account_status === 'suspended' && (
                <div className="mb-4">
                    <label className="text-xs text-theme-primary0 mb-1 block">Fin de suspensión (Opcional)</label>
                    <input
                        type="date"
                        className="w-full bg-theme-primary/50 border border-theme rounded-lg p-2 text-sm text-theme-primary"
                        onChange={(e) => updateStatusMutation.mutate({ status: 'suspended', end: new Date(e.target.value).toISOString() })}
                    />
                </div>
            )}

            <div className="border-t border-theme pt-4 mt-4">
                <h4 className="text-xs font-semibold text-theme-secondary mb-2 flex items-center gap-1">
                    <Megaphone className="h-3 w-3" /> Enviar Aviso
                </h4>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Título (ej. Advertencia)"
                        className="w-full bg-theme-primary/50 border border-theme rounded-lg p-2 text-sm text-theme-primary"
                        value={notifTitle}
                        onChange={e => setNotifTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Mensaje al usuario (no puede responder)..."
                        rows={3}
                        className="w-full bg-theme-primary/50 border border-theme rounded-lg p-2 text-sm text-theme-primary resize-none"
                        value={notifMessage}
                        onChange={e => setNotifMessage(e.target.value)}
                    />
                    <button
                        onClick={handleSendNotification}
                        disabled={sendNotificationMutation.isPending}
                        className="w-full bg-theme-secondary hover:bg-theme-secondary text-theme-primary py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Send className="h-3 w-3" />
                        {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </div>
            </div>
        </div>
    );
}
