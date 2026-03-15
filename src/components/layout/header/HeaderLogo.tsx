/**
 * // ─── COMPONENTE: HeaderLogo ───
 * // Arquitectura: Independent Lego
 * // Proposito principal: Identidad visual con efecto de destello cinemático.
 *    Efecto: Periodic Glint / Shimmer que atraviesa el logo cada 5s.
 */
import { Link } from 'react-router-dom';


export function HeaderLogo() {
    return (
        <Link to="/" className="flex items-center group flex-shrink-0 relative z-10 transition-transform duration-300">
            {/* Spotlight Glow de fondo */}
            <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            
            <div className="relative overflow-hidden group">
                <img
                    src="/logo-vsm-new.png"
                    alt="VSM Store"
                    className="h-11 sm:h-13 xl:h-16 w-auto transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.6)] drop-shadow-md relative z-10"
                />
            </div>

        </Link>
    );
}
