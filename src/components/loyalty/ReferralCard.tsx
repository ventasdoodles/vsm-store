import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Copy,
    Users,
    Gift,
    CheckCircle2,
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
                <div className="relative h-24 bg-gradient-to-br from-accent-primary/20 via-accent-secondary/10 to-transparent p-6 flex flex-col justify-end">
                    <div className="absolute top-4 right-6 opacity-10">
                        <Share2 size={64} className="rotate-12" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Invita y Gana</h3>
                    <p className="text-xs text-theme-secondary font-bold uppercase tracking-widest">Comparte tu código con amigos</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Código Box */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex items-center justify-between bg-zinc-900/80 border border-white/5 rounded-xl p-4 overflow-hidden">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-theme-tertiary uppercase mb-1">Tu código único</span>
                                <span className="text-2xl font-black text-white tracking-[0.2em]">{referralCode}</span>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300",
                                        copied ? "bg-herbal-500 text-white" : "bg-white/5 text-theme-secondary hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleShare}
                                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                                >
                                    <Share2 className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Reglas / Pasos rápidos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-accent-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-accent-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Amigos invitados</h4>
                                <p className="text-xs text-theme-tertiary leading-relaxed">
                                    Tus amigos reciben <span className="text-accent-primary font-bold">{REWARD_POINTS_REFERRED} V-Coins</span> al registrarse con tu código.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-herbal-500/10 flex items-center justify-center">
                                <Gift className="h-5 w-5 text-herbal-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Tus recompensas</h4>
                                <p className="text-xs text-theme-tertiary leading-relaxed">
                                    Ganas <span className="text-herbal-400 font-bold">{REWARD_POINTS_REFERRER} V-Coins</span> cuando realicen su primera compra.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 text-center space-y-1">
                            <span className="block text-[10px] font-bold text-theme-tertiary uppercase">Invitados</span>
                            <span className="text-xl font-black text-white">{stats.count}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 text-center space-y-1">
                            <span className="block text-[10px] font-bold text-theme-tertiary uppercase">Compeltados</span>
                            <span className="text-xl font-black text-white">{stats.completed}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 text-center space-y-1">
                            <span className="block text-[10px] font-bold text-theme-tertiary uppercase">Ganado</span>
                            <span className="flex items-center justify-center gap-1">
                                <span className="text-xl font-black text-gold-400">{stats.pointsEarned}</span>
                                <span className="text-[8px] font-bold text-gold-500/50">VC</span>
                            </span>
                        </div>
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
