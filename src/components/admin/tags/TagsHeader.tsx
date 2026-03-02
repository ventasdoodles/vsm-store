/**
 * // ─── COMPONENTE: TagsHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Propósito principal: Cabecera descriptiva e interactiva con buscador rápido.
 * // Regla / Notas: Glassmorphism puro, orbes de luz y uso de sombras interactivas.
 */
import { Search, Tags } from 'lucide-react';

interface TagsHeaderProps {
    search: string;
    setSearch: (val: string) => void;
    totalTags: number;
    totalProductsUsed: number;
}

export function TagsHeader({
    search,
    setSearch,
    totalTags,
    totalProductsUsed,
}: TagsHeaderProps) {
    return (
        <div className="relative overflow-hidden mb-8 rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glows Premium */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute right-1/4 top-0 h-64 w-64 rounded-full bg-pink-500/10 blur-[100px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-accent-primary/20 to-pink-500/10 rounded-[1rem] border border-accent-primary/20 shadow-inner">
                            <Tags className="h-7 w-7 text-accent-primary drop-shadow-[0_0_8px_rgba(var(--color-accent-primary),0.3)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary/20 to-pink-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-accent-primary ring-1 ring-inset ring-accent-primary/30">
                            Marketing & SEO
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-3">
                        Gestor de Etiquetas
                    </h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary/80">
                        {totalTags} etiquetas globales · {totalProductsUsed} productos clasificados
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Buscador Mágico */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary/50" />
                        <input
                            type="text"
                            placeholder="Buscar etiqueta por nombre o slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-[1.5rem] border border-white/5 bg-[#13141f]/70 py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-theme-secondary/50 focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all shadow-inner backdrop-blur-md"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
