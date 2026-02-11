// Header - VSM Store
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu } from 'lucide-react';

export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-primary-800 bg-primary-950/80 backdrop-blur-lg">
            <div className="container-vsm flex h-16 items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center group">
                    <img
                        src="/logo-vsm.png"
                        alt="VSM Store"
                        className="h-8 w-auto sm:h-10 transition-opacity group-hover:opacity-90"
                    />
                </Link>

                {/* Navegación central */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        to="/"
                        className="text-sm font-medium text-primary-300 hover:text-primary-100 transition-colors"
                    >
                        Inicio
                    </Link>
                    <Link
                        to="/vape"
                        className="text-sm font-medium text-primary-300 hover:text-vape-400 transition-colors"
                    >
                        Vape
                    </Link>
                    <Link
                        to="/420"
                        className="text-sm font-medium text-primary-300 hover:text-herbal-400 transition-colors"
                    >
                        420
                    </Link>
                </nav>

                {/* Acciones */}
                <div className="flex items-center gap-3">
                    <button
                        className="rounded-lg p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                        aria-label="Buscar"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                    <button
                        className="relative rounded-lg p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                        aria-label="Carrito"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {/* Badge placeholder */}
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-vape-500 text-[10px] font-bold text-white">
                            0
                        </span>
                    </button>
                    <button
                        className="rounded-lg p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors md:hidden"
                        aria-label="Menú"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
