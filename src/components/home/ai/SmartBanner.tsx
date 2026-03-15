/**
 * SmartBanner Component [Wave 70 - Hyper-Personalization]
 * 
 * A high-impact, AI-driven banner that appears only when there's a 
 * personalized message for the current user (e.g., Recovery, Reward).
 * 
 * Design: Premium Glassmorphism with holographic gradients.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Gift, Heart } from 'lucide-react';
import { useCustomerIQ } from '@/hooks/useCustomerIQ';
import { cn } from '@/lib/utils';

export const SmartBanner: React.FC = () => {
    const { banner, isLoading } = useCustomerIQ();

    if (isLoading || !banner) return null;

    const Icon = banner.type === 'recovery' ? Heart : 
                 banner.type === 'reward' ? Gift : 
                 banner.type === 'welcome' ? Sparkles : Zap;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="relative w-full py-2 px-4 md:px-0"
            >
                <div className={cn(
                    "relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20",
                    "bg-gradient-to-r",
                    banner.bgClass
                )}>
                    {/* Animated Grainy Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                    
                    {/* Floating Orbs for "Holographic" effect (Optimized) */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[64px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-[64px] -ml-24 -mb-24" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Icon className="w-8 h-8 text-white animate-pulse" />
                            </div>
                            
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                    {banner.title}
                                </h3>
                                <p className="text-white/80 text-lg md:text-xl font-medium mt-1">
                                    {banner.subtitle}
                                </p>
                            </div>
                        </div>

                        <Link
                            to={banner.link}
                            className="group relative flex items-center gap-2 px-8 py-4 bg-white text-theme-primary rounded-2xl font-bold text-lg hover:bg-theme-secondary hover:text-white transition-all duration-300 shadow-xl hover:shadow-white/20 active:scale-95"
                        >
                            <span className="relative z-10">{banner.cta}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Subtle AI Badge */}
                    <div className="absolute bottom-3 right-5 flex items-center gap-1.5 opacity-40">
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-[10px] text-white font-bold tracking-widest uppercase">AI Personalized</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
