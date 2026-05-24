export type CommerceFeatureFlag =
    | 'catalog'
    | 'cart'
    | 'checkout'
    | 'customerAccounts'
    | 'wishlist'
    | 'loyalty'
    | 'admin'
    | 'aiConcierge';

export interface HomeHeroMarketingCopy {
    title: string;
    subtitle: string;
    description: string;
    tag: string;
}

export interface TenantConfig {
    id: string;
    displayName: string;
    description: string;
    locale: string;
    currency: {
        code: string;
        symbol: string;
    };
    timezone: string;
    brand: {
        logoPath: string;
        primaryColorToken: string;
    };
    support: {
        whatsappLabel: string;
        whatsappNumber: string;
        whatsappDefaultMessage: string;
        emailLabel: string;
        email: string;
        phoneLabel: string;
        phone: string;
    };
    location: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        googleMapsUrl: string;
    };
    social: {
        facebook: string;
        instagram: string;
        youtube: string;
        tiktok: string;
        whatsapp: string;
    };
    policyLabels: {
        fulfillment: string[];
        payment: string[];
        legal: string[];
    };
    featureFlags: Record<CommerceFeatureFlag, boolean>;
}

export interface VerticalSectionConfig {
    slug: string;
    label: string;
    shortLabel: string;
    routePrefix: string;
    description: string;
    seoDescription: string;
    themeToken: string;
}

export interface CategoryTaxonomyHint {
    slug: string;
    label: string;
    sectionSlug: string;
    parentSlug?: string;
    fixtureImageKey?: string;
}

export interface ProductAttributeHint {
    categorySlug: string;
    sectionSlug: string;
    attributes: string[];
}

export interface ProductAttributeSchemaConfig {
    suggestedSpecsByCategorySlug: Record<string, string[]>;
    defaultSpecsBySectionSlug: Record<string, string[]>;
    specKeyNormalization: Record<string, string>;
}

export interface VerticalPackConfig {
    id: string;
    label: string;
    description: string;
    sections: VerticalSectionConfig[];
    categoryTaxonomyHints: CategoryTaxonomyHint[];
    productAttributeHints: ProductAttributeHint[];
    attributeSchema: ProductAttributeSchemaConfig;
    compatibilityRuleLabels: string[];
    recommendationRuleLabels: string[];
    legalPolicyCaveatLabels: string[];
    marketing: {
        homeHero: {
            primaryCopy: HomeHeroMarketingCopy;
        };
    };
    fixtureMetadata: {
        demoProductFamilies: string[];
        demoCategorySlugs: string[];
        fallbackImageKeys: string[];
    };
}
