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
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <NotificationBell />

            <CartButton />

            {/* Auth: desktop */}
            <div className="hidden md:block">
                {isAuthenticated ? (
                    <UserMenuDropdown />
                ) : (
                    <Link
                        to="/login"
                        className="btn-shine group relative flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] vsm-border bg-accent-primary/90 backdrop-blur-md"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LogIn className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">Entrar</span>
                    </Link>
                )}
            </div>

            {/* Mobile menu toggle */}
            <button
                onClick={onMenuToggle}
                className="rounded-full p-2.5 text-text-secondary hover:bg-theme-secondary/10 hover:text-theme-primary transition-all md:hidden active:scale-90"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
    );
}
