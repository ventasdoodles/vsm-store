import { secondVerticalProofConfig } from './secondVerticalProof';
import { secondVerticalProofProducts, type SecondVerticalProofProduct } from './secondVerticalProofFixtures';
import type { CategoryTaxonomyHint, ProductAttributeHint, VerticalPackConfig } from './types';

export interface LocalVerticalPackPreview {
    routePrefix: string;
    pack: VerticalPackConfig;
    routeManifest: LocalVerticalPackPreviewRouteManifestItem[];
    categoryTaxonomyHints: CategoryTaxonomyHint[];
    productAttributeHints: ProductAttributeHint[];
    demoProductFamilies: string[];
    products: SecondVerticalProofProduct[];
}

export interface LocalVerticalPackPreviewRouteManifestItem {
    sectionSlug: string;
    rootRoute: string;
    slugRoutePattern: string;
}

const buildLocalVerticalPackRouteManifest = (
    pack: VerticalPackConfig,
): LocalVerticalPackPreviewRouteManifestItem[] =>
    pack.sections.map((section) => ({
        sectionSlug: section.slug,
        rootRoute: section.routePrefix,
        slugRoutePattern: `${section.routePrefix}/:slug`,
    }));

const LOCAL_VERTICAL_PACK_PREVIEWS: LocalVerticalPackPreview[] = [
    {
        routePrefix: '/__qa/second-vertical-proof',
        pack: secondVerticalProofConfig,
        routeManifest: buildLocalVerticalPackRouteManifest(secondVerticalProofConfig),
        categoryTaxonomyHints: secondVerticalProofConfig.categoryTaxonomyHints,
        productAttributeHints: secondVerticalProofConfig.productAttributeHints,
        demoProductFamilies: secondVerticalProofConfig.fixtureMetadata.demoProductFamilies,
        products: secondVerticalProofProducts,
    },
];

export function resolveLocalVerticalPackPreviewByRoutePrefix(routePrefix: string): LocalVerticalPackPreview | null {
    const normalizedRoutePrefix = routePrefix.trim();

    if (!normalizedRoutePrefix) {
        return null;
    }

    return (
        LOCAL_VERTICAL_PACK_PREVIEWS.find(
            (preview) =>
                normalizedRoutePrefix === preview.routePrefix ||
                normalizedRoutePrefix.startsWith(`${preview.routePrefix}/`),
        ) ?? null
    );
}
