/**
 * // ─── COMPONENTE: TagRow ───
 * // Arquitectura: Dumb Component (Individual Row Lego)
 * // Propósito principal: Fila compacta para una etiqueta con acciones always-visible en mobile.
 * // Regla / Notas: Reemplaza TagCard. ~48px por fila vs ~140px por tarjeta.
 */
import { Edit2, Trash2, Box, Hash, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductTag } from '@/services/admin/admin-tags.service';

interface TagRowProps {
    tag: ProductTag;
    isDeleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function TagRow({ tag, isDeleting, onEdit, onDelete }: TagRowProps) {
    const productCount = tag.product_count || 0;

    return (
        <div className={cn(
            'group relative flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl transition-all duration-200',
            'hover:bg-white/[0.03] border border-transparent hover:border-white/5',
            isDeleting && 'opacity-50 pointer-events-none'
        )}>
            {/* Tag Icon + Label */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="hidden sm:flex p-1.5 rounded-lg bg-accent-primary/10 ring-1 ring-inset ring-accent-primary/20 shrink-0">
                    <Hash className="h-3.5 w-3.5 text-accent-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{tag.label}</p>
                    <p className="text-[10px] font-mono text-theme-secondary/60 truncate sm:hidden">
                        {tag.name}
                    </p>
                </div>
            </div>

            {/* Slug (desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 min-w-0 max-w-[180px]">
                <span className="text-xs font-mono text-theme-secondary/60 truncate">
                    {tag.name}
                </span>
            </div>

            {/* Product Count */}
            <div className="flex items-center gap-1.5 shrink-0">
                <Box className={cn('h-3.5 w-3.5', productCount > 0 ? 'text-accent-primary' : 'text-theme-secondary/30')} />
                <span className={cn('text-xs font-black tabular-nums', productCount > 0 ? 'text-white' : 'text-theme-secondary/30')}>
                    {productCount}
                </span>
            </div>

            {/* Actions — always visible on mobile, hover on desktop */}
            <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="p-2.5 rounded-lg text-theme-secondary hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Editar etiqueta"
                    title="Editar"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="p-2.5 rounded-lg text-theme-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    aria-label="Eliminar etiqueta"
                    title="Eliminar"
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
