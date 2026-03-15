import React from 'react';
import { Activity, TrendingUp, ShoppingBag, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdminPulse } from '@/hooks/admin/useAdminPulse';

export const AdminPulse = React.memo(() => {
    const { metrics, isLoading } = useAdminPulse();

    return (
        <AnimatePresence>
            {!isLoading && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg"
                >
                    {/* Status Heartbeat */}
                    <div className="relative flex items-center justify-center mr-1">
                        <div className={cn(
                            "h-2 w-2 rounded-full animate-ping absolute",
                            metrics.status === 'optimal' && "bg-emerald-500/50",
                            metrics.status === 'busy' && "bg-amber-500/50",
                            metrics.status === 'alert' && "bg-rose-500/50"
                        )} />
                        <div className={cn(
                            "h-2 w-2 rounded-full relative",
                            metrics.status === 'optimal' && "bg-emerald-500",
                            metrics.status === 'busy' && "bg-amber-500",
                            metrics.status === 'alert' && "bg-rose-500"
                        )} />
                    </div>

                    <div className="h-4 w-[1px] bg-white/10 mx-1" />

                    {/* Metrics */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-1 group">
                            <TrendingUp className="h-3 w-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white/80">${metrics.todaySales.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5 px-1 group">
                            <ShoppingBag className="h-3 w-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white/80">{metrics.activeOrders}</span>
                        </div>

                        {metrics.inventoryAlerts > 0 && (
                            <div className="flex items-center gap-1.5 px-1 group animate-pulse">
                                <Zap className="h-3 w-3 text-rose-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black text-rose-400">{metrics.inventoryAlerts}</span>
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-[1px] bg-white/10 mx-1" />

                    <div className="flex items-center gap-1 ml-1">
                        <Activity className="h-3 w-3 text-white/20" />
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-tighter">PULSE ADM</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
AdminPulse.displayName = 'AdminPulse';
