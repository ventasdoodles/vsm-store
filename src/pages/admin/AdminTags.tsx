// Gestión de Tags (Admin) — VSM Store
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Pencil, Trash2, Save, X, Search, Hash, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotification } from '@/hooks/useNotification';
import {
    getAllTags,
    createTag,
    renameTag,
    deleteTag,
    type ProductTag,
} from '@/services/admin';

export function AdminTags() {
    const qc = useQueryClient();
    const { success, error: notifyError } = useNotification();

    const [search, setSearch]           = useState('');
    const [editingTag, setEditingTag]   = useState<ProductTag | null>(null);
    const [editLabel, setEditLabel]     = useState('');
    const [editName, setEditName]       = useState('');
    const [newLabel, setNewLabel]       = useState('');
    const [newName, setNewName]         = useState('');
    const newInputRef = useRef<HTMLInputElement>(null);

    // Data
    const { data: tags = [], isLoading } = useQuery({
        queryKey: ['admin', 'tags'],
        queryFn: getAllTags,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'tags'] });

    // Mutations
    const createMut = useMutation({
        mutationFn: () => createTag(newName, newLabel || newName),
        onSuccess: () => {
            invalidate();
            setNewName(''); setNewLabel('');
            success('Creado', `Tag "${newLabel || newName}" creado`);
        },
        onError: (e: Error) => notifyError('Error', e.message.includes('duplicate') ? 'Ese tag ya existe' : 'No se pudo crear el tag'),
    });

    const renameMut = useMutation({
        mutationFn: () => renameTag(editingTag!.name, editName, editLabel),
        onSuccess: () => {
            invalidate();
            setEditingTag(null);
            success('Renombrado', 'Tag actualizado en todos los productos');
        },
        onError: () => notifyError('Error', 'No se pudo renombrar el tag'),
    });

    const deleteMut = useMutation({
        mutationFn: (name: string) => deleteTag(name),
        onSuccess: () => { invalidate(); success('Eliminado', 'Tag eliminado del catálogo'); },
        onError: () => notifyError('Error', 'No se pudo eliminar el tag'),
    });

    // Handlers
    const handleCreate = () => {
        if (!newName.trim()) return;
        createMut.mutate();
    };

    const handleStartEdit = (tag: ProductTag) => {
        setEditingTag(tag);
        setEditName(tag.name);
        setEditLabel(tag.label);
    };

    const handleSaveEdit = () => {
        if (!editName.trim() || !editLabel.trim()) return;
        renameMut.mutate();
    };

    const handleDelete = (tag: ProductTag) => {
        if (!confirm(`¿Eliminar el tag "${tag.label}"? Se eliminará del catálogo, pero los productos que ya lo tienen lo conservarán hasta que lo edites manualmente.`)) return;
        deleteMut.mutate(tag.name);
    };

    // Auto-slug mientras escribe
    const handleNewLabelChange = (val: string) => {
        setNewLabel(val);
        setNewName(val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    };

    // Filtered
    const filtered = tags.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalProducts = tags.reduce((sum, t) => sum + (t.product_count ?? 0), 0);

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vape-500/10">
                        <Tag className="h-5 w-5 text-vape-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-theme-primary">Etiquetas</h1>
                        <p className="text-xs text-theme-primary0">
                            {tags.length} tags · {totalProducts} usos en catálogo
                        </p>
                    </div>
                </div>
            </div>

            {/* Create new */}
            <div className="rounded-2xl border border-vape-500/20 bg-vape-500/5 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-vape-400">
                    <Plus className="h-4 w-4" /> Nuevo Tag
                </h2>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-40 space-y-1">
                        <label className="text-xs text-theme-primary0">Nombre de display</label>
                        <input
                            ref={newInputRef}
                            type="text"
                            value={newLabel}
                            onChange={e => handleNewLabelChange(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            placeholder="Ej. Sales de Nicotina"
                            className="w-full rounded-xl border border-theme bg-theme-primary/60 px-3 py-2 text-sm text-theme-primary placeholder-theme-primary0/50 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-32 space-y-1">
                        <label className="flex items-center gap-1 text-xs text-theme-primary0">
                            <Hash className="h-3 w-3" /> Clave (slug)
                        </label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="sales-de-nicotina"
                            className="w-full rounded-xl border border-theme bg-theme-primary/60 px-3 py-2 font-mono text-xs text-theme-secondary placeholder-theme-primary0/50 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!newName.trim() || createMut.isPending}
                        className="inline-flex items-center gap-2 rounded-xl bg-vape-600 px-4 py-2 text-sm font-medium text-white hover:bg-vape-500 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Crear
                    </button>
                </div>
            </div>

            {/* Search + list */}
            <div className="rounded-2xl border border-theme/40 bg-theme-primary/60">
                {/* Search bar */}
                <div className="border-b border-theme/20 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-primary0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar tags…"
                            className="w-full rounded-xl border border-theme bg-theme-secondary/20 py-2 pl-9 pr-4 text-sm text-theme-primary placeholder-theme-primary0/50 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="p-4">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="h-12 animate-pulse rounded-xl bg-theme-secondary/20" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-theme-primary0">
                            <Tag className="mb-2 h-10 w-10 opacity-20" />
                            <p className="text-sm">{search ? 'Sin resultados' : 'No hay tags aún'}</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {filtered.map(tag => (
                                <div
                                    key={tag.name}
                                    className={cn(
                                        'group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all',
                                        editingTag?.name === tag.name
                                            ? 'border-vape-500/40 bg-vape-500/10'
                                            : 'border-theme/20 hover:border-theme/40 hover:bg-theme-secondary/20'
                                    )}
                                >
                                    {editingTag?.name === tag.name ? (
                                        /* Edit mode */
                                        <>
                                            <div className="flex flex-1 flex-wrap items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editLabel}
                                                    onChange={e => setEditLabel(e.target.value)}
                                                    placeholder="Nombre de display"
                                                    className="min-w-32 flex-1 rounded-lg border border-theme bg-theme-primary px-2 py-1 text-sm text-theme-primary focus:border-vape-500 focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                    placeholder="slug"
                                                    className="min-w-24 w-40 rounded-lg border border-theme bg-theme-primary px-2 py-1 font-mono text-xs text-theme-secondary focus:border-vape-500 focus:outline-none"
                                                />
                                            </div>
                                            <button onClick={handleSaveEdit} disabled={renameMut.isPending}
                                                className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-500/20">
                                                <Save className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setEditingTag(null)}
                                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/20">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        /* Display mode */
                                        <>
                                            <div className="flex flex-1 flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium text-theme-primary">{tag.label}</span>
                                                <code className="rounded bg-theme-secondary/40 px-1.5 py-0.5 text-[10px] text-theme-secondary">
                                                    {tag.name}
                                                </code>
                                            </div>
                                            {/* Product count badge */}
                                            <div className="flex items-center gap-1 text-xs text-theme-primary0">
                                                <Package className="h-3 w-3" />
                                                <span>{tag.product_count ?? 0}</span>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button onClick={() => handleStartEdit(tag)}
                                                    className="rounded-lg p-2 text-theme-primary0 hover:bg-theme-secondary/50 hover:text-blue-400" title="Renombrar">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(tag)} disabled={deleteMut.isPending}
                                                    className="rounded-lg p-2 text-theme-primary0 hover:bg-red-500/20 hover:text-red-400" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
