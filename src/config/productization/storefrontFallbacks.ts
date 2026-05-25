import type { StoreSettings } from '@/services';

type StorefrontFeaturedCategoryFallback = NonNullable<StoreSettings['featured_categories']>[number];

export function getStorefrontFallbackImageUrl(path: string) {
    return typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString();
}

export function buildStorefrontHeroSliderFallbacks<T extends { image: string }>(
    fallbacks: readonly T[],
): T[] {
    return fallbacks.map((fallback) => ({
        ...fallback,
        image: getStorefrontFallbackImageUrl(fallback.image),
    }));
}

export function buildStorefrontFeaturedCategoryFallbacks<
    T extends {
        id: string;
        name: string;
        slug: string;
        sectionSlug: string;
        iconName: string;
        fallbackImagePath: string;
        presetId: string;
    },
>(categories: readonly T[]): StorefrontFeaturedCategoryFallback[] {
    return categories.map(({ fallbackImagePath, sectionSlug, ...category }) => ({
        ...category,
        section: sectionSlug as StorefrontFeaturedCategoryFallback['section'],
        image: getStorefrontFallbackImageUrl(fallbackImagePath),
    }));
}
