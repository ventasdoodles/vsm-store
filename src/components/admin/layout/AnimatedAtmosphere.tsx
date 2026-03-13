import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminPulse } from '@/hooks/admin/useAdminPulse';
import { cn } from '@/lib/utils';

/**
 * AnimatedAtmosphere Component [Wave 60 - Quantum Administration]
 * 
 * Creates a dynamic, immersive background environment for the Admin Panel.
 * The "Atmosphere" changes its color palette based on the business health (Pulse).
 * 
 * Features:
 * - Fluid Transitions: Uses AnimatePresence for smooth color shifts.
 * - Organic Motion: Three independent glow layers with varying scales and opacities.
 * - Noise Texture: SVG-based noise overlay to provide a premium "frosted" feel.
 * - Zero Performance Impact: Uses CSS-accelerated transforms and pointer-events-none.
 */
export const AnimatedAtmosphere: React.FC = () => {
    // Consumer of the unified business intelligence hook
    const { metrics } = useAdminPulse();

    /**
     * Maps Pulse status to precise Tailwind color tokens.
     * Optimal (Safe): Deep blue and herbal green.
     * Busy (Warning): Amber and warm orange.
     * Alert (Critical): Professional rose and crimson.
     */
    const getColors = () => {
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
                    primary: 'bg-[rgb(var(--vsm-accent-primary))]/10',
                    secondary: 'bg-[rgb(var(--vsm-accent-secondary))]/5',
                    accent: 'bg-[rgb(var(--vsm-accent-primary))]/5'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* 
                AnimatePresence allows for "exit" animations when the status key changes, 
                creating a beautiful cross-fade between ambiance states.
            */}
            <AnimatePresence exitBeforeEnter>
                <motion.div
                    key={metrics.status + '-glow'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Primary Atmospheric Glow (Top Right) */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={cn(
                            "absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full blur-[120px]",
                            colors.primary
                        )}
                    />

                    {/* Secondary Atmospheric Glow (Bottom Left) */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className={cn(
                            "absolute bottom-[-5%] left-[-5%] h-[40%] w-[40%] rounded-full blur-[100px]",
                            colors.secondary
                        )}
                    />

                    {/* Accent Atmospheric Floating Entity (Center-ish) */}
                    <motion.div
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -50, 50, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className={cn(
                            "absolute top-[20%] left-[15%] h-[30%] w-[30%] rounded-full blur-[150px]",
                            colors.accent
                        )}
                    />
                </motion.div>
            </AnimatePresence>
            
            {/* 
                Subtle Noise Texture Overlay:
                This provides the "high-end" tactile feel by breaking up smooth gradients.
            */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};
