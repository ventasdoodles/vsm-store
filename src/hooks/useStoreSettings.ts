import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreSettings, updateStoreSettings } from '@/services/settings.service';
import type { StoreSettings } from '@/services/settings.service';
import { SITE_CONFIG } from '@/config/site';

export function useStoreSettings() {
    return useQuery({
        queryKey: ['store_settings'],
        queryFn: async () => {
            const data = await getStoreSettings();
            // Fallback to site config if DB is empty/error
            if (!data) {
                return {
                    id: 1,
                    site_name: SITE_CONFIG.name,
                    description: SITE_CONFIG.description,
                    logo_url: SITE_CONFIG.logo,
                    whatsapp_number: SITE_CONFIG.whatsapp.number,
                    whatsapp_default_message: SITE_CONFIG.whatsapp.defaultMessage,
                    social_links: {
                        facebook: SITE_CONFIG.social.facebook,
                        instagram: SITE_CONFIG.social.instagram,
                        youtube: SITE_CONFIG.social.youtube,
                    },
                    location_address: SITE_CONFIG.location.address,
                    location_city: SITE_CONFIG.location.city,
                    location_map_url: SITE_CONFIG.location.googleMapsUrl,
                    bank_account_info: SITE_CONFIG.bankAccount,
                } as StoreSettings;
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
