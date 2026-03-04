/**
 * // ─── COMPONENTE: CategoriesHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Cabecera premium del modulo de categorias con orbes esmeralda/lima,
 *    stats en vivo (raices, subcategorias, populares), filtros de seccion como pills glassmorphism,
 *    y boton de crear con glow.
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism puro.
 */
import { Plus, FolderTree, Layers, Flame, Grid3X3 } from 'lucide-react';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';

interface CategoriesHeaderProps {
    categories: Category[];
    sectionFilter: Section | 'all';
    onSectionChange: (s: Section | 'all') => void;
    onNew: () => void;
}

/** Tabs de seccion */
const SECTION_TABS: { label: string; value: Section | 'all'; color: string }[] = [
    { label: 'Todas', value: 'all', color: 'text-white' },
    { label: 'Vape', value: 'vape', color: 'text-violet-400' },
    { label: '420', value: '420', color: 'text-emerald-400' },
];

export function CategoriesHeader({ categories, sectionFilter, onSectionChange, onNew }: CategoriesHeaderProps) {
    const roots    = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => !!c.parent_id);
    const popular  = categories.filter(c => c.is_popular);

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute right-1/4 top-0 h-56 w-56 rounded-full bg-lime-500/8 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-accent-primary/5 blur-[80px]" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Title + Icon */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-lime-500/10 rounded-[1rem] border border-emerald-500/20 shadow-inner">
                            <FolderTree className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500/20 to-lime-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                            Taxonomía
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                        Categorías
                    </h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary/80">
                        Organiza el árbol completo de tu catálogo.
                    </p>
                </div>

                {/* Right: Stats + Tabs + Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Mini Stats Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatPill icon={<Grid3X3 className="h-3.5 w-3.5" />} label="Raíces" value={roots.length} color="text-cyan-400 bg-cyan-500/10 ring-cyan-500/20" />
                        <StatPill icon={<Layers className="h-3.5 w-3.5" />} label="Sub" value={children.length} color="text-blue-400 bg-blue-500/10 ring-blue-500/20" />
                        {popular.length > 0 && (
                            <StatPill icon={<Flame className="h-3.5 w-3.5" />} label="Popular" value={popular.length} color="text-orange-400 bg-orange-500/10 ring-orange-500/20" />
                        )}
                    </div>

                    {/* Section Filter Tabs */}
                    <div className="flex gap-1 rounded-[1rem] border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
                        {SECTION_TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => onSectionChange(tab.value)}
                                className={`rounded-[0.75rem] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                                    sectionFilter === tab.value
                                        ? 'bg-white/10 text-white shadow-lg shadow-white/5 ring-1 ring-white/10'
                                        : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* New Button */}
                    <button
                        onClick={onNew}
                        className="
                            group relative inline-flex items-center gap-2 rounded-[1rem] px-5 py-2.5
                            font-bold text-white text-sm
                            bg-gradient-to-r from-emerald-600 to-lime-600
                            shadow-lg shadow-emerald-500/20
                            transition-all duration-300
                            hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:scale-[1.02]
                            active:scale-[0.98]
                        "
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-[1rem] bg-gradient-to-r from-emerald-500 to-lime-500 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                        <Plus className="relative z-10 h-4 w-4" />
                        <span className="relative z-10">Nueva</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Pill de estadistica individual */
function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset backdrop-blur-sm ${color}`}>
            {icon}
            <span className="opacity-60">{label}</span>
            <span className="font-black">{value}</span>
        </div>
    );
}
