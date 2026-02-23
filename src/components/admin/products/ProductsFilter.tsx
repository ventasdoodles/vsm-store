// ProductsFilter — Barra de filtros del módulo de Productos
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS } from '@/constants/app';
import type { Section } from '@/types/product';

interface ProductsFilterProps {
    search: string;
    sectionFilter: Section | '';
    showInactive: boolean;
    onSearchChange: (v: string) => void;
    onSectionChange: (v: Section | '') => void;
    onToggleInactive: () => void;
}

export function ProductsFilter({
    search,
    sectionFilter,
    showInactive,
    onSearchChange,
    onSectionChange,
    onToggleInactive,
}: ProductsFilterProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Buscador */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-tertiary" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-xl border border-theme/50 bg-theme-primary/60 py-2.5 pl-10 pr-4 text-sm text-theme-primary placeholder-primary-600 focus:border-vape-500/50 focus:outline-none focus:ring-1 focus:ring-vape-500/30"
                />
            </div>

            {/* Sección + Inactivos */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl border border-theme/50 bg-theme-primary/60 p-1">
                    {([['', 'Todos'], [SECTIONS.VAPE, 'Vape'], [SECTIONS.HERBAL, '420']] as [Section | '', string][]).map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => onSectionChange(val)}
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                sectionFilter === val
                                    ? val === '' ? 'bg-theme-secondary text-theme-primary'
                                        : val === SECTIONS.VAPE ? 'bg-vape-500/20 text-vape-400'
                                        : 'bg-herbal-500/20 text-herbal-400'
                                    : 'text-theme-tertiary hover:text-theme-secondary'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onToggleInactive}
                    className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                        showInactive
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            : 'border-theme/50 bg-theme-primary/60 text-theme-tertiary hover:text-theme-secondary'
                    )}
                >
                    <Filter className="h-3 w-3" />
                    Inactivos
                </button>
            </div>
        </div>
    );
}
