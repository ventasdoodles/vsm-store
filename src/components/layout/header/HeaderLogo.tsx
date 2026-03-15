/**
 * // ─── COMPONENTE: HeaderLogo ───
 * // Arquitectura: Independent Lego
 * // Proposito principal: Identidad visual con efecto de destello cinemático.
 *    Efecto: Periodic Glint / Shimmer que atraviesa el logo cada 5s.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeaderLogo() {
    return (
        <Link to="/" className="flex items-center group flex-shrink-0 relative z-10 transition-transform duration-300">
            {/* Spotlight Glow de fondo */}
            <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            
            <div className="relative overflow-hidden group">
                <img
                    src="/logo-vsm-new.png"
                    alt="VSM Store"
                    className="h-10 sm:h-12 xl:h-14 w-auto transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] filter brightness-110 drop-shadow-md relative z-10"
                />
                
                {/* 🎞️ Efecto Glint Cinematic (Shimmer) */}
                <motion.div
                    animate={{
                        x: ['-150%', '150%'],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 5,
                        ease: "linear"
                    }}
                    className="absolute inset-0 z-20 pointer-events-none skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{ width: '40%' }}
                />
            </div>
        </Link>
    );
}
