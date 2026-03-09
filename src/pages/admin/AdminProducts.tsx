/**
 * // ─── COMPONENTE: AdminProducts ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar la gestion de productos del admin.
 *    State: search, sectionFilter, showInactive, page, isEditorOpen, editingProduct.
 *    Mutations: toggle, delete, quickEdit, saveProduct (create/update).
 *    Delega TODO el renderizado visual a los Legos en components/admin/products/.
 * // Regla / Notas: Cero UI propio excepto layout wrapper. Sin `any`, sin cadenas magicas.
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Sparkles, Loader2 } from 'lucide-react';
import {
    getAllProducts,
    getAllCategories,
    getTagNames,
    createProduct,
    deleteProduct,
    toggleProductFlag,
    updateProduct,
    syncProductVariants,
    generateProductCopy,
    type ProductFormData,
} from '@/services/admin';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';
import { ProductsHeader } from '@/components/admin/products/ProductsHeader';
import { ProductsFilter } from '@/components/admin/products/ProductsFilter';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { ProductEditorDrawer } from '@/components/admin/products/ProductEditorDrawer';

/** Items por pagina */
const PAGE_SIZE = 15;

/** Query keys centralizadas */
const QUERY_KEY = ['admin', 'products'] as const;
const STATS_KEY = ['admin', 'stats'] as const;
const CATEGORIES_KEY = ['admin', 'categories'] as const;
const TAG_NAMES_KEY = ['admin', 'tag-names'] as const;

