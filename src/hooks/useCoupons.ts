// Hooks de cupones - VSM Store
import { useMutation, useQuery } from '@tanstack/react-query';
import * as couponService from '@/services/coupons.service';

export function useValidateCoupon() {
    return useMutation({
        mutationFn: ({ code, total, customerId }: { code: string; total: number; customerId?: string }) =>
            couponService.validateCoupon(code, total, customerId),
    });
}

export function useActiveCoupons() {
    return useQuery({
        queryKey: ['coupons', 'active'],
        queryFn: () => couponService.getActiveCoupons(),
        staleTime: 60_000,
    });
}
