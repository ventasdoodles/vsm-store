/**
 * // ─── COMPONENTE: TagsTable ───
 * // Arquitectura: Dumb Component (Lista compacta)
 * // Propósito principal: Reemplaza TagGrid con una vista de tabla compacta y paginada.
 * // Regla / Notas: Filas de ~48px vs tarjetas de 140px+. Reduce scroll 3x. Empty state premium.
 */
import { Tag } from 'lucide-react';
import type { ProductTag } from '@/services/admin';
import { TagRow } from './TagRow';

interface TagsTableProps {
    tags: ProductTag[];
    deletingName: string | null;
    onEdit: (tag: ProductTag) => void;
    onDelete: (name: string) => void;
}

export function TagsTable({ tags, deletingName, onEdit, onDelete }: TagsTableProps) {
    if (tags.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-theme-primary/5 rounded-2xl border border-white/5">
                <div className="p-4 bg-accent-primary/10 rounded-full mb-4">
                    <Tag className="h-10 w-10 text-accent-primary/40" />
                </div>
                <p className="text-lg font-black text-theme-primary text-center">
                    No se encontraron etiquetas
                </p>
                <p className="text-sm font-medium text-theme-secondary mt-1 text-center max-w-sm">
                    No hay etiquetas que coincidan con la búsqueda o no has creado ninguna todavía.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            {/* Header row (desktop) */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-theme-secondary/40">
                <div className="flex-1">Etiqueta</div>
                <div className="min-w-0 max-w-[180px]">Slug</div>
                <div className="w-16 text-center">Productos</div>
                <div className="w-20" />
            </div>

            {/* Rows */}
            {tags.map((tag) => (
                <TagRow
                    key={tag.name}
                    tag={tag}
                    isDeleting={deletingName === tag.name}
                    onEdit={() => onEdit(tag)}
                    onDelete={() => onDelete(tag.name)}
                />
            ))}
        </div>
    );
}
