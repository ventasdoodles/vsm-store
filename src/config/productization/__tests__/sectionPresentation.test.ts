import { describe, expect, it } from 'vitest';
import { vape420VerticalPackConfig } from '../vape420VerticalPack';
import {
    getVape420SectionPageConfig,
    getVape420SectionPresentationConfig,
} from '../sectionPresentation';

describe('section presentation productization', () => {
    it('keeps section page config derived from the shared vertical pack', () => {
        expect(getVape420SectionPageConfig(vape420VerticalPackConfig, 'vape')).toEqual(
            expect.objectContaining({
                slug: 'vape',
                title: 'Vape Collection',
                subtitle: 'Pods, líquidos, accesorios y todo lo que necesitas para vapear.',
                seoDescription: 'Explora toda nuestra colección de vapeo: pods, líquidos, accesorios y más.',
                routePrefix: '/vape',
                themeToken: 'vape',
            }),
        );

        expect(getVape420SectionPageConfig(vape420VerticalPackConfig, '420')).toEqual(
            expect.objectContaining({
                slug: '420',
                title: '420 Zone',
                subtitle: 'Herbal, grinders, papel, accesorios y más para tu sesión perfecta.',
                seoDescription: 'Descubre nuestra selección completa de productos 420: herbal, accesorios y más.',
                routePrefix: '/420',
                themeToken: 'herbal',
            }),
        );
    });

    it('keeps section presentation config derived from the shared vertical pack', () => {
        expect(getVape420SectionPresentationConfig(vape420VerticalPackConfig, 'vape')).toEqual(
            expect.objectContaining({
                slug: 'vape',
                isVape: true,
                heroGradientClassName: 'from-vape-500/30 via-purple-500/10 to-transparent',
                heroBlobClassName: 'bg-vape-500',
                heroBadgeClassName: 'text-vape-400 bg-vape-500/10 border-vape-500/20',
                sortActiveClassName: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
                sortHighlightClassName: 'bg-vape-500/10 font-semibold text-vape-400',
            }),
        );

        expect(getVape420SectionPresentationConfig(vape420VerticalPackConfig, '420')).toEqual(
            expect.objectContaining({
                slug: '420',
                isVape: false,
                heroGradientClassName: 'from-herbal-500/30 via-emerald-500/10 to-transparent',
                heroBlobClassName: 'bg-herbal-500',
                heroBadgeClassName: 'text-herbal-400 bg-herbal-500/10 border-herbal-500/20',
                sortActiveClassName: 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
                sortHighlightClassName: 'bg-herbal-500/10 font-semibold text-herbal-400',
            }),
        );
    });
});
