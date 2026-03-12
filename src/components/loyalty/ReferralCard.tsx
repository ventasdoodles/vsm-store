/**
 * // ─── COMPONENTE: REFERRAL CARD ───
 * // Propósito: Gestión de sistema de referidos (compartir e invitar).
 * // Arquitectura: Pure presentation with Web Share API integration.
 * // Estilo: High-Contrast Premium Glass with dynamic accents.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Copy,
    Users,
    Gift,
    CheckCircle,
    Share2,
    ArrowRight
} from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
import { REWARD_POINTS_REFERRER, REWARD_POINTS_REFERRED } from '@/lib/domain/loyalty';

interface ReferralCardProps {
    referralCode: string;
    stats: {
        count: number;
        completed: number;
        pointsEarned: number;
    };
    loading?: boolean;
}

export function ReferralCard({ referralCode, stats, loading }: ReferralCardProps) {
    const notify = useNotification();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        notify.info('Código copiado al portapapeles', '¡Compártelo!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '¡Únete a VSM Store!',
                    text: `Usa mi código ${referralCode} y obtén ${REWARD_POINTS_REFERRED} V-Coins de regalo en tu primera compra en VSM Store.`,
                    url: window.location.origin
                });
            } catch (err) {
                console.error('Error al compartir:', err);
            }
        } else {
            handleCopy();
        }
    };

    if (loading) {
        return (
            <div className="vsm-surface glass-premium animate-pulse h-64 flex items-center justify-center">
                <div className="text-theme-tertiary">Cargando sistema de referidos...</div>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="vsm-surface glass-premium overflow-hidden">
                {/* Header decorativo con fondo dinámico */}
                <div className="relative h-24 bg-gradient-to-br from-accent-primary/20 via-accent-secondary/10 to-transparent p-6 flex flex-col justify-end border-b border-white/5">
                    <div className="absolute top-4 right-6 opacity-10">
                        <Share2 size={64} className="rotate-12" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Invita y Gana</h3>
                    <p className="text-xs text-theme-secondary font-bold uppercase tracking-widest">Comparte tu código con amigos</p>
                </div>

                <div className="p-8 space-y-10">
                    {/* Código Box */}
                    <div className="relative group/code">
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary rounded-2xl blur-xl opacity-10 group-hover/code:opacity-30 transition duration-1000 animate-pulse-slow" />
                        <div className="relative flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-6 overflow-hidden backdrop-blur-xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] mb-2 opacity-50">Tu código maestro</span>
                                <span className="text-3xl font-black text-white tracking-[0.25em] italic uppercase">{referralCode}</span>
                            </div>
                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-500 shadow-2xl",
                                        copied 
                                            ? "bg-herbal-500 text-white" 
                                            : "bg-white/5 text-theme-tertiary border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
                                    )}
                                >
                                    <AnimatePresence initial={false}>
                                        {copied ? (
                                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <CheckCircle className="h-6 w-6" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <Copy className="h-6 w-6" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleShare}
                                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-primary text-white shadow-2xl shadow-accent-primary/30 hover:bg-accent-primary/90 transition-all duration-500"
                                >
                                    <Share2 className="h-6 w-6" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Reglas con estética mejorada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group/item">
                            <div className="h-12 w-12 shrink-0 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 group-hover/item:scale-110 transition-transform duration-500">
                                <Users className="h-6 w-6 text-accent-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Amigos invitados</h4>
                                <p className="text-xs text-theme-tertiary leading-relaxed opacity-60">
                                    Reciben <span className="text-accent-primary font-black uppercase italic">{REWARD_POINTS_REFERRED} V-Coins</span> al unirse.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group/item">
                            <div className="h-12 w-12 shrink-0 rounded-xl bg-herbal-500/10 flex items-center justify-center border border-herbal-500/20 group-hover/item:scale-110 transition-transform duration-500">
                                <Gift className="h-6 w-6 text-herbal-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Tu botín</h4>
                                <p className="text-xs text-theme-tertiary leading-relaxed opacity-60">
                                    Ganas <span className="text-herbal-400 font-black uppercase italic">{REWARD_POINTS_REFERRER} V-Coins</span> por su compra.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Dashboard Refinado */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Invitados', value: stats.count, color: 'text-white' },
                            { label: 'Completados', value: stats.completed, color: 'text-herbal-400' },
                            { label: 'Ganado', value: stats.pointsEarned, suffix: 'VC', color: 'text-gold-400' }
                        ].map((stat, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 text-center space-y-1 hover:border-white/10 transition-colors">
                                <span className="block text-[9px] font-black text-theme-tertiary uppercase tracking-[0.15em] opacity-40">{stat.label}</span>
                                <div className="flex items-center justify-center gap-1">
                                    <span className={cn("text-2xl font-black tracking-tighter italic uppercase", stat.color)}>{stat.value}</span>
                                    {stat.suffix && <span className="text-[9px] font-black text-gold-500/30 uppercase mt-1">{stat.suffix}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer interactivo */}
                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-theme-tertiary uppercase">¿Cómo funciona?</span>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:gap-2 transition-all duration-300">
                        Ver términos <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </section>
    );
}
