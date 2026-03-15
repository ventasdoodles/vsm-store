/**
 * useAddresses.ts - VSM Store
 * 
 * Hooks basados en React Query para la gestión de direcciones del cliente.
 * 
 * @module hooks/useAddresses
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as addressService from '@/services';
import type { AddressData } from '@/services';

// Re-exports para que componentes no importen del service
export type { Address, AddressData } from '@/services';
export { formatAddress } from '@/services';

export function useAddresses(customerId: string | undefined) {
    return useQuery({
        queryKey: ['addresses', customerId],
        queryFn: () => addressService.getAddresses(customerId!),
        enabled: !!customerId,
    });
}

export function useDefaultAddress(customerId: string | undefined, type: 'shipping' | 'billing') {
    return useQuery({
        queryKey: ['addresses', customerId, 'default', type],
        queryFn: () => addressService.getDefaultAddress(customerId!, type),
        enabled: !!customerId,
    });
}

export function useCreateAddress() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: AddressData) => addressService.createAddress(data),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['addresses', variables.customer_id] });
        },
    });
}

export function useUpdateAddress() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AddressData> }) =>
            addressService.updateAddress(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['addresses'] });
        },
    });
}

export function useDeleteAddress() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => addressService.deleteAddress(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['addresses'] });
        },
    });
}

export function useSetDefaultAddress() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, customerId, type }: { id: string; customerId: string; type: 'shipping' | 'billing' }) =>
            addressService.setDefaultAddress(id, customerId, type),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['addresses'] });
        },
    });
}
