import { buildVerticalPackRouteManifest, type VerticalPackRouteManifestItem } from './verticalPackReadModel';
import type { VerticalPackConfig } from './types';
import type { Section } from '@/types/constants';

export type VerticalPackSectionRouteManifestItem = VerticalPackRouteManifestItem;

export interface VerticalPackPublicSectionRouteDeclaration {
    sectionSlug: Section;
    path: string;
    elementName: 'SectionPage' | 'SectionSlugResolver';
}

export const getVape420SectionRouteManifest = (config: VerticalPackConfig): VerticalPackRouteManifestItem[] =>
    buildVerticalPackRouteManifest(config);

export const getVape420PublicSectionRouteDeclarations = (config: VerticalPackConfig): VerticalPackPublicSectionRouteDeclaration[] =>
    getVape420SectionRouteManifest(config).flatMap((route) => [
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
    config: VerticalPackConfig,
    routeManifest: VerticalPackRouteManifestItem[] = getVape420SectionRouteManifest(config),
): Section {
    const normalizedPathname = pathname.trim();
    const matchedRoute = routeManifest.find((route) => normalizedPathname.startsWith(route.rootRoute));

    return (matchedRoute?.sectionSlug as Section) ?? (config.sections[0]?.slug || 'vape');
}
