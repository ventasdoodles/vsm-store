/**
 * // ─── COMPONENTE: CategoryTreeContainer ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Contenedor glassmorphism para el arbol de categorias.
 *    Maneja los estados de carga, vacio, y renderiza la lista de CategoryTreeNode.
 *    Extraido del orchestrator para cumplir la regla Lego (cero UI en orchestrator).
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism con orbes sutiles.
 */
import { TreePine } from 'lucide-react';
import type { Category } from '@/types/category';
import type { Section } from '@/types/product';
import { CategoryTreeNode } from './CategoryTreeNode';

interface CategoryTreeContainerProps {
    roots: Category[];
    allCategories: Category[];
    sectionFilter: Section | 'all';
    isLoading: boolean;
    onEdit: (c: Category) => void;
    onAddChild: (parent: Category) => void;
    onDelete: (c: Category) => void;
    onToggleActive: (c: Category) => void;
    isToggling: boolean;
}

/** Cantidad de skeletons para el estado de carga */
const SKELETON_COUNT = 4;

export function CategoryTreeContainer({
    roots,
    allCategories,
    sectionFilter,
    isLoading,
    onEdit,
    onAddChild,
    onDelete,
    onToggleActive,
    isToggling,
}: CategoryTreeContainerProps) {
    return (
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-5 shadow-xl backdrop-blur-md">
            {/* Orbes ambientales sutiles */}
            <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-[80px]" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lime-500/4 blur-[60px]" />

            <div className="relative z-10">
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                            <div
                                key={i}
                                className="h-12 animate-pulse rounded-[1rem] bg-white/5"
                                style={{ width: `${100 - i * 8}%` }}
                            />
                        ))}
                    </div>
                ) : roots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-5">
                            <TreePine className="h-12 w-12 text-white/10" />
                        </div>
                        <p className="text-sm font-semibold text-white/40">
                            No hay categorías
                            {sectionFilter !== 'all' ? ` en sección ${sectionFilter}` : ''}
                        </p>
                        <p className="mt-1 text-xs text-white/20">
                            Crea la primera categoría para empezar a organizar tu catálogo.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {roots.map(root => (
                            <CategoryTreeNode
                                key={root.id}
                                category={root}
                                allCategories={allCategories}
                                level={0}
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
        </div>
    );
}
