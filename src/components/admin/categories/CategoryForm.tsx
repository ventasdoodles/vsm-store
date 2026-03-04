/**
 * // ─── COMPONENTE: CategoryForm ───
 * // Arquitectura: Dumb Component (Visual + Form State)
 * // Proposito principal: Panel lateral deslizante glassmorphism para crear/editar categorias.
 *    Incluye: nombre, slug auto-gen, seccion, padre, descripcion, imagen preview, toggles
 *    (is_popular, is_active), order_index. Backdrop blur con animacion de entrada.
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism en panel y todos los inputs.
 *    El form state local se sincroniza via useEffect al abrir.
 */
import { useEffect, useState } from 'react';
import { X, Save, Flame, Image, Hash, AlignLeft, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';
import type { CategoryFormData } from '@/services/admin';

interface CategoryFormProps {
    open: boolean;
    editing: Category | null;
    parentCategory: Category | null;
    allCategories: Category[];
    isSaving: boolean;
    onSave: (data: CategoryFormData) => void;
    onClose: () => void;
}

/** Estado inicial vacio del formulario */
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

/** Clase compartida para inputs glassmorphism */
const INPUT_CLASS =
    'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07]';

const SELECT_CLASS =
    'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07] [&>option]:bg-gray-900 [&>option]:text-white';

export function CategoryForm({ open, editing, parentCategory, allCategories, isSaving, onSave, onClose }: CategoryFormProps) {
    const [form, setForm] = useState<CategoryFormData>(EMPTY);

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

    const rootOptions = allCategories.filter(
        c => !c.parent_id && c.id !== editing?.id && c.section === form.section,
    );

    const isChild = !!form.parent_id;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300',
                    open ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col',
                    'border-l border-white/5 bg-gray-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl',
                    'transition-transform duration-300 ease-out',
                    open ? 'translate-x-0' : 'translate-x-full',
                )}
            >
                {/* ── Header ── */}
                <div className="relative overflow-hidden border-b border-white/5 px-6 py-5">
                    {/* Mini orbe */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-[60px]" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/70">
                                    {editing ? 'Editar' : isChild ? 'Nueva Sub' : 'Nueva Categoría'}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-white">
                                {editing ? editing.name : isChild ? 'Subcategoría' : 'Categoría'}
                            </h2>
                            {parentCategory && (
                                <p className="text-xs text-white/40">
                                    Bajo: <span className="text-emerald-400">{parentCategory.name}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-white/30 transition-all hover:bg-white/5 hover:text-white/60"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Nombre + Slug */}
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
                                Nombre *
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={form.name}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="Ej. Líquidos"
                                className={INPUT_CLASS}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
                                <Hash className="h-3 w-3" /> Slug *
                            </label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="liquidos"
                                className={`${INPUT_CLASS} font-mono text-xs`}
                            />
                        </div>
                    </div>

                    {/* Seccion + Padre */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                                Sección
                            </label>
                            <select
                                value={form.section}
                                onChange={e => set('section', e.target.value as Section)}
                                disabled={isChild}
                                className={cn(SELECT_CLASS, isChild && 'cursor-not-allowed opacity-40')}
                            >
                                <option value="vape">Vape</option>
                                <option value="420">420</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                                Categoría padre
                            </label>
                            <select
                                value={form.parent_id ?? ''}
                                onChange={e => set('parent_id', e.target.value || null)}
                                disabled={!!parentCategory}
                                className={cn(SELECT_CLASS, !!parentCategory && 'cursor-not-allowed opacity-40')}
                            >
                                <option value="">— Raíz —</option>
                                {rootOptions.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Descripcion */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
                            <AlignLeft className="h-3 w-3" /> Descripción
                            <span className="normal-case text-emerald-400/50">(opcional — SEO)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.description ?? ''}
                            onChange={e => set('description', e.target.value)}
                            placeholder="E-liquids en diversas concentraciones…"
                            className={`${INPUT_CLASS} resize-none`}
                        />
                    </div>

                    {/* Imagen */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
                            <Image className="h-3 w-3" /> URL de imagen
                            <span className="normal-case text-emerald-400/50">(opcional)</span>
                        </label>
                        <input
                            type="url"
                            value={form.image_url ?? ''}
                            onChange={e => set('image_url', e.target.value || null)}
                            placeholder="https://…"
                            className={INPUT_CLASS}
                        />
                        {form.image_url && (
                            <div className="mt-2.5 overflow-hidden rounded-[1rem] border border-white/10 shadow-lg">
                                <img
                                    src={form.image_url}
                                    alt="preview"
                                    className="h-24 w-full object-cover"
                                    loading="lazy"
                                    onError={e => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>

                    {/* Toggles Card */}
                    <div className="space-y-3 rounded-[1rem] border border-white/5 bg-white/[0.02] p-4">

                        {/* Popular */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                                    <Flame className={cn('h-4 w-4 transition-colors', form.is_popular ? 'text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.4)]' : 'text-white/20')} />
                                    Popular / Trending
                                </p>
                                <p className="text-[11px] text-white/30">Badge de llama en la tienda</p>
                            </div>
                            <ToggleSwitch
                                checked={form.is_popular ?? false}
                                onChange={() => set('is_popular', !form.is_popular)}
                                activeColor="bg-orange-500"
                            />
                        </div>

                        {/* Activa */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">Activa</p>
                                <p className="text-[11px] text-white/30">Visible en la tienda</p>
                            </div>
                            <ToggleSwitch
                                checked={form.is_active}
                                onChange={() => set('is_active', !form.is_active)}
                                activeColor="bg-emerald-500"
                            />
                        </div>

                        {/* Order index */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">Orden</p>
                                <p className="text-[11px] text-white/30">Menor = primero</p>
                            </div>
                            <input
                                type="number"
                                min={0}
                                value={form.order_index ?? 0}
                                onChange={e => set('order_index', Number(e.target.value))}
                                className="w-16 rounded-[0.75rem] border border-white/10 bg-white/5 px-2.5 py-1.5 text-center text-sm text-white outline-none focus:border-emerald-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-[0.75rem] border border-white/10 px-4 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white/70"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !form.name.trim() || !form.slug.trim()}
                        className="
                            group relative inline-flex items-center gap-2 rounded-[0.75rem] px-6 py-2.5
                            text-sm font-bold text-white
                            bg-gradient-to-r from-emerald-600 to-lime-600
                            shadow-lg shadow-emerald-500/20
                            transition-all duration-300
                            hover:shadow-emerald-500/30 hover:-translate-y-0.5
                            disabled:opacity-50 disabled:pointer-events-none
                            active:scale-[0.98]
                        "
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-[0.75rem] bg-gradient-to-r from-emerald-500 to-lime-500 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                        <span className="relative z-10 flex items-center gap-2">
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editing ? 'Guardar cambios' : 'Crear categoría'}
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}

/** Toggle switch reutilizable con color configurable */
function ToggleSwitch({
    checked,
    onChange,
    activeColor,
}: {
    checked: boolean;
    onChange: () => void;
    activeColor: string;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                checked ? activeColor : 'bg-white/10',
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1',
                )}
            />
        </button>
    );
}
