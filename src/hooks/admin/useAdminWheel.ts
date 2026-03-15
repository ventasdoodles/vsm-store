import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllWheelPrizes, 
    createWheelPrize,
    updateWheelPrize, 
    deleteWheelPrize,
    toggleWheelPrize,
    getWheelStats,
    type WheelPrizeFormData
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';

/**
 * useAdminWheel
 * Logic for the Admin Reward Wheel configuration.
 * Manages prizes, statuses, and statistics via TanStack Query.
 * 
 * @architecture Admin Logic (Wave 90) - Thin Component Pattern
 * @safety 100% Type-safe mutation variables (§1.2 Compliance)
 */
export function useAdminWheel() {
    const queryClient = useQueryClient();
    const { success } = useNotification();

    const query = useQuery({
        queryKey: ['admin', 'wheel', 'prizes'],
        queryFn: getAllWheelPrizes,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'wheel'] });
    };

    const saveMutation = useMutation({
        mutationFn: (data: WheelPrizeFormData & { id?: string }) => 
            data.id ? updateWheelPrize(data.id, data) : createWheelPrize(data),
        onSuccess: () => {
            invalidate();
            success('Guardado', 'Segmento de la ruleta actualizado');
        }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleWheelPrize(id, active),
        onSuccess: () => { invalidate(); }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWheelPrize,
        onSuccess: () => {
            invalidate();
            success('Eliminado', 'Premio removido de la ruleta');
        }
    });

    return {
        prizes: query.data ?? [],
        isLoading: query.isLoading,
        savePrize: (data: WheelPrizeFormData & { id?: string }) => saveMutation.mutate(data),
        togglePrize: (id: string, active: boolean) => toggleMutation.mutate({ id, active }),
        deletePrize: (id: string) => deleteMutation.mutate(id),
        isMutating: saveMutation.isPending || toggleMutation.isPending || deleteMutation.isPending,
        togglingId: toggleMutation.isPending ? toggleMutation.variables?.id : undefined,
        deletingId: deleteMutation.isPending ? deleteMutation.variables : undefined
    };
}

export function useAdminWheelStats() {
    return useQuery({
        queryKey: ['admin', 'wheel', 'stats'],
        queryFn: getWheelStats,
        staleTime: 30000
    });
}
