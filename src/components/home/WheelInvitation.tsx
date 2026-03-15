/**
 * // ─── COMPONENTE: WheelInvitation ───
 * // Arquitectura: Presentational Component con hook de auth
 * // Proposito principal: Card de invitación cinemática a la Ruleta de Premios.
 *    Redirige a /loyalty (registrado) o /login (no registrado).
 * // Regla / Notas: Sin `any`. Sin lógica de negocio. Usa useAuth hook. exitBeforeEnter framer v6.
 */
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Star, Dices } from 'lucide-react';


import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * WheelInvitation — Invitación ultra-premium a la Ruleta de Premios (Wave 26)
 */
export function WheelInvitation() {
    const { isAuthenticated } = useAuth();

    return (
        <Link
            to={isAuthenticated ? '/loyalty' : '/login'}
            className="block relative overflow-hidden rounded-[3rem] border border-white/10 bg-[#08090f]/80 backdrop-blur-3xl group transition-all duration-700 hover:border-vape-500/50 hover:scale-[1.02] active:scale-[0.99] shadow-2xl"
        >
            {/* ── Background: Cinematic Auras ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-vape-500/20 blur-[120px] group-hover:bg-vape-500/30 transition-all duration-1000" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-theme-tertiary/10 blur-[100px] animate-pulse" />
                
                {/* ── Cinematic Particles [Wave 125] ── */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/40 rounded-full"
                        animate={{
                            y: [0, -100],
                            x: [0, (i % 2 === 0 ? 20 : -20)],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "linear"
                        }}
                        style={{
                            left: `${20 + i * 15}%`,
                            bottom: '0%'
                        }}
                    />
                ))}
            </div>

            {/* ── Top neon accent ── */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vape-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-12">

                {/* ── Left: Advanced Wheel Visual ── */}
                <div className="relative flex-shrink-0 flex items-center justify-center">

                    {/* Multi-layered orbit rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-white/5 border-dashed"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-vape-500/10"
                        />
                    </div>

                    {/* Main Icon Energy Core */}
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 10, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center rounded-full border-[6px] border-white/20 shadow-[0_0_60px_rgba(234,88,12,0.5)] overflow-hidden group-hover:border-white/40 transition-colors duration-700"
                        style={{
                            background: 'conic-gradient(from 0deg, #f59e0b, #fbbf24, #f59e0b, #ea580c, #c2410c, #f59e0b)',
                        }}
                    >
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                        <motion.div
                             animate={{ 
                                scale: [1, 1.15, 1],
                                rotate: [0, 15, -15, 0]
                             }}
                             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Dices className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)] relative z-10" />
                        </motion.div>
                        
                        {/* Shimmer sweep inside wheel */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"
                            animate={{ translateY: ['100%', '-100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                    </motion.div>

                    {/* Energy Pulse Aura */}
                    <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-vape-400 bg-vape-400/20"
                    />
                </div>

                {/* ── Right: Premium Content ── */}
                <div className="flex-1 text-center md:text-left space-y-6">

                    {/* Elite Badge */}
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">
                            Exclusivo Miembros Elite
                        </span>
                    </div>

                    {/* Title with Gradient Polish */}
                    <div className="space-y-1">
                        <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
                            The Wheel
                        </h2>
                        <h2 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-vape-400 via-orange-400 to-yellow-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            of Destiny
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-white/60 text-base sm:text-lg font-bold max-w-md leading-tight uppercase tracking-tight">
                        {isAuthenticated
                            ? 'Tienes un giro esperando. No dejes que tus V-Coins se escapen hoy.'
                            : 'Únete a la elite de VSM Store y reclama tu primer giro gratuito ahora mismo.'}
                    </p>

                    {/* Action CTA */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="group/btn relative inline-flex items-center gap-4 px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest bg-[rgb(var(--border-primary))] shadow-[0_20px_40px_rgba(255,255,255,0.15)] transition-all duration-300 overflow-hidden cursor-pointer"
                            style={{ color: 'rgb(var(--bg-primary))' }}
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            <span>{isAuthenticated ? 'Girar Ahora' : 'Comenzar Aventura'}</span>
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
</motion.div>
                        
                        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                            <Dices className="w-3 h-3" />
                            Actualizado hace 2h
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
