// Formulario de Producto (Admin) - VSM Store
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, X, Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    createProduct,
    updateProduct,
    getAllCategories,
    getProductById,
    getTagNames,
    type ProductFormData
} from '@/services/admin';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';
import { ImageUploader } from '@/components/admin/ImageUploader';


import { useNotification } from '@/hooks/useNotification';
import { slugify } from '@/lib/utils';

const INITIAL: ProductFormData = {
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
    status: 'active',
    images: [],
    cover_image: null,
    is_featured: false,
    is_featured_until: null,
    is_new: false,
    is_new_until: null,
    is_bestseller: false,
    is_bestseller_until: null,
    is_active: true,
};

const inputCls =
    'w-full rounded-xl border border-theme bg-theme-primary/60 px-4 py-2.5 text-sm text-theme-primary placeholder-primary-600 focus:border-vape-500/50 focus:outline-none';

export function AdminProductForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';
    const [form, setForm] = useState<ProductFormData>(INITIAL);
    const [tagInput, setTagInput] = useState('');
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    const { data: allTagNames = [] } = useQuery({
        queryKey: ['admin', 'tag-names'],
        queryFn: getTagNames,
        staleTime: 60_000,
    });

    const tagSuggestions = tagInput.length > 0
        ? allTagNames.filter(t => t.includes(tagInput.toLowerCase()) && !form.tags.includes(t))
        : allTagNames.filter(t => !form.tags.includes(t)).slice(0, 8);

    // Query: Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: getAllCategories,
    });

    // Query: Product Details (if editing)
    const { data: product, isLoading: loadingProduct } = useQuery({
        queryKey: ['admin', 'product', id],
        queryFn: () => getProductById(id!),
        enabled: !!isEditing,
    });

    // Sync form with product data when loaded
    useEffect(() => {
        if (product) {
            // eslint-disable-next-line
            setForm({
                name: product.name,
                slug: product.slug,
                description: product.description ?? '',
                short_description: product.short_description ?? '',
                price: product.price,
                compare_at_price: product.compare_at_price,
                stock: product.stock,
                sku: product.sku ?? '',
                section: product.section,
                category_id: product.category_id,
                tags: product.tags ?? [],
                status: product.status,
                images: product.images ?? [],
                cover_image: product.cover_image ?? null,
                is_featured: product.is_featured,
                is_featured_until: product.is_featured_until ?? null,
                is_new: product.is_new,
                is_new_until: product.is_new_until ?? null,
                is_bestseller: product.is_bestseller,
                is_bestseller_until: product.is_bestseller_until ?? null,
                is_active: product.is_active,
            });
        }
    }, [product]);

    // Mutation: Save Product
    const mutation = useMutation({
        mutationFn: (data: ProductFormData) => {
            return isEditing ? updateProduct(id!, data as Partial<ProductFormData>) : createProduct(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            success('Guardado', isEditing ? 'Producto actualizado correctamente' : 'Producto creado con éxito');
            navigate('/admin/products');
        },
        onError: (err: unknown) => {
            console.error('Error saving product:', err);
            notifyError('Error', (err as Error)?.message || 'No se pudo guardar el producto');
        },
    });

    // Ordenar jerárquicamente: padre primero, luego sus hijos inmediatamente después
    const filteredCats = (() => {
        const sectionCats = categories.filter((c: Category) => c.section === form.section);
        const roots = sectionCats.filter((c: Category) => !c.parent_id);
        const children = sectionCats.filter((c: Category) => !!c.parent_id);
        const result: Category[] = [];
        for (const root of roots) {
            result.push(root);
            result.push(...children.filter((c: Category) => c.parent_id === root.id));
        }
        return result;
    })();

    // Sync form with product data when loaded
    // ... (existing useEffect)

    const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
        setForm((prev) => {
            const u = { ...prev, [key]: value };
            if (key === 'name' && !isEditing) u.slug = slugify(value as string);
            if (key === 'section') u.category_id = '';
            return u;
        });
    };

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
        setTagInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.category_id || (form.price === undefined || form.price === null)) {
            notifyError('Campos requeridos', 'Por favor completa el nombre, precio y categoría');
            return;
        }
        mutation.mutate(form);
    };

    if (loadingProduct) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-vape-400" /></div>;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/products')} className="rounded-xl border border-theme p-2 text-theme-secondary hover:bg-theme-secondary/50 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-theme-primary">{isEditing ? 'Editar producto' : 'Nuevo producto'}</h1>
                    <p className="text-sm text-theme-secondary">{isEditing ? 'Modifica los datos' : 'Completa los datos'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <section className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-theme-secondary"><Package className="h-4 w-4 text-vape-400" />Información básica</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-theme-secondary">Nombre *</label><input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Nombre del producto" /></div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-xs font-medium text-theme-secondary">Slug</label>
                            </div>
                            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} className={cn(inputCls, 'font-mono')} placeholder="auto-generado" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-xs font-medium text-theme-secondary">SKU</label>
                            </div>
                            <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)} className={cn(inputCls, 'font-mono')} placeholder="VSM-XXX-001" />
                        </div>
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-theme-secondary">Descripción corta</label><input type="text" value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className={inputCls} placeholder="Resumen breve" /></div>
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-theme-secondary">Descripción completa</label><textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Descripción detallada..." /></div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-theme-secondary">💰 Precio e Inventario</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div><label className="mb-1 block text-xs font-medium text-theme-secondary">Precio *</label><input type="number" required min={0} step={0.01} value={form.price || ''} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                        <div><label className="mb-1 block text-xs font-medium text-theme-secondary">Precio anterior</label><input type="number" min={0} step={0.01} value={form.compare_at_price ?? ''} onChange={(e) => set('compare_at_price', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} /></div>
                        <div><label className="mb-1 block text-xs font-medium text-theme-secondary">Stock *</label><input type="number" required min={0} value={form.stock || ''} onChange={(e) => set('stock', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                        <div><label className="mb-1 block text-xs font-medium text-theme-secondary">Status</label><select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}><option value="active">Activo</option><option value="legacy">Legacy</option><option value="discontinued">Descontinuado</option><option value="coming_soon">Próximamente</option></select></div>
                    </div>
                </section>

                {/* Section & Category */}
                <section className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-theme-secondary">📂 Sección y Categoría</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div><label className="mb-1 block text-xs font-medium text-theme-secondary">Sección *</label>
                            <div className="flex gap-2">
                                {(['vape', '420'] as Section[]).map((s) => (
                                    <button key={s} type="button" onClick={() => set('section', s)} className={cn('flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors', form.section === s ? (s === 'vape' ? 'border-vape-500/50 bg-vape-500/10 text-vape-400' : 'border-herbal-500/50 bg-herbal-500/10 text-herbal-400') : 'border-theme bg-theme-primary/60 text-theme-secondary')}>{s === 'vape' ? '💨 Vape' : '🌿 420'}</button>
                                ))}
                            </div>
                        </div>
                        <div><label className="mb-1 block text-xs font-medium text-theme-secondary">Categoría *</label>
                            <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
                                <option value="">Selecciona categoría</option>
                                {filteredCats.map((c: Category) => (<option key={c.id} value={c.id}>{c.parent_id ? '  └ ' : ''}{c.name}</option>))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Flags */}
                <section className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-theme-secondary">🏷️ Badges</h2>
                    <div className="space-y-6">
                        {([
                            { key: 'is_featured' as const, until: 'is_featured_until' as const, label: '⭐ Destacado', active: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
                            { key: 'is_new' as const, until: 'is_new_until' as const, label: '✨ Nuevo', active: 'border-blue-500/30 text-blue-400 bg-accent-primary/10' },
                            { key: 'is_bestseller' as const, until: 'is_bestseller_until' as const, label: '🔥 Bestseller', active: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
                        ]).map(({ key, until, label, active }) => (
                            <div key={key} className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-theme-subtle pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => set(key, !form[key])}
                                        className={cn(
                                            'rounded-xl border px-4 py-2 text-sm font-medium transition-colors min-w-[140px]',
                                            form[key] ? active : 'border-theme bg-theme-primary/60 text-theme-secondary'
                                        )}
                                    >
                                        {label}
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-theme-secondary font-medium">{label.split(' ')[1]}</span>
                                        <span className="text-xs text-accent-primary italic">
                                            {form[key]
                                                ? (form[until] ? `Expira: ${new Date(form[until]!).toLocaleDateString()}` : 'Sin límite temporal')
                                                : 'Desactivado'}
                                        </span>
                                    </div>
                                </div>

                                {form[key] && (
                                    <div className="flex gap-1 overflow-hidden rounded-lg border border-theme bg-theme-primary/40 p-1">
                                        {[
                                            { l: '∞', v: null },
                                            { l: '1d', v: 1 },
                                            { l: '7d', v: 7 },
                                            { l: '30d', v: 30 }
                                        ].map((d) => {
                                            return (
                                                <button
                                                    key={d.l}
                                                    type="button"
                                                    onClick={() => {
                                                        if (d.v === null) set(until, null);
                                                        else {
                                                            const date = new Date();
                                                            date.setDate(date.getDate() + d.v);
                                                            set(until, date.toISOString());
                                                        }
                                                    }}
                                                    className={cn(
                                                        "px-3 py-1 text-xs font-bold transition-all rounded-md",
                                                        (d.v === null && !form[until]) || (d.v !== null && form[until] && Math.abs(new Date(form[until]!).getTime() - (new Date().getTime() + d.v * 86400000)) < 100000)
                                                            ? "bg-theme-secondary text-white"
                                                            : "text-theme-secondary hover:bg-theme-secondary/40"
                                                    )}
                                                >
                                                    {d.l}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => set('is_active', !form.is_active)}
                                className={cn(
                                    'rounded-xl border px-4 py-2 text-sm font-medium transition-colors w-full sm:w-auto',
                                    form.is_active ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-theme bg-theme-primary/60 text-theme-secondary'
                                )}
                            >
                                {form.is_active ? '✅ Producto Visible' : '❌ Producto Oculto'}
                            </button>
                            <p className="text-xs text-accent-primary">Controla si el producto aparece en la tienda.</p>
                        </div>
                    </div>
                </section>

                {/* Tags */}
                <section className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-theme-secondary">🔖 Tags</h2>
                    </div>
                    <div className="relative flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                            onFocus={() => setShowTagSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className={cn(inputCls, 'flex-1')}
                            placeholder="Escribe o elige un tag..."
                        />
                        <button type="button" onClick={addTag} className="rounded-xl border border-theme bg-theme-primary/60 px-3 text-theme-secondary hover:bg-theme-secondary/50"><Plus className="h-4 w-4" /></button>
                        {/* Autocomplete dropdown */}
                        {showTagSuggestions && tagSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-xl border border-theme bg-theme-primary shadow-lg">
                                {tagSuggestions.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onMouseDown={() => { set('tags', [...form.tags, t]); setTagInput(''); setShowTagSuggestions(false); }}
                                        className="flex w-full items-center px-3 py-2 text-sm text-theme-primary hover:bg-theme-secondary/30 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {form.tags.length > 0 && <div className="flex flex-wrap gap-2">{form.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 rounded-full bg-theme-secondary/40 px-2.5 py-1 text-xs text-theme-secondary">{tag}<button type="button" onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="hover:text-red-400"><X className="h-3 w-3" /></button></span>))}</div>}
                </section>

                {/* Images */}
                <section className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-theme-secondary">📷 Imágenes</h2>
                    <ImageUploader
                        images={form.images}
                        coverImage={form.cover_image}
                        onChange={(urls) => set('images', urls)}
                        onCoverChange={(url) => set('cover_image', url)}
                    />
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/admin/products')} className="rounded-xl border border-theme px-5 py-2.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 disabled:opacity-50 transition-all">
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEditing ? 'Guardar cambios' : 'Crear producto'}
                    </button>
                </div>
            </form>
        </div>
    );
}
