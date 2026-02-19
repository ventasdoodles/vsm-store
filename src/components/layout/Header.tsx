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
    const { isAuthenticated, profile, signOut } = useAuth();
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
                'sticky top-0 z-30 border-b transition-all duration-300',
                scrolled
                    ? 'border-theme/80 bg-theme-primary/90 backdrop-blur-xl shadow-lg shadow-black/50'
                    : 'border-theme/40 bg-theme-primary/60 backdrop-blur-md'
            )}
        >
            <div className="container-vsm flex h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
                {/* Skip to main content (accessibility) */}
                <a href="#main-content" className="skip-to-main">
                    Saltar al contenido principal
                </a>

                {/* Logo */}
                <Link to="/" className="flex items-center group flex-shrink-0">
                    <img
                        src="/logo-vsm.png"
                        alt="VSM Store"
                        className="h-14 w-auto sm:h-16 transition-all duration-300 group-hover:opacity-90 group-hover:scale-[1.02]"
                    />
                </Link>

                {/* Navegación central — desktop */}
                <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 flex-shrink-0">
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-all"
                    >
                        <Home className="h-3.5 w-3.5" />
                        Inicio
                    </Link>
                    <CategoryDropdown
                        section="vape"
                        label="Vape"
                        icon={<Flame className="h-3.5 w-3.5" />}
                        colorClass="hover:text-vape-400"
                        hoverBg="hover:bg-vape-500/10"
                    />
                    <CategoryDropdown
                        section="420"
                        label="420"
                        icon={<Leaf className="h-3.5 w-3.5" />}
                        colorClass="hover:text-herbal-400"
                        hoverBg="hover:bg-herbal-500/10"
                    />
                </nav>

                {/* SearchBar — desktop */}
                <div className="hidden sm:block flex-1 max-w-md mx-6">
                    <SearchBar expandable className="w-full" />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
                    <ThemeToggle />
                    {/* Notificaciones */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative rounded-lg p-2 text-theme-secondary transition-all hover:bg-theme-secondary/50 hover:text-theme-primary"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-vape-500 text-[9px] font-bold text-white ring-2 ring-theme-primary animate-bounce-in">
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
                            <>
                                {/* <Link to="/notifications" className="relative rounded-lg p-2 text-theme-secondary hover:bg-theme-secondary hover:text-vape-400 transition-colors">
                                    <Bell className="h-5 w-5" />
                                </Link> */}
                                <UserMenuDropdown />
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 rounded-lg bg-vape-500/10 px-3.5 py-1.5 text-sm font-medium text-vape-400 border border-vape-500/20 hover:bg-vape-500/20 transition-all"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                Entrar
                            </Link>
                        )}
                    </div>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-lg p-2 text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-all md:hidden"
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Menú móvil desplegable — animado */}
            <div
                className={cn(
                    'overflow-hidden transition-all duration-300 ease-out md:hidden',
                    menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <nav className="border-t border-theme/50 bg-theme-primary/95 backdrop-blur-xl px-4 py-3 space-y-1">
                    {/* SearchBar en móvil */}
                    <div className="sm:hidden pb-2">
                        <SearchBar />
                    </div>
                    <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        Inicio
                    </Link>

                    {/* Vape con categorías */}
                    <div>
                        <Link
                            to="/?section=vape"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-theme-secondary hover:bg-vape-500/10 hover:text-vape-400 transition-colors"
                        >
                            <Flame className="h-4 w-4" />
                            Vape
                        </Link>
                        {vapeRoots.length > 0 && (
                            <div className="ml-8 space-y-0.5">
                                {vapeRoots.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/vape/${cat.slug}`}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-lg px-3 py-2 text-xs text-theme-secondary hover:bg-vape-500/10 hover:text-vape-400 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 420 con categorías */}
                    <div>
                        <Link
                            to="/?section=420"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-theme-secondary hover:bg-herbal-500/10 hover:text-herbal-400 transition-colors"
                        >
                            <Leaf className="h-4 w-4" />
                            420
                        </Link>
                        {herbalRoots.length > 0 && (
                            <div className="ml-8 space-y-0.5">
                                {herbalRoots.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/420/${cat.slug}`}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-lg px-3 py-2 text-xs text-theme-secondary hover:bg-herbal-500/10 hover:text-herbal-400 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auth: móvil */}
                    <hr className="border-theme/50 my-2" />
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/profile"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors"
                            >
                                <User className="h-4 w-4" />
                                {profile?.full_name ?? 'Mi perfil'}
                            </Link>
                            <Link
                                to="/orders"
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-lg px-3 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors ml-8"
                            >
                                Mis pedidos
                            </Link>
                            <button
                                onClick={() => { signOut(); setMenuOpen(false); }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-vape-400 hover:bg-vape-500/10 transition-colors"
                        >
                            <LogIn className="h-4 w-4" />
                            Iniciar sesión
                        </Link>
                    )}
                </nav>
            </div>
        </header >
    );
}
