import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    getHomeHeroFallbackImageUrl,
    getHomeHeroSliderFallbacks,
    NATIONAL_HOME_HERO_COPY,
} from '../homeHero';

const readSource = () => readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'homeHero.ts'), 'utf8');

describe('home hero constants public surface', () => {
    it('keeps fallback slides backed by the home hero productization leaf', () => {
        expect(NATIONAL_HOME_HERO_COPY.title).toBe('Vapes y 420');
        expect(getHomeHeroSliderFallbacks()).toEqual([
            expect.objectContaining({
                id: '1',
                title: NATIONAL_HOME_HERO_COPY.title,
                image: '/images/storefront-fallbacks/hero-vape.svg',
                ctaLink: '/vape',
            }),
            expect.objectContaining({
                id: '2',
                title: 'Productos Premium 420',
                image: '/images/storefront-fallbacks/hero-extracts.svg',
                ctaLink: '/420',
            }),
            expect.objectContaining({
                id: '3',
                title: 'Más de 50 Sabores',
                image: '/images/storefront-fallbacks/hero-generic.svg',
                ctaLink: '/vape/liquidos',
            }),
        ]);
        expect(getHomeHeroFallbackImageUrl('/images/storefront-fallbacks/hero-vape.svg')).toBe(
            new URL('/images/storefront-fallbacks/hero-vape.svg', window.location.origin).toString(),
        );
    });

    it('imports the shared home hero fallback leaf directly instead of the productization barrel', () => {
        const source = readSource();

        expect(source).toContain("from '@/config/productization/homeHero'");
        expect(source).not.toMatch(/from ['"]@\/config\/productization['"]/);
        expect(source).not.toMatch(/from ['"]@\/config\/storefrontSettingsFallback['"]/);
    });
});
