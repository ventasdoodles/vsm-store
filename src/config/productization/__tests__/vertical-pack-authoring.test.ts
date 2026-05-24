import { describe, expect, it } from 'vitest';

import {
    defineVerticalPack,
    getVerticalPackContractViolations,
    verticalPackAuthoringTemplate,
} from '..';
import type { VerticalPackConfig } from '../types';

describe('vertical pack authoring scaffold', () => {
    it('provides a contract-compatible template for future packs', () => {
        expect(() => defineVerticalPack(verticalPackAuthoringTemplate)).not.toThrow();
        expect(verticalPackAuthoringTemplate.fixtureMetadata.demoCategorySlugs).toEqual([
            'template-core',
            'template-accessories',
        ]);
    });

    it('fails meaningfully when authored pack references undeclared sections', () => {
        const invalidPack: VerticalPackConfig = {
            ...verticalPackAuthoringTemplate,
            sections: [
                verticalPackAuthoringTemplate.sections[0]!,
            ],
            attributeSchema: {
                ...verticalPackAuthoringTemplate.attributeSchema,
                defaultSpecsBySectionSlug: {
                    'template-main': ['Brand', 'Material', 'Format'],
                },
            },
            marketing: {
                ...verticalPackAuthoringTemplate.marketing,
                categoryShowcase: {
                    fallbackCategories: verticalPackAuthoringTemplate.marketing.categoryShowcase.fallbackCategories.map(
                        (category, index) =>
                            index === 1
                                ? {
                                      ...category,
                                      sectionSlug: 'missing-section',
                                  }
                                : category,
                    ),
                },
            },
        };

        const violations = getVerticalPackContractViolations(invalidPack);

        expect(violations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    field: 'categoryTaxonomyHints.sectionSlug',
                    message: expect.stringContaining('template-alt'),
                }),
                expect.objectContaining({
                    field: 'productAttributeHints.sectionSlug',
                    message: expect.stringContaining('template-alt'),
                }),
                expect.objectContaining({
                    field: 'marketing.categoryShowcase.fallbackCategories.sectionSlug',
                    message: expect.stringContaining('missing-section'),
                }),
            ]),
        );
        expect(() => defineVerticalPack(invalidPack)).toThrow(/Invalid vertical pack contract/);
    });
});
