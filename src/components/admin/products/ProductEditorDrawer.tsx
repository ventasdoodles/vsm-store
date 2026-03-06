/**
 * // ─── COMPONENTE: ProductEditorDrawer ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Panel lateral glassmorphism para crear/editar productos.
 *    Secciones: Imagenes, Info Basica, Catalogo (seccion + categoria + tags),
 *    Precio, Inventario. Inputs glassmorphism border-white/10 bg-white/5.
 *    Footer pegajoso con boton glow violeta.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin cadenas magicas.
 */
import { useState, useEffect, useMemo } from 'react';
import { Camera, Save, DollarSign, Tag, Package2, Loader2, FolderTree, Tags, X, Plus, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { useNotification } from '@/hooks/useNotification';
import { type Product } from '@/types/product';
import { type ProductFormData, uploadProductImage } from '@/services/admin';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';
import { ImageUploader } from './ImageUploader';
import { CategoryCascader } from './CategoryCascader';
import { ProductVariantsEditor } from './ProductVariantsEditor';

interface ProductEditorDrawerProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ProductFormData>) => void;
    isSaving: boolean;
    /** All categories from admin query */
    categories: Category[];
    /** All tag names for autocomplete */
    tagNames: string[];
}

const DEFAULT_FORM: Partial<ProductFormData> = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_at_price: null,
    stock: 0,
    sku: '',
    section: 'vape',
    category_id: '',
    tags: [],
    status: 'draft',
    images: [],
    cover_image: null,
    is_active: true,
};

/** Glassmorphism input style constant */
const INPUT_CLS = 'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20';

