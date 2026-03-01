// CategoryTreeNode — Fila del árbol de categorías con todas las features
import { useState } from 'react';
import { ChevronRight, ChevronDown, Flame, Pencil, Plus, Trash2, ToggleLeft, ToggleRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';

interface Props {
    category: Category;
    allCategories: Category[];
    level?: number;
    onEdit: (c: Category) => void;
    onAddChild: (parent: Category) => void;
    onDelete: (c: Category) => void;
    onToggleActive: (c: Category) => void;
    isToggling?: boolean;
}

export function CategoryTreeNode({
    category,
    allCategories,
    level = 0,
    onEdit,
    onAddChild,
    onDelete,
    onToggleActive,
    isToggling,
}: Props) {
    const children = allCategories.filter(c => c.parent_id === category.id);
    const hasChildren = children.length > 0;
    const [expanded, setExpanded] = useState(true);

    const isRoot = !category.parent_id;

    return (
        <div>
            {/* Row */}
            <div
                className={cn(
                    'group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all',
                    category.is_active
                        ? 'border-theme hover:border-theme-strong hover:bg-theme-secondary/20'
                        : 'border-dashed border-theme-subtle opacity-50 hover:opacity-70',
                    isRoot ? 'bg-theme-secondary/10' : 'bg-transparent',
                )}
                style={{ marginLeft: `${level * 28}px` }}
            >
                {/* Expand marker */}
                <button
                    onClick={() => setExpanded(p => !p)}
                    className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-theme-secondary hover:bg-theme-secondary/50',
                        !hasChildren && 'invisible'
                    )}
                >
                    {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>

                {/* Thumbnail */}
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-theme-subtle bg-theme-secondary/30">
                    {category.image_url ? (
                        <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={e => (e.currentTarget.style.display = 'none')}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-3.5 w-3.5 text-theme-secondary/30" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        {/* Flame badge */}
                        {category.is_popular && (
                            <span title="Popular" className="flex-shrink-0">
                                <Flame className="h-3.5 w-3.5 text-orange-400" />
                            </span>
                        )}
                        <span className={cn(
                            'truncate text-sm font-medium',
                            category.is_active ? 'text-theme-primary' : 'text-theme-secondary line-through'
                        )}>
                            {category.name}
                        </span>
                        {/* Section badge — solo en raíz */}
                        {isRoot && (
                            <span className={cn(
                                'flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                                category.section === 'vape'
                                    ? 'bg-vape-500/10 text-vape-400'
                                    : 'bg-herbal-500/10 text-herbal-400'
                            )}>
                                {category.section}
                            </span>
                        )}
                        {/* Children count badge */}
                        {hasChildren && (
                            <span className="flex-shrink-0 rounded-full bg-theme-secondary/50 px-1.5 py-0.5 text-xs text-theme-secondary">
                                {children.length}
                            </span>
                        )}
                    </div>
                    {/* Description preview */}
                    {category.description && (
                        <p className="mt-0.5 truncate text-xs text-theme-secondary/70">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Toggle active */}
                    <button
                        onClick={() => onToggleActive(category)}
                        disabled={isToggling}
                        title={category.is_active ? 'Desactivar' : 'Activar'}
                        className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary/50 hover:text-emerald-400"
                    >
                        {category.is_active
                            ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                            : <ToggleLeft className="h-4 w-4" />
                        }
                    </button>

                    {/* Edit */}
                    <button
                        onClick={() => onEdit(category)}
                        title="Editar"
                        className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary/50 hover:text-blue-400"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>

                    {/* Add child (solo en raíz) */}
                    {isRoot && (
                        <button
                            onClick={() => onAddChild(category)}
                            title="Agregar subcategoría"
                            className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary/50 hover:text-vape-400"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    )}

                    {/* Delete */}
                    <button
                        onClick={() => onDelete(category)}
                        title="Eliminar"
                        className="rounded-lg p-1.5 text-theme-secondary hover:bg-red-500/20 hover:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="relative mt-0.5 space-y-0.5">
                    {/* Vertical guide line */}
                    <div
                        className="absolute top-0 h-full w-px bg-theme-secondary/20"
                        style={{ left: `${level * 28 + 18}px` }}
                    />
                    {children.map(child => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            allCategories={allCategories}
                            level={level + 1}
                            onEdit={onEdit}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                            onToggleActive={onToggleActive}
                            isToggling={isToggling}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
