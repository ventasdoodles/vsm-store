/**
 * // ─── COMPONENTE: CategoryCascader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Selector de categoria en cascada con profundidad ilimitada.
 *    Dado un arbol de categorias con parent_id, renderiza N dropdowns glassmorphism
 *    donde cada nivel muestra los hijos del nivel anterior. Al seleccionar un nodo,
 *    si tiene hijos aparece un nuevo dropdown. El category_id final es siempre el nodo
 *    mas profundo seleccionado. Breadcrumb visual del path completo.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin cadenas magicas. Profundidad recursiva.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';

interface CategoryCascaderProps {
    /** All categories (flat array from DB) */
    categories: Category[];
    /** Current section filter */
    section: Section;
    /** Currently selected category_id */
    value: string;
    /** Fires with the deepest selected category id (or '' if cleared) */
    onChange: (categoryId: string) => void;
}

/** Glassmorphism select style */
const SELECT_CLS = 'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20';

/** Level labels for visual context */
const LEVEL_LABELS = ['Categoria', 'Subcategoria', 'Sub-subcategoria', 'Nivel 4', 'Nivel 5'] as const;

export function CategoryCascader({ categories, section, value, onChange }: CategoryCascaderProps) {
    // Only active categories for this section
    const sectionCats = useMemo(
        () => categories.filter(c => c.section === section && c.is_active),
        [categories, section],
    );

    // Index: parent_id → children[]
    const childrenMap = useMemo(() => {
        const map = new Map<string | null, Category[]>();
        for (const c of sectionCats) {
            const key = c.parent_id ?? '__root__';
            const arr = map.get(key) ?? [];
            arr.push(c);
            map.set(key, arr);
        }
        return map;
    }, [sectionCats]);

    // Index: id → category (for path resolution)
    const byId = useMemo(() => {
        const map = new Map<string, Category>();
        for (const c of sectionCats) map.set(c.id, c);
        return map;
    }, [sectionCats]);

    /**
     * Walk up from a category_id to the root, returning the path
     * from root → deepest as an array of ids.
     */
    const resolvePath = useCallback((catId: string): string[] => {
        const path: string[] = [];
        let current = byId.get(catId);
        while (current) {
            path.unshift(current.id);
            current = current.parent_id ? byId.get(current.parent_id) : undefined;
        }
        return path;
    }, [byId]);

    // Path state: array of selected IDs from root to deepest
    const [path, setPath] = useState<string[]>([]);

    // Sync path when value or section changes
    useEffect(() => {
        if (value && byId.has(value)) {
            setPath(resolvePath(value));
        } else {
            setPath([]);
        }
    }, [value, byId, resolvePath]);

    /** Get children for a given parent (null = roots) */
    const getChildren = (parentId: string | null): Category[] => {
        const key = parentId ?? '__root__';
        return childrenMap.get(key) ?? [];
    };

    /** Handle selection at a specific depth level */
    const handleSelect = (level: number, catId: string) => {
        if (!catId) {
            // Cleared this level — trim path and fire with parent or empty
            const newPath = path.slice(0, level);
            setPath(newPath);
            onChange(newPath.length > 0 ? newPath[newPath.length - 1]! : '');
        } else {
            // Selected a category — set path up to this level and fire
            const newPath = [...path.slice(0, level), catId];
            setPath(newPath);
            onChange(catId);
        }
    };

    // Build the cascading dropdown levels
    const roots = getChildren(null);

    // Determine how many dropdowns to show:
    // Level 0: roots (always shown)
    // Level N: children of path[N-1] (shown if path[N-1] has children)
    const levels: { parentId: string | null; options: Category[]; selected: string }[] = [];

    // Level 0: roots
    levels.push({ parentId: null, options: roots, selected: path[0] ?? '' });

    // Subsequent levels: children of each selected node
    for (let i = 0; i < path.length; i++) {
        const parentId = path[i]!;
        const children = getChildren(parentId);
        if (children.length > 0) {
            levels.push({
                parentId,
                options: children,
                selected: path[i + 1] ?? '',
            });
        }
    }

    if (roots.length === 0) {
        return (
            <p className="text-xs text-white/25 italic">
                No hay categorias activas para esta seccion.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {levels.map((level, idx) => (
                <div key={`level-${idx}-${level.parentId ?? 'root'}`}>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                        {LEVEL_LABELS[Math.min(idx, LEVEL_LABELS.length - 1)]}
                    </label>
                    <select
                        value={level.selected}
                        onChange={(e) => handleSelect(idx, e.target.value)}
                        className={cn(
                            SELECT_CLS,
                            !level.selected && 'text-white/25',
                        )}
                    >
                        <option value="">
                            {idx === 0 ? 'Selecciona categoria' : 'Selecciona subcategoria (opcional)'}
                        </option>
                        {level.options.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            ))}

            {/* Breadcrumb — shows full path */}
            {path.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                    {path.map((id, idx) => {
                        const cat = byId.get(id);
                        if (!cat) return null;
                        return (
                            <span key={id} className="flex items-center gap-1">
                                {idx > 0 && <ChevronRight className="h-3 w-3 text-white/15" />}
                                <span className={cn(
                                    'text-xs font-semibold',
                                    idx === path.length - 1 ? 'text-cyan-400' : 'text-white/30',
                                )}>
                                    {cat.name}
                                </span>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
