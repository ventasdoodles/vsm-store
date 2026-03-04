/**
 * // ─── COMPONENTE: CategoryTreeNode ───
 * // Arquitectura: Dumb Component (Visual + Recursion)
 * // Proposito principal: Fila premium del arbol de categorias con glassmorphism,
 *    thumbnails con glow, badges semanticos, guias de conexion con gradiente,
 *    acciones hover con microinteracciones. Se renderiza recursivamente para hijos.
 * // Regla / Notas: Props tipadas. Sin `any`. Cada nivel incrementa el indent.
 *    Los nodos inactivos se muestran con opacidad reducida y borde dashed.
 */
import { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Flame,
    Pencil,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    ImageOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';

interface CategoryTreeNodeProps {
    category: Category;
    allCategories: Category[];
    level?: number;
    onEdit: (c: Category) => void;
    onAddChild: (parent: Category) => void;
    onDelete: (c: Category) => void;
    onToggleActive: (c: Category) => void;
    isToggling?: boolean;
}

/** Indent en px por nivel de profundidad */
const LEVEL_INDENT = 28;

/** Color de la guia vertical por seccion */
const GUIDE_COLOR: Record<string, string> = {
    vape: 'from-violet-500/30 to-violet-500/0',
    '420': 'from-emerald-500/30 to-emerald-500/0',
};

export function CategoryTreeNode({
    category,
    allCategories,
    level = 0,
    onEdit,
    onAddChild,
    onDelete,
    onToggleActive,
    isToggling,
}: CategoryTreeNodeProps) {
    const children = allCategories.filter(c => c.parent_id === category.id);
    const hasChildren = children.length > 0;
    const [expanded, setExpanded] = useState(true);

    const isRoot = !category.parent_id;

    return (
        <div>
            {/* Row */}
            <div
                className={cn(
                    'group flex items-center gap-2.5 rounded-[1rem] border px-3.5 py-2.5 transition-all duration-200',
                    category.is_active
                        ? 'border-white/5 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-lg'
                        : 'border-dashed border-white/5 opacity-40 hover:opacity-60',
                    isRoot
                        ? 'bg-white/[0.03] shadow-md'
                        : 'bg-transparent',
                )}
                style={{ marginLeft: `${level * LEVEL_INDENT}px` }}
            >
                {/* Expand chevron */}
                <button
                    onClick={() => setExpanded(p => !p)}
                    className={cn(
                        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all',
                        hasChildren
                            ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                            : 'invisible',
                    )}
                >
                    {expanded
                        ? <ChevronDown className="h-3.5 w-3.5" />
                        : <ChevronRight className="h-3.5 w-3.5" />
                    }
                </button>

                {/* Thumbnail with glow */}
                <div className={cn(
                    'relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border transition-all',
                    category.is_active
                        ? 'border-white/10 shadow-lg'
                        : 'border-white/5',
                )}>
                    {category.image_url ? (
                        <>
                            <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={e => (e.currentTarget.style.display = 'none')}
                            />
                            {/* Glow ring on hover */}
                            <div className={cn(
                                'pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-2 transition-opacity group-hover:opacity-100',
                                category.section === 'vape' ? 'ring-violet-500/30' : 'ring-emerald-500/30',
                            )} />
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/[0.03]">
                            <ImageOff className="h-3.5 w-3.5 text-white/15" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        {/* Flame badge */}
                        {category.is_popular && (
                            <span title="Popular" className="flex-shrink-0">
                                <Flame className="h-3.5 w-3.5 text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.4)]" />
                            </span>
                        )}
                        <span className={cn(
                            'truncate text-sm font-semibold',
                            category.is_active ? 'text-white' : 'text-white/40 line-through',
                        )}>
                            {category.name}
                        </span>
                        {/* Section badge — solo en raiz */}
                        {isRoot && (
                            <span className={cn(
                                'flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset',
                                category.section === 'vape'
                                    ? 'bg-violet-500/10 text-violet-400 ring-violet-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
                            )}>
                                {category.section}
                            </span>
                        )}
                        {/* Children count badge */}
                        {hasChildren && (
                            <span className="flex-shrink-0 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-white/30 ring-1 ring-inset ring-white/10">
                                {children.length}
                            </span>
                        )}
                    </div>
                    {/* Description preview */}
                    {category.description && (
                        <p className="mt-0.5 truncate text-[11px] text-white/30">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Actions — always visible on mobile, hover on desktop */}
                <div className="flex items-center gap-0.5 sm:translate-x-2 sm:opacity-0 transition-all duration-200 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                    {/* Toggle active */}
                    <ActionButton
                        onClick={() => onToggleActive(category)}
                        disabled={isToggling}
                        title={category.is_active ? 'Desactivar' : 'Activar'}
                        hoverColor="hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                        {category.is_active
                            ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                            : <ToggleLeft className="h-4 w-4" />
                        }
                    </ActionButton>

                    {/* Edit */}
                    <ActionButton
                        onClick={() => onEdit(category)}
                        title="Editar"
                        hoverColor="hover:text-blue-400 hover:bg-blue-500/10"
                    >
                        <Pencil className="h-4 w-4" />
                    </ActionButton>

                    {/* Add child (solo en raiz) */}
                    {isRoot && (
                        <ActionButton
                            onClick={() => onAddChild(category)}
                            title="Agregar subcategoría"
                            hoverColor="hover:text-lime-400 hover:bg-lime-500/10"
                        >
                            <Plus className="h-4 w-4" />
                        </ActionButton>
                    )}

                    {/* Delete */}
                    <ActionButton
                        onClick={() => onDelete(category)}
                        title="Eliminar"
                        hoverColor="hover:text-red-400 hover:bg-red-500/10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </ActionButton>
                </div>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="relative mt-1 space-y-1">
                    {/* Vertical gradient guide line */}
                    <div
                        className={`absolute top-0 h-full w-px bg-gradient-to-b ${GUIDE_COLOR[category.section] ?? GUIDE_COLOR['vape']}`}
                        style={{ left: `${level * LEVEL_INDENT + 18}px` }}
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

/** Boton de accion con hover consistente */
function ActionButton({
    children,
    onClick,
    title,
    hoverColor,
    disabled,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    hoverColor: string;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
            className={cn(
                'rounded-lg p-2.5 text-white/30 transition-all disabled:opacity-50',
                hoverColor,
            )}
        >
            {children}
        </button>
    );
}
