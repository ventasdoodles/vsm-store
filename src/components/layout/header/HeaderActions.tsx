// HeaderActions — Barra de acciones derecha del header
// Compone: ThemeToggle, NotificationBell, CartButton, auth desktop, menu toggle mobile
// Cada hijo es independiente y se obtiene sus datos internamente
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartButton } from '@/components/cart/CartButton';
import { NotificationBell } from './NotificationBell';
import { UserMenuDropdown } from './UserMenuDropdown';
import { useAuth } from '@/hooks/useAuth';

interface HeaderActionsProps {
    menuOpen: boolean;
    onMenuToggle: () => void;
}

export function HeaderActions({ menuOpen, onMenuToggle }: HeaderActionsProps) {
    const { isAuthenticated } = useAuth();

    return (
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:gap-3 ml-auto">
            <NotificationBell />

            <CartButton />

            {/* Auth: desktop */}
            <div className="hidden md:block">
                {isAuthenticated ? (
                    <UserMenuDropdown />
                ) : (
                    <Link
                        to="/login"
                        className="group relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-black text-white transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] border border-white/20 bg-gradient-to-r from-accent-primary to-blue-500 overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                        <LogIn className="h-4 w-4 relative z-10" />
                        <span className="relative z-10 tracking-wide">ENTRAR</span>
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
