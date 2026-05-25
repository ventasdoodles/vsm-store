/**
 * useStoreSettings - VSM Store
 * 
 * Custom hook para la lógica y gestión de StoreSettings.
 * @module hooks/useStoreSettings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreSettings, updateStoreSettings } from '@/services';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

export function useStoreSettings() {
    return useQuery({
        queryKey: ['store_settings'],
        queryFn: async () => {
            const data = await getStoreSettings();
            // Fallback to site config if DB is empty/error
            if (!data) {
                return getStorefrontSettingsFallback();
            }
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUpdateStoreSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStoreSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store_settings'] });
        },
    });
}
