// HeaderActions — Barra de acciones derecha del header
// Compone: ThemeToggle, NotificationBell, CartButton, auth desktop, menu toggle mobile
// Cada hijo es independiente y se obtiene sus datos internamente
import { Menu, X, LogIn, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartButton } from '@/components/cart/CartButton';
import { NotificationBell } from './NotificationBell';
import { UserMenuDropdown } from './UserMenuDropdown';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface HeaderActionsProps {
    menuOpen: boolean;
    onMenuToggle: () => void;
}

export function HeaderActions({ menuOpen, onMenuToggle }: HeaderActionsProps) {
    const { isAuthenticated } = useAuth();

    return (
        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4 xl:gap-5 ml-auto pl-2 xl:pl-4">
            <NotificationBell />

            <Link
                to={isAuthenticated ? "/loyalty" : "/login"}
                className="relative group flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-vape-500/10 border border-vape-500/20 text-vape-400 hover:bg-vape-500/20 transition-all"
                title="Giro Diario Disponible"
            >
                <motion.div
                    animate={{ 
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1] 
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 5 
                    }}
                >
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
                <span className="hidden sm:inline text-[10px] font-black tracking-tighter uppercase text-white/80 group-hover:text-vape-400 transition-colors">Ruleta</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-vape-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
            </Link>

            <CartButton />

            {/* Auth: desktop */}
            <div className="hidden md:block">
                {isAuthenticated ? (
                    <UserMenuDropdown />
                ) : (
                    <Link
                        to="/login"
                        className="group relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold tracking-wider text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:bg-white/10"
                    >
                        <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                        <LogIn className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">ENTRAR</span>
                    </Link>
                )}
            </div>

            {/* Mobile menu toggle */}
            <button
                onClick={onMenuToggle}
                className="rounded-full p-2.5 text-theme-secondary hover:bg-white/10 hover:text-white transition-all md:hidden active:scale-90"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
    );
}