export function AdminProducts() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const { confirm } = useConfirm();
    const [search, setSearch] = useState('');
    const [sectionFilter, setSectionFilter] = useState<Section | ''>('');
    const [showInactive, setShowInactive] = useState(false);
    const [quickFilter, setQuickFilter] = useState<'low-stock' | 'no-image' | 'bestsellers' | ''>('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    // Editor state
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // ── Data ──
    const { data: products = [], isLoading } = useQuery({
        queryKey: [...QUERY_KEY],
        queryFn: getAllProducts,
    });

    const { data: categories = [] } = useQuery({
        queryKey: [...CATEGORIES_KEY],
        queryFn: getAllCategories,
    });

    const { data: tagNames = [] } = useQuery({
        queryKey: [...TAG_NAMES_KEY],
        queryFn: getTagNames,
        staleTime: 60_000,
    });

    // ── Helper ──
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [...STATS_KEY] });
    };

    // ── Mutations ──
    const toggleMutation = useMutation({
        mutationFn: ({ id, flag, value }: { id: string; flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active'; value: boolean }) =>
            toggleProductFlag(id, flag, value),
        onSuccess: () => { invalidate(); success('Actualizado', 'Estado del producto actualizado'); },
        onError: () => notifyError('Error', 'No se pudo actualizar el estado del producto'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => { invalidate(); success('Desactivado', 'El producto ha sido desactivado'); },
        onError: () => notifyError('Error', 'No se pudo desactivar el producto'),
    });

    const quickEditMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { price: number; stock: number } }) =>
            updateProduct(id, data as Partial<ProductFormData>),
        onSuccess: () => { invalidate(); success('Guardado', 'Cambios rapidos aplicados'); },
        onError: () => notifyError('Error', 'No se pudo aplicar la edicion rapida'),
    });

    const saveProductMutation = useMutation({
        mutationFn: async (data: Partial<ProductFormData>) => {
            if (editingProduct && editingProduct.id !== '') {
                const res = await updateProduct(editingProduct.id, data);
                if (data.variants) {
                    await syncProductVariants(editingProduct.id, data.variants);
                }
                return res;
            }
            const newProduct = await createProduct(data as ProductFormData);
            if (data.variants && newProduct.id) {
                await syncProductVariants(newProduct.id, data.variants);
            }
            return newProduct;
        },
        onSuccess: () => {
            invalidate();
            const isUpdate = editingProduct && editingProduct.id !== '';
            success(isUpdate ? 'Actualizado' : 'Creado', `Producto ${isUpdate ? 'actualizado' : 'creado'} exitosamente`);
            setIsEditorOpen(false);
            setEditingProduct(null);
        },
        onError: (err: Error) => {
            console.error(err);
            notifyError('Error', 'No se pudo guardar el producto');
        },
    });

    // ── Handlers ──
    const handleToggle = (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => {
        toggleMutation.mutate({ id, flag, value: !current });
    };

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: `¿Desactivar "${name}"?`,
            description: 'No se eliminará permanentemente de la base de datos, solo se ocultará de la tienda (estado inactivo).',
            confirmText: 'Sí, desactivar',
            cancelText: 'Cancelar',
            type: 'warning'
        });
        if (!isConfirmed) return;
        deleteMutation.mutate(id);
    };

    const handleQuickSave = (id: string, data: { price: number; stock: number }) => {
        const safeData = {
            price: Math.max(0.01, data.price),
            stock: Math.max(0, Math.floor(data.stock)),
        };
        quickEditMutation.mutate({ id, data: safeData });
    };

    const bulkToggleMutation = useMutation({
        mutationFn: ({ ids, active }: { ids: string[]; active: boolean }) =>
            Promise.all(ids.map(id => toggleProductFlag(id, 'is_active', active))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            success('Actualizado', `${selectedIds.length} productos actualizados`);
            setSelectedIds([]);
        },
        onError: () => notifyError('Error', 'No se pudieron actualizar los productos'),
    });

    const bulkAISyncMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.all(ids.map(async (id) => {
                const product = products.find(p => p.id === id);
                if (!product) return null;
                const aiResult = await generateProductCopy(product.name, product.description || '');
                return updateProduct(id, {
                    description: product.description || aiResult.description,
                    short_description: product.short_description || aiResult.short_description,
                    tags: Array.from(new Set([...(product.tags || []), ...(aiResult.tags || [])]))
                } as Partial<ProductFormData>);
            }));
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            success('Sincronización IA', `${selectedIds.length} productos enriquecidos con IA`);
            setSelectedIds([]);
        },
        onError: () => notifyError('Error', 'La sincronización de IA falló'),
    });

    /** Duplicar: abre el editor con los datos del producto original pero sin id (modo crear) */
    const handleDuplicate = (product: Product) => {
        const clone: Product = {
            ...product,
            id: '',
            name: `${product.name} (Copia)`,
            slug: `${product.slug}-copia`,
            sku: product.sku ? `${product.sku}-COPY` : '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setEditingProduct(clone);
        setIsEditorOpen(true);
    };

    const handleExportCSV = () => {
        const headers = ['Nombre', 'SKU', 'Seccion', 'Precio', 'Precio Comparacion', 'Stock', 'Destacado', 'Nuevo', 'Bestseller', 'Activo'];
        const rows = filtered.map(p => [
            p.name,
            p.sku ?? '',
            p.section,
            p.price,
            p.compare_at_price ?? '',
            p.stock,
            p.is_featured ? 'Si' : 'No',
            p.is_new ? 'Si' : 'No',
            p.is_bestseller ? 'Si' : 'No',
            p.is_active ? 'Si' : 'No',
        ]);
        const csvContent = [headers, ...rows]
            .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_vsm_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Filtro ──
    const filtered = useMemo(() => {
        return products.filter((p) => {
            const q = search.toLowerCase();
            if (q && !p.name.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) return false;
            if (sectionFilter && p.section !== sectionFilter) return false;
            if (!showInactive && !p.is_active) return false;

            // Quick Filters
            if (quickFilter === 'low-stock' && p.stock > 5) return false;
            if (quickFilter === 'no-image' && (p.cover_image || (p.images && p.images.length > 0))) return false;
            if (quickFilter === 'bestsellers' && !p.is_bestseller) return false;

            return true;
        });
    }, [products, search, sectionFilter, showInactive, quickFilter]);

    // ── Derived mutation state (typed, no `as any`) ──
    const togglingId = toggleMutation.isPending ? toggleMutation.variables?.id : undefined;
    const deletingId = deleteMutation.isPending ? deleteMutation.variables : undefined;
    const savingId = quickEditMutation.isPending ? quickEditMutation.variables?.id : undefined;

    // ── Render ──
    return (
        <div className="space-y-5">
            <ProductsHeader
                products={filtered}
                onExportCSV={handleExportCSV}
                onAddProduct={() => {
                    setEditingProduct(null);
                    setIsEditorOpen(true);
                }}
            />

            <ProductsFilter
                search={search}
                sectionFilter={sectionFilter}
                showInactive={showInactive}
                quickFilter={quickFilter}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onSectionChange={(v) => { setSectionFilter(v); setPage(1); }}
                onToggleInactive={() => { setShowInactive(!showInactive); setPage(1); }}
                onQuickFilterChange={(f) => { setQuickFilter(f); setPage(1); }}
            />

            <ProductsTable
                products={filtered}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                currentPage={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onQuickSave={handleQuickSave}
                onEdit={(p) => {
                    setEditingProduct(p);
                    setIsEditorOpen(true);
                }}
                onDuplicate={handleDuplicate}
                togglingId={togglingId}
                deletingId={deletingId}
                savingId={savingId}
            />

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-4 rounded-[2rem] border border-vape-500/30 bg-[#13141f]/90 px-6 py-3 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.15)]">
                        <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vape-500 text-[10px] font-black text-white">
                                {selectedIds.length}
                            </div>
                            <span className="text-xs font-bold text-white/70">Seleccionados</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => bulkToggleMutation.mutate({ ids: selectedIds, active: true })}
                                disabled={bulkToggleMutation.isPending}
                                className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                                Activar
                            </button>
                            <button
                                onClick={() => bulkToggleMutation.mutate({ ids: selectedIds, active: false })}
                                disabled={bulkToggleMutation.isPending}
                                className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 transition-all"
                            >
                                Desactivar
                            </button>
                            <button
                                onClick={() => bulkAISyncMutation.mutate(selectedIds)}
                                disabled={bulkAISyncMutation.isPending}
                                className="flex items-center gap-2 rounded-xl bg-violet-600/20 px-4 py-2 text-xs font-black uppercase tracking-wider text-violet-400 hover:bg-violet-600/30 transition-all border border-violet-500/30"
                            >
                                {bulkAISyncMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                )}
                                Magic Sync (IA)
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="ml-2 text-xs font-bold text-white/30 hover:text-white/60 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ProductEditorDrawer
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSave={(data) => saveProductMutation.mutate(data)}
                categories={categories}
                tagNames={tagNames}
                isSaving={saveProductMutation.isPending}
            />
        </div>
    );
}
