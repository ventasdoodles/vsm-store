import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const MOCK_QUESTS: Quest[] = [
    {
        id: 'q1',
        title: 'Explorador 420',
        description: 'Visita 3 productos de la sección herbal para conocer lo natural.',
        reward: 50,
        progress: 2,
        target: 3,
        type: 'explorer'
    },
    {
        id: 'q2',
        title: 'Mente Curiosa',
        description: 'Pregunta al Concierge sobre los beneficios de los terpenos.',
        reward: 25,
        progress: 0,
        target: 1,
        type: 'social'
    },
    {
        id: 'q3',
        title: 'Coleccionista VIP',
        description: 'Realiza tu segunda compra en menos de 30 días.',
        reward: 500,
        progress: 0,
        target: 1,
        isLocked: true,
        type: 'buyer'
    }
];

export const SmartQuests: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-vape-400" />
                    <h2 className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-80">
                        Smart Quests (AI Driven)
                    </h2>
                </div>
                <span className="text-[9px] font-bold text-herbal-400 bg-herbal-400/10 px-2 py-0.5 rounded-full animate-pulse-slow">
                    Misiones Activas
                </span>
            </div>

            <div className="grid gap-3">
                {MOCK_QUESTS.map((quest, idx) => (
                    <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
                            quest.isLocked 
                                ? "bg-black/20 border-white/5 opacity-60" 
                                : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-vape-500/30"
                        )}
                    >
                        {/* Progress Background */}
                        <div 
                            className="absolute inset-y-0 left-0 bg-vape-500/5 transition-all duration-1000"
                            style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                        />

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
                                    <span className="text-xs font-black text-vape-400">
                                        +{quest.reward} V-Coins
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

                        {/* Progress Bar Footer (Subtle) */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-1 flex-1 rounded-full bg-black/40 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-vape-500 to-vape-300 transition-all duration-1000"
                                    style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                                />
                            </div>
                            <span className="text-[9px] font-black text-theme-tertiary uppercase">
                                {quest.progress}/{quest.target}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
