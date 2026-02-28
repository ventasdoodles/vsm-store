// Gesti�n de Productos (Admin) - VSM Store
// Orquestador: conecta datos y l�gica con los componentes Lego
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllProducts,
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

const PAGE_SIZE = 15;

export function AdminProducts() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const [search, setSearch] = useState('');
    const [sectionFilter, setSectionFilter] = useState<Section | ''>('');
    const [showInactive, setShowInactive] = useState(false);
    const [page, setPage] = useState(1);

    // Modal state
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    //  Queries 
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['admin', 'products'],
        queryFn: getAllProducts,
    });

    //  Mutations 
    const toggleMutation = useMutation({
        mutationFn: ({ id, flag, value }: { id: string; flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active'; value: boolean }) =>
            toggleProductFlag(id, flag, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
            success('Actualizado', 'Estado del producto actualizado');
        },
        onError: () => notifyError('Error', 'No se pudo actualizar el estado del producto'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
            success('Desactivado', 'El producto ha sido desactivado');
        },
        onError: () => notifyError('Error', 'No se pudo desactivar el producto'),
    });

    const quickEditMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { price: number; stock: number } }) =>
            updateProduct(id, data as Partial<ProductFormData>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            success('Guardado', 'Cambios r�pidos aplicados');
        },
        onError: () => notifyError('Error', 'No se pudo aplicar la edici�n r�pida'),
    });
    const saveProductMutation = useMutation({
        mutationFn: async (data: Partial<ProductFormData>) => {
            if (editingProduct) {
                return updateProduct(editingProduct.id, data);
            }
            return createProduct(data as ProductFormData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            success(editingProduct ? 'Actualizado' : 'Creado', `Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`);
            setIsEditorOpen(false);
            setEditingProduct(null);
        },
        onError: (err: any) => {
            console.error(err);
            notifyError('Error', 'No se pudo guardar el producto');
        },
    });
    //  Handlers 
    const handleToggle = (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => {
        toggleMutation.mutate({ id, flag, value: !current });
    };

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`�Desactivar "${name}"? No se eliminar�, solo se ocultar� de la tienda.`)) return;
        deleteMutation.mutate(id);
    };

    const handleQuickSave = (id: string, data: { price: number; stock: number }) => {
        quickEditMutation.mutate({ id, data });
    };

    //  Superpoder: Exportar CSV 
    const handleExportCSV = () => {
        const headers = ['Nombre', 'SKU', 'Secci�n', 'Precio', 'Precio Comparaci�n', 'Stock', 'Destacado', 'Nuevo', 'Bestseller', 'Activo'];
        const rows = filtered.map(p => [
            p.name,
            p.sku ?? '',
            p.section,
            p.price,
            p.compare_at_price ?? '',
            p.stock,
            p.is_featured ? 'S�' : 'No',
            p.is_new ? 'S�' : 'No',
            p.is_bestseller ? 'S�' : 'No',
            p.is_active ? 'S�' : 'No',
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

    //  Filtro 
    const filtered = useMemo(() => {
        return products.filter((p) => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku?.toLowerCase().includes(search.toLowerCase())) return false;
            if (sectionFilter && p.section !== sectionFilter) return false;
            if (!showInactive && !p.is_active) return false;
            return true;
        });
    }, [products, search, sectionFilter, showInactive]);

    return (
        <div className="space-y-5">
            <ProductsHeader
                count={filtered.length}
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
                togglingId={toggleMutation.isPending ? (toggleMutation.variables as any)?.id : undefined}
                deletingId={deleteMutation.isPending ? (deleteMutation.variables as string) : undefined}
                savingId={quickEditMutation.isPending ? (quickEditMutation.variables as any)?.id : undefined}
            />

            <ProductEditorDrawer
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSave={(data) => saveProductMutation.mutate(data)}
                isSaving={saveProductMutation.isPending}
            />
        </div>
    );
}
