// Gestión de Categorías (Admin)  VSM Store
// Orchestrator: estado + mutaciones solamente.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderTree } from 'lucide-react';

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
import type { Section } from '@/types/product';

import { CategoriesHeader, CategoryForm, CategoryTreeNode } from '@/components/admin/categories';

type PanelMode = 'closed' | 'create-root' | 'create-child' | 'edit';

export function AdminCategories() {
    const qc = useQueryClient();
    const { success, error: notifyError } = useNotification();

    // UI state
    const [panelMode, setPanelMode]           = useState<PanelMode>('closed');
    const [editingCat, setEditingCat]         = useState<Category | null>(null);
    const [parentCat, setParentCat]           = useState<Category | null>(null);
    const [sectionFilter, setSectionFilter]   = useState<Section | 'all'>('all');

    //  Data 
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: getAllCategories,
    });

    //  Mutations 
    const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] });

    const createMut = useMutation({
        mutationFn: createCategory,
        onSuccess: () => { invalidate(); closePanel(); success('Creada', 'Categoría creada con éxito'); },
        onError: () => notifyError('Error', 'No se pudo crear la categoría'),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => updateCategory(id, data),
        onSuccess: () => { invalidate(); closePanel(); success('Actualizada', 'Categoría actualizada'); },
        onError: () => notifyError('Error', 'No se pudo actualizar la categoría'),
    });

    const deleteMut = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => { invalidate(); success('Eliminada', 'Categoría eliminada'); },
        onError: () => notifyError('Error', 'No se pudo eliminar la categoría'),
    });

    const toggleMut = useMutation({
        mutationFn: ({ id, flag }: { id: string; flag: boolean }) => toggleCategoryActive(id, flag),
        onSuccess: () => { invalidate(); success('Actualizada', 'Estado actualizado'); },
        onError: () => notifyError('Error', 'No se pudo cambiar el estado'),
    });

    //  Handlers 
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
        if (!confirm(`¿Eliminar "${cat.name}"${categories.some(c => c.parent_id === cat.id) ? ' y sus subcategorías' : ''}?`)) return;
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

    //  Filtered roots 
    const visibleRoots = categories.filter(c =>
        !c.parent_id && (sectionFilter === 'all' || c.section === sectionFilter)
    );

    //  Render 
    return (
        <div className="space-y-5">
            <CategoriesHeader
                categories={categories}
                sectionFilter={sectionFilter}
                onSectionChange={setSectionFilter}
                onNew={handleNew}
            />

            <div className="rounded-2xl border border-theme bg-theme-primary/60 p-4">
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-11 animate-pulse rounded-xl bg-theme-secondary/20" />
                        ))}
                    </div>
                ) : visibleRoots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-theme-primary0">
                        <FolderTree className="mb-3 h-12 w-12 opacity-20" />
                        <p className="text-sm">No hay categorías{sectionFilter !== 'all' ? ` en sección ${sectionFilter}` : ''}</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {visibleRoots.map(root => (
                            <CategoryTreeNode
                                key={root.id}
                                category={root}
                                allCategories={categories}
                                level={0}
                                onEdit={handleEdit}
                                onAddChild={handleAddChild}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                                isToggling={toggleMut.isPending}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Panel lateral */}
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
