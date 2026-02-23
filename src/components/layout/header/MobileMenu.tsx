// MobileMenu — Menú móvil del header
// Independiente: obtiene sus propias categorías y lee auth internamente
import { Link } from 'react-router-dom';
import { Home, User, Flame, Leaf, LogOut, LogIn, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/search/SearchBar';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { isAuthenticated, signOut } = useAuth();
    const { data: vapeCategories = [] } = useCategories('vape');
    const { data: herbalCategories = [] } = useCategories('420');

    const vapeRoots = vapeCategories.filter((c) => c.parent_id === null);
    const herbalRoots = herbalCategories.filter((c) => c.parent_id === null);

    return (
        <div
            className={cn(
                'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden glass-premium border-t border-theme/5',
                isOpen ? 'max-h-[800px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
            )}
        >
            <nav className="p-4 space-y-2">
                {/* SearchBar en móvil */}
                <div className="sm:hidden pb-4">
                    <SearchBar />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <Link
                        to="/"
                        onClick={onClose}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                    >
                        <Home className="h-6 w-6 text-blue-500" />
                        Inicio
                    </Link>
                    <Link
                        to="/rastreo"
                        onClick={onClose}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                    >
                        <Truck className="h-6 w-6 text-yellow-500" />
                        Rastrear
                    </Link>
                    <Link
                        to="/profile"
                        onClick={onClose}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                    >
                        <User className="h-6 w-6 text-purple-500" />
                        Perfil
                    </Link>
                </div>

                {/* Vape con categorías */}
                <div className="rounded-2xl bg-theme-secondary/5 p-4 border border-theme/5">
                    <Link
                        to="/?section=vape"
                        onClick={onClose}
                        className="flex items-center gap-3 text-lg font-bold text-theme-primary mb-3"
                    >
                        <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                            <Flame className="h-5 w-5" />
                        </div>
                        Vape Collection
                    </Link>
                    {vapeRoots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {vapeRoots.map((cat) => (
                                <Link
                                    key={cat.id}
                                    to={`/vape/${cat.slug}`}
                                    onClick={onClose}
                                    className="rounded-lg bg-theme-tertiary/50 px-3 py-2 text-xs text-theme-secondary hover:bg-blue-500/20 hover:text-theme-primary transition-colors text-center"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* 420 con categorías */}
                <div className="rounded-2xl bg-theme-secondary/5 p-4 border border-theme/5">
                    <Link
                        to="/?section=420"
                        onClick={onClose}
                        className="flex items-center gap-3 text-lg font-bold text-theme-primary mb-3"
                    >
                        <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-500">
                            <Leaf className="h-5 w-5" />
                        </div>
                        420 Zone
                    </Link>
                    {herbalRoots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {herbalRoots.map((cat) => (
                                <Link
                                    key={cat.id}
                                    to={`/420/${cat.slug}`}
                                    onClick={onClose}
                                    className="rounded-lg bg-theme-tertiary/50 px-3 py-2 text-xs text-theme-secondary hover:bg-emerald-500/20 hover:text-theme-primary transition-colors text-center"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auth: móvil */}
                <div className="pt-2">
                    {isAuthenticated ? (
                        <button
                            onClick={() => { signOut(); onClose(); }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                        >
                            <LogOut className="h-5 w-5" />
                            Cerrar sesión
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                        >
                            <LogIn className="h-5 w-5" />
                            Iniciar sesión
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}