export function ProductEditorDrawer({
    product,
    isOpen,
    onClose,
    onSave,
    isSaving,
    categories,
    tagNames,
}: ProductEditorDrawerProps) {
    const [formData, setFormData] = useState<Partial<ProductFormData>>(DEFAULT_FORM);
    const [tagInput, setTagInput] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const notify = useNotification();

    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                ...product,
                images: product.images || [],
                tags: product.tags || [],
                description: product.description || '',
                short_description: product.short_description || '',
                sku: product.sku || '',
            });
        } else if (!product && isOpen) {
            setFormData(DEFAULT_FORM);
        }
        setTagInput('');
    }, [product, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'number' ? Number(value) : value };
            // Reset category when section changes
            if (name === 'section') updated.category_id = '';
            return updated;
        });
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: newImages,
            cover_image: newImages.length > 0 ? newImages[0] : null
        }));
    };

    /** Tag suggestions matching input */
    const tagSuggestions = useMemo(() => {
        const currentTags = formData.tags ?? [];
        if (tagInput.length > 0) {
            return tagNames.filter(t => t.includes(tagInput.toLowerCase()) && !currentTags.includes(t));
        }
        return tagNames.filter(t => !currentTags.includes(t)).slice(0, 8);
    }, [tagNames, tagInput, formData.tags]);

    const addTag = (tag?: string) => {
        const t = (tag ?? tagInput).trim().toLowerCase();
        if (t && !(formData.tags ?? []).includes(t)) {
            setFormData(prev => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
        }
        setTagInput('');
        setShowTagDropdown(false);
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: (prev.tags ?? []).filter(t => t !== tag) }));
    };

    const handleSave = () => {
        if (!formData.name?.trim()) {
            notify.warning('Campo requerido', 'El nombre es obligatorio');
            return;
        }
        if (!formData.price || formData.price <= 0) {
            notify.warning('Campo requerido', 'El precio debe ser mayor a 0');
            return;
        }
        if (!formData.category_id) {
            notify.warning('Campo requerido', 'Selecciona una categoría');
            return;
        }
        if (!formData.section) {
            notify.warning('Campo requerido', 'Selecciona una sección (Vape o 420)');
            return;
        }

        const finalData = { ...formData };
        if (!finalData.slug && finalData.name) {
            finalData.slug = finalData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        onSave(finalData);
    };

    const isEditMode = !!product && !!product.id;
    const isDuplicate = !!product && !product.id;

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={isDuplicate ? 'Duplicar Producto' : isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
            width="max-w-2xl w-full"
        >
            <div className="space-y-8 pb-24">

                {/* 1. Imagenes */}
                <section className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <div className="rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 p-1.5 border border-violet-500/20">
                            <Camera className="h-4 w-4 text-violet-400" />
                        </div>
                        Fotografias
                    </h3>
                    <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                        <ImageUploader
                            images={formData.images || []}
                            onChange={handleImagesChange}
                            onUpload={uploadProductImage}
                            maxImages={4}
                        />
                    </div>
                </section>

                {/* 2. Info Basica */}
                <section className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-1.5 border border-blue-500/20">
                            <Package2 className="h-4 w-4 text-blue-400" />
                        </div>
                        Info Basica
                    </h3>
                    <div className="grid grid-cols-1 gap-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Ej: Vaporesso XROS 3"
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                SKU (Interno)
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku || ''}
                                onChange={handleChange}
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                Descripcion Corta
                            </label>
                            <textarea
                                name="short_description"
                                value={formData.short_description || ''}
                                onChange={handleChange}
                                rows={2}
                                className={INPUT_CLS}
                                placeholder="Resumen breve visible en tarjetas..."
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                Descripcion Completa
                            </label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows={5}
                                className={INPUT_CLS}
                                placeholder="Descripcion detallada del producto..."
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Catalogo: Seccion + Categoria + Tags */}
                <section className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/10 p-1.5 border border-cyan-500/20">
                            <FolderTree className="h-4 w-4 text-cyan-400" />
                        </div>
                        Catalogo
                    </h3>
                    <div className="space-y-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                        {/* Seccion */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                Seccion
                            </label>
                            <select
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                className={INPUT_CLS}
                            >
                                <option value="vape">Vape</option>
                                <option value="420">420</option>
                            </select>
                        </div>

                        {/* Categoria cascading (profundidad ilimitada) */}
                        <CategoryCascader
                            categories={categories}
                            section={(formData.section ?? 'vape') as Section}
                            value={formData.category_id || ''}
                            onChange={(id) => setFormData(prev => ({ ...prev, category_id: id }))}
                        />

                        {/* Tags */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                                <Tags className="h-3 w-3" />
                                Etiquetas
                            </label>
                            <div className="relative flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => { setTagInput(e.target.value); setShowTagDropdown(true); }}
                                    onFocus={() => setShowTagDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    className={cn(INPUT_CLS, 'flex-1')}
                                    placeholder="Escribe o elige un tag..."
                                />
                                <button
                                    type="button"
                                    onClick={() => addTag()}
                                    className="rounded-[0.75rem] border border-white/10 bg-white/5 px-3 text-white/30 transition-all hover:bg-white/10 hover:text-white/60"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>

                                {/* Autocomplete dropdown */}
                                {showTagDropdown && tagSuggestions.length > 0 && (
                                    <div className="absolute left-0 top-full z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-[0.75rem] border border-white/10 bg-theme-primary/95 shadow-xl backdrop-blur-xl">
                                        {tagSuggestions.map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onMouseDown={() => addTag(t)}
                                                className="flex w-full items-center px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white first:rounded-t-[0.75rem] last:rounded-b-[0.75rem]"
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tag pills */}
                            {(formData.tags ?? []).length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(formData.tags ?? []).map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-400 ring-1 ring-inset ring-violet-500/20"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. Precio e Inventario */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                            <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-1.5 border border-emerald-500/20">
                                <DollarSign className="h-4 w-4 text-emerald-400" />
                            </div>
                            Precio
                        </h3>
                        <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 space-y-4 backdrop-blur-sm">
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                    Precio de Venta ($) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || 0}
                                    onChange={handleChange}
                                    className={`${INPUT_CLS} text-xl font-black`}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                    Precio Comparacion (Tachado)
                                </label>
                                <input
                                    type="number"
                                    name="compare_at_price"
                                    value={formData.compare_at_price || ''}
                                    onChange={handleChange}
                                    className={INPUT_CLS}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                            <div className="rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-1.5 border border-amber-500/20">
                                <Tag className="h-4 w-4 text-amber-400" />
                            </div>
                            Inventario
                        </h3>
                        <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 space-y-4 backdrop-blur-sm">
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                    Stock Disponible *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock || 0}
                                    onChange={handleChange}
                                    className={INPUT_CLS}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                    Estado Publico
                                </label>
                                <label className="mt-3 flex cursor-pointer items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                                        />
                                        <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-emerald-500/50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white/70 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:bg-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white/70">
                                        {formData.is_active ? 'Activo (Visible)' : 'Oculto / Borrador'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 5. Variantes y Atributos */}
                <section className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <div className="rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/10 p-1.5 border border-violet-500/20">
                            <Layers className="h-4 w-4 text-violet-400" />
                        </div>
                        Variantes y Atributos
                    </h3>
                    <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.01] p-1 backdrop-blur-sm">
                        <ProductVariantsEditor
                            existingVariants={product?.variants || []}
                            basePrice={formData.price || 0}
                            baseSku={formData.sku || null}
                            onChange={(variants) => setFormData(p => ({ ...p, variants }))}
                        />
                    </div>
                </section>
            </div>

            {/* Sticky Footer */}
            <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-theme-primary/95 px-6 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="rounded-[0.75rem] px-4 py-2 text-sm font-bold text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="
                            group relative inline-flex items-center gap-2 rounded-[1rem] px-6 py-2.5
                            font-bold text-white text-sm
                            bg-gradient-to-r from-violet-600 to-indigo-600
                            shadow-lg shadow-violet-500/20
                            transition-all duration-300
                            hover:shadow-violet-500/30 hover:-translate-y-0.5
                            disabled:opacity-50 disabled:hover:translate-y-0
                            active:scale-[0.98]
                        "
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-[1rem] bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                        {isSaving ? (
                            <>
                                <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
                                <span className="relative z-10">Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="relative z-10 h-4 w-4" />
                                <span className="relative z-10">{isEditMode ? 'Guardar Cambios' : isDuplicate ? 'Crear Copia' : 'Crear Producto'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </SideDrawer>
    );
}