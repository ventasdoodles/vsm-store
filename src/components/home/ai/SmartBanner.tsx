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
                    "relative overflow-hidden rounded-[2rem] p-6 md:p-8 shadow-2xl border border-white/20",
                    "bg-gradient-to-br",
                    banner.bgClass
                )}>
                    {/* ── Premium Mesh Gradients ── [Wave 125] */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/20 blur-[100px] animate-pulse" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-black/30 blur-[120px]" />
                        <div className="absolute top-1/4 left-1/2 w-48 h-48 bg-theme-tertiary/20 rounded-full blur-[80px]" />
                    </div>

                    {/* ── High-Speed Shine Sweep ── */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                        animate={{ x: ['-150%', '300%'] }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                    />
                    
                    {/* Animated Grainy Texture */}
                    <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                    
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/40 shadow-xl"
                            >
                                <Icon className="w-10 h-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            </motion.div>
                            
                            <div className="text-center md:text-left space-y-1">
                                <motion.h3 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-[0.9]"
                                >
                                    {banner.title}
                                </motion.h3>
                                <p className="text-white/80 text-sm md:text-lg font-bold uppercase tracking-wider">
                                    {banner.subtitle}
                                </p>
                            </div>
                        </div>

                        <Link
                            to={banner.link}
                            className="group relative flex items-center gap-3 px-10 py-4 bg-[rgb(var(--border-primary))] rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.15)]"
                            style={{ color: 'rgb(var(--bg-primary))' }}
                        >
                            <span className="relative z-10">{banner.cta}</span>
                            <div className="relative z-10 p-1 bg-[rgb(var(--bg-primary))] rounded-full group-hover:bg-theme-secondary transition-colors">
                                <ArrowRight className="w-3.5 h-3.5 text-theme-primary" />
                            </div>
                        </Link>
                    </div>

                    {/* AI Identity Token */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <Sparkles className="w-3 h-3 text-white/60" />
                        <span className="text-[9px] text-white/60 font-black tracking-[0.2em] uppercase">Hyper-Personalized Content</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
