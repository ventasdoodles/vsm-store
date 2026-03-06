// Hooks de programa de lealtad - VSM Store
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as loyaltyService from '@/services/loyalty.service';
import { getCustomerStats } from '@/services/stats.service';
import { getStoreSettings } from '@/services/settings.service';

// Loyalty: staleTime=5min (puntos cambian solo en pedidos)
const LOYALTY_STALE_TIME = 1000 * 60 * 5;

export function usePointsBalance(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'balance', customerId],
        queryFn: () => loyaltyService.getPointsBalance(customerId!),
        enabled: !!customerId,
        staleTime: LOYALTY_STALE_TIME,
    });
}

export function usePointsHistory(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'history', customerId],
        queryFn: () => loyaltyService.getPointsHistory(customerId!),
        enabled: !!customerId,
        staleTime: LOYALTY_STALE_TIME,
    });
}

export function useTierProgress(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'tier', customerId],
        queryFn: async () => {
            const [stats, settings] = await Promise.all([
                getCustomerStats(customerId!),
                getStoreSettings()
            ]);
            const progress = loyaltyService.getProgressToNextTier(stats.totalSpent, settings?.loyalty_tiers_config || null);
            const tierInfo = loyaltyService.getTierInfo(progress.currentTier, settings?.loyalty_tiers_config || null);
            return { ...progress, tierInfo, totalSpent: stats.totalSpent };
        },
        enabled: !!customerId,
        staleTime: LOYALTY_STALE_TIME,
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
