import { vape420VerticalPackConfig } from './vape420VerticalPack';
import { secondVerticalProofConfig } from './secondVerticalProof';
import { secondVerticalProofProducts, type SecondVerticalProofProduct } from './secondVerticalProofFixtures';
import {
    buildVerticalPackReadModel,
    buildVerticalPackRouteManifest,
    resolveVerticalPackSection,
    type VerticalPackRouteManifestItem,
    type VerticalPackSectionReadModel,
    type VerticalPackSectionProductGroup,
} from './verticalPackReadModel';
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

export interface LocalVerticalPackPreviewSectionViewModel extends VerticalPackSectionReadModel {}

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
    sectionProductGroups: VerticalPackSectionProductGroup<SecondVerticalProofProduct>[];
}

export interface LocalVerticalPackPreviewShellViewModel {
    preview: LocalVerticalPackPreviewViewModel;
    activeSection: LocalVerticalPackPreviewSectionViewModel | null;
    activeSectionProducts: SecondVerticalProofProduct[];
    activeSectionProductCount: number;
    activeSectionHasLocalProducts: boolean;
    sectionProductGroups: VerticalPackSectionProductGroup<SecondVerticalProofProduct>[];
}

export type LocalVerticalPackPreviewKey = 'second-vertical-proof' | 'vape-420-preview';

export type LocalVerticalPackPreviewRouteManifestItem = VerticalPackRouteManifestItem;

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
        routeManifest: buildVerticalPackRouteManifest(secondVerticalProofConfig),
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
        routeManifest: buildVerticalPackRouteManifest(vape420VerticalPackConfig),
        categoryTaxonomyHints: vape420VerticalPackConfig.categoryTaxonomyHints,
        productAttributeHints: vape420VerticalPackConfig.productAttributeHints,
        demoProductFamilies: vape420VerticalPackConfig.fixtureMetadata.demoProductFamilies,
        products: [],
    },
];

export function buildLocalVerticalPackPreviewViewModel(
    preview: LocalVerticalPackPreview,
): LocalVerticalPackPreviewViewModel {
    const readModel = buildVerticalPackReadModel(preview.pack, preview.products);

    return {
        previewKey: preview.previewKey,
        previewLabel: preview.previewLabel,
        routePrefix: preview.routePrefix,
        proves: preview.proves,
        doesNotProve: preview.doesNotProve,
        pack: preview.pack,
        sections: readModel.sections,
        routeManifest: readModel.routeManifest,
        categoryTaxonomyHints: preview.categoryTaxonomyHints,
        productAttributeHints: preview.productAttributeHints,
        demoProductFamilies: preview.demoProductFamilies,
        products: preview.products,
        productsBySectionSlug: readModel.productsBySectionSlug,
        hasLocalProducts: readModel.hasLocalProducts,
        sectionProductGroups: readModel.sectionProductGroups,
    };
}

export function buildLocalVerticalPackPreviewShellViewModel(
    preview: LocalVerticalPackPreview,
    sectionRouteOrSlug: string | null | undefined,
): LocalVerticalPackPreviewShellViewModel {
    const previewViewModel = buildLocalVerticalPackPreviewViewModel(preview);
    const activeSection =
        resolveLocalVerticalPackPreviewSection(previewViewModel, sectionRouteOrSlug) ??
        previewViewModel.sections[0] ??
        null;

    return {
        preview: previewViewModel,
        activeSection,
        activeSectionProducts: activeSection ? previewViewModel.productsBySectionSlug[activeSection.slug] ?? [] : [],
        activeSectionProductCount: activeSection
            ? previewViewModel.productsBySectionSlug[activeSection.slug]?.length ?? 0
            : 0,
        activeSectionHasLocalProducts: activeSection
            ? (previewViewModel.productsBySectionSlug[activeSection.slug]?.length ?? 0) > 0
            : false,
        sectionProductGroups: previewViewModel.sectionProductGroups,
    };
}

export function resolveLocalVerticalPackPreviewSection(
    viewModel: LocalVerticalPackPreviewViewModel,
    sectionRouteOrSlug: string | null | undefined,
): LocalVerticalPackPreviewSectionViewModel | null {
    return resolveVerticalPackSection(viewModel.sections, sectionRouteOrSlug);
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
