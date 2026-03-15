import React from 'react';
/**
 * // ─── COMPONENTE: DashboardPulse ───
 * // Arquitectura: Presentational / AI Hybrid
 * // Propósito: Mostrar un resumen narrativo de la salud del negocio usando IA.
 */
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardPulse, type DashboardStats } from '@/services/admin';
import { cn } from '@/lib/utils';

interface DashboardPulseProps {
    stats: DashboardStats;
}

export const DashboardPulse = React.memo(({ stats }: DashboardPulseProps) => {
    const { data: pulse, isLoading, refetch } = useQuery({
        queryKey: ['admin', 'pulse'],
        queryFn: () => getDashboardPulse(stats),
        // No refetch automático para no gastar tokens innecesariamente
        staleTime: Infinity, 
    });

    const healthColor = pulse ? (
        pulse.health_score > 80 ? 'text-emerald-400' :
        pulse.health_score > 50 ? 'text-amber-400' : 'text-rose-400'
    ) : 'text-white/40';

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#1a1b26]/40 p-1 backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            
            <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
                            <Activity className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">
                                Business Pulse <span className="text-[10px] ml-1 text-violet-400/60 font-medium tracking-normal">(Beta AI)</span>
                            </h3>
                            <p className="text-[11px] text-white/40 font-medium">Análisis en tiempo real de tendencias y anomalías</p>
                        </div>
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl bg-violet-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Sparkles className="h-3 w-3" />
                        )}
                        Sincronizar IA
                    </button>
                </div>

                <AnimatePresence>
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3 py-2"
                        >
                            <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                            <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
                        </motion.div>
                    ) : pulse ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="relative rounded-2xl bg-white/[0.02] p-4 border border-white/5">
                                <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                                    "{pulse.narrative}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Anomalies */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block">Detección de Anomalías</span>
                                    <div className="space-y-2">
                                        {pulse.anomalies?.map((anomaly, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-amber-200/80">
                                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                                {anomaly}
                                            </div>
                                        ))}
                                        {(pulse.anomalies?.length || 0) === 0 && (
                                            <div className="text-xs font-bold text-emerald-400/80 flex items-center gap-2">
                                                <TrendingUp className="h-3 w-3" />
                                                Operación estable sin anomalías.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent border border-violet-500/10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Health Score</span>
                                    <div className={cn("text-4xl font-black tracking-tighter", healthColor)}>
                                        {pulse.health_score}%
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pulse.health_score}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className={cn("h-full", 
                                                pulse.health_score > 80 ? 'bg-emerald-500' : 
                                                pulse.health_score > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                            )} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <Activity className="h-8 w-8 text-white/10 mx-auto mb-2" />
                            <p className="text-xs font-bold text-white/30">Pulsa el botón para generar el informe de salud</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});
DashboardPulse.displayName = 'DashboardPulse';
