import { useState } from 'react';
import { useAdminProactiveInsights } from '@/hooks/admin/useAdminCustomers';
import { 
    Sparkles, RefreshCw, ChevronRight, 
    AlertCircle, TrendingUp, Zap, Target 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type CustomerInsight } from '@/services/admin';
import { cn } from '@/lib/utils';

export function AIInsights() {
    const { insights, isLoading, refetch, isError } = useAdminProactiveInsights();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0D0D0D]/50 backdrop-blur-3xl p-8 group">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-vape-500/10 blur-[80px] group-hover:bg-vape-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-vape-500/10 border border-vape-500/20">
                            <Sparkles className="h-5 w-5 text-vape-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight">AI Insights</h2>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Sugerencias Proactivas</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing || isLoading}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("h-4 w-4", (isRefreshing || isLoading) && "animate-spin")} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {insights.map((insight: CustomerInsight, idx: number) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group/card relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-vape-500/30 hover:bg-vape-500/[0.02] transition-all duration-500"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn(
                                        "p-2 rounded-xl border",
                                        insight.type === 'critical' && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                                        insight.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                                        insight.type === 'warning' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                                        insight.type === 'info' && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                    )}>
                                        {insight.type === 'critical' && <AlertCircle className="h-4 w-4" />}
                                        {insight.type === 'success' && <TrendingUp className="h-4 w-4" />}
                                        {insight.type === 'warning' && <Zap className="h-4 w-4" />}
                                        {insight.type === 'info' && <Target className="h-4 w-4" />}
                                    </div>
                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">GEMINI 2.0 FLASH</span>
                                </div>

                                <h3 className="text-sm font-bold text-white mb-2 group-hover/card:text-vape-300 transition-colors">{insight.title}</h3>
                                <p className="text-xs text-white/40 font-medium leading-relaxed mb-6">
                                    {insight.description}
                                </p>

                                {insight.actionLabel && (
                                    <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-widest group-hover/card:bg-vape-500 group-hover/card:text-white transition-all">
                                        {insight.actionLabel}
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isError && !isLoading && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-rose-400/60">
                            <AlertCircle className="h-12 w-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest text-center">
                                Error al cargar inteligencia<br/>
                                <span className="text-[10px] opacity-70 mt-1 block">La cuota de IA podría estar agotada</span>
                            </p>
                        </div>
                    )}

                    {insights.length === 0 && !isLoading && !isError && (

                        <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20">
                            <Sparkles className="h-12 w-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No hay recomendaciones en este momento</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
