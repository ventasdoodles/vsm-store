// ProductsHeader — Cabecera del módulo de Productos
// Muestra título, contador y botón de nuevo producto + exportar CSV
import { Link } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';

interface ProductsHeaderProps {
    count: number;
    onExportCSV: () => void;
}

export function ProductsHeader({ count, onExportCSV }: ProductsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-theme-primary">Productos</h1>
                <p className="text-sm text-theme-secondary">
                    {count} producto{count !== 1 ? 's' : ''} encontrados
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onExportCSV}
                    className="inline-flex items-center gap-2 rounded-xl border border-theme/50 bg-theme-secondary/10 px-4 py-2.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/20 transition-all"
                    title="Exportar lista filtrada a CSV"
                >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                </button>
                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 hover:shadow-vape-500/30 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo producto
                </Link>
            </div>
        </div>
    );
}
