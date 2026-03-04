/**
 * // ─── COMPONENTE: TagsFilters ───
 * // Arquitectura: Dumb Component (Visual + Controlled)
 * // Propósito principal: Barra de búsqueda para filtrar etiquetas.
 * // Regla / Notas: Patrón idéntico a BrandsFilters.
 */
import { Search, X } from 'lucide-react';

interface TagsFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
}

export function TagsFilters({ search, onSearchChange }: TagsFiltersProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary/50" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o slug..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-[#13141f]/70 py-2.5 pl-10 pr-9 text-sm font-semibold text-white placeholder-theme-secondary/50 focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all backdrop-blur-md"
                />
                {search && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-theme-secondary/50 hover:text-white transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
