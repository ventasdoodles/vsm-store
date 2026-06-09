import type { Section } from '@/types/constants';
import type { VerticalPackConfig, VerticalSectionConfig } from './types';
import type {
    SectionPageProductizationConfig,
    SectionPresentationProductizationConfig,
} from './sectionPage';

const getThemeClasses = (themeToken: string) => {
    if (themeToken === 'vape') {
        return {
            heroGradient: 'from-vape-500/30 via-purple-500/10 to-transparent',
            heroBlob: 'bg-vape-500',
            heroBadge: 'text-vape-400 bg-vape-500/10 border-vape-500/20',
            sortActive: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
            sortHighlight: 'bg-vape-500/10 font-semibold text-vape-400',
        };
    } else if (themeToken === 'herbal' || themeToken === '420') {
        return {
            heroGradient: 'from-herbal-500/30 via-emerald-500/10 to-transparent',
            heroBlob: 'bg-herbal-500',
            heroBadge: 'text-herbal-400 bg-herbal-500/10 border-herbal-500/20',
            sortActive: 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
            sortHighlight: 'bg-herbal-500/10 font-semibold text-herbal-400',
        };
    } else {
        // Fallback for other verticals
        return {
            heroGradient: 'from-indigo-500/30 via-sky-500/10 to-transparent',
            heroBlob: 'bg-indigo-500',
            heroBadge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
            sortActive: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            sortHighlight: 'bg-indigo-500/10 font-semibold text-indigo-400',
        };
    }
};

const buildSectionPresentationConfig = (
    section: VerticalSectionConfig,
): SectionPresentationProductizationConfig => {
    const theme = getThemeClasses(section.themeToken);
    return {
        slug: section.slug as Section,
        title: section.label,
        subtitle: section.description,
        seoDescription: section.seoDescription,
        routePrefix: section.routePrefix,
        themeToken: section.themeToken,
        isVape: section.themeToken === 'vape',
        heroGradientClassName: theme.heroGradient,
        heroBlobClassName: theme.heroBlob,
        heroBadgeClassName: theme.heroBadge,
        sortActiveClassName: theme.sortActive,
        sortHighlightClassName: theme.sortHighlight,
    };
};

const getSectionPresentationBySlug = (config: VerticalPackConfig) => new Map(
    config.sections.map(
        (section): readonly [Section, SectionPresentationProductizationConfig] => [
            section.slug as Section,
            buildSectionPresentationConfig(section),
        ],
    ),
);

export const getVape420SectionPresentationConfig = (
    config: VerticalPackConfig,
    slug: Section,
): SectionPresentationProductizationConfig => {
    const sectionPresentationBySlug = getSectionPresentationBySlug(config);
    const section = sectionPresentationBySlug.get(slug);

    if (!section) {
        throw new Error(`Missing section presentation config for "${slug}"`);
    }

    return section;
};

export const getVape420SectionPageConfig = (config: VerticalPackConfig, slug: Section): SectionPageProductizationConfig => {
    const section = getVape420SectionPresentationConfig(config, slug);
    return {
        slug: section.slug,
        title: section.title,
        subtitle: section.subtitle,
        seoDescription: section.seoDescription,
        routePrefix: section.routePrefix,
        themeToken: section.themeToken,
    };
};
