// DesktopNav — Navegación principal del escritorio
// Compone CategoryDropdown internamente. No sabe de auth, search, ni notificaciones.
import { Link } from 'react-router-dom';
import { Home, Flame, Leaf } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';

export function DesktopNav() {
    return (
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-2 flex-shrink-0 p-1.5 rounded-full glass-premium shadow-inner">
            <Link
                to="/"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/10 transition-all duration-300 relative overflow-hidden group"
            >
                <Home className="h-4 w-4 relative z-10 group-hover:text-cyan-400 transition-colors" />
                <span className="relative z-10">Inicio</span>
                <div className="absolute inset-0 bg-gradient-to-r from-theme-secondary/0 via-theme-secondary/5 to-theme-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <CategoryDropdown
                section="vape"
                label="Vape"
                icon={<Flame className="h-4 w-4" />}
                colorClass="hover:text-blue-500"
                hoverBg="hover:bg-blue-500/10"
            />
            <CategoryDropdown
                section="420"
                label="420"
                icon={<Leaf className="h-4 w-4" />}
                colorClass="hover:text-emerald-500"
                hoverBg="hover:bg-emerald-500/10"
            />
        </nav>
    );
}
