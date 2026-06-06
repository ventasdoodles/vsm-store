import { activeVerticalPackConfig } from './active';
import { buildVerticalPackRouteManifest, type VerticalPackRouteManifestItem } from './verticalPackReadModel';
import type { Section } from '@/types/constants';

export type VerticalPackSectionRouteManifestItem = VerticalPackRouteManifestItem;

export interface VerticalPackPublicSectionRouteDeclaration {
    sectionSlug: Section;
    path: string;
    elementName: 'SectionPage' | 'SectionSlugResolver';
}

export const getVape420SectionRouteManifest = (): VerticalPackRouteManifestItem[] =>
    buildVerticalPackRouteManifest(activeVerticalPackConfig);

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
    routeManifest: VerticalPackRouteManifestItem[] = getVape420SectionRouteManifest(),
): Section {
    const normalizedPathname = pathname.trim();
    const matchedRoute = routeManifest.find((route) => normalizedPathname.startsWith(route.rootRoute));

    return (matchedRoute?.sectionSlug as Section) ?? (activeVerticalPackConfig.sections[0]?.slug || 'vape');
}
