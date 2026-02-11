// Header - VSM Store
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Flame, Leaf } from 'lucide-react';
import { CartButton } from '@/components/cart/CartButton';

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-primary-800 bg-primary-950/80 backdrop-blur-lg">
            <div className="container-vsm flex h-16 items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center group flex-shrink-0">
                    <img
                        src="/logo-vsm.png"
                        alt="VSM Store"
                        className="h-12 w-auto sm:h-14 transition-opacity group-hover:opacity-90"
                    />
                </Link>

                {/* Navegación central — desktop */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        to="/"
                        className="text-sm font-medium text-primary-300 hover:text-primary-100 transition-colors"
                    >
                        Inicio
                    </Link>
                    <Link
                        to="/?section=vape"
                        className="flex items-center gap-1 text-sm font-medium text-primary-300 hover:text-vape-400 transition-colors"
                    >
                        <Flame className="h-3.5 w-3.5" />
                        Vape
                    </Link>
                    <Link
                        to="/?section=420"
                        className="flex items-center gap-1 text-sm font-medium text-primary-300 hover:text-herbal-400 transition-colors"
                    >
                        <Leaf className="h-3.5 w-3.5" />
                        420
                    </Link>
                </nav>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                    <button
                        className="rounded-lg p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                        aria-label="Buscar"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Carrito */}
                    <CartButton />

                    {/* Hamburger — móvil */}
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
                <nav className="border-t border-primary-800 bg-primary-950 px-4 py-3 md:hidden">
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-primary-900 hover:text-primary-100 transition-colors"
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/?section=vape"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-vape-500/10 hover:text-vape-400 transition-colors"
                        >
                            <Flame className="h-4 w-4" />
                            Vape
                        </Link>
                        <Link
                            to="/?section=420"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-herbal-500/10 hover:text-herbal-400 transition-colors"
                        >
                            <Leaf className="h-4 w-4" />
                            420
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
