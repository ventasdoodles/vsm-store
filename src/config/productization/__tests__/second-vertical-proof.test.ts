import { describe, expect, it } from 'vitest';

import { assertValidVerticalPackContract, summarizeVerticalPackContract } from '..';
import {
    getSecondVerticalProofSections,
    secondVerticalProofConfig,
    secondVerticalProofProducts,
} from '../secondVerticalProof';
import type { VerticalPackConfig } from '../types';

describe('second vertical proof config', () => {
    it('represents a non-Vape/420 vertical as static productization config', () => {
        const config: VerticalPackConfig = secondVerticalProofConfig;
        const summary = summarizeVerticalPackContract(config);

        expect(config.id).toBe('second-vertical-proof');
        expect(config.sections.map((section) => section.slug)).toEqual(['demo-home', 'demo-studio']);
        expect(config.sections.map((section) => section.slug)).not.toContain('vape');
        expect(config.sections.map((section) => section.slug)).not.toContain('420');
        expect(getSecondVerticalProofSections()).toBe(config.sections);
        expect(summary.sectionRoutePrefixes).toEqual([
            '/__qa/second-vertical-proof/demo-home',
            '/__qa/second-vertical-proof/demo-studio',
        ]);
    });

    it('satisfies the shared vertical pack contract', () => {
        expect(() => assertValidVerticalPackContract(secondVerticalProofConfig)).not.toThrow();
        expect(secondVerticalProofConfig.fixtureMetadata.demoCategorySlugs).toEqual([
            'organizers',
            'desk-tools',
        ]);
        expect(secondVerticalProofConfig.fixtureMetadata.fallbackImageKeys).toEqual([
            'proof-organizers',
            'proof-desk-tools',
        ]);
    });

    it('keeps proof products on string section slugs outside the production Section type', () => {
        expect(secondVerticalProofProducts).toHaveLength(2);
        expect(secondVerticalProofProducts.map((product) => product.sectionSlug)).toEqual([
            'demo-home',
            'demo-studio',
        ]);
        expect(secondVerticalProofProducts[0]).toEqual(
            expect.objectContaining({
                name: 'Modular Organizer',
                categorySlug: 'organizers',
            }),
        );
    });

    it('keeps proof products aligned with declared pack sections and category hints', () => {
        const sectionSlugs = new Set(secondVerticalProofConfig.sections.map((section) => section.slug));
        const categorySectionBySlug = new Map(
            secondVerticalProofConfig.categoryTaxonomyHints.map((category) => [
                category.slug,
                category.sectionSlug,
            ]),
        );
        const attributeHintKeys = new Set(
            secondVerticalProofConfig.productAttributeHints.map(
                (hint) => `${hint.sectionSlug}:${hint.categorySlug}`,
            ),
        );

        for (const product of secondVerticalProofProducts) {
            expect(sectionSlugs.has(product.sectionSlug)).toBe(true);
            expect(categorySectionBySlug.get(product.categorySlug)).toBe(product.sectionSlug);
            expect(attributeHintKeys.has(`${product.sectionSlug}:${product.categorySlug}`)).toBe(true);
        }
    });

    it('keeps proof product fixtures aligned with fixture metadata', () => {
        expect(secondVerticalProofProducts.map((product) => product.name)).toEqual(
            secondVerticalProofConfig.fixtureMetadata.demoProductFamilies,
        );
        expect(secondVerticalProofProducts.map((product) => product.categorySlug)).toEqual(
            secondVerticalProofConfig.fixtureMetadata.demoCategorySlugs,
        );
    });
});
