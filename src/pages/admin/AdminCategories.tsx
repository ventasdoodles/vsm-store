// Gestión de Categorías (Admin) - VSM Store
import { useEffect, useState } from 'react';
import { FolderTree, Plus, Pencil, Check, X, Loader2, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllCategories, createCategory, updateCategory, deleteCategory, type CategoryFormData } from '@/services/admin.service';
import type { Category } from '@/types/category';
import type { Section } from '@/types/product';

const emptyCat: CategoryFormData = {
    name: '', slug: '', section: 'vape', parent_id: null,
    description: '', order_index: 0, is_active: true,
};

function slugify(t: string) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [sectionTab, setSectionTab] = useState<Section>('vape');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CategoryFormData>(emptyCat);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => { setLoading(true); getAllCategories().then(setCategories).finally(() => setLoading(false)); };
    useEffect(() => { load(); }, []);

    const filtered = categories.filter((c) => c.section === sectionTab);
    const parents = filtered.filter((c) => !c.parent_id);
    const childrenOf = (pid: string) => filtered.filter((c) => c.parent_id === pid);

    const startEdit = (c: Category) => {
        setEditingId(c.id);
        setForm({ name: c.name, slug: c.slug, section: c.section, parent_id: c.parent_id, description: c.description ?? '', order_index: c.order_index ?? 0, is_active: c.is_active });
        setShowNew(false);
    };

    const startNew = (parentId?: string) => {
        setShowNew(true);
        setEditingId(null);
        setForm({ ...emptyCat, section: sectionTab, parent_id: parentId ?? null, order_index: filtered.length });
    };

    const cancel = () => { setEditingId(null); setShowNew(false); };

    const handleSave = async () => {
        if (!form.name) return;
        const data = { ...form, slug: form.slug || slugify(form.name) };
        setSaving(true);
        try {
            if (editingId) {
                await updateCategory(editingId, data);
            } else {
                await createCategory(data);
            }
            cancel();
            load();
        } catch (err) {
            console.error('Error saving category:', err);
            alert('Error al guardar la categoría');
        } finally { setSaving(false); }
    };

    const handleDeactivate = async (id: string, name: string) => {
        if (!confirm(`¿Desactivar "${name}"?`)) return;
        try { await deleteCategory(id); load(); } catch (err) { console.error(err); }
    };

    const InlineForm = ({ indent = false }: { indent?: boolean }) => (
        <div className={cn('flex items-center gap-2 rounded-xl border border-vape-500/30 bg-vape-500/5 px-3 py-2', indent && 'ml-8')}>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Nombre de categoría" autoFocus className="flex-1 bg-transparent text-sm text-primary-200 placeholder-primary-600 outline-none" />
            <input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} className="w-12 rounded bg-primary-800/40 px-2 py-1 text-center text-xs text-primary-400 outline-none" title="Orden" />
            <button onClick={handleSave} disabled={saving || !form.name} className="rounded-lg bg-vape-500/20 p-1.5 text-vape-400 hover:bg-vape-500/30 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button onClick={cancel} className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-800/40 transition-colors">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Categorías</h1>
                    <p className="text-sm text-primary-500">{filtered.length} categoría{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => startNew()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 transition-all hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" /> Nueva categoría
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-1 rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                {(['vape', '420'] as Section[]).map((s) => (
                    <button key={s} onClick={() => { setSectionTab(s); cancel(); }} className={cn('flex-1 rounded-lg py-2 text-sm font-medium transition-colors', sectionTab === s ? (s === 'vape' ? 'bg-vape-500/15 text-vape-400' : 'bg-herbal-500/15 text-herbal-400') : 'text-primary-500 hover:text-primary-300')}>
                        {s === 'vape' ? '💨 Vape' : '🌿 420'}
                    </button>
                ))}
            </div>

            {/* Tree */}
            {loading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => (<div key={i} className="h-12 animate-pulse rounded-xl bg-primary-800/30" />))}</div>
            ) : parents.length === 0 && !showNew ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/60 py-16">
                    <FolderTree className="h-12 w-12 text-primary-700 mb-3" />
                    <p className="text-sm text-primary-500">No hay categorías en esta sección</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {showNew && !form.parent_id && <InlineForm />}
                    {parents.map((parent) => (
                        <div key={parent.id}>
                            {/* Parent category */}
                            {editingId === parent.id ? (
                                <InlineForm />
                            ) : (
                                <div className="group flex items-center gap-2 rounded-xl border border-primary-800/30 bg-primary-900/60 px-4 py-3 hover:border-primary-700/40 transition-colors">
                                    <GripVertical className="h-3.5 w-3.5 text-primary-700" />
                                    <FolderTree className="h-4 w-4 text-vape-400" />
                                    <span className="flex-1 text-sm font-medium text-primary-200">{parent.name}</span>
                                    <span className="text-xs font-mono text-primary-600 mr-2">#{parent.order_index}</span>
                                    {!parent.is_active && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400 mr-1">Inactiva</span>}
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startNew(parent.id)} className="rounded-md p-1 text-primary-500 hover:bg-primary-800/50 hover:text-primary-300" title="Agregar subcategoría"><Plus className="h-3 w-3" /></button>
                                        <button onClick={() => startEdit(parent)} className="rounded-md p-1 text-primary-500 hover:bg-primary-800/50 hover:text-primary-300" title="Editar"><Pencil className="h-3 w-3" /></button>
                                        <button onClick={() => handleDeactivate(parent.id, parent.name)} className="rounded-md p-1 text-primary-500 hover:bg-red-500/10 hover:text-red-400" title="Desactivar"><X className="h-3 w-3" /></button>
                                    </div>
                                </div>
                            )}

                            {/* Children */}
                            {childrenOf(parent.id).map((child) => (
                                editingId === child.id ? (
                                    <InlineForm key={child.id} indent />
                                ) : (
                                    <div key={child.id} className="group ml-8 flex items-center gap-2 rounded-xl border border-primary-800/20 bg-primary-900/40 px-4 py-2.5 hover:border-primary-700/30 transition-colors mt-1">
                                        <ChevronRight className="h-3 w-3 text-primary-700" />
                                        <span className="flex-1 text-sm text-primary-300">{child.name}</span>
                                        <span className="text-xs font-mono text-primary-600 mr-2">#{child.order_index}</span>
                                        {!child.is_active && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400 mr-1">Inactiva</span>}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(child)} className="rounded-md p-1 text-primary-500 hover:bg-primary-800/50 hover:text-primary-300"><Pencil className="h-3 w-3" /></button>
                                            <button onClick={() => handleDeactivate(child.id, child.name)} className="rounded-md p-1 text-primary-500 hover:bg-red-500/10 hover:text-red-400"><X className="h-3 w-3" /></button>
                                        </div>
                                    </div>
                                )
                            ))}
                            {showNew && form.parent_id === parent.id && <InlineForm indent />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
