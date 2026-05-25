import { describe, expect, it } from 'vitest';
import { getVape420CategoryShowcaseFallbackCategories } from '../categoryShowcase';
import { getVape420HomeHeroSliderFallbacks } from '../homeHero';
import {
    buildStorefrontFeaturedCategoryFallbacks,
    buildStorefrontHeroSliderFallbacks,
    getStorefrontFallbackImageUrl,
} from '../storefrontFallbacks';

const fallbackUrl = (path: string) => new URL(path, window.location.origin).toString();

describe('storefront fallbacks helper', () => {
    it('keeps hero slider fallback normalization centralized', () => {
        expect(buildStorefrontHeroSliderFallbacks(getVape420HomeHeroSliderFallbacks())).toEqual([
            {
                id: '1',
                title: 'Vapes y 420',
                subtitle: 'seleccionados',
                description: 'Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.',
                tag: 'Envíos Nacionales',
                image: fallbackUrl('/images/storefront-fallbacks/hero-vape.svg'),
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
                image: fallbackUrl('/images/storefront-fallbacks/hero-extracts.svg'),
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
                image: fallbackUrl('/images/storefront-fallbacks/hero-generic.svg'),
                ctaText: 'Ver Líquidos',
                ctaLink: '/vape/liquidos',
                bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
                bgGradientLight: 'from-blue-500 via-indigo-500 to-slate-600',
                active: true,
                order: 3,
            },
        ]);
    });

    it('keeps featured category fallback normalization centralized', () => {
        expect(buildStorefrontFeaturedCategoryFallbacks(getVape420CategoryShowcaseFallbackCategories())).toEqual([
            {
                id: '1',
                name: 'Líquidos',
                slug: 'liquidos',
                section: 'vape',
                iconName: 'Flame',
                image: fallbackUrl('/images/storefront-fallbacks/category-liquidos.svg'),
                presetId: 'orange-red',
            },
            {
                id: '2',
                name: 'Pods & Mods',
                slug: 'mods',
                section: 'vape',
                iconName: 'Box',
                image: fallbackUrl('/images/storefront-fallbacks/category-pods.svg'),
                presetId: 'blue-purple',
            },
            {
                id: '3',
                name: 'Cannabis Premium',
                slug: 'concentrados',
                section: '420',
                iconName: 'Leaf',
                image: fallbackUrl('/images/storefront-fallbacks/category-cannabis.svg'),
                presetId: 'green-emerald',
            },
            {
                id: '4',
                name: 'Accesorios',
                slug: 'accesorios-vape',
                section: 'vape',
                iconName: 'Zap',
                image: fallbackUrl('/images/storefront-fallbacks/category-accesorios.svg'),
                presetId: 'yellow-orange',
            },
        ]);
    });

    it('returns normalized image urls for local browser contexts', () => {
        expect(getStorefrontFallbackImageUrl('/images/storefront-fallbacks/category-liquidos.svg')).toBe(
            fallbackUrl('/images/storefront-fallbacks/category-liquidos.svg'),
        );
    });
});
