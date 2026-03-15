/**
 * useLoyalty - VSM Store
 * 
 * Custom hook para la lógica y gestión de Loyalty.
 * @module hooks/useLoyalty
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import * as loyaltyService from '@/services';
import { getCustomerStats } from '@/services';
import { getStoreSettings } from '@/services';
import { useAuth } from '@/hooks/useAuth';

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

export function useReferralStats(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'referrals', 'stats', customerId],
        queryFn: () => loyaltyService.getReferralStats(customerId!),
        enabled: !!customerId,
        staleTime: LOYALTY_STALE_TIME,
    });
}

export function useAppliedReferral(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty', 'referrals', 'applied', customerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('referrals')
                .select('referrer_id, status')
                .eq('referred_id', customerId!)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!customerId,
        staleTime: LOYALTY_STALE_TIME,
    });
}

export function useApplyReferralCode() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ code, customerId }: { code: string; customerId: string }) =>
            loyaltyService.applyReferralCode(code, customerId),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['loyalty', 'referrals', 'applied', variables.customerId] });
        },
    });
}

/**
 * useLoyaltyIA [Consolidated Wave 90]
 * Orchestrates smart rewards based on customer segmentation.
 */
export function useLoyaltyIA() {
    const { profile } = useAuth();
    const [proposition, setProposition] = useState<loyaltyService.SmartLoyaltyProposition | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!profile?.id) return;

        const syncIA = async () => {
            setIsLoading(true);
            try {
                const active = await loyaltyService.getActiveIAProposition(profile.id);
                if (active) {
                    setProposition(active);
                } else {
                    const intel = await loyaltyService.getCustomerIntelligence360(profile.id);
                    const targetSegments = ['En Riesgo', 'Casi Perdido', 'Nuevo', 'Prospecto'];
                    if (intel && targetSegments.includes(intel.segment)) {
                        const newReward = await loyaltyService.generateSmartReward(profile.id);
                        setProposition(newReward);
                    }
                }
            } catch (err) {
                console.error('[useLoyaltyIA] Error syncing IA:', err);
            } finally {
                setIsLoading(false);
            }
        };

        syncIA();
    }, [profile?.id]);

    return { 
        proposition, 
        isLoading, 
        hasProposition: !!proposition 
    };
}

/**
 * Hook to claim an IA proposition
 */
export function useClaimIAProposition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (propositionId: string) => loyaltyService.claimIAProposition(propositionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty'] });
        }
    });
}
