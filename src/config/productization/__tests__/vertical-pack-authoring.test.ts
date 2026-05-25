import { describe, expect, it } from 'vitest';

import {
    defineVerticalPack,
    getVerticalPackContractViolations,
    VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS,
    verticalPackAuthoringTemplate,
} from '..';
import type { VerticalPackConfig } from '../types';

const readPath = (value: unknown, path: string): unknown =>
    path.split('.').reduce<unknown>((current, segment) => {
        if (current && typeof current === 'object' && segment in current) {
            return (current as Record<string, unknown>)[segment];
        }

        return undefined;
    }, value);

const expectRequiredFields = (value: unknown, fields: readonly string[]) => {
    for (const field of fields) {
        expect(readPath(value, field), field).not.toBeUndefined();
    }
};

describe('vertical pack authoring scaffold', () => {
    it('provides a contract-compatible template for future packs', () => {
        expect(() => defineVerticalPack(verticalPackAuthoringTemplate)).not.toThrow();
        expect(verticalPackAuthoringTemplate.fixtureMetadata.demoCategorySlugs).toEqual([
            'template-core',
            'template-accessories',
        ]);
    });

    it('keeps the template aligned with the pack-level required authoring fields', () => {
        expectRequiredFields(
            verticalPackAuthoringTemplate,
            VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.pack,
        );
    });

    it('keeps template sections aligned with required section authoring fields', () => {
        for (const section of verticalPackAuthoringTemplate.sections) {
            expectRequiredFields(section, VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.section);
        }
    });

    it('keeps template taxonomy and attribute hints aligned with required authoring fields', () => {
        for (const category of verticalPackAuthoringTemplate.categoryTaxonomyHints) {
            expectRequiredFields(
                category,
                VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.categoryTaxonomyHint,
            );
        }

        for (const hint of verticalPackAuthoringTemplate.productAttributeHints) {
            expectRequiredFields(hint, VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.productAttributeHint);
        }
    });

    it('keeps template showcase and fixture metadata aligned with required authoring fields', () => {
        for (const category of verticalPackAuthoringTemplate.marketing.categoryShowcase
            .fallbackCategories) {
            expectRequiredFields(
                category,
                VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.categoryShowcaseItem,
            );
        }

        expectRequiredFields(
            verticalPackAuthoringTemplate.fixtureMetadata,
            VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.fixtureMetadata,
        );
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
