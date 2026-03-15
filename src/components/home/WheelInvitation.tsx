/**
 * // ─── COMPONENTE: WheelInvitation ───
 * // Arquitectura: Presentational Component con hook de auth
 * // Proposito principal: Card de invitación cinemática a la Ruleta de Premios.
 *    Redirige a /loyalty (registrado) o /login (no registrado).
 * // Regla / Notas: Sin `any`. Sin lógica de negocio. Usa useAuth hook. exitBeforeEnter framer v6.
 */
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Zap, Star, Dices } from 'lucide-react';


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
            className="block relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#08090f]/60 backdrop-blur-xl group transition-all duration-500 hover:border-vape-500/40 hover:scale-[1.015] active:scale-[0.99]"
        >
            {/* ── Background: multi-glow auras ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[400px] h-[400px] rounded-full bg-vape-500/15 blur-[100px] group-hover:bg-vape-500/25 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 rounded-full bg-yellow-500/8 blur-[80px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-orange-500/5 blur-[60px]" />
            </div>

            {/* ── Top accent line ── */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vape-500/60 to-transparent" />

            <div className="relative p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-10">

                {/* ── Left: Animated Wheel Visual ── */}
                <div className="relative flex-shrink-0 flex items-center justify-center">

                    {/* Outer orbit ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/5"
                    >
                        {[0, 72, 144, 216, 288].map((deg, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-vape-400/60"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${deg}deg) translate(96px, -50%)`,
                                    boxShadow: '0 0 6px rgba(234,88,12,0.8)',
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Inner slow orbit */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-32 h-32 sm:w-36 sm:h-36 pointer-events-none"
                    >
                        <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-yellow-400/80" />
                        <Star className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 text-blue-400/70" />
                        <Sparkles className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400/60" />
                    </motion.div>

                    {/* Main icon */}
                    <motion.div
                        animate={{
                            rotate: [0, 8, -8, 8, 0],
                            scale: [1, 1.1, 1, 1.1, 1],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-full border-4 border-white/30 shadow-[0_0_50px_rgba(234,88,12,0.4)] overflow-hidden"
                        style={{
                            background: 'conic-gradient(from 0deg, #f59e0b, #fbbf24, #fcd34d, #f59e0b, #ea580c, #c2410c, #f59e0b)',
                        }}
                    >
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                        <motion.div
                             animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                             }}
                             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Dices className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10" />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 rounded-full" />
                    </motion.div>



                    {/* Glow behind icon */}
                    <div className="absolute inset-0 rounded-full bg-vape-500/20 blur-2xl scale-75 -z-10" />
                </div>

                {/* ── Right: Content ── */}
                <div className="flex-1 text-center md:text-left space-y-5">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vape-500/15 border border-vape-500/30">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vape-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-vape-500" />
                        </span>
                        <span className="text-[10px] font-black text-vape-300 uppercase tracking-[0.2em]">
                            Giro Diario Disponible
                        </span>
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                            The Wheel
                        </h2>
                        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-vape-400 via-orange-400 to-yellow-400">
                            of VSM
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-white/55 text-sm sm:text-base font-medium max-w-md leading-relaxed">
                        {isAuthenticated
                            ? 'Tu giro diario está listo. Gana V-Coins, cupones sorpresa y premios exclusivos solo por ser parte de VSM.'
                            : 'Únete a la elite de VSM Store y desbloquea tu giro diario gratuito. Premios reales, cada 24 horas.'}
                    </p>

                    {/* CTA Button */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest transition-all duration-300 shadow-xl relative overflow-hidden cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #ea580c, #f97316)',
                            boxShadow: '0 8px 32px rgba(234,88,12,0.35)',
                        }}
                    >
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                        />
                        <Zap className="w-4 h-4 text-white fill-current relative z-10" />
                        <span className="text-white relative z-10">
                            {isAuthenticated ? 'Girar ahora' : 'Registrarme y Girar'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white relative z-10 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                </div>
            </div>
        </Link>
    );
}
