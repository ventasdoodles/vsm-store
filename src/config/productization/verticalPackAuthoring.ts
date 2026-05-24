import type { VerticalPackConfig } from './types';
import { assertValidVerticalPackContract } from './verticalPackContract';

export const VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS = {
    pack: [
        'id',
        'label',
        'description',
        'sections',
        'categoryTaxonomyHints',
        'productAttributeHints',
        'attributeSchema',
        'compatibilityRuleLabels',
        'recommendationRuleLabels',
        'legalPolicyCaveatLabels',
        'marketing.homeHero.primaryCopy',
        'marketing.categoryShowcase.fallbackCategories',
        'fixtureMetadata.demoProductFamilies',
        'fixtureMetadata.demoCategorySlugs',
        'fixtureMetadata.fallbackImageKeys',
    ],
    section: ['slug', 'label', 'shortLabel', 'routePrefix', 'description', 'seoDescription', 'themeToken'],
    categoryTaxonomyHint: ['slug', 'label', 'sectionSlug'],
    productAttributeHint: ['categorySlug', 'sectionSlug', 'attributes'],
    categoryShowcaseItem: ['id', 'name', 'slug', 'sectionSlug', 'iconName', 'fallbackImagePath', 'presetId'],
    fixtureMetadata: ['demoProductFamilies', 'demoCategorySlugs', 'fallbackImageKeys'],
} as const;

export function defineVerticalPack(pack: VerticalPackConfig): VerticalPackConfig {
    return assertValidVerticalPackContract(pack);
}

export const verticalPackAuthoringTemplate = defineVerticalPack({
    id: 'template-vertical-pack',
    label: 'Template Vertical Pack',
    description: 'Local-only authoring template for future static vertical packs.',
    sections: [
        {
            slug: 'template-main',
            label: 'Template Main',
            shortLabel: 'Main',
            routePrefix: '/__qa/template-vertical-pack/main',
            description: 'Primary template section for future pack authors.',
            seoDescription: 'Local-only template section for future vertical-pack authoring.',
            themeToken: 'template-primary',
        },
        {
            slug: 'template-alt',
            label: 'Template Alt',
            shortLabel: 'Alt',
            routePrefix: '/__qa/template-vertical-pack/alt',
            description: 'Secondary template section for future pack authors.',
            seoDescription: 'Local-only secondary template section for future vertical-pack authoring.',
            themeToken: 'template-secondary',
        },
    ],
    categoryTaxonomyHints: [
        {
            slug: 'template-core',
            label: 'Template Core',
            sectionSlug: 'template-main',
            fixtureImageKey: 'template-core',
        },
        {
            slug: 'template-accessories',
            label: 'Template Accessories',
            sectionSlug: 'template-alt',
            fixtureImageKey: 'template-accessories',
        },
    ],
    productAttributeHints: [
        {
            categorySlug: 'template-core',
            sectionSlug: 'template-main',
            attributes: ['Material', 'Use Case', 'Format'],
        },
        {
            categorySlug: 'template-accessories',
            sectionSlug: 'template-alt',
            attributes: ['Material', 'Size', 'Compatibility'],
        },
    ],
    attributeSchema: {
        suggestedSpecsByCategorySlug: {
            'template-core': ['Material', 'Use Case', 'Format'],
            'template-accessories': ['Material', 'Size', 'Compatibility'],
        },
        defaultSpecsBySectionSlug: {
            'template-main': ['Brand', 'Material', 'Format'],
            'template-alt': ['Brand', 'Size', 'Compatibility'],
        },
        specKeyNormalization: {
            material: 'Material',
            'use case': 'Use Case',
            format: 'Format',
            size: 'Size',
            compatibility: 'Compatibility',
            brand: 'Brand',
        },
    },
    compatibilityRuleLabels: [
        'Template products should stay within declared section compatibility boundaries.',
    ],
    recommendationRuleLabels: [
        'Template recommendations should stay within local fixture assumptions.',
    ],
    legalPolicyCaveatLabels: [
        'Template data is local-only authoring guidance.',
    ],
    marketing: {
        homeHero: {
            primaryCopy: {
                title: 'Template Vertical Pack',
                subtitle: 'authoring scaffold',
                description: 'Reusable local template for future vertical-pack authoring without runtime claims.',
                tag: 'Local authoring only',
            },
        },
        categoryShowcase: {
            fallbackCategories: [
                {
                    id: 'template-category-1',
                    name: 'Template Core',
                    slug: 'template-core',
                    sectionSlug: 'template-main',
                    iconName: 'Package',
                    fallbackImagePath: '/images/storefront-fallbacks/category-pods.svg',
                    presetId: 'template-blue',
                },
                {
                    id: 'template-category-2',
                    name: 'Template Accessories',
                    slug: 'template-accessories',
                    sectionSlug: 'template-alt',
                    iconName: 'Sparkles',
                    fallbackImagePath: '/images/storefront-fallbacks/category-accesorios.svg',
                    presetId: 'template-slate',
                },
            ],
        },
    },
    fixtureMetadata: {
        demoProductFamilies: ['Template Core Family', 'Template Accessories Family'],
        demoCategorySlugs: ['template-core', 'template-accessories'],
        fallbackImageKeys: ['template-core', 'template-accessories'],
    },
});
