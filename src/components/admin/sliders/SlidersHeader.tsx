// ─── MegaHero Sliders Header ──────────────────────────────────────────────────
// Muestra el título del módulo, stats rápidas y el botón de creación principal.
import { Image as ImageIcon, Plus, Eye, EyeOff } from 'lucide-react';

interface SlidersHeaderProps {
    /** Callback para abrir el modal de nuevo slide */
    onCreateNew: () => void;
    /** Total de sliders configurados */
    total: number;
    /** Total de sliders activos/visibles */
    activeCount: number;
}

export function SlidersHeader({ onCreateNew, total, activeCount }: SlidersHeaderProps) {
    const inactiveCount = total - activeCount;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-primary/10 p-6 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full sm:w-auto">
                <h1 className="text-3xl font-black text-theme-primary flex items-center gap-3 drop-shadow-sm">
                    <div className="p-2.5 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                        <ImageIcon className="h-7 w-7 text-pink-400" />
                    </div>
                    MegaHero Sliders
                </h1>
                <p className="text-sm font-medium text-theme-secondary mt-2 max-w-2xl">
                    Gestiona los banners principales de la tienda (Home). Modifica fondos premium, textos y enlaces CTA para maximizar la experiencia.
                </p>

                {/* Quick Stats Badges */}
                {total > 0 && (
                    <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[11px] font-black tracking-wider uppercase">
                            {total} total
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black tracking-wider uppercase">
                            <Eye className="w-3 h-3" /> {activeCount} activos
                        </span>
                        {inactiveCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black tracking-wider uppercase">
                                <EyeOff className="w-3 h-3" /> {inactiveCount} ocultos
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            <button
                onClick={onCreateNew}
                className="relative z-10 w-full md:w-auto group flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white px-6 py-3.5 rounded-2xl font-black tracking-wide transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/25 active:scale-95"
            >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                <span>NUEVO SLIDE</span>
            </button>
        </div>
    );
}
