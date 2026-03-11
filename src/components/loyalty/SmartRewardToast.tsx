import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, Copy, CheckCircle } from 'lucide-react';
import { claimIAProposition } from '@/services/loyaltyIA.service';
import { useLoyaltyIA } from '@/hooks/useLoyaltyIA';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

export function SmartRewardToast() {
    const notify = useNotification();
    const { proposition } = useLoyaltyIA();
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (proposition) {
            // Pequeño delay para que no aparezca de golpe al cargar
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [proposition]);

    const handleCopy = () => {
        if (!proposition) return;
        navigator.clipboard.writeText(proposition.generated_code);
        setCopied(true);
        notify.success('¡Cupón copiado!', 'Usa tu beneficio exclusivo en el checkout.');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDismiss = async () => {
        setIsVisible(false);
        // Si el usuario lo cierra, lo marcamos como reclamado/visto para no molestar más
        if (proposition) {
            await claimIAProposition(proposition.id);
        }
    };

    if (!proposition) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="fixed bottom-24 right-4 z-[100] w-[320px] md:w-[380px]"
                >
                    <div className="vsm-surface glass-premium overflow-hidden border-accent-primary/20 shadow-2xl shadow-accent-primary/10">
                        {/* Header con brillo */}
                        <div className="relative p-4 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/10 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-accent-primary flex items-center justify-center animate-pulse">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Oferta Personalizada IA</span>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10 text-theme-tertiary transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-white font-bold leading-tight">
                                    {proposition.personalized_message}
                                </h4>
                                <div className="flex items-center gap-2 text-herbal-400">
                                    <Gift size={14} />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                        Beneficio: {proposition.discount_value}{proposition.discount_type === 'percentage' ? '%' : '$'} de descuento
                                    </span>
                                </div>
                            </div>

                            {/* Code Box UI */}
                            <div className="relative group cursor-pointer" onClick={handleCopy}>
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                                <div className="relative flex items-center justify-between bg-zinc-900/60 border border-white/10 rounded-xl p-3">
                                    <code className="text-lg font-black text-white tracking-widest uppercase">
                                        {proposition.generated_code}
                                    </code>
                                    <div className={cn(
                                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                        copied ? "bg-herbal-500 text-white" : "bg-white/5 text-theme-tertiary"
                                    )}>
                                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    </div>
                                </div>
                                <p className="text-[9px] text-center mt-2 text-theme-tertiary font-bold uppercase tracking-widest opacity-60">
                                    Haz clic para copiar y usar en tu compra
                                </p>
                            </div>
                        </div>

                        {/* Footer / Timer */}
                        <div className="px-5 py-2 bg-white/5 border-t border-white/5">
                            <p className="text-[9px] text-theme-tertiary font-medium">
                                Esta oferta generada por IA expira en 48 horas.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
