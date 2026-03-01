import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Ticket, Loader2 } from 'lucide-react';
import { adjustPoints } from '@/services/loyalty.service';
import { useNotificationsStore } from '@/stores/notifications.store';

interface Props {
    customerId: string;
}

export function CustomerMarketing({ customerId }: Props) {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();
    
    const [pointsAmount, setPointsAmount] = useState('');
    const [pointsReason, setPointsReason] = useState('');

    const adjustPointsMutation = useMutation({
        mutationFn: () => adjustPoints(customerId, Number(pointsAmount), pointsReason || 'Ajuste manual (Admin)'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customerId] });
            addNotification({ type: 'success', title: 'Puntos Asignados', message: `Se han agregado ${pointsAmount} puntos al cliente.` });
            setPointsAmount('');
            setPointsReason('');
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudieron asignar los puntos.' });
        }
    });

    const handleGivePoints = () => {
        if (!pointsAmount || isNaN(Number(pointsAmount))) {
            addNotification({ type: 'error', title: 'Monto inválido', message: 'Ingresa una cantidad válida de puntos.' });
            return;
        }
        adjustPointsMutation.mutate();
    };

    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
            <h3 className="text-sm font-semibold text-pink-400 mb-4 flex items-center gap-2">
                <Gift className="h-4 w-4" /> Acciones de Marketing
            </h3>

            <div className="space-y-4">
                {/* Regalar Puntos */}
                <div className="p-4 rounded-xl border border-theme bg-theme-primary/40">
                    <h4 className="text-xs font-bold text-theme-primary mb-2 flex items-center gap-1">
                        <Gift className="h-3 w-3 text-yellow-400" /> Regalar Puntos de Lealtad
                    </h4>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Cantidad (ej. 50)"
                                value={pointsAmount}
                                onChange={e => setPointsAmount(e.target.value)}
                                className="w-1/3 bg-theme-primary/50 border border-theme rounded-lg px-3 py-2 text-sm text-theme-primary"
                            />
                            <input
                                type="text"
                                placeholder="Motivo (ej. Compensación por retraso)"
                                value={pointsReason}
                                onChange={e => setPointsReason(e.target.value)}
                                className="flex-1 bg-theme-primary/50 border border-theme rounded-lg px-3 py-2 text-sm text-theme-primary"
                            />
                        </div>
                        <button
                            onClick={handleGivePoints}
                            disabled={adjustPointsMutation.isPending}
                            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {adjustPointsMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
                            Abonar Puntos
                        </button>
                    </div>
                </div>

                {/* Generar Cupón (Placeholder for future) */}
                <div className="p-4 rounded-xl border border-theme bg-theme-primary/40 opacity-50 pointer-events-none">
                    <h4 className="text-xs font-bold text-theme-primary mb-2 flex items-center gap-1">
                        <Ticket className="h-3 w-3 text-blue-400" /> Generar Cupón Único (Próximamente)
                    </h4>
                    <p className="text-xs text-theme-secondary mb-3">Crea un cupón de descuento exclusivo para este cliente.</p>
                    <button className="w-full bg-theme-secondary text-theme-primary py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        <Ticket className="h-3 w-3" />
                        Crear Cupón
                    </button>
                </div>
            </div>
        </div>
    );
}
