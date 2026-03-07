/**
 * FilterSidebar - Componente de filtrado avanzado para el catálogo.
 * Diseño Glassmorphism Premium con soporte para mobile (BottomSheet).
 */
import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { getAvailableFilters, type FilterState } from '@/lib/product-filtering';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

interface FilterSidebarProps {
    products: Product[];
    section: Section;
    activeFilters: FilterState;
    onChange: (filters: FilterState) => void;
    onClose?: () => void; // Para mobile
}

export function FilterSidebar({ products, section, activeFilters, onChange, onClose }: FilterSidebarProps) {
    const isVape = section === 'vape';
    const { minPrice, maxPrice, attributes } = getAvailableFilters(products);

    const handlePriceChange = (value: number, index: 0 | 1) => {
        const newRange = [...activeFilters.priceRange] as [number, number];
        newRange[index] = value;
        onChange({ ...activeFilters, priceRange: newRange });
    };

    const toggleAttribute = (attrName: string, value: string) => {
        const currentValues = activeFilters.attributes[attrName] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        onChange({
            ...activeFilters,
            attributes: {
                ...activeFilters.attributes,
                [attrName]: newValues
            }
        });
    };

    const clearFilters = () => {
        onChange({
            priceRange: [minPrice, maxPrice],
            attributes: {}
        });
    };

    const hasActiveFilters =
        activeFilters.priceRange[0] !== minPrice ||
        activeFilters.priceRange[1] !== maxPrice ||
        Object.values(activeFilters.attributes).some(arr => arr.length > 0);

    return (
        <aside className="flex flex-col gap-8">
            {/* Header / Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className={cn("h-4 w-4", isVape ? "text-vape-400" : "text-herbal-400")} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-theme-primary">Filtros</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-[10px] font-bold uppercase tracking-tighter text-theme-tertiary hover:text-theme-primary transition-colors"
                    >
                        Limpiar todos
                    </button>
                )}
            </div>

            {/* Rango de Precio */}
            <FilterGroup title="Rango de Precio">
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                            <span className="text-[10px] text-theme-tertiary uppercase font-bold">Min</span>
                            <div className="rounded-lg bg-theme-secondary/30 border border-theme p-2 text-xs font-mono text-theme-primary">
                                {formatPrice(activeFilters.priceRange[0])}
                            </div>
                        </div>
                        <div className="flex-1 space-y-1 text-right">
                            <span className="text-[10px] text-theme-tertiary uppercase font-bold">Max</span>
                            <div className="rounded-lg bg-theme-secondary/30 border border-theme p-2 text-xs font-mono text-theme-primary">
                                {formatPrice(activeFilters.priceRange[1])}
                            </div>
                        </div>
                    </div>

                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={activeFilters.priceRange[1]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                        className={cn(
                            "w-full h-1.5 rounded-full appearance-none cursor-pointer bg-theme-secondary/40",
                            isVape ? "accent-vape-500" : "accent-herbal-500"
                        )}
                    />
                </div>
            </FilterGroup>

            {/* Atributos Dinámicos */}
            {Object.entries(attributes).map(([attrName, values]) => (
                <FilterGroup key={attrName} title={attrName}>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {values.map((val: string) => {
                            const isActive = activeFilters.attributes[attrName]?.includes(val);
                            return (
                                <button
                                    key={val}
                                    onClick={() => toggleAttribute(attrName, val)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                                        isActive
                                            ? isVape
                                                ? "bg-vape-500/20 border-vape-500/40 text-vape-400"
                                                : "bg-herbal-500/20 border-herbal-500/40 text-herbal-400"
                                            : "bg-theme-secondary/20 border-transparent text-theme-secondary hover:bg-theme-secondary/40"
                                    )}
                                >
                                    {val}
                                </button>
                            );
                        })}
                    </div>
                </FilterGroup>
            ))}

            {onClose && (
                <button
                    onClick={onClose}
                    className={cn(
                        "mt-4 w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-xl",
                        isVape ? "bg-vape-500 shadow-vape-500/20" : "bg-herbal-500 shadow-herbal-500/20"
                    )}
                >
                    Ver Resultados
                </button>
            )}
        </aside>
    );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="space-y-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full group"
            >
                <span className="text-[11px] font-bold uppercase tracking-widest text-theme-secondary group-hover:text-theme-primary transition-colors">
                    {title}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-theme-tertiary transition-transform", !isOpen && "-rotate-90")} />
            </button>
            {isOpen && children}
        </div>
    );
}
