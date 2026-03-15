/**
 * useLoyaltyStats - VSM Store
 * 
 * Custom hook para la lógica y gestión de LoyaltyStats.
 * @module hooks/useLoyaltyStats
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminLoyaltyStats } from '@/services';
export type { LoyaltyStatsData } from '@/services';

export function useLoyaltyStats() {
    return useQuery({
        queryKey: ['loyaltyStats'],
        queryFn: getAdminLoyaltyStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
