import { STORE_SETTINGS_ID } from '@/constants/app';
import { SITE_CONFIG } from '@/config/site';
import {
    getVape420CategoryShowcaseFallbackCategories,
    getVape420CategoryShowcaseFallbackImageUrl,
} from '@/config/productization/categoryShowcase';
import { getVape420HomeHeroSliderFallbacks } from '@/config/productization/homeHero';
import type { StoreSettings } from '@/services';

type StorefrontHeroSliderFallback = NonNullable<StoreSettings['hero_sliders']>[number];
type StorefrontFeaturedCategoryFallback = NonNullable<StoreSettings['featured_categories']>[number];

const STORE_FRONT_HERO_SLIDER_FALLBACKS: StorefrontHeroSliderFallback[] = getVape420HomeHeroSliderFallbacks();

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
        image: getVape420CategoryShowcaseFallbackImageUrl(category.fallbackImagePath),
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
