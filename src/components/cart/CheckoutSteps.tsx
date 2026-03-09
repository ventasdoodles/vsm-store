import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Step {
    id: number;
    label: string;
}

interface CheckoutStepsProps {
    currentStep: number;
    steps: Step[];
}

export function CheckoutSteps({ currentStep, steps }: CheckoutStepsProps) {
    return (
        <div className="relative mb-8 flex items-center justify-between px-2">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-theme-secondary/20" />

            {/* Active Line (Animated) */}
            <motion.div
                className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-vape-500 to-herbal-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            />

            {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                        <motion.div
                            initial={false}
                            animate={{
                                scale: isActive ? 1.1 : 1,
                                backgroundColor: isCompleted || isActive ? 'var(--accent-primary, #3b82f6)' : 'var(--bg-secondary, #18181b)',
                                borderColor: isCompleted || isActive ? 'transparent' : 'rgba(255,255,255,0.1)'
                            }}
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-shadow",
                                isActive && "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                                isCompleted && "bg-herbal-500!"
                            )}
                            style={{
                                backgroundColor: isCompleted ? '#10B981' : isActive ? '#3B82F6' : undefined
                            }}
                        >
                            {isCompleted ? (
                                <Check className="h-4 w-4 text-slate-900" strokeWidth={3} />
                            ) : (
                                <span className={cn(isActive ? "text-white" : "text-theme-tertiary")}>
                                    {step.id}
                                </span>
                            )}
                        </motion.div>
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider transition-colors",
                            isActive ? "text-theme-primary" : "text-theme-tertiary"
                        )}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
