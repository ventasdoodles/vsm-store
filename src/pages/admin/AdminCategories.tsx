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
import { useAdminCategories } from '@/hooks/admin/useAdminCatalog';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';
import { type CategoryFormData } from '@/services/admin';

import { CategoriesHeader, CategoryForm, CategoryTreeContainer } from '@/components/admin/categories';

/** Estados posibles del panel lateral */
type PanelMode = 'closed' | 'create-root' | 'create-child' | 'edit';


export function AdminCategories() {
    const { 
        categories, 
        isLoading, 
        createCategory, 
        updateCategory, 
        deleteCategory, 
        toggleActive,
        isMutating 
    } = useAdminCategories();

    const { error: notifyError } = useNotification();
    const { confirm } = useConfirm();

    // ── UI state ──
    const [panelMode, setPanelMode] = useState<PanelMode>('closed');
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [parentCat, setParentCat] = useState<Category | null>(null);
    const [sectionFilter, setSectionFilter] = useState<Section | 'all'>('all');

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

    const handleDelete = async (cat: Category) => {
        // Proteger categorías de respaldo del sistema
        if (cat.slug === 'sin-categoria') {
            notifyError('Protegida', '"Sin Categoría" es una categoría del sistema y no se puede eliminar.');
            return;
        }

        const hasChildren = categories.some(c => c.parent_id === cat.id);
        const childMsg = hasChildren ? '\n• Sus subcategorías subirán un nivel' : '';
        const prodMsg = '\n• Sus productos se moverán a "Sin Categoría"';

        const isConfirmed = await confirm({
            title: `¿Eliminar "${cat.name}"?`,
            description: `Esta acción no se puede deshacer.${prodMsg}${childMsg}`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!isConfirmed) return;
        deleteCategory(cat.id);
    };

    const handleToggleActive = (cat: Category) => {
        toggleActive(cat.id, !cat.is_active);
    };

    const handleSave = async (data: CategoryFormData) => {
        if (panelMode === 'edit' && editingCat) {
            await updateCategory(editingCat.id, data);
        } else {
            await createCategory(data);
        }
        closePanel();
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
                isToggling={isMutating}
            />

            <CategoryForm
                open={panelMode !== 'closed'}
                editing={editingCat}
                parentCategory={parentCat}
                allCategories={categories}
                isSaving={isMutating}
                onSave={handleSave}
                onClose={closePanel}
            />
        </div>
    );
}
