/**
 * // ─── HOOK: useAdminCatalog ─── [Wave 128 - Hook Unification]
 * // Propósito: Centralizar gestión de Categorías, Marcas y Tags.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    toggleCategoryActive,
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getTagNames
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';

export function useAdminCategories() {
    const queryClient = useQueryClient();
    const { success } = useNotification();

    const query = useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: getAllCategories,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => { invalidate(); success('Creado', 'Categoría creada'); }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateCategory(id, data),
        onSuccess: () => { invalidate(); success('Actualizado', 'Categoría actualizada'); }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => { invalidate(); success('Borrado', 'Categoría eliminada'); }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, flag }: { id: string, flag: boolean }) => toggleCategoryActive(id, flag),
        onSuccess: () => { invalidate(); success('Actualizada', 'Estado actualizado'); }
    });

    return {
        categories: query.data ?? [],
        isLoading: query.isLoading,
        createCategory: (data: any) => createMutation.mutateAsync(data),
        updateCategory: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
        deleteCategory: (id: string) => deleteMutation.mutateAsync(id),
        toggleActive: (id: string, flag: boolean) => toggleMutation.mutateAsync({ id, flag }),
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || toggleMutation.isPending
    };
}

export function useAdminBrands() {
    const queryClient = useQueryClient();
    const { success } = useNotification();

    const query = useQuery({
        queryKey: ['admin', 'brands'],
        queryFn: getBrands,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
        queryClient.invalidateQueries({ queryKey: ['brands'] });
    };

    const createMutation = useMutation({
        mutationFn: createBrand,
        onSuccess: () => { invalidate(); success('Creada', 'Marca creada exitosamente'); }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateBrand(id, data),
        onSuccess: () => { invalidate(); success('Actualizada', 'Marca actualizada'); }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBrand,
        onSuccess: () => { invalidate(); success('Eliminada', 'Marca eliminada'); }
    });

    return {
        brands: query.data ?? [],
        isLoading: query.isLoading,
        createBrand: (data: any) => createMutation.mutateAsync(data),
        updateBrand: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
        deleteBrand: (id: string) => deleteMutation.mutateAsync(id),
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
}

export function useAdminTags() {
    return useQuery({
        queryKey: ['admin', 'tags'],
        queryFn: getTagNames,
    });
}
