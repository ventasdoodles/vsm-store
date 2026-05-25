import { describe, expect, it } from 'vitest';
import { STORE_SETTINGS_ID } from '@/constants/app';
import { NATIONAL_HOME_HERO_COPY } from '@/constants/homeHero';
import { SITE_CONFIG } from '@/config/site';
import {
    getStorefrontFeaturedCategoryFallbacks,
    getStorefrontHeroSliderFallbacks,
    getStorefrontSettingsFallback,
} from '../storefrontSettingsFallback';

const fallbackUrl = (path: string) => new URL(path, window.location.origin).toString();

describe('storefront settings fallback', () => {
    it('preserves the current DB-empty store settings fallback contract', () => {
        const fallback = getStorefrontSettingsFallback();

        expect(fallback).toEqual(
            expect.objectContaining({
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
            }),
        );
    });

    it('preserves the current fallback home slider routes and national copy', () => {
        const fallback = getStorefrontSettingsFallback();

        expect(fallback.hero_sliders).toEqual(getStorefrontHeroSliderFallbacks());
        expect(fallback.hero_sliders).toEqual([
            expect.objectContaining({
                id: '1',
                title: NATIONAL_HOME_HERO_COPY.title,
                subtitle: NATIONAL_HOME_HERO_COPY.subtitle,
                description: NATIONAL_HOME_HERO_COPY.description,
                tag: NATIONAL_HOME_HERO_COPY.tag,
                image: '/images/storefront-fallbacks/hero-vape.svg',
                ctaText: 'Compra Ahora',
                ctaLink: '/vape',
                active: true,
                order: 1,
            }),
            expect.objectContaining({
                id: '2',
                title: 'Productos Premium 420',
                image: '/images/storefront-fallbacks/hero-extracts.svg',
                ctaText: 'Explorar 420',
                ctaLink: '/420',
                active: true,
                order: 2,
            }),
            expect.objectContaining({
                id: '3',
                title: 'Más de 50 Sabores',
                image: '/images/storefront-fallbacks/hero-generic.svg',
                ctaText: 'Ver Líquidos',
                ctaLink: '/vape/liquidos',
                active: true,
                order: 3,
            }),
        ]);
        expect(fallback.featured_categories).toEqual(getStorefrontFeaturedCategoryFallbacks());
        expect(fallback.featured_categories).toEqual([
            expect.objectContaining({
                id: '1',
                name: 'L\u00edquidos',
                slug: 'liquidos',
                section: 'vape',
                iconName: 'Flame',
                image: fallbackUrl('/images/storefront-fallbacks/category-liquidos.svg'),
                presetId: 'orange-red',
            }),
            expect.objectContaining({
                id: '2',
                name: 'Pods & Mods',
                slug: 'mods',
                section: 'vape',
                iconName: 'Box',
                image: fallbackUrl('/images/storefront-fallbacks/category-pods.svg'),
                presetId: 'blue-purple',
            }),
            expect.objectContaining({
                id: '3',
                name: 'Cannabis Premium',
                slug: 'concentrados',
                section: '420',
                iconName: 'Leaf',
                image: fallbackUrl('/images/storefront-fallbacks/category-cannabis.svg'),
                presetId: 'green-emerald',
            }),
            expect.objectContaining({
                id: '4',
                name: 'Accesorios',
                slug: 'accesorios-vape',
                section: 'vape',
                iconName: 'Zap',
                image: fallbackUrl('/images/storefront-fallbacks/category-accesorios.svg'),
                presetId: 'yellow-orange',
            }),
        ]);
    });
});
