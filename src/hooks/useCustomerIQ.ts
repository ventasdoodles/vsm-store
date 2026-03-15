/**
 * useCustomerIQ Hook [Wave 90 - Consolidated Architecture]
 * 
 * Central truth for customer intelligence, personalized banners and segments.
 * Replaces useIntelligence.ts
 */
import { useQuery } from '@tanstack/react-query';
import { conciergeService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { CustomerProfile } from '@/types/customer';


export function useCustomerIQ() {
    const { user, isAuthenticated } = useAuth();
    const { data: rawIntelligence, isLoading, refetch } = useQuery({

        queryKey: ['customer-iq', user?.id],
        queryFn: () => conciergeService.getMyIntelligence(),
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60 * 5,
    });

    const intelligence = rawIntelligence as CustomerProfile | null;

    const banner = intelligence?.segment 
        ? conciergeService.getPersonalizedBanner(intelligence.segment)
        : null;

    return {
        intelligence,
        banner,
        isLoading,
        refetch,
        segment: intelligence?.segment || 'Normal'
    };

}
