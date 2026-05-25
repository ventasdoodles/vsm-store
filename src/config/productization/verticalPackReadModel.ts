import type { VerticalPackConfig, VerticalSectionConfig } from './types';

export interface VerticalPackRouteManifestItem {
    sectionSlug: string;
    rootRoute: string;
    slugRoutePattern: string;
}

export interface VerticalPackSectionReadModel extends VerticalSectionConfig {
    slugRoutePattern: string;
    hasLocalProducts: boolean;
    localProductCount: number;
}

export interface VerticalPackSectionProductGroup<TProduct extends { sectionSlug: string }> {
    section: VerticalPackSectionReadModel;
    products: TProduct[];
    productCount: number;
    hasLocalProducts: boolean;
}

export interface VerticalPackReadModel<TProduct extends { sectionSlug: string }> {
    pack: VerticalPackConfig;
    routeManifest: VerticalPackRouteManifestItem[];
    sections: VerticalPackSectionReadModel[];
    productsBySectionSlug: Record<string, TProduct[]>;
    hasLocalProducts: boolean;
    sectionProductGroups: VerticalPackSectionProductGroup<TProduct>[];
}

export function buildVerticalPackRouteManifest(pack: VerticalPackConfig): VerticalPackRouteManifestItem[] {
    return pack.sections.map((section) => ({
        sectionSlug: section.slug,
        rootRoute: section.routePrefix,
        slugRoutePattern: `${section.routePrefix}/:slug`,
    }));
}

export function buildVerticalPackReadModel<TProduct extends { sectionSlug: string }>(
    pack: VerticalPackConfig,
    products: readonly TProduct[] = [],
): VerticalPackReadModel<TProduct> {
    const productsBySectionSlug = pack.sections.reduce<Record<string, TProduct[]>>((accumulator, section) => {
        accumulator[section.slug] = products.filter((product) => product.sectionSlug === section.slug);
        return accumulator;
    }, {});

    const sections = pack.sections.map((section) => {
        const localProducts = productsBySectionSlug[section.slug] ?? [];

        return {
            ...section,
            slugRoutePattern: `${section.routePrefix}/:slug`,
            hasLocalProducts: localProducts.length > 0,
            localProductCount: localProducts.length,
        };
    });

    const sectionProductGroups = sections.map((section) => {
        const localProducts = productsBySectionSlug[section.slug] ?? [];

        return {
            section,
            products: localProducts,
            productCount: localProducts.length,
            hasLocalProducts: localProducts.length > 0,
        };
    });

    return {
        pack,
        routeManifest: buildVerticalPackRouteManifest(pack),
        sections,
        productsBySectionSlug,
        hasLocalProducts: products.length > 0,
        sectionProductGroups,
    };
}

export function resolveVerticalPackSection(
    sections: VerticalPackSectionReadModel[],
    sectionRouteOrSlug: string | null | undefined,
): VerticalPackSectionReadModel | null {
    const normalizedSectionRouteOrSlug = sectionRouteOrSlug?.trim();

    if (!normalizedSectionRouteOrSlug) {
        return null;
    }

    return (
        sections.find(
            (section) =>
                normalizedSectionRouteOrSlug === section.slug ||
                normalizedSectionRouteOrSlug === section.routePrefix ||
                normalizedSectionRouteOrSlug.startsWith(`${section.routePrefix}/`),
        ) ?? null
    );
}
