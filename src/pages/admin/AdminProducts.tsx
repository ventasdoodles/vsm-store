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
import {
    getAllProducts,
    getAllCategories,
    getTagNames,
    createProduct,
    deleteProduct,
    toggleProductFlag,
    updateProduct,
    type ProductFormData,
} from '@/services/admin';
import type { Product, Section } from '@/types/product';
import { useNotification } from '@/hooks/useNotification';
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
    const [search, setSearch] = useState('');
    const [sectionFilter, setSectionFilter] = useState<Section | ''>('');
    const [showInactive, setShowInactive] = useState(false);
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
                return updateProduct(editingProduct.id, data);
            }
            return createProduct(data as ProductFormData);
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

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Desactivar "${name}"? No se eliminara, solo se ocultara de la tienda.`)) return;
        deleteMutation.mutate(id);
    };

    const handleQuickSave = (id: string, data: { price: number; stock: number }) => {
        quickEditMutation.mutate({ id, data });
    };

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
            return true;
        });
    }, [products, search, sectionFilter, showInactive]);

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
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onSectionChange={(v) => { setSectionFilter(v); setPage(1); }}
                onToggleInactive={() => { setShowInactive(!showInactive); setPage(1); }}
            />

            <ProductsTable
                products={filtered}
                isLoading={isLoading}
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
