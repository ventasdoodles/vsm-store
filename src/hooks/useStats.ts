// Hooks de estadísticas - VSM Store
import { useQuery } from '@tanstack/react-query';
import * as statsService from '@/services/stats.service';

export function useCustomerStats(customerId: string | undefined) {
    return useQuery({
        queryKey: ['stats', customerId],
        queryFn: () => statsService.getCustomerStats(customerId!),
        enabled: !!customerId,
        staleTime: 60_000,
    });
}

export function useTopProducts(customerId: string | undefined) {
    return useQuery({
        queryKey: ['stats', 'topProducts', customerId],
        queryFn: () => statsService.getTopProducts(customerId!),
        enabled: !!customerId,
        staleTime: 60_000,
    });
}

export function useSpendingHistory(customerId: string | undefined) {
    return useQuery({
        queryKey: ['stats', 'spending', customerId],
        queryFn: () => statsService.getSpendingByMonth(customerId!),
        enabled: !!customerId,
        staleTime: 60_000,
    });
}
