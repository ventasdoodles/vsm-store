import type { Section } from '@/types/constants';
import type { VerticalSectionConfig } from './types';
import { vape420VerticalPackConfig } from './vape420VerticalPack';
import type {
    SectionPageProductizationConfig,
    SectionPresentationProductizationConfig,
} from './sectionPage';

const buildSectionPresentationConfig = (
    section: VerticalSectionConfig,
): SectionPresentationProductizationConfig => ({
    slug: section.slug as Section,
    title: section.label,
    subtitle: section.description,
    seoDescription: section.seoDescription,
    routePrefix: section.routePrefix,
    themeToken: section.themeToken,
    isVape: section.themeToken === 'vape',
    heroGradientClassName:
        section.themeToken === 'vape'
            ? 'from-vape-500/30 via-purple-500/10 to-transparent'
            : 'from-herbal-500/30 via-emerald-500/10 to-transparent',
    heroBlobClassName: section.themeToken === 'vape' ? 'bg-vape-500' : 'bg-herbal-500',
    heroBadgeClassName:
        section.themeToken === 'vape'
            ? 'text-vape-400 bg-vape-500/10 border-vape-500/20'
            : 'text-herbal-400 bg-herbal-500/10 border-herbal-500/20',
    sortActiveClassName:
        section.themeToken === 'vape'
            ? 'bg-vape-500/10 text-vape-400 border-vape-500/20'
            : 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
    sortHighlightClassName:
        section.themeToken === 'vape'
            ? 'bg-vape-500/10 font-semibold text-vape-400'
            : 'bg-herbal-500/10 font-semibold text-herbal-400',
});

const sectionPresentationBySlug = new Map(
    vape420VerticalPackConfig.sections.map(
        (section): readonly [Section, SectionPresentationProductizationConfig] => [
            section.slug as Section,
            buildSectionPresentationConfig(section),
        ],
    ),
);

export const getVape420SectionPresentationConfig = (
    slug: Section,
): SectionPresentationProductizationConfig => {
    const section = sectionPresentationBySlug.get(slug);

    if (!section) {
        throw new Error(`Missing Vape/420 section presentation config for "${slug}"`);
    }

    return section;
};

export const getVape420SectionPageConfig = (slug: Section): SectionPageProductizationConfig => {
    const section = getVape420SectionPresentationConfig(slug);
    return {
        slug: section.slug,
        title: section.title,
        subtitle: section.subtitle,
        seoDescription: section.seoDescription,
        routePrefix: section.routePrefix,
        themeToken: section.themeToken,
    };
};
