// DesktopNav — Navegación principal del escritorio
// Compone CategoryDropdown internamente. No sabe de auth, search, ni notificaciones.
import { Link } from 'react-router-dom';
import { Flame, Leaf, Truck } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';

export function DesktopNav() {
    return (
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-2 flex-shrink-0 p-1.5 rounded-2xl glass-premium shadow-inner">
            <Link
                to="/"
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/10 transition-all duration-300 relative overflow-hidden group"
            >
                <Flame className="h-4 w-4 relative z-10 group-hover:text-red-500 transition-colors" />
                <span className="relative z-10">MÃ¡s Vendidos</span>
                <div className="absolute inset-0 bg-gradient-to-r from-theme-secondary/0 via-theme-secondary/5 to-theme-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <CategoryDropdown
                section="vape"
                label="Vape"
                icon={<Flame className="h-4 w-4" />}
                colorClass="hover:text-accent-primary"
                hoverBg="hover:bg-accent-primary/10"
            />
            <CategoryDropdown
                section="420"
                label="420"
                icon={<Leaf className="h-4 w-4" />}
                colorClass="hover:text-emerald-500"
                hoverBg="hover:bg-emerald-500/10"
            />
            <Link
                to="/rastreo"
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-theme-secondary hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-300 relative overflow-hidden group"
            >
                <Truck className="h-4 w-4 relative z-10 group-hover:text-yellow-400 transition-colors" />
                <span className="relative z-10">Rastrear</span>
            </Link>
        </nav>
    );
}
