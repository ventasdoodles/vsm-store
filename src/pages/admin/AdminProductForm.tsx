// Formulario de Producto (Admin) - VSM Store
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, X, Plus, Package, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createProduct, updateProduct, getAllCategories, type ProductFormData } from '@/services/admin.service';
import type { Category } from '@/types/category';
import type { Product, Section } from '@/types/product';
import { supabase } from '@/lib/supabase';

function slugify(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const INITIAL: ProductFormData = {
    name: '', slug: '', description: '', short_description: '', price: 0,
    compare_at_price: null, stock: 0, sku: '', section: 'vape', category_id: '',
    tags: [], status: 'active', images: [], is_featured: false, is_new: false,
    is_bestseller: false, is_active: true,
};

const inputCls = 'w-full rounded-xl border border-primary-800/50 bg-primary-950/60 px-4 py-2.5 text-sm text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none';

export function AdminProductForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';
    const [form, setForm] = useState<ProductFormData>(INITIAL);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(!!isEditing);
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [imageInput, setImageInput] = useState('');

    useEffect(() => { getAllCategories().then(setCategories); }, []);

    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                const { data } = await supabase.from('products').select('*').eq('id', id!).single();
                if (data) {
                    const p = data as Product;
                    setForm({
                        name: p.name, slug: p.slug, description: p.description ?? '',
                        short_description: p.short_description ?? '', price: p.price,
                        compare_at_price: p.compare_at_price, stock: p.stock, sku: p.sku ?? '',
                        section: p.section, category_id: p.category_id, tags: p.tags ?? [],
                        status: p.status, images: p.images ?? [], is_featured: p.is_featured,
                        is_new: p.is_new, is_bestseller: p.is_bestseller, is_active: p.is_active,
                    });
                }
            } finally { setLoading(false); }
        })();
    }, [isEditing, id]);

    const filteredCats = categories.filter((c) => c.section === form.section);

    const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
        setForm((prev) => {
            const u = { ...prev, [key]: value };
            if (key === 'name' && !isEditing) u.slug = slugify(value as string);
            if (key === 'section') u.category_id = '';
            return u;
        });
    };

    const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]); setTagInput(''); };
    const addImage = () => { const u = imageInput.trim(); if (u) set('images', [...form.images, u]); setImageInput(''); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.category_id || form.price <= 0) return;
        setSaving(true);
        try {
            if (isEditing) await updateProduct(id!, form); else await createProduct(form);
            navigate('/admin/products');
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Error al guardar. Revisa los datos e inténtalo de nuevo.');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-vape-400" /></div>;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/products')} className="rounded-xl border border-primary-800/50 p-2 text-primary-400 hover:bg-primary-800/50 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-primary-100">{isEditing ? 'Editar producto' : 'Nuevo producto'}</h1>
                    <p className="text-sm text-primary-500">{isEditing ? 'Modifica los datos' : 'Completa los datos'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <section className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 space-y-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-300"><Package className="h-4 w-4 text-vape-400" />Información básica</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-primary-400">Nombre *</label><input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Nombre del producto" /></div>
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Slug</label><input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} className={cn(inputCls, 'font-mono')} placeholder="auto-generado" /></div>
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">SKU</label><input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)} className={cn(inputCls, 'font-mono')} placeholder="VSM-XXX-001" /></div>
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-primary-400">Descripción corta</label><input type="text" value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className={inputCls} placeholder="Resumen breve" /></div>
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-primary-400">Descripción completa</label><textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Descripción detallada..." /></div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-primary-300">💰 Precio e Inventario</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Precio *</label><input type="number" required min={0} step={0.01} value={form.price || ''} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Precio anterior</label><input type="number" min={0} step={0.01} value={form.compare_at_price ?? ''} onChange={(e) => set('compare_at_price', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} /></div>
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Stock *</label><input type="number" required min={0} value={form.stock || ''} onChange={(e) => set('stock', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Status</label><select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}><option value="active">Activo</option><option value="legacy">Legacy</option><option value="discontinued">Descontinuado</option><option value="coming_soon">Próximamente</option></select></div>
                    </div>
                </section>

                {/* Section & Category */}
                <section className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-primary-300">📂 Sección y Categoría</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Sección *</label>
                            <div className="flex gap-2">
                                {(['vape', '420'] as Section[]).map((s) => (
                                    <button key={s} type="button" onClick={() => set('section', s)} className={cn('flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors', form.section === s ? (s === 'vape' ? 'border-vape-500/50 bg-vape-500/10 text-vape-400' : 'border-herbal-500/50 bg-herbal-500/10 text-herbal-400') : 'border-primary-800/50 bg-primary-950/60 text-primary-500')}>{s === 'vape' ? '💨 Vape' : '🌿 420'}</button>
                                ))}
                            </div>
                        </div>
                        <div><label className="mb-1 block text-xs font-medium text-primary-400">Categoría *</label>
                            <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
                                <option value="">Selecciona categoría</option>
                                {filteredCats.map((c) => (<option key={c.id} value={c.id}>{c.parent_id ? '  └ ' : ''}{c.name}</option>))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Flags */}
                <section className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-primary-300">🏷️ Badges</h2>
                    <div className="flex flex-wrap gap-3">
                        {([
                            { key: 'is_featured' as const, label: '⭐ Destacado', active: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
                            { key: 'is_new' as const, label: '✨ Nuevo', active: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
                            { key: 'is_bestseller' as const, label: '🔥 Bestseller', active: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
                            { key: 'is_active' as const, label: '✅ Activo', active: 'bg-green-500/15 border-green-500/30 text-green-400' },
                        ]).map(({ key, label, active }) => (
                            <button key={key} type="button" onClick={() => set(key, !form[key])} className={cn('rounded-xl border px-4 py-2 text-sm font-medium transition-colors', form[key] ? active : 'border-primary-800/50 bg-primary-950/60 text-primary-500')}>{label}</button>
                        ))}
                    </div>
                </section>

                {/* Tags */}
                <section className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-primary-300">🔖 Tags</h2>
                    <div className="flex gap-2">
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className={cn(inputCls, 'flex-1')} placeholder="Tag + Enter..." />
                        <button type="button" onClick={addTag} className="rounded-xl border border-primary-800/50 bg-primary-950/60 px-3 text-primary-400 hover:bg-primary-800/50"><Plus className="h-4 w-4" /></button>
                    </div>
                    {form.tags.length > 0 && <div className="flex flex-wrap gap-2">{form.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary-800/40 px-2.5 py-1 text-xs text-primary-300">{tag}<button type="button" onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="hover:text-red-400"><X className="h-3 w-3" /></button></span>))}</div>}
                </section>

                {/* Images */}
                <section className="rounded-2xl border border-primary-800/40 bg-primary-900/60 p-5 space-y-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-300"><ImageIcon className="h-4 w-4 text-vape-400" />Imágenes</h2>
                    <div className="flex gap-2">
                        <input type="url" value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())} className={cn(inputCls, 'flex-1')} placeholder="URL de imagen..." />
                        <button type="button" onClick={addImage} className="rounded-xl border border-primary-800/50 bg-primary-950/60 px-3 text-primary-400 hover:bg-primary-800/50"><Plus className="h-4 w-4" /></button>
                    </div>
                    {form.images.length > 0 && <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{form.images.map((url, i) => (<div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-primary-800/40"><img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => set('images', form.images.filter((u) => u !== url))} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>{i === 0 && <span className="absolute bottom-1 left-1 rounded bg-vape-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">Principal</span>}</div>))}</div>}
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/admin/products')} className="rounded-xl border border-primary-800/50 px-5 py-2.5 text-sm font-medium text-primary-400 hover:bg-primary-800/50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 disabled:opacity-50 transition-all">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEditing ? 'Guardar cambios' : 'Crear producto'}
                    </button>
                </div>
            </form>
        </div>
    );
}
