/**
 * CustomerMarketing — Máquina de Retención y Lealtad
 * 
 * Panel de incentivos directos al cliente:
 * - Controlador de V-Coins: inyección manual de puntos con motivo.
 * - Generador de cupón dedicado 1-uso (TODO: integrar con backend).
 * Utiliza el servicio de loyalty para ajustes de puntos en tiempo real.
 * 
 * @module admin/customers/details
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ticket, Loader2, Sparkles, Coins, TrendingUp } from 'lucide-react';
import { adjustPoints, getPointsBalance } from '@/services/loyalty.service';
import { useNotification } from '@/hooks/useNotification';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerMarketing({ customer }: Props) {
    const queryClient = useQueryClient();
    const notify = useNotification();

    const { data: currentCoins = 0 } = useQuery({
        queryKey: ['admin', 'customer', customer.id, 'points'],
        queryFn: () => getPointsBalance(customer.id),
        enabled: !!customer.id,
    });
    
    const [pointsAmount, setPointsAmount] = useState('');
    const [pointsReason, setPointsReason] = useState('');
    const [isGeneratingCoupon] = useState(false);

    const adjustPointsMutation = useMutation({
        mutationFn: () => adjustPoints(customer.id, Number(pointsAmount), pointsReason || 'Ajuste manual (Admin)'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id, 'points'] });
            notify.success('Asignación Exitosa', `Se han agregado ${pointsAmount} V-Coins al cliente.`);
            setPointsAmount('');
            setPointsReason('');
        },
        onError: () => {
            notify.error('Fallo', 'No se pudieron asignar los V-Coins.');
        }
    });

    const handleGivePoints = () => {
        if (!pointsAmount || isNaN(Number(pointsAmount)) || Number(pointsAmount) <= 0) {
            notify.error('Monto Inválido', 'Ingresa una cantidad válida de V-Coins.');
            return;
        }
        adjustPointsMutation.mutate();
    };

    // TODO: Integrar con admin-coupons.service cuando exista la API de cupones dedicados.
    // Botón deshabilitado hasta que se implemente el backend real.
    const handleGenerateUniqueCoupon = () => {
        notify.warning('Próximamente', 'La generación de cupones dedicados estará disponible en una actualización futura.');
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/5 border border-pink-500/20 shadow-inner">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Máquina de Retención</h3>
                    <p className="text-xs text-theme-secondary/70">Incentivos y lealtad</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {/* V-Coins Controller */}
                <div className="p-5 rounded-2xl border border-white/5 bg-[#1a1c29]/50 hover:bg-[#1a1c29]/80 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-400" /> Controlador V-Coins
                        </h4>
                        <div className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20 flex items-center gap-1">
                            {currentCoins} Disponibles
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <div className="relative w-1/3">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary font-bold">+</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={pointsAmount}
                                    onChange={e => setPointsAmount(e.target.value)}
                                    className="w-full bg-[#13141f] border border-white/10 focus:border-yellow-400/50 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white font-medium placeholder-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-yellow-400/50"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Motivo (ej. Compensación VIP)"
                                value={pointsReason}
                                onChange={e => setPointsReason(e.target.value)}
                                className="flex-1 bg-[#13141f] border border-white/10 focus:border-yellow-400/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-yellow-400/50"
                            />
                        </div>
                        <button
                            onClick={handleGivePoints}
                            disabled={adjustPointsMutation.isPending}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300
                                ${pointsAmount ? 'bg-gradient-to-r from-yellow-500/20 to-amber-600/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-white/5 text-theme-secondary border border-transparent hover:bg-white/10'}
                            `}
                        >
                            {adjustPointsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                            Inyectar V-Coins a la Billetera
                        </button>
                    </div>
                </div>

                {/* Cupón Único */}
                <div className="p-5 rounded-2xl border border-white/5 bg-[#1a1c29]/50 hover:bg-[#1a1c29]/80 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-blue-400" /> Cupón Dedicado One-Click
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">Nuevo</span>
                    </div>
                    <p className="text-xs text-theme-secondary/80 mb-4 leading-relaxed">
                        Genera un cupón de 10% de descuento irrepetible (1 uso) anclado estrictamente a este correo. Ideal para carritos abandonados o disculpas.
                    </p>
                    <button 
                        onClick={handleGenerateUniqueCoupon}
                        disabled={isGeneratingCoupon}
                        className="w-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] focus:scale-[0.98]"
                    >
                        {isGeneratingCoupon ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</>
                        ) : (
                            <><Sparkles className="h-4 w-4" /> Generar y Copiar MAGIC-10</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
