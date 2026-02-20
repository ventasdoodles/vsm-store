// Header - VSM Store
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell, Flame, Leaf, ChevronDown, ShoppingBag, MapPin, LogIn, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useNotificationsStore } from '@/stores/notifications.store';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';
import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from '@/components/search/SearchBar';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import type { Section } from '@/types/product';

// ---------------------------------------------------
// Dropdown de categorías para una sección
// ---------------------------------------------------
interface CategoryDropdownProps {
    section: Section;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    hoverBg: string;
}

function CategoryDropdown({ section, label, icon, colorClass, hoverBg }: CategoryDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const { data: categories = [] } = useCategories(section);

    // Solo categorías raíz
    const rootCategories = categories.filter((c) => c.parent_id === null);

    const handleEnter = () => {
        clearTimeout(timeout.current);
        setOpen(true);
    };
    const handleLeave = () => {
        timeout.current = setTimeout(() => setOpen(false), 150);
    };

    // Cerrar con click fuera
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-theme-secondary transition-all',
                    'hover:bg-theme-secondary/50 hover:text-theme-primary',
                    colorClass
                )}
            >
                {icon}
                {label}
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {open && rootCategories.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-theme/60 bg-theme-primary/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in">
                    {/* Link a la sección */}
                    <Link
                        to={`/?section=${section}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                            'block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-theme-secondary transition-colors',
                            hoverBg
                        )}
                    >
                        Ver todo {label}
                    </Link>
                    <hr className="border-theme/50" />
                    {rootCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/${section}/${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className={cn(
                                'block px-4 py-2.5 text-sm text-theme-secondary transition-colors',
                                hoverBg
                            )}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------
// User Menu Dropdown (desktop)
// ---------------------------------------------------
function UserMenuDropdown() {
    const { user, profile, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const handleEnter = () => { clearTimeout(timeout.current); setOpen(true); };
    const handleLeave = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Cuenta';

    return (
        <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-all"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vape-500/10 border border-vape-500/20">
                    <User className="h-3.5 w-3.5 text-vape-400" />
                </div>
                <span className="hidden lg:inline max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-theme/60 bg-theme-primary/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in">
                    <div className="px-4 py-3 border-b border-theme/50">
                        <p className="text-sm font-medium text-theme-primary truncate">{profile?.full_name ?? 'Mi cuenta'}</p>
                        <p className="text-xs text-theme-secondary truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                        <User className="h-4 w-4 text-theme-secondary" /> Mi perfil
                    </Link>
                    <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                        <ShoppingBag className="h-4 w-4 text-theme-secondary" /> Mis pedidos
                    </Link>
                    <Link to="/addresses" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                        <MapPin className="h-4 w-4 text-theme-secondary" /> Mis direcciones
                    </Link>
                    <hr className="border-theme/50" />
                    <button
                        onClick={() => { signOut(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------
// Hook: detectar scroll para header bg
// ---------------------------------------------------
function useScrolled(threshold = 10) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);
    return scrolled;
}

// ---------------------------------------------------
// Header principal
// ---------------------------------------------------

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated, signOut } = useAuth();
    const { data: vapeCategories = [] } = useCategories('vape');
    const { data: herbalCategories = [] } = useCategories('420');
    const scrolled = useScrolled();

    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = useNotificationsStore((s) => s.notifications);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const vapeRoots = vapeCategories.filter((c) => c.parent_id === null);
    const herbalRoots = herbalCategories.filter((c) => c.parent_id === null);

    return (
        <header
            className={cn(
                'sticky top-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                scrolled
                    ? 'glass-premium shadow-2xl shadow-black/40 py-2'
                    : 'bg-transparent py-4 border-b border-white/5'
            )}
        >
            {/* Subtle bottom gradient line when scrolled */}
            <div className={cn(
                "absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0"
            )} />

            <div className="container-vsm flex h-14 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 relative">
                {/* Skip to main content (accessibility) */}
                <a href="#main-content" className="skip-to-main">
                    Saltar al contenido principal
                </a>

                {/* Logo */}
                <Link to="/" className="flex items-center group flex-shrink-0 relative z-10">
                    <img
                        src="/logo-vsm.png"
                        alt="VSM Store"
                        className="h-12 w-auto sm:h-14 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter brightness-110"
                    />
                </Link>

                {/* Navegación central — desktop */}
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

                {/* SearchBar — desktop */}
                <div className="hidden sm:block flex-1 max-w-md mx-6">
                    <SearchBar expandable className="w-full glass-premium text-theme-primary placeholder:text-theme-tertiary rounded-full border-theme/10 focus:border-theme/30 transition-all" />
                </div>

                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <ThemeToggle />
                    {/* Notificaciones */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative rounded-full p-2.5 text-text-secondary transition-all hover:bg-theme-secondary/10 hover:text-theme-primary hover:scale-110 active:scale-95"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-black shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse-glow">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <NotificationCenter
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>

                    <CartButton />

                    {/* Auth: desktop */}
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <UserMenuDropdown />
                        ) : (
                            <Link
                                to="/login"
                                className="nav-btn-shine group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-500/30 bg-blue-600/90 backdrop-blur-md"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <LogIn className="h-4 w-4 relative z-10" />
                                <span className="relative z-10">Entrar</span>
                            </Link>
                        )}
                    </div>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-full p-2.5 text-text-secondary hover:bg-theme-secondary/10 hover:text-theme-primary transition-all md:hidden active:scale-90"
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Menú móvil desplegable — animado */}
            <div
                className={cn(
                    'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden glass-premium border-t border-theme/5',
                    menuOpen ? 'max-h-[800px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
                )}
            >
                <nav className="p-4 space-y-2">
                    {/* SearchBar en móvil */}
                    <div className="sm:hidden pb-4">
                        <SearchBar />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                        >
                            <Home className="h-6 w-6 text-blue-500" />
                            Inicio
                        </Link>
                        <Link
                            to="/profile"
                            onClick={() => setMenuOpen(false)}
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
                            onClick={() => setMenuOpen(false)}
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
                                        onClick={() => setMenuOpen(false)}
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
                            onClick={() => setMenuOpen(false)}
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
                                        onClick={() => setMenuOpen(false)}
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
                                onClick={() => { signOut(); setMenuOpen(false); }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                            >
                                <LogOut className="h-5 w-5" />
                                Cerrar sesión
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                            >
                                <LogIn className="h-5 w-5" />
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header >
    );
}
