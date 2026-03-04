/**
 * // ─── COMPONENTE: TagsHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Propósito principal: Cabecera premium con título, badge e botón de acción.
 * // Regla / Notas: Homogenizado con BrandsHeader. Glassmorphism + orbes de luz.
 */
import { Tags, Plus } from 'lucide-react';

interface TagsHeaderProps {
    onNew: () => void;
}

export function TagsHeader({ onNew }: TagsHeaderProps) {
    return (
        <div className="relative overflow-hidden mb-8 rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glows Premium */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute right-1/4 top-0 h-64 w-64 rounded-full bg-pink-500/10 blur-[100px]" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-accent-primary/20 to-pink-500/10 rounded-[1rem] border border-accent-primary/20 shadow-inner">
                            <Tags className="h-7 w-7 text-accent-primary drop-shadow-[0_0_8px_rgba(var(--color-accent-primary),0.3)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary/20 to-pink-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-accent-primary ring-1 ring-inset ring-accent-primary/30">
                            Marketing & SEO
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                        Gestor de Etiquetas
                    </h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary/80">
                        Crea, organiza y gestiona las etiquetas de tus productos.
                    </p>
                </div>

                <button
                    onClick={onNew}
                    className="flex items-center gap-2 self-start sm:self-auto px-5 py-3 rounded-2xl bg-accent-primary text-black text-sm font-black hover:bg-accent-primary/90 transition-all active:scale-95 shadow-lg shadow-accent-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Etiqueta
                </button>
            </div>
        </div>
    );
}
