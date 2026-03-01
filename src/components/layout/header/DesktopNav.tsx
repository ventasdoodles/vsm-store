// DesktopNav  Navegación principal del escritorio
// Compone CategoryDropdown internamente. No sabe de auth, search, ni notificaciones.
import { Link } from 'react-router-dom';
import { Flame, Leaf, Truck, Tag, Sparkles, PackageCheck } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface DesktopNavProps {
    compact?: boolean;
}

export function DesktopNav({ compact = false }: DesktopNavProps) {
    const { isAuthenticated } = useAuth();
    
    return (
        <nav aria-label="Navegación principal" className={cn(
            "hidden lg:flex items-center justify-center gap-1 flex-shrink-0 p-1.5 rounded-full bg-[#1e2538]/60 backdrop-blur-md border border-white/10 shadow-inner shadow-black/20 transition-all hover:bg-[#1e2538]/80 hover:border-white/20",
            compact && "gap-0.5"
        )}>
            <Link
                to="/novedades"
                className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
                title="Lo Nuevo"
            >
                <Sparkles className="h-4 w-4 relative z-10 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                {!compact && <span className="relative z-10 tracking-wide">Lo Nuevo</span>}
            </Link>

            {/* Divisor */}
            <div className="w-px h-4 bg-white/10 mx-0.5" />

            <Link
                to="/"
                className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
                title="Más Vendidos"
            >
                <Flame className="h-4 w-4 relative z-10 group-hover:text-vape-400 transition-colors flex-shrink-0" />
                {!compact && <span className="relative z-10 tracking-wide">Más Vendidos</span>}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>

            {/* Divisor */}
            <div className="w-px h-4 bg-white/10 mx-0.5" />

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

            {/* Divisor */}
            <div className="w-px h-4 bg-white/10 mx-0.5" />

            <Link
                to="/ofertas"
                className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 relative group"
                title="Ofertas"
            >
                <Tag className="h-4 w-4 relative z-10 group-hover:text-red-400 transition-colors flex-shrink-0" />
                {!compact && <span className="relative z-10 tracking-wide">Ofertas</span>}
            </Link>

            {isAuthenticated && (
                <>
                    {/* Divisor */}
                    <div className="w-px h-4 bg-white/10 mx-0.5" />

                    <Link
                        to="/perfil/pedidos"
                        className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300 relative group"
                        title="Mis Compras"
                    >
                        <PackageCheck className="h-4 w-4 relative z-10 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                        {!compact && <span className="relative z-10 tracking-wide">Mis Compras</span>}
                    </Link>
                </>
            )}

            {/* Rastreo (Only visible when NOT in compact mode, giving it room) */}
            {!compact && (
                <>
                    {/* Divisor */}
                    <div className="w-px h-4 bg-white/10 mx-0.5 hidden xl:block" />

                    <Link
                        to="/rastreo"
                        className="hidden xl:flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 relative group"
                    >
                        <Truck className="h-4 w-4 relative z-10 group-hover:text-yellow-400 transition-colors" />
                        <span className="relative z-10 tracking-wide">Rastrear</span>
                    </Link>
                </>
            )}
        </nav>
    );
}
