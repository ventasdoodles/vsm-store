/**
 * // ─── HOOK: useAdminProducts ─── [Wave 90 - Admin Refactoring]
 * // Propósito: Centralizar la lógica de negocio de gestión de productos.
 * // Maneja: Fetching, Filtrado, Seleccion, Mutaciones (Batch & Single).
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllProducts, 
    getAllCategories, 
    getTagNames, 
    toggleProductFlag, 
    deleteProduct, 
    updateProduct, 
    createProduct,
    syncProductVariants,
    generateProductCopy,
    uploadProductImage,
    getProductById,
    type ProductFormData,
    type VariantInput
} from '@/services/admin';

export { 
    getAllProducts, 
    getAllCategories, 
    getTagNames, 
    toggleProductFlag, 
    deleteProduct, 
    updateProduct, 
    createProduct,
    syncProductVariants,
    generateProductCopy,
    uploadProductImage,
    getProductById,
}
export type { ProductFormData, VariantInput };
import type { Section } from '@/types/constants';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';

const QUERY_KEY = ['admin', 'products'] as const;

export function useAdminProducts() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const { confirm } = useConfirm();

    // Filters State
    const [search, setSearch] = useState('');
    const [sectionFilter, setSectionFilter] = useState<Section | ''>('');
    const [showInactive, setShowInactive] = useState(false);
    const [quickFilter, setQuickFilter] = useState<'low-stock' | 'no-image' | 'bestsellers' | ''>('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    // Queries
    const { data: products = [], isLoading } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: getAllProducts,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: getAllCategories,
    });

    const { data: tagNames = [] } = useQuery({
        queryKey: ['admin', 'tag-names'],
        queryFn: getTagNames,
        staleTime: 60_000,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    // Derived filtered list
    const filtered = useMemo(() => {
        return products.filter((p) => {
            const q = search.toLowerCase();
            if (q && !p.name.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) return false;
            if (sectionFilter && p.section !== sectionFilter) return false;
            if (!showInactive && !p.is_active) return false;

            if (quickFilter === 'low-stock' && p.stock > 5) return false;
            if (quickFilter === 'no-image' && (p.cover_image || (p.images && p.images.length > 0))) return false;
            if (quickFilter === 'bestsellers' && !p.is_bestseller) return false;

            return true;
        });
    }, [products, search, sectionFilter, showInactive, quickFilter]);

    // Mutations
    const toggleMutation = useMutation({
        mutationFn: ({ id, flag, value }: { id: string; flag: 'is_active' | 'is_featured' | 'is_new' | 'is_bestseller'; value: boolean }) =>
            toggleProductFlag(id, flag, value),
        onSuccess: () => { invalidate(); success('Actualizado', 'Estado actualizado'); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => { invalidate(); success('Desactivado', 'Producto desactivado'); },
    });

    const bulkToggleMutation = useMutation({
        mutationFn: ({ ids, active }: { ids: string[]; active: boolean }) =>
            Promise.all(ids.map(id => toggleProductFlag(id, 'is_active', active))),
        onSuccess: () => {
            invalidate();
            success('Actualizado', `${selectedIds.length} productos actualizados`);
            setSelectedIds([]);
        },
    });

    const bulkAISyncMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            return Promise.all(ids.map(async (id) => {
                const product = products.find(p => p.id === id);
                if (!product) return null;
                const aiResult = await generateProductCopy(product.name, product.description || '');
                return updateProduct(id, {
                    description: product.description || aiResult.description,
                    short_description: product.short_description || aiResult.short_description,
                    tags: Array.from(new Set([...(product.tags || []), ...(aiResult.tags || [])]))
                } as Partial<ProductFormData>);
            }));
        },
        onSuccess: () => {
            invalidate();
            success('Sincronización IA', 'Productos enriquecidos exitosamente');
            setSelectedIds([]);
        },
    });

    /** Whitelist of columns that exist in the `products` table */
    const PRODUCT_COLUMNS = [
        'name', 'slug', 'description', 'short_description', 'price',
        'compare_at_price', 'stock', 'sku', 'section', 'category_id',
        'tags', 'status', 'images', 'cover_image', 'is_featured',
        'is_featured_until', 'is_new', 'is_new_until', 'is_bestseller',
        'is_bestseller_until', 'is_active',
    ] as const;

    const saveProductMutation = useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: Partial<ProductFormData> }) => {
            // Extract variants (handled separately) and whitelist only valid columns
            const { variants } = data;
            const productData: Record<string, unknown> = {};
            for (const key of PRODUCT_COLUMNS) {
                if (key in data) productData[key] = (data as Record<string, unknown>)[key];
            }

            if (id) {
                const res = await updateProduct(id, productData as Partial<ProductFormData>);
                if (variants) await syncProductVariants(id, variants as unknown as VariantInput[]);
                return res;
            }
            const newProduct = await createProduct(productData as unknown as ProductFormData);
            if (variants && newProduct.id) await syncProductVariants(newProduct.id, variants as unknown as VariantInput[]);
            return newProduct;
        },
        onSuccess: () => {
            invalidate();
            success('Guardado', 'Producto guardado exitosamente');
        },
        onError: (err: unknown) => {
            const message = err instanceof Error ? err.message 
                : typeof err === 'object' && err !== null && 'message' in err ? String((err as Record<string, unknown>).message)
                : 'Error desconocido al guardar.';
            notifyError('Error al guardar', message);
        }
    });

    return {
        // State
        products: filtered,
        categories,
        tagNames,
        isLoading,
        search,
        sectionFilter,
        showInactive,
        quickFilter,
        selectedIds,
        page,

        // Actions
        setSearch,
        setSectionFilter,
        setShowInactive,
        setQuickFilter,
        setSelectedIds,
        setPage,
        handleToggle: (id: string, flag: 'is_active' | 'is_featured' | 'is_new' | 'is_bestseller', current: boolean) => 
            toggleMutation.mutate({ id, flag, value: !current }),
        handleDelete: async (id: string, name: string) => {
            const ok = await confirm({ 
                title: `¿Desactivar "${name}"?`, 
                description: 'Esta acción ocultará el producto de la tienda.',
                confirmText: 'Desactivar',
                cancelText: 'Cancelar',
                type: 'warning' 
            });
            if (ok) deleteMutation.mutate(id);
        },
        handleQuickSave: (id: string, data: { price: number; stock: number }) => {
            const safeData = {
                price: Math.max(0.01, data.price),
                stock: Math.max(0, Math.floor(data.stock)),
            };
            saveProductMutation.mutate({ id, data: safeData as Partial<ProductFormData> });
        },
        bulkToggle: (active: boolean) => bulkToggleMutation.mutate({ ids: selectedIds, active }),
        bulkAISync: () => bulkAISyncMutation.mutate(selectedIds),
        saveProduct: (data: Partial<ProductFormData>, id?: string) => saveProductMutation.mutateAsync({ id, data }),

        // Loading states
        isToggling: toggleMutation.isPending,
        togglingId: toggleMutation.variables?.id,
        isDeleting: deleteMutation.isPending,
        deletingId: deleteMutation.variables,
        isBulkToggling: bulkToggleMutation.isPending,
        isBulkAISyncing: bulkAISyncMutation.isPending,
        isSaving: saveProductMutation.isPending
    };
}

/** 
 * [Wave 125] Hook para obtener detalle completo de un producto en el dashboard admin.
 * Centraliza la lógica de precarga de datos para edición de productos y variantes.
 * 
 * @param id ID del producto o null si no hay ninguno seleccionado.
 */
export function useAdminProductDetail(id: string | null) {
    return useQuery({
        queryKey: ['admin', 'product', id],
        queryFn: () => id ? getProductById(id) : null,
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}
