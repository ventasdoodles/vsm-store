import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBehaviorRules, createBehaviorRule, toggleBehaviorRule, deleteBehaviorRule } from '@/services/ai-behavior.service';
import { toast } from 'react-hot-toast';

export function useBehaviorRules() {
    return useQuery({
        queryKey: ['ai_behavior_rules'],
        queryFn: getBehaviorRules,
    });
}

export function useCreateBehaviorRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBehaviorRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai_behavior_rules'] });
            toast.success('Regla agregada con éxito');
        },
        onError: () => {
            toast.error('Error al agregar la regla');
        }
    });
}

export function useToggleBehaviorRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, is_active }: { id: string, is_active: boolean }) => toggleBehaviorRule(id, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai_behavior_rules'] });
        },
        onError: () => {
            toast.error('Error al cambiar el estado de la regla');
        }
    });
}

export function useDeleteBehaviorRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBehaviorRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai_behavior_rules'] });
            toast.success('Regla eliminada');
        },
        onError: () => {
            toast.error('Error al eliminar la regla');
        }
    });
}
