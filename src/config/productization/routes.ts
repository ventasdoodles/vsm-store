import { vape420VerticalPackConfig } from './vape420VerticalPack';

export interface VerticalPackSectionRouteManifestItem {
    sectionSlug: string;
    rootRoute: string;
    slugRoutePattern: string;
}

export const getVape420SectionRouteManifest = (): VerticalPackSectionRouteManifestItem[] =>
    vape420VerticalPackConfig.sections.map((section) => ({
        sectionSlug: section.slug,
        rootRoute: section.routePrefix,
        slugRoutePattern: `${section.routePrefix}/:slug`,
    }));
