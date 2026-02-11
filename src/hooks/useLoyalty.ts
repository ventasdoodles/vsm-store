// Hooks de programa de lealtad - VSM Store
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as loyaltyService from '@/services/loyalty.service';
import { getCustomerStats } from '@/services/stats.service';

export function usePointsBalance(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'balance', customerId],
        queryFn: () => loyaltyService.getPointsBalance(customerId!),
        enabled: !!customerId,
    });
}

export function usePointsHistory(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'history', customerId],
        queryFn: () => loyaltyService.getPointsHistory(customerId!),
        enabled: !!customerId,
    });
}

export function useTierProgress(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'tier', customerId],
        queryFn: async () => {
            const stats = await getCustomerStats(customerId!);
            const progress = loyaltyService.getProgressToNextTier(stats.totalSpent);
            const tierInfo = loyaltyService.getTierInfo(progress.currentTier);
            return { ...progress, tierInfo, totalSpent: stats.totalSpent };
        },
        enabled: !!customerId,
    });
}

export function useRedeemPoints() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, points, orderId }: { customerId: string; points: number; orderId?: string }) =>
            loyaltyService.redeemPoints(customerId, points, orderId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['loyalty'] });
        },
    });
}
