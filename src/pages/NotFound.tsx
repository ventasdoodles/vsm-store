// Página 404 - VSM Store
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
    return (
        <div className="container-vsm flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="mb-2 text-8xl font-extrabold text-primary-700">404</h1>
            <h2 className="mb-4 text-2xl font-semibold text-primary-300">
                Página no encontrada
            </h2>
            <p className="mb-8 max-w-md text-primary-500">
                La página que buscas no existe o fue movida.
                Regresa al inicio para seguir explorando.
            </p>
            <div className="flex gap-3">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-6 py-3 text-sm font-semibold text-primary-200 transition-all hover:bg-primary-700 hover:-translate-y-0.5"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Link>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-vape-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-vape-500/25 transition-all hover:bg-vape-600 hover:-translate-y-0.5"
                >
                    <Home className="h-4 w-4" />
                    Inicio
                </Link>
            </div>
        </div>
    );
}
