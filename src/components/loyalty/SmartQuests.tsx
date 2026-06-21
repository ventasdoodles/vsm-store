/**
 * // ─── COMPONENTE: SmartQuests ───
 * // Arquitectura: Smart Component — misiones dinámicas basadas en datos reales del usuario.
 * // Proposito: Generar quests contextuales de V-Coins basados en el perfil real del cliente.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin datos mock. Usa hooks de lealtad existentes.
 */
import React from 'react';
import { m } from 'framer-motion';
import { Target, Zap, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTierProgress, useReferralStats } from '@/hooks/useLoyalty';

interface Quest {
    id: string;
    title: string;
    description: string;
    reward: number;
    progress: number;
    target: number;
    isLocked?: boolean;
    isCompleted?: boolean;
    type: 'explorer' | 'social' | 'buyer';
}

function buildQuests(
    totalOrders: number,
    referralsCompleted: number,
    totalSpent: number,
    currentTier: string,
): Quest[] {
    const quests: Quest[] = [];

    // Quest 1: Primera compra
    const firstOrderDone = totalOrders >= 1;
    quests.push({
        id: 'q-first-order',
        title: 'Primera Compra',
        description: 'Realiza tu primer pedido en VSM Store para ganar V-Coins de bienvenida.',
        reward: 50,
        progress: firstOrderDone ? 1 : 0,
        target: 1,
        isCompleted: firstOrderDone,
        type: 'buyer',
    });

    // Quest 2: Referir un amigo
    const referralDone = referralsCompleted >= 1;
    quests.push({
        id: 'q-referral',
        title: 'Embajador VSM',
        description: 'Invita a un amigo con tu código de referido y gana V-Coins cuando compre.',
        reward: 50,
        progress: referralDone ? 1 : 0,
        target: 1,
        isCompleted: referralDone,
        type: 'social',
    });

    // Quest 3: Alcanzar Silver (solo si aún es Bronze)
    if (currentTier === 'bronze') {
        const silverThreshold = 5000;
        quests.push({
            id: 'q-reach-silver',
            title: 'Rango Silver',
            description: `Acumula $${silverThreshold.toLocaleString('es-MX')} en compras para desbloquear beneficios Silver.`,
            reward: 200,
            progress: Math.min(Math.round(totalSpent), silverThreshold),
            target: silverThreshold,
            type: 'buyer',
        });
    }

    // Quest 4: Comprador frecuente (5 pedidos) — bloqueado si < 3 pedidos
    const frequentTarget = 5;
    const frequentDone = totalOrders >= frequentTarget;
    quests.push({
        id: 'q-frequent-buyer',
        title: 'Comprador Frecuente',
        description: `Completa ${frequentTarget} pedidos para desbloquear una recompensa especial.`,
        reward: 150,
        progress: Math.min(totalOrders, frequentTarget),
        target: frequentTarget,
        isCompleted: frequentDone,
        isLocked: totalOrders < 1,
        type: 'buyer',
    });

    return quests;
}

export const SmartQuests: React.FC = () => {
    const { user, profile } = useAuth();
    const { data: tierData } = useTierProgress(user?.id);
    const { data: referralStats } = useReferralStats(user?.id);

    const totalOrders = profile?.total_orders ?? 0;
    const totalSpent = tierData?.totalSpent ?? profile?.total_spent ?? 0;
    const currentTier = tierData?.currentTier ?? 'bronze';
    const referralsCompleted = referralStats?.completed ?? 0;

    const quests = buildQuests(totalOrders, referralsCompleted, totalSpent, currentTier);

    // No mostrar sección si todas las misiones están completadas
    const allDone = quests.every((q) => q.isCompleted);
    const activeCount = quests.filter((q) => !q.isCompleted && !q.isLocked).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-vape-400" />
                    <h2 className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-80">
                        Smart Quests
                    </h2>
                </div>
                <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full",
                    allDone
                        ? "text-herbal-400 bg-herbal-400/10"
                        : "text-herbal-400 bg-herbal-400/10 animate-pulse-slow"
                )}>
                    {allDone ? '¡Todas completadas!' : `${activeCount} Misiones Activas`}
                </span>
            </div>

            <div className="grid gap-3">
                {quests.map((quest, idx) => (
                    <m.div
                        key={quest.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
                            quest.isCompleted
                                ? "bg-herbal-500/5 border-herbal-500/20 opacity-80"
                                : quest.isLocked
                                    ? "bg-black/20 border-white/5 opacity-60"
                                    : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-vape-500/30"
                        )}
                    >
                        {/* Progress Background */}
                        {!quest.isCompleted && (
                            <div
                                className="absolute inset-y-0 left-0 bg-vape-500/5 transition-all duration-1000"
                                style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                            />
                        )}

                        <div className="relative flex items-center gap-4">
                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                                quest.isCompleted
                                    ? "bg-herbal-500/20 border-herbal-500/30 text-herbal-400"
                                    : quest.isLocked
                                        ? "bg-white/5 border-white/5 text-theme-tertiary"
                                        : "bg-vape-500/20 border-vape-500/30 text-vape-400 group-hover:bg-vape-500/30"
                            )}>
                                {quest.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : quest.isLocked ? <Lock className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="text-sm font-bold text-theme-primary truncate">
                                        {quest.title}
                                    </h3>
                                    <span className={cn(
                                        "text-xs font-black",
                                        quest.isCompleted ? "text-herbal-400" : "text-vape-400"
                                    )}>
                                        {quest.isCompleted ? '✓ Completada' : `+${quest.reward} V-Coins`}
                                    </span>
                                </div>
                                <p className="text-[11px] text-theme-secondary leading-tight line-clamp-1">
                                    {quest.description}
                                </p>
                            </div>

                            {!quest.isLocked && !quest.isCompleted && (
                                <ChevronRight className="h-4 w-4 text-theme-tertiary group-hover:text-white transition-colors" />
                            )}
                        </div>

                        {/* Progress Bar Footer */}
                        {!quest.isCompleted && (
                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-1 flex-1 rounded-full bg-black/40 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-vape-500 to-vape-300 transition-all duration-1000"
                                        style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-[9px] font-black text-theme-tertiary uppercase">
                                    {quest.target >= 1000
                                        ? `$${quest.progress.toLocaleString('es-MX')}/$${quest.target.toLocaleString('es-MX')}`
                                        : `${quest.progress}/${quest.target}`
                                    }
                                </span>
                            </div>
                        )}
                    </m.div>
                ))}
            </div>
        </div>
    );
};
