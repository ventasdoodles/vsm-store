/**
 * // ─── COMPONENTE: ProductsFilter ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Barra de filtros premium con buscador glassmorphism,
 *    tabs de seccion con pills glassmorphism y toggle de inactivos con glow ambar.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin cadenas magicas.
 */
import { Search, Eye, EyeOff } from 'lucide-react';
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

/** Tabs de seccion */
const SECTION_TABS: { label: string; value: Section | '' }[] = [
    { label: 'Todos', value: '' },
    { label: 'Vape', value: SECTIONS.VAPE },
    { label: '420', value: SECTIONS.HERBAL },
];

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
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-[1rem] border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
            </div>

            {/* Section + Inactive */}
            <div className="flex items-center gap-2">
                {/* Section tabs */}
                <div className="flex gap-1 rounded-[1rem] border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
                    {SECTION_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => onSectionChange(tab.value)}
                            className={cn(
                                'rounded-[0.75rem] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
                                sectionFilter === tab.value
                                    ? 'bg-white/10 text-white shadow-lg shadow-white/5 ring-1 ring-white/10'
                                    : 'text-white/40 hover:text-white/70'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Inactive toggle */}
                <button
                    onClick={onToggleInactive}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-[1rem] border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-sm',
                        showInactive
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                            : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'
                    )}
                >
                    {showInactive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Inactivos
                </button>
            </div>
        </div>
    );
}
