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
                    payment_methods: {
                        transfer: true,
                        mercadopago: false,
                        cash: false,
                    },
                    hero_sliders: [
                        {
                            id: '1',
                            title: 'Los Mejores Vapes',
                            subtitle: '20% OFF en tu primera compra + envío gratis en Xalapa',
                            ctaText: 'Compra Ahora',
                            ctaLink: '/vape',
                            bgGradient: 'from-violet-900 via-fuchsia-900 to-purple-900',
                            bgGradientLight: 'from-violet-500 via-fuchsia-500 to-purple-600',
                            active: true,
                            order: 1
                        },
                        {
                            id: '2',
                            title: 'Productos Premium 420',
                            subtitle: 'La mejor selección de productos importados directamente para ti',
                            ctaText: 'Explorar 420',
                            ctaLink: '/420',
                            bgGradient: 'from-emerald-900 via-green-900 to-teal-900',
                            bgGradientLight: 'from-emerald-500 via-green-500 to-teal-600',
                            active: true,
                            order: 2
                        },
                        {
                            id: '3',
                            title: 'Más de 50 Sabores',
                            subtitle: 'Encuentra tu favorito entre nuestra amplia variedad de líquidos',
                            ctaText: 'Ver Líquidos',
                            ctaLink: '/vape/liquidos',
                            bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
                            bgGradientLight: 'from-blue-500 via-indigo-500 to-slate-600',
                            active: true,
                            order: 3
                        }
                    ],
                    loyalty_config: {
                        points_per_currency: 0.1,
                        currency_per_point: 0.1,
                        min_points_to_redeem: 100,
                        max_points_per_order: 1000,
                        points_expiry_days: 365,
                        enable_loyalty: true
                    },
                    flash_deals_end: null,
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
