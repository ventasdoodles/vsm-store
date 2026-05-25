import { vape420VerticalPackConfig } from './vape420VerticalPack';
import { secondVerticalProofConfig } from './secondVerticalProof';
import { secondVerticalProofProducts, type SecondVerticalProofProduct } from './secondVerticalProofFixtures';
import type { CategoryTaxonomyHint, ProductAttributeHint, VerticalPackConfig } from './types';

export interface LocalVerticalPackPreview {
    previewKey: LocalVerticalPackPreviewKey;
    previewLabel: string;
    routePrefix: string;
    proves: string[];
    doesNotProve: string[];
    pack: VerticalPackConfig;
    routeManifest: LocalVerticalPackPreviewRouteManifestItem[];
    categoryTaxonomyHints: CategoryTaxonomyHint[];
    productAttributeHints: ProductAttributeHint[];
    demoProductFamilies: string[];
    products: SecondVerticalProofProduct[];
}

export interface LocalVerticalPackPreviewSectionViewModel {
    slug: string;
    label: string;
    shortLabel: string;
    routePrefix: string;
    description: string;
    slugRoutePattern: string;
    hasLocalProducts: boolean;
}

export interface LocalVerticalPackPreviewViewModel {
    previewKey: LocalVerticalPackPreviewKey;
    previewLabel: string;
    routePrefix: string;
    proves: string[];
    doesNotProve: string[];
    pack: VerticalPackConfig;
    sections: LocalVerticalPackPreviewSectionViewModel[];
    routeManifest: LocalVerticalPackPreviewRouteManifestItem[];
    categoryTaxonomyHints: CategoryTaxonomyHint[];
    productAttributeHints: ProductAttributeHint[];
    demoProductFamilies: string[];
    products: SecondVerticalProofProduct[];
    productsBySectionSlug: Record<string, SecondVerticalProofProduct[]>;
    hasLocalProducts: boolean;
}

export interface LocalVerticalPackPreviewRouteManifestItem {
    sectionSlug: string;
    rootRoute: string;
    slugRoutePattern: string;
}

export type LocalVerticalPackPreviewKey = 'second-vertical-proof' | 'vape-420-preview';

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
        previewKey: 'second-vertical-proof',
        previewLabel: 'Second Vertical Proof',
        routePrefix: '/__qa/second-vertical-proof',
        proves: [
            'Local preview selection from the dev-only QA surface',
            'Selected pack identity, route manifest, taxonomy hints, and proof products render together',
        ],
        doesNotProve: [
            'Production routing or generalized vertical switching',
            'Runtime multi-tenant behavior, DB-backed portability, or production readiness',
        ],
        pack: secondVerticalProofConfig,
        routeManifest: buildLocalVerticalPackRouteManifest(secondVerticalProofConfig),
        categoryTaxonomyHints: secondVerticalProofConfig.categoryTaxonomyHints,
        productAttributeHints: secondVerticalProofConfig.productAttributeHints,
        demoProductFamilies: secondVerticalProofConfig.fixtureMetadata.demoProductFamilies,
        products: secondVerticalProofProducts,
    },
    {
        previewKey: 'vape-420-preview',
        previewLabel: 'Vape/420 Preview',
        routePrefix: '/__qa/second-vertical-proof',
        proves: [
            'Local preview switching across multiple preview states',
            'Selected Vape/420 pack identity, route manifest, taxonomy hints, and explicit empty-state rendering',
        ],
        doesNotProve: [
            'Production routing or generalized vertical switching',
            'Runtime multi-tenant behavior, DB-backed portability, or production readiness',
        ],
        pack: vape420VerticalPackConfig,
        routeManifest: buildLocalVerticalPackRouteManifest(vape420VerticalPackConfig),
        categoryTaxonomyHints: vape420VerticalPackConfig.categoryTaxonomyHints,
        productAttributeHints: vape420VerticalPackConfig.productAttributeHints,
        demoProductFamilies: vape420VerticalPackConfig.fixtureMetadata.demoProductFamilies,
        products: [],
    },
];

export function buildLocalVerticalPackPreviewViewModel(
    preview: LocalVerticalPackPreview,
): LocalVerticalPackPreviewViewModel {
    const productsBySectionSlug = preview.pack.sections.reduce<Record<string, SecondVerticalProofProduct[]>>(
        (accumulator, section) => {
            accumulator[section.slug] = preview.products.filter((product) => product.sectionSlug === section.slug);
            return accumulator;
        },
        {},
    );

    return {
        previewKey: preview.previewKey,
        previewLabel: preview.previewLabel,
        routePrefix: preview.routePrefix,
        proves: preview.proves,
        doesNotProve: preview.doesNotProve,
        pack: preview.pack,
        sections: preview.pack.sections.map((section) => ({
            slug: section.slug,
            label: section.label,
            shortLabel: section.shortLabel,
            routePrefix: section.routePrefix,
            description: section.description,
            slugRoutePattern: `${section.routePrefix}/:slug`,
            hasLocalProducts: (productsBySectionSlug[section.slug] ?? []).length > 0,
        })),
        routeManifest: preview.routeManifest,
        categoryTaxonomyHints: preview.categoryTaxonomyHints,
        productAttributeHints: preview.productAttributeHints,
        demoProductFamilies: preview.demoProductFamilies,
        products: preview.products,
        productsBySectionSlug,
        hasLocalProducts: preview.products.length > 0,
    };
}

export function resolveLocalVerticalPackPreviewByRoutePrefix(routePrefix: string): LocalVerticalPackPreview | null {
    const normalizedRoutePrefix = routePrefix.trim();

    if (!normalizedRoutePrefix) {
        return null;
    }

    return LOCAL_VERTICAL_PACK_PREVIEWS.find(
        (preview) =>
            normalizedRoutePrefix === preview.routePrefix ||
            normalizedRoutePrefix.startsWith(`${preview.routePrefix}/`),
    ) ?? null;
}

export function resolveLocalVerticalPackPreviewByKey(
    previewKey: string | null | undefined,
): LocalVerticalPackPreview | null {
    const normalizedPreviewKey = previewKey?.trim();

    if (!normalizedPreviewKey) {
        return null;
    }

    return LOCAL_VERTICAL_PACK_PREVIEWS.find((preview) => preview.previewKey === normalizedPreviewKey) ?? null;
}
