import { motion } from 'framer-motion';
import { Sparkles, TrendingDown } from 'lucide-react';
import { OraclePrediction } from '@/services';
import { cn } from '@/lib/utils';

interface StockOracleBadgeProps {
    prediction: OraclePrediction | null;
    isLoading: boolean;
}

/**
 * StockOracleBadge - Visualización premium de profecías de stock (Wave 24)
 * Diseño: "Abyssal Oracle" (Glassmorphism + Neon Glow)
 */
export function StockOracleBadge({ prediction, isLoading }: StockOracleBadgeProps) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-vape-500/20" />
                <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
        );
    }

    if (!prediction) return null;

    const isCritical = prediction.urgencyLevel === 'critical' || prediction.urgencyLevel === 'high';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "relative overflow-hidden p-4 rounded-2xl border transition-all duration-500 shadow-2xl group",
                isCritical 
                    ? "bg-red-500/10 border-red-500/30 shadow-red-500/10" 
                    : "bg-vape-500/10 border-vape-500/30 shadow-vape-500/10"
            )}
        >
            {/* Ambient Background Glow */}
            <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] opacity-40 animate-pulse",
                isCritical ? "bg-red-500" : "bg-vape-500"
            )} />

            <div className="flex items-start gap-4 relative z-10">
                {/* Oracle Icon Container */}
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative",
                    isCritical 
                        ? "bg-gradient-to-br from-red-500 to-orange-600" 
                        : "bg-gradient-to-br from-vape-500 to-blue-600"
                )}>
                    {isCritical ? (
                        <TrendingDown className="w-5 h-5 text-white animate-bounce" />
                    ) : (
                        <Sparkles className="w-5 h-5 text-white" />
                    )}
                    
                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-xl border border-white/30 animate-ping opacity-20" />
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            isCritical ? "text-red-400" : "text-vape-400"
                        )}>
                            Profecía de Stock VSM IA
                        </span>
                        {isCritical && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </div>
                    
                    <h4 className="text-sm font-bold text-white leading-snug">
                        {prediction.customerMessage}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[11px] text-white/50 italic font-medium">
                            Agotamiento estimado: {new Date(prediction.depletionDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle bottom glint */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
    );
}
