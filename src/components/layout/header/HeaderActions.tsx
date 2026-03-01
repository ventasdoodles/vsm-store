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
        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4 xl:gap-5 ml-auto pl-2 xl:pl-4">
            <NotificationBell />

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
