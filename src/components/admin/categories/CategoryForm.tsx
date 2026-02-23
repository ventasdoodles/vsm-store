// CategoryForm — Panel lateral deslizante para crear/editar categorías
// Incluye: nombre, slug, sección, padre, descripción, imagen, is_popular, order_index
import { useEffect, useState } from 'react';
import { X, Save, Flame, Image, Hash, AlignLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types/category';
import type { Section } from '@/types/product';
import type { CategoryFormData } from '@/services/admin/admin-categories.service';

interface Props {
    open: boolean;
    editing: Category | null;       // null = crear, Category = editar
    parentCategory: Category | null; // si viene de "agregar hijo"
    allCategories: Category[];
    isSaving: boolean;
    onSave: (data: CategoryFormData) => void;
    onClose: () => void;
}

const EMPTY: CategoryFormData = {
    name: '',
    slug: '',
    section: 'vape',
    parent_id: null,
    is_active: true,
    description: '',
    image_url: null,
    is_popular: false,
    order_index: 0,
};

export function CategoryForm({ open, editing, parentCategory, allCategories, isSaving, onSave, onClose }: Props) {
    const [form, setForm] = useState<CategoryFormData>(EMPTY);

    // Poblar form al abrir
    useEffect(() => {
        if (!open) return;

        if (editing) {
            setForm({
                name:        editing.name,
                slug:        editing.slug,
                section:     editing.section,
                parent_id:   editing.parent_id,
                is_active:   editing.is_active,
                description: editing.description ?? '',
                image_url:   editing.image_url ?? null,
                is_popular:  editing.is_popular ?? false,
                order_index: editing.order_index ?? 0,
            });
        } else if (parentCategory) {
            setForm({ ...EMPTY, section: parentCategory.section, parent_id: parentCategory.id });
        } else {
            setForm(EMPTY);
        }
    }, [open, editing, parentCategory]);

    const set = <K extends keyof CategoryFormData>(k: K, v: CategoryFormData[K]) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const handleNameChange = (name: string) => {
        setForm(prev => ({ ...prev, name, slug: editing ? prev.slug : slugify(name) }));
    };

    const handleSubmit = () => {
        if (!form.name.trim() || !form.slug.trim()) return;
        onSave(form);
    };

    // Categorías raíz disponibles como padres (solo misma sección, no la misma que estamos editando)
    const rootOptions = allCategories.filter(
        c => !c.parent_id && c.id !== editing?.id && c.section === form.section
    );

    const isChild = !!form.parent_id;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-theme/30 bg-theme-primary shadow-2xl transition-transform duration-300',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-theme/20 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-theme-primary">
                            {editing ? 'Editar Categoría' : isChild ? 'Nueva Subcategoría' : 'Nueva Categoría'}
                        </h2>
                        {parentCategory && (
                            <p className="text-xs text-theme-primary0">
                                Bajo: <span className="text-vape-400">{parentCategory.name}</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-theme-primary0 hover:bg-theme-secondary/50 hover:text-theme-primary"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                    {/* Nombre + Slug */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-theme-primary0">Nombre *</label>
                            <input
                                autoFocus
                                type="text"
                                value={form.name}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="Ej. Líquidos"
                                className="w-full rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 text-sm text-theme-primary placeholder-theme-primary0/50 focus:border-vape-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="flex items-center gap-1 text-xs font-medium text-theme-primary0">
                                <Hash className="h-3 w-3" /> Slug *
                            </label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="liquidos"
                                className="w-full rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 font-mono text-xs text-theme-secondary focus:border-vape-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Sección + Padre */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-theme-primary0">Sección</label>
                            <select
                                value={form.section}
                                onChange={e => set('section', e.target.value as Section)}
                                disabled={isChild}
                                className={cn(
                                    'w-full rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 text-sm text-theme-primary focus:border-vape-500 focus:outline-none',
                                    isChild && 'cursor-not-allowed opacity-50'
                                )}
                            >
                                <option value="vape">Vape</option>
                                <option value="420">420</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-theme-primary0">Categoría padre</label>
                            <select
                                value={form.parent_id ?? ''}
                                onChange={e => set('parent_id', e.target.value || null)}
                                disabled={!!parentCategory}
                                className={cn(
                                    'w-full rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 text-sm text-theme-primary focus:border-vape-500 focus:outline-none',
                                    !!parentCategory && 'cursor-not-allowed opacity-50'
                                )}
                            >
                                <option value="">— Raíz —</option>
                                {rootOptions.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs font-medium text-theme-primary0">
                            <AlignLeft className="h-3 w-3" /> Descripción
                            <span className="text-primary-600">(opcional — para menús y SEO)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.description ?? ''}
                            onChange={e => set('description', e.target.value)}
                            placeholder="E-liquids en diversas concentraciones y sabores…"
                            className="w-full resize-none rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 text-sm text-theme-primary placeholder-theme-primary0/50 focus:border-vape-500 focus:outline-none"
                        />
                    </div>

                    {/* Imagen URL */}
                    <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs font-medium text-theme-primary0">
                            <Image className="h-3 w-3" /> URL de imagen
                            <span className="text-primary-600">(opcional — banner o thumbnail)</span>
                        </label>
                        <input
                            type="url"
                            value={form.image_url ?? ''}
                            onChange={e => set('image_url', e.target.value || null)}
                            placeholder="https://…"
                            className="w-full rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 text-sm text-theme-primary placeholder-theme-primary0/50 focus:border-vape-500 focus:outline-none"
                        />
                        {form.image_url && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-theme/30">
                                <img
                                    src={form.image_url}
                                    alt="preview"
                                    className="h-24 w-full object-cover"
                                    onError={e => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>

                    {/* Toggles: Popular + Activa + Order */}
                    <div className="space-y-3 rounded-xl border border-theme/20 bg-theme-secondary/10 p-4">

                        {/* Popular */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="flex items-center gap-1.5 text-sm font-medium text-theme-primary">
                                    <Flame className={cn('h-4 w-4', form.is_popular ? 'text-orange-400' : 'text-theme-primary0')} />
                                    Popular / Trending
                                </p>
                                <p className="text-xs text-theme-primary0">Muestra badge de llama en la tienda</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => set('is_popular', !form.is_popular)}
                                className={cn(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    form.is_popular ? 'bg-orange-500' : 'bg-theme-secondary'
                                )}
                            >
                                <span className={cn(
                                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                                    form.is_popular ? 'translate-x-6' : 'translate-x-1'
                                )} />
                            </button>
                        </div>

                        {/* Activa */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Activa</p>
                                <p className="text-xs text-theme-primary0">Visible en la tienda</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => set('is_active', !form.is_active)}
                                className={cn(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    form.is_active ? 'bg-emerald-500' : 'bg-theme-secondary'
                                )}
                            >
                                <span className={cn(
                                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                                    form.is_active ? 'translate-x-6' : 'translate-x-1'
                                )} />
                            </button>
                        </div>

                        {/* Order index */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Orden</p>
                                <p className="text-xs text-theme-primary0">Posición en el menú (menor = primero)</p>
                            </div>
                            <input
                                type="number"
                                min={0}
                                value={form.order_index ?? 0}
                                onChange={e => set('order_index', Number(e.target.value))}
                                className="w-16 rounded-lg border border-theme bg-theme-secondary/30 px-2 py-1 text-center text-sm text-theme-primary focus:border-vape-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-theme/20 px-5 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-theme/30 px-4 py-2 text-sm text-theme-primary0 hover:bg-theme-secondary/30 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !form.name.trim() || !form.slug.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-vape-600 px-5 py-2 text-sm font-medium text-white hover:bg-vape-500 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editing ? 'Guardar cambios' : 'Crear categoría'}
                    </button>
                </div>
            </div>
        </>
    );
}
