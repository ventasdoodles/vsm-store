// DesktopNav — Navegación principal del escritorio
// Compone CategoryDropdown internamente. No sabe de auth, search, ni notificaciones.
import { Link } from 'react-router-dom';
import { Flame, Leaf, Truck } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';

export function DesktopNav() {
    return (
        <nav aria-label="Navegación principal" className="hidden lg:flex items-center justify-center gap-2 xl:gap-3 flex-shrink-0 p-1.5 rounded-full bg-[#1e2538]/60 backdrop-blur-md border border-white/10 shadow-inner shadow-black/20 transition-all hover:bg-[#1e2538]/80 hover:border-white/20">
            <Link
                to="/"
                className="flex items-center gap-1.5 rounded-full px-4 xl:px-5 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
            >
                <Flame className="h-4 w-4 relative z-10 group-hover:text-vape-400 transition-colors" />
                <span className="relative z-10 tracking-wide">Más Vendidos</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
        </nav>
    );
}
