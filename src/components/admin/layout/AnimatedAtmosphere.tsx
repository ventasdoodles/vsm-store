import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAdminPulse } from '@/hooks/admin';
import { cn } from '@/lib/utils';

/**
 * AnimatedAtmosphere Component [Wave 60 - Quantum Administration]
 * 
 * Optimized Version:
 * - Reduced blur radius (150px -> 80px) to decrease GPU load.
 * - simplified stagger/float animations.
 * - Uses hardware acceleration hints.
 */
export const AnimatedAtmosphere = React.memo(() => {
    const { data: metrics } = useAdminPulse();

    const getColors = () => {
        if (!metrics) return {
            primary: 'bg-[rgb(var(--vsm-accent-primary,168_85_247))]/10',
            secondary: 'bg-[rgb(var(--vsm-accent-secondary,139_92_246))]/5',
            accent: 'bg-[rgb(var(--vsm-accent-primary,168_85_247))]/5'
        };

        switch (metrics.status) {
            case 'alert':
                return {
                    primary: 'bg-rose-500/10',
                    secondary: 'bg-crimson-600/5',
                    accent: 'bg-rose-400/5'
                };
            case 'busy':
                return {
                    primary: 'bg-amber-500/10',
                    secondary: 'bg-orange-600/5',
                    accent: 'bg-amber-400/5'
                };
            case 'optimal':
            default:
                return {
                    primary: 'bg-[rgb(var(--vsm-accent-primary,168_85_247))]/10',
                    secondary: 'bg-[rgb(var(--vsm-accent-secondary,139_92_246))]/5',
                    accent: 'bg-[rgb(var(--vsm-accent-primary,168_85_247))]/5'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <AnimatePresence>
                <m.div
                    key={(metrics?.status || 'optimal') + '-glow'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 will-change-opacity"
                >
                    {/* Primary Atmospheric Glow (Top Right) */}
                    <m.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.3, 0.4, 0.3],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={cn(
                            "absolute top-[-15%] right-[-10%] h-[50%] w-[50%] rounded-full blur-[80px] will-change-transform transform-gpu",
                            colors.primary
                        )}
                    />

                    {/* Secondary Atmospheric Glow (Bottom Left) */}
                    <m.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className={cn(
                            "absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[70px] will-change-transform transform-gpu",
                            colors.secondary
                        )}
                    />

                    {/* Accent Atmospheric Floating Entity (Center) */}
                    <m.div
                        animate={{
                            x: [0, 20, -20, 0],
                            y: [0, -20, 20, 0],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className={cn(
                            "absolute top-[25%] left-[20%] h-[25%] w-[25%] rounded-full blur-[90px] will-change-transform transform-gpu",
                            colors.accent
                        )}
                    />
                </m.div>
            </AnimatePresence>
            
            {/* Grainy Noise Overlay (Low Opacity for high-performance feel) */}
            <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat transform-gpu" 
            />
        </div>
    );
});
AnimatedAtmosphere.displayName = 'AnimatedAtmosphere';
