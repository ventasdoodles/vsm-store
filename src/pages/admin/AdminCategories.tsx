// Gestión de Categorías (Admin) - VSM Store
// Árbol de categorías, creación y edición
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FolderTree,
    Plus,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronDown,
    Save,
    X,
    ToggleLeft,
    ToggleRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive
} from '@/services/admin.service';
import type { Section } from '@/types/product';
import type { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { SECTIONS } from '@/constants/app';

import { useNotification } from '@/hooks/useNotification';
import { slugify } from '@/lib/utils';

export function AdminCategories() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const [editingNode, setEditingNode] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState<import('@/services/admin.service').CategoryFormData>({
        name: '',
        slug: '',
        section: 'vape',
        parent_id: null,
        is_active: true,
        description: '',
        order_index: 0
    });

    // Query: All Categories
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: getAllCategories,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
            resetForm();
            success('Creada', 'La categoría ha sido creada con éxito');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error', 'No se pudo crear la categoría');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<import('@/services/admin.service').CategoryFormData> }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
            setEditingNode(null);
            resetForm();
            success('Actualizada', 'Categoría actualizada correctamente');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error', 'No se pudo actualizar la categoría');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
            success('Eliminada', 'Categoría eliminada con éxito');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error', 'No se pudo eliminar la categoría');
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCategoryActive(id, !isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
            success('Actualizada', 'Estado de categoría actualizado');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error', 'No se pudo cambiar el estado de la categoría');
        },
    });

    // Helpers
    const resetForm = () => {
        setIsCreating(false);
        setEditingNode(null);
        setFormData({
            name: '',
            slug: '',
            section: 'vape',
            parent_id: null,
            is_active: true,
            description: '',
            order_index: 0
        });
    };

    const handleCreate = (parentId: string | null = null) => {
        let section: Section = 'vape';
        if (parentId) {
            const parent = categories.find(c => c.id === parentId);
            if (parent) section = parent.section;
        }

        setFormData({
            name: '',
            slug: '',
            section,
            parent_id: parentId,
            is_active: true,
            description: '',
            order_index: 0
        });
        setIsCreating(true);
        setEditingNode(null);

        // Auto-expand parent being added to
        if (parentId) {
            setExpanded(prev => ({ ...prev, [parentId]: true }));
        }
    };

    const handleEdit = (category: Category) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            section: category.section,
            parent_id: category.parent_id,
            is_active: category.is_active,
            description: category.description ?? '',
            order_index: category.order_index ?? 0
        });
        setEditingNode(category.id);
        setIsCreating(false);
    };

    const handleSave = () => {
        if (!formData.name || !formData.slug) return alert('Nombre y slug obligatorios');

        if (isCreating) {
            createMutation.mutate(formData);
        } else if (editingNode) {
            updateMutation.mutate({ id: editingNode, data: formData });
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`¿Eliminar categoría "${name}" y sus subcategorías?`)) {
            deleteMutation.mutate(id);
        }
    };

    // Recursive Renderer
    const renderNode = (category: Category, level = 0) => {
        const children = categories.filter((c) => c.parent_id === category.id);
        const hasChildren = children.length > 0;
        const isExpanded = expanded[category.id] ?? true;
        const isBeingEdited = editingNode === category.id;
        const isUpdating = updateMutation.isPending && updateMutation.variables?.id === category.id;

        return (
            <div key={category.id} className="relative">
                {/* Node Row */}
                <div
                    className={cn(
                        'group flex items-center gap-2 rounded-lg border border-transparent p-2 transition-all hover:bg-primary-800/30',
                        isBeingEdited ? 'border-vape-500/50 bg-vape-500/10' : 'border-primary-800/10'
                    )}
                    style={{ marginLeft: `${level * 24}px` }}
                >
                    {/* Expand Toggle */}
                    <button
                        onClick={() => setExpanded((prev) => ({ ...prev, [category.id]: !isExpanded }))}
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded text-primary-500 hover:bg-primary-700/50',
                            !hasChildren && 'invisible'
                        )}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {/* Content / Edit Form */}
                    <div className="flex-1">
                        {isBeingEdited ? (
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
                                    className="h-8 rounded-md border border-primary-700 bg-primary-900 px-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                                    placeholder="Nombre"
                                />
                                <div className="text-xs text-primary-600">/ {formData.slug}</div>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value as Section })}
                                    disabled={!!category.parent_id}
                                    className={cn(
                                        "h-8 rounded-md border border-primary-700 bg-primary-900 px-2 text-xs text-primary-400 focus:border-vape-500 focus:outline-none",
                                        !!category.parent_id && "opacity-50 cursor-not-allowed bg-primary-800"
                                    )}
                                >
                                    <option value="vape">Vape</option>
                                    <option value="420">420</option>
                                </select>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/20"
                                    isLoading={updateMutation.isPending}
                                >
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={resetForm}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-400 hover:bg-red-500/20"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className={cn('text-sm font-medium', !category.is_active && 'text-primary-500 line-through decoration-primary-700')}>
                                    {category.name}
                                </span>
                                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider', category.section === 'vape' ? 'bg-vape-500/10 text-vape-400' : 'bg-herbal-500/10 text-herbal-400')}>
                                    {category.section}
                                </span>
                                {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-primary-500" />}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {!isBeingEdited && (
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {/* Toggle Active */}
                            <Button
                                onClick={() => toggleMutation.mutate({ id: category.id, isActive: category.is_active })}
                                disabled={toggleMutation.isPending}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-600 hover:bg-primary-700/50 hover:text-primary-300"
                                title={category.is_active ? 'Desactivar' : 'Activar'}
                            >
                                {category.is_active ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>

                            {/* Edit */}
                            <Button
                                onClick={() => handleEdit(category)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-600 hover:bg-primary-700/50 hover:text-blue-400"
                                title="Editar"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Add Subcategory */}
                            <Button
                                onClick={() => handleCreate(category.id)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-600 hover:bg-primary-700/50 hover:text-emerald-400"
                                title="Agregar subcategoría"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>

                            {/* Delete */}
                            <Button
                                onClick={() => handleDelete(category.id, category.name)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-600 hover:bg-primary-700/50 hover:text-red-400"
                                title="Eliminar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Subcategories */}
                {(hasChildren || (isCreating && formData.parent_id === category.id)) && isExpanded && (
                    <div className="relative">
                        <div className="absolute left-[calc(24px+11px)] top-0 h-full w-px bg-primary-800/20" style={{ left: `${(level) * 24 + 12}px` }} />
                        {children.map((child) => renderNode(child, level + 1))}

                        {/* Inline Creation Form for Subcategory */}
                        {isCreating && formData.parent_id === category.id && (
                            <div className="relative" style={{ marginLeft: `${(level + 1) * 24}px` }}>
                                <div className="flex items-center gap-2 rounded-lg border border-vape-500/50 bg-vape-500/10 p-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
                                        className="h-8 rounded-md border border-primary-700 bg-primary-900 px-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                                        placeholder="Nombre subcategoría"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave();
                                            if (e.key === 'Escape') resetForm();
                                        }}
                                    />
                                    <div className="text-xs text-primary-600">/ {formData.slug}</div>
                                    <select
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value as Section })}
                                        disabled={true} // Inherit from parent always
                                        className="h-8 rounded-md border border-primary-700 bg-primary-800 px-2 text-xs text-primary-400 opacity-50 cursor-not-allowed focus:outline-none"
                                    >
                                        <option value={SECTIONS.VAPE}>Vape</option>
                                        <option value={SECTIONS.HERBAL}>420</option>
                                    </select>
                                    <Button
                                        onClick={handleSave}
                                        disabled={createMutation.isPending}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/20"
                                        isLoading={createMutation.isPending}
                                    >
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={resetForm}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-400 hover:bg-red-500/20"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // New Category Form (Root)
    const renderNewForm = () => {
        if (!isCreating || formData.parent_id) return null;

        return (
            <div className="mb-4 rounded-xl border border-vape-500/30 bg-vape-500/5 p-4">
                <h3 className="mb-3 text-sm font-medium text-vape-300">Nueva Categoría Principal</h3>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-primary-500">Nombre</label>
                        <input
                            autoFocus
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
                            className="w-full rounded-lg border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                            placeholder="Ej. Líquidos"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-primary-500">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full rounded-lg border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-400 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    <div className="w-32 space-y-1">
                        <label className="text-xs text-primary-500">Sección</label>
                        <select
                            value={formData.section}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value as Section })}
                            disabled={!!formData.parent_id}
                            className={cn(
                                "w-full rounded-lg border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none",
                                !!formData.parent_id && "opacity-50 cursor-not-allowed bg-primary-800"
                            )}
                        >
                            <option value={SECTIONS.VAPE}>Vape</option>
                            <option value={SECTIONS.HERBAL}>420</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pb-0.5">
                        <Button
                            onClick={() => createMutation.mutate(formData)}
                            disabled={createMutation.isPending}
                            isLoading={createMutation.isPending}
                            variant="vape"
                            className="bg-vape-600 hover:bg-vape-500"
                        >
                            Guardar
                        </Button>
                        <Button
                            onClick={resetForm}
                            variant="secondary"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    import { HelpTooltip } from '@/components/ui/HelpTooltip';

    return (
        <div className="space-y-5">
            import {HelpTooltip} from '@/components/ui/HelpTooltip';

            // ... existing code ...

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-100">Categorías</h1>
                        <p className="text-sm text-primary-500">Organiza el catálogo de productos</p>
                    </div>
                    <HelpTooltip
                        title="Categorías Jerárquicas"
                        content={[
                            'Organiza productos en categorías padre e hijas',
                            'Click en "+" junto a categoría para crear subcategoría',
                            'Arrastra para reordenar (próximamente)',
                            'Eliminar categoría requiere que no tenga productos asignados'
                        ]}
                        position="right"
                    />
                </div>
                {!isCreating && (
                    <button
                        onClick={() => handleCreate(null)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-4 py-2 text-sm font-medium text-primary-100 hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Categoría
                    </button>
                )}
            </div>

            <div className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-6">
                {renderNewForm()}

                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 animate-pulse rounded-lg bg-primary-800/30" />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-primary-500">
                        <FolderTree className="mb-3 h-12 w-12 opacity-20" />
                        <p>No hay categorías aún</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {categories
                            .filter((c) => !c.parent_id) // Roots
                            .map((root) => renderNode(root))}
                    </div>
                )}
            </div>
        </div>
    );
}
