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
        <div className="vsm-surface glass-premium p-4 flex items-center gap-3 border-herbal-500/20 bg-herbal-500/5">
            <CheckCircle className="h-5 w-5 text-herbal-400" />
            <p className="text-xs font-bold text-herbal-400 uppercase tracking-widest">
                ¡Código de referido aplicado con éxito!
            </p>
        </div>
    );

    return (
        <div className="vsm-surface glass-premium overflow-hidden">
            <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Ticket className="h-4 w-4 text-accent-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">¿Tienes un código de invitación?</h4>
                        <p className="text-[10px] text-theme-tertiary font-medium">Ingrésalo para recibir {REWARD_POINTS_REFERRED} V-Coins en tu primera compra.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="EJ: VSM-X7R2"
                        disabled={applyMutation.isPending || status === 'success'}
                        className={cn(
                            "w-full h-12 bg-zinc-900/50 border rounded-xl px-4 text-sm font-black tracking-[0.2em] uppercase transition-all duration-300",
                            "placeholder:text-zinc-700 placeholder:tracking-normal placeholder:font-medium",
                            status === 'error' ? "border-red-500/50 text-red-400" : "border-white/5 text-white focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={!code.trim() || applyMutation.isPending || status === 'success'}
                        className="absolute right-2 top-2 h-8 px-4 rounded-lg bg-accent-primary text-white text-[10px] font-black uppercase tracking-tighter hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {applyMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <>
                                Aplicar <ArrowRight className="h-3 w-3" />
                            </>
                        )}
                    </button>
                </form>

                <AnimatePresence exitBeforeEnter>
                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-red-400"
                        >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[10px] font-bold uppercase">{errorMsg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
