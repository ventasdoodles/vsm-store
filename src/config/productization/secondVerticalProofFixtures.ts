export interface SecondVerticalProofProduct {
    id: string;
    name: string;
    sectionSlug: string;
    categorySlug: string;
    priceLabel: string;
    shortDescription: string;
    attributeSummary: string[];
}

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
