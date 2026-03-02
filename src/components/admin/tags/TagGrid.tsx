/**
 * // ─── COMPONENTE: TagGrid ───
 * // Arquitectura: Dumb Component (Flex Grid for Tags)
 * // Propósito principal: Mostrar la colección de etiquetas en formato de tarjetas y no en tabla.
 * // Regla / Notas: Recibe directamente el array de etiquetas `tags` y las funciones.
 */
import { Tag } from 'lucide-react';
import type { ProductTag } from '@/services/admin/admin-tags.service';
import { TagCreateCard } from './TagCreateCard';
import { TagCard } from './TagCard';

interface TagGridProps {
    tags: ProductTag[];
    searchQuery: string;
    isCreating: boolean;
    isDeleting: string | null | undefined;
    isRenaming: string | null | undefined;
    onCreate: (name: string, label: string) => void;
    onRename: (oldName: string, newLabel: string) => void;
    onDelete: (name: string) => void;
}

export function TagGrid({
    tags,
    searchQuery,
    isCreating,
    isDeleting,
    isRenaming,
    onCreate,
    onRename,
    onDelete,
}: TagGridProps) {
    const filteredTags = tags.filter((t) =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in pb-10">
            {/* Si no se está buscando específicamente, la primera tarjeta siempre es "Crear" */}
            {!searchQuery && (
                <div className="relative">
                    <TagCreateCard onCreate={onCreate} isLoading={isCreating} />
                </div>
            )}

            {filteredTags.map((tag) => (
                <TagCard
                    key={tag.name}
                    tag={tag}
                    isDeleting={isDeleting === tag.name}
                    isRenaming={isRenaming === tag.name}
                    onDelete={() => onDelete(tag.name)}
                    onRename={(newLabel) => onRename(tag.name, newLabel)}
                />
            ))}

            {filteredTags.length === 0 && searchQuery && (
                <div className="col-span-full border border-white/5 border-dashed rounded-[2rem] p-12 text-center bg-theme-primary/10 backdrop-blur-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-accent-primary/5 flex items-center justify-center mb-4 border border-accent-primary/20">
                        <Tag className="h-6 w-6 text-accent-primary opacity-50" />
                    </div>
                    <p className="text-sm font-black text-theme-secondary uppercase tracking-widest">
                        NO SE ENCONTRARON ETIQUETAS
                    </p>
                    <p className="text-xs text-theme-secondary/50 mt-2">
                        Intenta con otra búsqueda.
                    </p>
                </div>
            )}
        </div>
    );
}