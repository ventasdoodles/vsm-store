import { useQuery } from '@tanstack/react-query';
import { getAdminLoyaltyStats } from '@/services/loyalty.service';
export type { LoyaltyStatsData } from '@/services/loyalty.service';

export function useLoyaltyStats() {
    return useQuery({
        queryKey: ['loyaltyStats'],
        queryFn: getAdminLoyaltyStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
