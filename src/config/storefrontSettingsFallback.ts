import { STORE_SETTINGS_ID } from '@/constants/app';
import { NATIONAL_HOME_HERO_COPY } from '@/constants/homeHero';
import { SITE_CONFIG } from '@/config/site';
import { getVape420CategoryShowcaseFallbackCategories } from '@/config/productization/categoryShowcase';
import type { StoreSettings } from '@/services';

type StorefrontHeroSliderFallback = NonNullable<StoreSettings['hero_sliders']>[number];
type StorefrontFeaturedCategoryFallback = NonNullable<StoreSettings['featured_categories']>[number];

const storefrontFallbackImage = (path: string) =>
    typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString();

const STORE_FRONT_HERO_SLIDER_FALLBACKS: StorefrontHeroSliderFallback[] = [
    {
        id: '1',
        title: NATIONAL_HOME_HERO_COPY.title,
        subtitle: NATIONAL_HOME_HERO_COPY.subtitle,
        description: NATIONAL_HOME_HERO_COPY.description,
        tag: NATIONAL_HOME_HERO_COPY.tag,
        image: '/images/storefront-fallbacks/hero-vape.svg',
        ctaText: 'Compra Ahora',
        ctaLink: '/vape',
        bgGradient: 'from-violet-900 via-fuchsia-900 to-purple-900',
        bgGradientLight: 'from-violet-500 via-fuchsia-500 to-purple-600',
        active: true,
        order: 1,
    },
    {
        id: '2',
        title: 'Productos Premium 420',
        subtitle: 'La mejor selección de productos importados directamente para ti',
        image: '/images/storefront-fallbacks/hero-extracts.svg',
        ctaText: 'Explorar 420',
        ctaLink: '/420',
        bgGradient: 'from-emerald-900 via-green-900 to-teal-900',
        bgGradientLight: 'from-emerald-500 via-green-500 to-teal-600',
        active: true,
        order: 2,
    },
    {
        id: '3',
        title: 'Más de 50 Sabores',
        subtitle: 'Encuentra tu favorito entre nuestra amplia variedad de líquidos',
        image: '/images/storefront-fallbacks/hero-generic.svg',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
        bgGradientLight: 'from-blue-500 via-indigo-500 to-slate-600',
        active: true,
        order: 3,
    },
];

export function getStorefrontHeroSliderFallbacks(): StorefrontHeroSliderFallback[] {
    return STORE_FRONT_HERO_SLIDER_FALLBACKS;
}

const STORE_FRONT_FEATURED_CATEGORY_FALLBACKS: StorefrontFeaturedCategoryFallback[] = getVape420CategoryShowcaseFallbackCategories().map(
    (category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        section: category.sectionSlug as StorefrontFeaturedCategoryFallback['section'],
        iconName: category.iconName,
        image: storefrontFallbackImage(category.fallbackImagePath),
        presetId: category.presetId,
    }),
);

export function getStorefrontFeaturedCategoryFallbacks(): StorefrontFeaturedCategoryFallback[] {
    return STORE_FRONT_FEATURED_CATEGORY_FALLBACKS;
}

export function getStorefrontSettingsFallback(): StoreSettings {
    return {
        id: STORE_SETTINGS_ID,
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
        hero_sliders: getStorefrontHeroSliderFallbacks(),
        featured_categories: getStorefrontFeaturedCategoryFallbacks(),
        loyalty_config: {
            points_per_currency: 0.1,
            currency_per_point: 0.1,
            min_points_to_redeem: 100,
            max_points_per_order: 1000,
            points_expiry_days: 365,
            enable_loyalty: true,
        },
        flash_deals_end: null,
        is_ai_assistant_enabled: false,
    } as StoreSettings;
}
