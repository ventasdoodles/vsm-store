import { vape420VerticalPackConfig } from './vape420VerticalPack';
import type { Section } from '@/types/constants';

export interface VerticalPackSectionRouteManifestItem {
    sectionSlug: string;
    rootRoute: string;
    slugRoutePattern: string;
}

export interface VerticalPackPublicSectionRouteDeclaration {
    sectionSlug: Section;
    path: string;
    elementName: 'SectionPage' | 'SectionSlugResolver';
}

export const getVape420SectionRouteManifest = (): VerticalPackSectionRouteManifestItem[] =>
    vape420VerticalPackConfig.sections.map((section) => ({
        sectionSlug: section.slug,
        rootRoute: section.routePrefix,
        slugRoutePattern: `${section.routePrefix}/:slug`,
    }));

export const getVape420PublicSectionRouteDeclarations = (): VerticalPackPublicSectionRouteDeclaration[] =>
    getVape420SectionRouteManifest().flatMap((route) => [
        {
            sectionSlug: route.sectionSlug as Section,
            path: route.rootRoute,
            elementName: 'SectionPage',
        },
        {
            sectionSlug: route.sectionSlug as Section,
            path: route.slugRoutePattern,
            elementName: 'SectionSlugResolver',
        },
    ]);

export function resolveSectionFromRouteManifest(
    pathname: string,
    routeManifest: VerticalPackSectionRouteManifestItem[] = getVape420SectionRouteManifest(),
): Section {
    const normalizedPathname = pathname.trim();
    const matchedRoute = routeManifest.find((route) => normalizedPathname.startsWith(route.rootRoute));

    return (matchedRoute?.sectionSlug as Section) ?? 'vape';
}
