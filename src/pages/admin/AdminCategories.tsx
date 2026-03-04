/**
 * // ─── COMPONENTE: AdminCategories ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar la gestion de categorias del admin.
 *    State: panelMode, editingCat, parentCat, sectionFilter.
 *    Mutations: create, update, delete, toggleActive.
 *    Delega TODO el renderizado visual a los Legos en components/admin/categories/.
 * // Regla / Notas: Cero UI propio excepto layout wrapper. Sin `any`, sin cadenas magicas.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@/hooks/useNotification';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    type CategoryFormData,
} from '@/services/admin';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';

import { CategoriesHeader, CategoryForm, CategoryTreeContainer } from '@/components/admin/categories';

/** Estados posibles del panel lateral */
type PanelMode = 'closed' | 'create-root' | 'create-child' | 'edit';

/** Query key centralizada */
const QUERY_KEY = ['admin', 'categories'] as const;

export function AdminCategories() {
    const qc = useQueryClient();
    const { success, error: notifyError } = useNotification();

    // ── UI state ──
    const [panelMode, setPanelMode]         = useState<PanelMode>('closed');
    const [editingCat, setEditingCat]       = useState<Category | null>(null);
    const [parentCat, setParentCat]         = useState<Category | null>(null);
    const [sectionFilter, setSectionFilter] = useState<Section | 'all'>('all');

    // ── Data ──
    const { data: categories = [], isLoading } = useQuery({
        queryKey: [...QUERY_KEY],
        queryFn: getAllCategories,
    });

    // ── Mutations ──
    const invalidate = () => qc.invalidateQueries({ queryKey: [...QUERY_KEY] });

    const createMut = useMutation({
        mutationFn: createCategory,
        onSuccess: () => { invalidate(); closePanel(); success('Creada', 'Categoría creada con éxito'); },
        onError: () => notifyError('Error', 'No se pudo crear la categoría'),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
            updateCategory(id, data),
        onSuccess: () => { invalidate(); closePanel(); success('Actualizada', 'Categoría actualizada'); },
        onError: () => notifyError('Error', 'No se pudo actualizar la categoría'),
    });

    const deleteMut = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => { invalidate(); success('Eliminada', 'Categoría eliminada'); },
        onError: () => notifyError('Error', 'No se pudo eliminar la categoría'),
    });

    const toggleMut = useMutation({
        mutationFn: ({ id, flag }: { id: string; flag: boolean }) =>
            toggleCategoryActive(id, flag),
        onSuccess: () => { invalidate(); success('Actualizada', 'Estado actualizado'); },
        onError: () => notifyError('Error', 'No se pudo cambiar el estado'),
    });

    // ── Handlers ──
    const closePanel = () => { setPanelMode('closed'); setEditingCat(null); setParentCat(null); };

    const handleNew = () => { setEditingCat(null); setParentCat(null); setPanelMode('create-root'); };

    const handleAddChild = (parent: Category) => {
        setEditingCat(null);
        setParentCat(parent);
        setPanelMode('create-child');
    };

    const handleEdit = (cat: Category) => {
        setEditingCat(cat);
        setParentCat(null);
        setPanelMode('edit');
    };

    const handleDelete = (cat: Category) => {
        // Proteger categorías de respaldo del sistema
        if (cat.slug === 'sin-categoria') {
            notifyError('Protegida', '"Sin Categoría" es una categoría del sistema y no se puede eliminar.');
            return;
        }

        const hasChildren = categories.some(c => c.parent_id === cat.id);
        const childMsg = hasChildren ? '\n• Sus subcategorías subirán un nivel' : '';
        const prodMsg = '\n• Sus productos se moverán a "Sin Categoría"';

        if (!confirm(`¿Eliminar "${cat.name}"?${prodMsg}${childMsg}`)) return;
        deleteMut.mutate(cat.id);
    };

    const handleToggleActive = (cat: Category) => {
        toggleMut.mutate({ id: cat.id, flag: !cat.is_active });
    };

    const handleSave = (data: CategoryFormData) => {
        if (panelMode === 'edit' && editingCat) {
            updateMut.mutate({ id: editingCat.id, data });
        } else {
            createMut.mutate(data);
        }
    };

    // ── Derived data ──
    const visibleRoots = categories.filter(
        c => !c.parent_id && (sectionFilter === 'all' || c.section === sectionFilter),
    );

    // ── Render ──
    return (
        <div className="space-y-6">
            <CategoriesHeader
                categories={categories}
                sectionFilter={sectionFilter}
                onSectionChange={setSectionFilter}
                onNew={handleNew}
            />

            <CategoryTreeContainer
                roots={visibleRoots}
                allCategories={categories}
                sectionFilter={sectionFilter}
                isLoading={isLoading}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                isToggling={toggleMut.isPending}
            />

            <CategoryForm
                open={panelMode !== 'closed'}
                editing={editingCat}
                parentCategory={parentCat}
                allCategories={categories}
                isSaving={createMut.isPending || updateMut.isPending}
                onSave={handleSave}
                onClose={closePanel}
            />
        </div>
    );
}
