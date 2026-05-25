import type { Section } from '@/types/constants';

export interface SectionPageProductizationConfig {
    slug: Section;
    title: string;
    subtitle: string;
    seoDescription: string;
    routePrefix: string;
    themeToken: string;
}

export interface SectionPresentationProductizationConfig extends SectionPageProductizationConfig {
    isVape: boolean;
    heroGradientClassName: string;
    heroBlobClassName: string;
    heroBadgeClassName: string;
    sortActiveClassName: string;
    sortHighlightClassName: string;
}

export { getVape420SectionPageConfig, getVape420SectionPresentationConfig } from './sectionPresentation';
