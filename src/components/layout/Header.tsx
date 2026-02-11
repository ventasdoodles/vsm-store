// Header - VSM Store
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Flame, Leaf, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from '@/components/search/SearchBar';
import { useCategories } from '@/hooks/useCategories';
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
                    'flex items-center gap-1 text-sm font-medium text-primary-300 transition-colors',
                    colorClass
                )}
            >
                {icon}
                {label}
                <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {open && rootCategories.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-primary-800 bg-primary-950 shadow-2xl shadow-black/50 animate-[fadeIn_0.15s_ease-out]">
                    {/* Link a la sección */}
                    <Link
                        to={`/?section=${section}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                            'block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-500 transition-colors',
                            hoverBg
                        )}
                    >
                        Ver todo {label}
                    </Link>
                    <hr className="border-primary-800" />
                    {rootCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/${section}/${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className={cn(
                                'block px-4 py-2.5 text-sm text-primary-300 transition-colors',
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
// Header principal
// ---------------------------------------------------

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: vapeCategories = [] } = useCategories('vape');
    const { data: herbalCategories = [] } = useCategories('420');

    const vapeRoots = vapeCategories.filter((c) => c.parent_id === null);
    const herbalRoots = herbalCategories.filter((c) => c.parent_id === null);

    return (
        <header className="sticky top-0 z-30 border-b border-primary-800 bg-primary-950/80 backdrop-blur-lg">
            <div className="container-vsm flex h-16 items-center gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center group flex-shrink-0">
                    <img
                        src="/logo-vsm.png"
                        alt="VSM Store"
                        className="h-12 w-auto sm:h-14 transition-opacity group-hover:opacity-90"
                    />
                </Link>

                {/* Navegación central — desktop */}
                <nav className="hidden md:flex items-center gap-5 flex-shrink-0">
                    <Link
                        to="/"
                        className="text-sm font-medium text-primary-300 hover:text-primary-100 transition-colors"
                    >
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
                <div className="hidden sm:block flex-1 max-w-sm ml-auto">
                    <SearchBar />
                </div>

                {/* Acciones */}
                <div className="ml-auto sm:ml-0 flex items-center gap-2">
                    <CartButton />
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-lg p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors md:hidden"
                        aria-label="Menú"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Menú móvil desplegable */}
            {menuOpen && (
                <nav className="border-t border-primary-800 bg-primary-950 px-4 py-3 md:hidden space-y-1">
                    {/* SearchBar en móvil */}
                    <div className="sm:hidden pb-2">
                        <SearchBar />
                    </div>
                    <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-primary-900 hover:text-primary-100 transition-colors"
                    >
                        Inicio
                    </Link>

                    {/* Vape con categorías */}
                    <div>
                        <Link
                            to="/?section=vape"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-vape-500/10 hover:text-vape-400 transition-colors"
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
                                        className="block rounded-lg px-3 py-2 text-xs text-primary-500 hover:bg-vape-500/10 hover:text-vape-400 transition-colors"
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
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-herbal-500/10 hover:text-herbal-400 transition-colors"
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
                                        className="block rounded-lg px-3 py-2 text-xs text-primary-500 hover:bg-herbal-500/10 hover:text-herbal-400 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
