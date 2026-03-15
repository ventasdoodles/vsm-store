import { useQuery } from '@tanstack/react-query';
import { getPulseMetrics, type PulseMetrics } from '@/services/admin';

/**
 * useAdminPulse Hook [Wave 60 - Quantum Administration]
 * 
 * Centralizes business intelligence logic. Polls metrics from Supabase
 * using React Query for automatic caching and shared state between 
 * AdminPulse and AnimatedAtmosphere.
 * 
 * @architecture Thin Hook Pattern (Â§1.1)
 */
export function useAdminPulse() {
    const { data: metrics, isLoading, refetch } = useQuery<PulseMetrics>({
        queryKey: ['admin', 'pulse'],
        queryFn: getPulseMetrics,
        refetchInterval: 60000, // Poll every minute, shared by all consumers
        staleTime: 30000,       // Cache valid for 30s
    });

    return { 
        metrics: metrics || { todaySales: 0, activeOrders: 0, inventoryAlerts: 0, status: 'optimal' }, 
        isLoading, 
        refetch 
    };
}

