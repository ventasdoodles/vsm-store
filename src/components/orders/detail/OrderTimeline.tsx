import { m } from 'framer-motion';
import { Package, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/hooks/useOrders';

interface OrderTimelineProps {
    statusSteps: OrderStatus[];
    currentStepIndex: number;
    statusConfigMap: Record<OrderStatus, { label: string; color: string; bg: string; border: string }>;
    statusIcons: Record<OrderStatus, LucideIcon>;
}

export function OrderTimeline({ statusSteps, currentStepIndex, statusConfigMap, statusIcons }: OrderTimelineProps) {
    return (
        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
            
            <div className="flex items-center justify-between relative">
                {statusSteps.map((step, i) => {
                    const config = statusConfigMap[step];
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const StepIcon = statusIcons[step] || Package;

                    return (
                        <div key={step} className="flex flex-1 items-center group/step">
                            <div className="flex flex-col items-center gap-3 relative z-10 mx-auto">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-700 shadow-xl",
                                    isActive 
                                        ? "bg-accent-primary text-black border-accent-primary shadow-accent-primary/20 scale-110" 
                                        : "bg-black/60 text-theme-tertiary border-white/5 opacity-40",
                                    isCurrent && "ring-4 ring-accent-primary/20 animate-pulse"
                                )}>
                                    <StepIcon size={20} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest transition-colors duration-500 hidden sm:block text-center",
                                    isActive ? "text-white font-bold" : "text-theme-tertiary opacity-40"
                                )}>
                                    {config?.label ?? step}
                                </span>
                            </div>
                            
                            {i < statusSteps.length - 1 && (
                                <div className="h-[2px] flex-1 bg-white/5 mx-[-12px] relative overflow-hidden">
                                    {i < currentStepIndex && (
                                        <m.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1, delay: i * 0.2 }}
                                            className="h-full bg-accent-primary shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
