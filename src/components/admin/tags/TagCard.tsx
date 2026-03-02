/**
 * // ─── COMPONENTE: TagCard ───
 * // Arquitectura: Dumb Component (Individual Tag Lego)
 * // Proposito principal: Mostrar una etiqueta individual con sus estadisticas y opciones de edicion/borrado inline.
 * // Regla / Notas: Mantiene su propio estado de edicion UI ("inline Edit") pero la data final la envia arriba.
 */
import { useState } from 'react';
import { Tag, Edit2, Trash2, Box, Check, X, Loader2, Hash } from 'lucide-react';
import type { ProductTag } from '@/services/admin/admin-tags.service';

interface TagCardProps {
    tag: ProductTag;
    isDeleting: boolean;
    isRenaming: boolean;
    onDelete: () => void;
    onRename: (newLabel: string) => void;
}

export function TagCard({ tag, isDeleting, isRenaming, onDelete, onRename }: TagCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(tag.label);

    const productCount = tag.product_count || 0;

    const handleRename = () => {
        if (editLabel.trim() && editLabel !== tag.label) {
            onRename(editLabel.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setEditLabel(tag.label);
            setIsEditing(false);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#13141f]/40 hover:bg-[#13141f]/70 transition-all duration-500 h-full min-h-[140px] flex flex-col justify-between p-5 backdrop-blur-md hover:border-accent-primary/20 hover:shadow-lg hover:shadow-accent-primary/5">
            {/* Ambient Glow on Hover */}
            <div className="absolute -inset-2 bg-gradient-to-r from-accent-primary/0 via-accent-primary/5 to-accent-primary/0 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Header: Name / Input and Actions */}
            <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            disabled={isRenaming}
                            className="w-full bg-white/5 border border-accent-primary/50 rounded-lg px-2 py-1 text-sm font-black text-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-theme-secondary shrink-0" />
                            <h3 className="text-sm font-black text-white truncate uppercase tracking-widest">
                                {tag.label}
                            </h3>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleRename}
                                disabled={isRenaming}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                                {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setEditLabel(tag.label); }}
                                disabled={isRenaming}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded-lg bg-white/5 text-theme-secondary hover:text-white hover:bg-white/10 transition-colors"
                                title="Editar etiqueta"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={onDelete}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors disabled:opacity-50"
                                title="Eliminar etiqueta"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Footer: Stats & Slug */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto relative z-10">
                <div className="flex items-center gap-1.5 text-xs text-theme-secondary/70">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{tag.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                    <Box className={`h-4 w-4 ${productCount > 0 ? 'text-accent-primary' : 'text-theme-secondary/40'}`} />
                    <span className={`text-xs font-black ${productCount > 0 ? 'text-white' : 'text-theme-secondary/40'}`}>
                        {productCount}
                    </span>
                </div>
            </div>
            
            {/* Overlay de carga */}
            {(isDeleting || isRenaming) && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] rounded-[1.5rem] flex items-center justify-center pointer-events-none">
                    <Loader2 className="h-6 w-6 text-accent-primary animate-spin" />
                </div>
            )}
        </div>
    );
}
