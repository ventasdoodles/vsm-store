import { describe, expect, it } from 'vitest';
import { vape420VerticalPackConfig } from '@/config/productization';
import { FALLBACK_CATEGORIES } from '../category-showcase';

const fallbackUrl = (path: string) => new URL(path, window.location.origin).toString();

describe('category showcase constants public surface', () => {
    it('keeps fallback categories backed by the Vape/420 vertical pack', () => {
        expect(FALLBACK_CATEGORIES).toEqual([
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
        expect(vape420VerticalPackConfig.marketing.categoryShowcase.fallbackCategories.map((category) => category.slug)).toEqual(
            FALLBACK_CATEGORIES.map((category) => category.slug),
        );
    });
});
