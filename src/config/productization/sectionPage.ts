import type { Section } from '@/types/constants';
import { vape420VerticalPackConfig } from './vape420VerticalPack';

export interface SectionPageProductizationConfig {
    slug: Section;
    title: string;
    subtitle: string;
    seoDescription: string;
    routePrefix: string;
    themeToken: string;
}

const verticalSectionsBySlug = new Map(
    vape420VerticalPackConfig.sections.map((section) => [section.slug, section]),
);

export const getVape420SectionPageConfig = (slug: Section): SectionPageProductizationConfig => {
    const section = verticalSectionsBySlug.get(slug);

    if (!section) {
        throw new Error(`Missing Vape/420 section config for "${slug}"`);
    }

    return {
        slug,
        title: section.label,
        subtitle: section.description,
        seoDescription: section.seoDescription,
        routePrefix: section.routePrefix,
        themeToken: section.themeToken,
    };
};
