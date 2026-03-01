/**
 * CustomerGodMode — Controles Críticos de Cuenta
 * 
 * Zona de peligro del CRM con capacidades de admin nivel Dios:
 * - Toggle de estado: Libre / Jaula (suspensión temporal) / Ban permanente.
 * - Auto-levantar suspensión con fecha límite.
 * - Transmisión forzada de notificaciones in-app al dispositivo del usuario.
 * 
 * @module admin/customers/details
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Megaphone, Send, AlertOctagon, Ban, Loader2, CheckCircle } from 'lucide-react';
import { updateCustomerStatus, sendCustomerNotification } from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerGodMode({ customer }: Props) {
    const queryClient = useQueryClient();
    const notify = useNotification();

    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');

    const updateStatusMutation = useMutation({
        mutationFn: ({ status, end }: { status: 'active' | 'suspended' | 'banned', end?: string }) =>
            updateCustomerStatus(customer.id, status, end),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            notify.success('Transición Exitosa', 'Nivel de acceso alterado exitosamente.');
        },
        onError: () => {
            notify.error('Fallo', 'Infracción de seguridad. No se pudo alterar.');
        }
    });

    const sendNotificationMutation = useMutation({
        mutationFn: () => sendCustomerNotification(customer.id, notifTitle, notifMessage, 'info'),
        onSuccess: () => {
            setNotifTitle('');
            setNotifMessage('');
            notify.success('Transmisión', 'Transmisión confirmada al dispositivo del usuario.');
        },
        onError: () => {
            notify.error('Fallo', 'Fallo en la transmisión.');
        }
    });

    const handleSendNotification = () => {
        if (!notifTitle.trim() || !notifMessage.trim()) {
            notify.error('Vacio', 'Protocolo incompleto. Ingresa título y cuerpo del mensaje.');
            return;
        }
        sendNotificationMutation.mutate();
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-gradient-to-b from-[#1a1014] to-[#130b0e] backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(220,38,38,0.05)]">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/5 border border-red-500/30 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)]">
                    <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse-slow" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-rose-500 uppercase tracking-wider">God Mode</h3>
                    <p className="text-xs text-rose-400/60">Controles críticos de cuenta</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10 bg-[#13141f]/40 p-4 rounded-2xl border border-red-500/10">
                
                {/* Status Toggles */}
                <div>
                    <label className="text-xs font-bold text-rose-400/80 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertOctagon className="h-3.5 w-3.5" /> Estado de Cuenta
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ status: 'active' })}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all duration-300
                                ${customer.account_status === 'active' || !customer.account_status 
                                ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)] scale-100' 
                                : 'bg-[#1a1c29] border-white/5 text-theme-secondary/50 hover:border-green-500/20 hover:text-green-400/50 hover:bg-green-500/5 hover:scale-95'}
                            `}
                        >
                            <CheckCircle className="h-4 w-4 mb-1" />
                            LIBRE
                        </button>
                        
                        <button
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ status: 'suspended' })}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all duration-300
                                ${customer.account_status === 'suspended' 
                                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)] scale-100' 
                                : 'bg-[#1a1c29] border-white/5 text-theme-secondary/50 hover:border-orange-500/20 hover:text-orange-400/50 hover:bg-orange-500/5 hover:scale-95'}
                            `}
                        >
                            <ShieldAlert className="h-4 w-4 mb-1" />
                            JAULA
                        </button>

                        <button
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ status: 'banned' })}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all duration-300
                                ${customer.account_status === 'banned' 
                                ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-100' 
                                : 'bg-[#1a1c29] border-white/5 text-theme-secondary/50 hover:border-red-500/20 hover:text-red-500/50 hover:bg-red-500/5 hover:scale-95'}
                            `}
                        >
                            <Ban className="h-4 w-4 mb-1" />
                            BAN
                        </button>
                    </div>

                    {customer.account_status === 'suspended' && (
                        <div className="mt-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl animate-in fade-in zoom-in-95">
                            <label className="text-xs font-medium text-orange-400/80 mb-2 block">Levantar jaula automáticamente el:</label>
                            <input
                                type="date"
                                className="w-full bg-[#13141f] border border-orange-500/30 rounded-lg px-3 py-2 text-sm text-orange-400 focus:outline-none focus:border-orange-400"
                                onChange={(e) => updateStatusMutation.mutate({ status: 'suspended', end: new Date(e.target.value).toISOString() })}
                            />
                        </div>
                    )}
                </div>

                <div className="h-px bg-red-500/10 w-full" />

                {/* Direct Transmission (Force push notif) */}
                <div>
                    <label className="text-xs font-bold text-rose-400/80 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <Megaphone className="h-3.5 w-3.5" /> Forzar Transmisión (In-App)
                    </label>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Asunto (ej. Alerta de Seguridad)"
                            className="w-full bg-[#1a1c29]/80 border border-white/5 focus:border-rose-500/50 rounded-xl px-4 py-2.5 text-sm text-rose-100 placeholder-rose-400/20 transition-colors focus:outline-none"
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Mensaje de solo-lectura para el usuario..."
                            rows={3}
                            className="w-full bg-[#1a1c29]/80 border border-white/5 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-rose-100 placeholder-rose-400/20 transition-colors focus:outline-none resize-none"
                            value={notifMessage}
                            onChange={e => setNotifMessage(e.target.value)}
                        />
                        <button
                            onClick={handleSendNotification}
                            disabled={sendNotificationMutation.isPending}
                            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)] active:scale-[0.98]"
                        >
                            {sendNotificationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {sendNotificationMutation.isPending ? 'Transmitiendo...' : 'Ejecutar Transmisión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
