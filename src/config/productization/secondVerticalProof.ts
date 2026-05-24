import type { VerticalPackConfig } from './types';

export interface SecondVerticalProofProduct {
    id: string;
    name: string;
    sectionSlug: string;
    categorySlug: string;
    priceLabel: string;
    shortDescription: string;
    attributeSummary: string[];
}

export const secondVerticalProofConfig = {
    id: 'second-vertical-proof',
    label: 'Second Vertical Proof',
    description: 'Local-only proof pack for validating a non-Vape/420 vertical shape without runtime routes.',
    sections: [
        {
            slug: 'demo-home',
            label: 'Demo Home',
            shortLabel: 'Home',
            routePrefix: '/__qa/second-vertical-proof/demo-home',
            description: 'Static demo section for home essentials in a local proof surface.',
            seoDescription: 'Local-only second vertical proof for home essentials.',
            themeToken: 'proof',
        },
        {
            slug: 'demo-studio',
            label: 'Demo Studio',
            shortLabel: 'Studio',
            routePrefix: '/__qa/second-vertical-proof/demo-studio',
            description: 'Static demo section for studio accessories in a local proof surface.',
            seoDescription: 'Local-only second vertical proof for studio accessories.',
            themeToken: 'proof-alt',
        },
    ],
    categoryTaxonomyHints: [
        {
            slug: 'organizers',
            label: 'Organizers',
            sectionSlug: 'demo-home',
            fixtureImageKey: 'proof-organizers',
        },
        {
            slug: 'desk-tools',
            label: 'Desk Tools',
            sectionSlug: 'demo-studio',
            fixtureImageKey: 'proof-desk-tools',
        },
    ],
    productAttributeHints: [
        {
            categorySlug: 'organizers',
            sectionSlug: 'demo-home',
            attributes: ['Material', 'Capacity', 'Finish'],
        },
        {
            categorySlug: 'desk-tools',
            sectionSlug: 'demo-studio',
            attributes: ['Material', 'Size', 'Compatibility'],
        },
    ],
    attributeSchema: {
        suggestedSpecsByCategorySlug: {
            organizers: ['Material', 'Capacity', 'Finish'],
            'desk-tools': ['Material', 'Size', 'Compatibility'],
        },
        defaultSpecsBySectionSlug: {
            'demo-home': ['Brand', 'Material', 'Finish'],
            'demo-studio': ['Brand', 'Size', 'Compatibility'],
        },
        specKeyNormalization: {
            material: 'Material',
            capacity: 'Capacity',
            finish: 'Finish',
            size: 'Size',
            compatibility: 'Compatibility',
        },
    },
    compatibilityRuleLabels: [
        'Fixture products stay within the same demo section',
        'Fixture accessories match local attribute hints only',
    ],
    recommendationRuleLabels: [
        'Recommend by local fixture category',
        'Recommend by shared attribute summary',
    ],
    legalPolicyCaveatLabels: [
        'Local proof data only',
        'No production catalog, checkout, or policy claim',
    ],
    marketing: {
        homeHero: {
            primaryCopy: {
                title: 'Second Vertical Proof',
                subtitle: 'static local pack',
                description: 'A non-Vape/420 vertical rendered from productization config without runtime services.',
                tag: 'Local fixture only',
            },
        },
        categoryShowcase: {
            fallbackCategories: [
                {
                    id: 'proof-category-1',
                    name: 'Organizers',
                    slug: 'organizers',
                    sectionSlug: 'demo-home',
                    iconName: 'Boxes',
                    fallbackImagePath: '/images/storefront-fallbacks/category-accesorios.svg',
                    presetId: 'stone-zinc',
                },
                {
                    id: 'proof-category-2',
                    name: 'Desk Tools',
                    slug: 'desk-tools',
                    sectionSlug: 'demo-studio',
                    iconName: 'Asterisk',
                    fallbackImagePath: '/images/storefront-fallbacks/category-pods.svg',
                    presetId: 'cyan-blue',
                },
            ],
        },
    },
    fixtureMetadata: {
        demoProductFamilies: ['Modular Organizer', 'Desk Dock'],
        demoCategorySlugs: ['organizers', 'desk-tools'],
        fallbackImageKeys: ['proof-organizers', 'proof-desk-tools'],
    },
} satisfies VerticalPackConfig;

export const secondVerticalProofProducts: SecondVerticalProofProduct[] = [
    {
        id: 'proof-product-1',
        name: 'Modular Organizer',
        sectionSlug: 'demo-home',
        categorySlug: 'organizers',
        priceLabel: '$420.00',
        shortDescription: 'Static fixture product mapped to the demo-home section.',
        attributeSummary: ['Material: Recycled polymer', 'Capacity: 3 trays', 'Finish: Matte'],
    },
    {
        id: 'proof-product-2',
        name: 'Desk Dock',
        sectionSlug: 'demo-studio',
        categorySlug: 'desk-tools',
        priceLabel: '$590.00',
        shortDescription: 'Static fixture product mapped to the demo-studio section.',
        attributeSummary: ['Material: Aluminum', 'Size: Compact', 'Compatibility: Universal'],
    },
];

export const getSecondVerticalProofSections = () => secondVerticalProofConfig.sections;
