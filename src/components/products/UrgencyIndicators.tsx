import { Flame, TrendingUp, Check, PackageX, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UrgencyIndicatorsProps {
    stock: number;
    viewCount?: number;
    className?: string;
}

export const UrgencyIndicators = ({ stock, viewCount, className }: UrgencyIndicatorsProps) => {
    // Simular personas viendo (fake pero efectivo)
    const [viewing, setViewing] = useState(() => viewCount || Math.floor(Math.random() * 15) + 5);

    // Simular última compra
    const [lastPurchaseTime] = useState(() => Math.floor(Math.random() * 180) + 30); // 30-210 minutos
    const lastPurchaseHours = Math.floor(lastPurchaseTime / 60);
    const lastPurchaseMinutes = lastPurchaseTime % 60;

    // Actualizar viewing count cada 10-30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            setViewing((prev) => Math.max(3, Math.min(20, prev + change)));
        }, Math.floor(Math.random() * 20000) + 10000);

        return () => clearInterval(interval);
    }, []);

    // Calcular porcentaje vendido (simulado)
    const soldPercentage = stock > 10 ? 60 : 85;

    // Out of Stock State
    if (stock === 0) {
        return (
            <div className={cn("flex items-center gap-2 text-red-500 font-medium bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20", className)}>
                <PackageX className="w-4 h-4" />
                <span>Agotado</span>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("space-y-4 p-4 bg-gradient-to-br from-theme-secondary/10 to-transparent border border-theme/20 rounded-2xl", className)}
        >
            {/* Stock Status */}
            {stock <= 10 ? (
                // Low Stock Warning
                <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-3 text-orange-500 bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20"
                >
                    <Flame className="w-5 h-5 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="font-bold text-sm tracking-wide">
                        {stock <= 3
                            ? `¡SOLO QUEDAN ${stock} EN STOCK!`
                            : `¡Últimas ${stock} unidades!`}
                    </span>
                </motion.div>
            ) : (
                // Normal Stock
                <div className="flex items-center gap-2 text-emerald-500">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold text-sm">En stock y listo para enviar</span>
                </div>
            )}

            {/* People Viewing */}
            <div className="flex items-center gap-3 text-theme-secondary">
                <div className="relative flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </div>
                <span className="text-sm">
                    <motion.span 
                        key={viewing}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-black text-theme-primary inline-block"
                    >
                        {viewing}
                    </motion.span> personas viendo esto ahora
                </span>
            </div>

            {/* Last Purchase */}
            <div className="flex items-center gap-3 text-theme-secondary">
                <Activity className="w-4 h-4 text-vape-500" />
                <span className="text-sm">
                    Última compra hace{' '}
                    <span className="font-semibold text-theme-primary">
                        {lastPurchaseHours > 0 ? `${lastPurchaseHours}h ` : ''}{lastPurchaseMinutes}m
                    </span>
                </span>
            </div>

            {/* Sold Progress (Only for low stock to increase urgency) */}
            {stock <= 10 && (
                <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="text-theme-secondary font-medium">Vendido</span>
                        </div>
                        <span className="font-black text-orange-500">{soldPercentage}%</span>
                    </div>
                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${soldPercentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 rounded-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
