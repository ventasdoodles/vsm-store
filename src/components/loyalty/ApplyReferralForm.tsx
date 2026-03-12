/**
 * // ─── COMPONENTE: APPLY REFERRAL FORM ───
 * // Propósito: Formulario para la aplicación de códigos de invitación (referidos).
 * // Arquitectura: Pure presentation with mutation-based logic (§1.1).
 * // Estilo: Premium Floating Label Input (§2.1).
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppliedReferral, useApplyReferralCode } from '@/hooks/useLoyalty';
import { REWARD_POINTS_REFERRED } from '@/lib/domain/loyalty';
import { cn } from '@/lib/utils';

export function ApplyReferralForm() {
    const { user } = useAuth();
    const { data: applied, isLoading: loadingApplied } = useAppliedReferral(user?.id);
    const applyMutation = useApplyReferralCode();

    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !code.trim() || applyMutation.isPending) return;

        try {
            setStatus('idle');
            await applyMutation.mutateAsync({ code: code.trim().toUpperCase(), customerId: user.id });
            setStatus('success');
            setCode('');
        } catch (err: unknown) {
            setStatus('error');
            const message = err instanceof Error ? err.message : 'Error al aplicar el código';
            setErrorMsg(message);
        }
    };

    if (loadingApplied) return null;

    if (applied) return (
        <div className="vsm-surface border-herbal-500/20 bg-herbal-500/5 p-6 flex items-center gap-4 group/applied overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-herbal-500/10 to-transparent translate-x-[-100%] group-hover/applied:translate-x-[100%] transition-transform duration-1000" />
            <div className="h-12 w-12 rounded-xl bg-herbal-500/10 flex items-center justify-center border border-herbal-500/20">
                <CheckCircle className="h-6 w-6 text-herbal-400" />
            </div>
            <div>
                <p className="text-xs font-black text-herbal-400 uppercase tracking-[0.15em]">¡Código Maestro Activado!</p>
                <p className="text-[10px] text-herbal-400/60 font-medium">Has desbloqueado tus recompensas de bienvenida.</p>
            </div>
        </div>
    );

    return (
        <div className="vsm-surface glass-premium overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                        <Ticket className="h-6 w-6 text-accent-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">¿Tienes un código?</h4>
                        <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60">Gana {REWARD_POINTS_REFERRED} V-Coins al instante</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group/input">
                        {/* Premium Floating Label Input */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl blur opacity-0 group-focus-within/input:opacity-20 transition duration-500" />
                        
                        <div className="relative">
                            <input
                                id="referral-code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder=" "
                                disabled={applyMutation.isPending || status === 'success'}
                                className={cn(
                                    "peer w-full rounded-2xl border border-white/5 bg-white/[0.02] px-5 pt-7 pb-3 text-sm font-black text-white tracking-[0.2em] uppercase placeholder-transparent focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/20 transition-all backdrop-blur-xl",
                                    status === 'error' && "border-red-500/30 text-red-400"
                                )}
                            />
                            <label
                                htmlFor="referral-code"
                                className="absolute left-5 top-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-theme-tertiary transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-placeholder-shown:tracking-normal peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:font-black peer-focus:tracking-[0.2em] peer-focus:text-accent-primary"
                            >
                                Código de Invitación
                            </label>

                            <button
                                type="submit"
                                disabled={!code.trim() || applyMutation.isPending || status === 'success'}
                                className="absolute right-2.5 top-2.5 bottom-2.5 px-6 rounded-xl bg-accent-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-accent-secondary disabled:opacity-0 disabled:translate-x-4 transition-all duration-500 flex items-center gap-2 group/btn shadow-xl shadow-accent-primary/20"
                            >
                                {applyMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Activar <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2 text-red-400/80 px-2"
                            >
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{errorMsg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}
