import { describe, expect, it } from 'vitest';

import {
    assertValidVerticalPackReadModelContract,
    buildLocalVerticalPackPreviewViewModel,
    getVerticalPackReadModelContractViolations,
    resolveLocalVerticalPackPreviewByKey,
    summarizeVerticalPackReadModelContract,
    vape420VerticalPackConfig,
} from '..';
import { secondVerticalProofConfig, secondVerticalProofProducts } from '../secondVerticalProof';

describe('verticalPackReadModelContract', () => {
    it('accepts the Vape/420 pack read model contract', () => {
        const summary = summarizeVerticalPackReadModelContract(vape420VerticalPackConfig);

        expect(summary.packId).toBe('vape-420');
        expect(summary.sectionSlugs).toEqual(['vape', '420']);
        expect(summary.routeManifestRootRoutes).toEqual(['/vape', '/420']);
        expect(summary.routeManifestSlugRoutePatterns).toEqual(['/vape/:slug', '/420/:slug']);
        expect(summary.sectionReadModelSlugs).toEqual(['vape', '420']);
        expect(summary.sectionProductCounts).toEqual([0, 0]);
        expect(summary.localProductSectionSlugs).toEqual([]);
        expect(summary.hasLocalProducts).toBe(false);
        expect(getVerticalPackReadModelContractViolations(vape420VerticalPackConfig)).toEqual([]);
        expect(() => assertValidVerticalPackReadModelContract(vape420VerticalPackConfig)).not.toThrow();
    });

    it('accepts the second vertical proof pack and its local fixtures', () => {
        const summary = summarizeVerticalPackReadModelContract(
            secondVerticalProofConfig,
            secondVerticalProofProducts,
        );
        const preview = buildLocalVerticalPackPreviewViewModel(resolveLocalVerticalPackPreviewByKey('second-vertical-proof')!);

        expect(summary.packId).toBe('second-vertical-proof');
        expect(summary.sectionSlugs).toEqual(['demo-home', 'demo-studio']);
        expect(summary.routeManifestRootRoutes).toEqual([
            '/__qa/second-vertical-proof/demo-home',
            '/__qa/second-vertical-proof/demo-studio',
        ]);
        expect(summary.routeManifestSlugRoutePatterns).toEqual([
            '/__qa/second-vertical-proof/demo-home/:slug',
            '/__qa/second-vertical-proof/demo-studio/:slug',
        ]);
        expect(summary.sectionProductCounts).toEqual([1, 1]);
        expect(summary.localProductSectionSlugs).toEqual(['demo-home', 'demo-studio']);
        expect(summary.hasLocalProducts).toBe(true);
        expect(getVerticalPackReadModelContractViolations(secondVerticalProofConfig, secondVerticalProofProducts)).toEqual([]);
        expect(() =>
            assertValidVerticalPackReadModelContract(secondVerticalProofConfig, secondVerticalProofProducts),
        ).not.toThrow();
        expect(preview.sections.map((section) => section.slugRoutePattern)).toEqual([
            '/__qa/second-vertical-proof/demo-home/:slug',
            '/__qa/second-vertical-proof/demo-studio/:slug',
        ]);
        expect(preview.sectionProductGroups.map((group) => group.productCount)).toEqual([1, 1]);
    });

    it('reports contract drift when products are no longer assigned to declared sections', () => {
        const brokenProducts = [
            {
                ...secondVerticalProofProducts[0],
                sectionSlug: 'missing-section',
            },
            {
                ...secondVerticalProofProducts[1],
                sectionSlug: 'missing-section-two',
            },
        ];

        const violations = getVerticalPackReadModelContractViolations(secondVerticalProofConfig, brokenProducts);

        expect(violations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    field: 'products.sectionSlug',
                }),
                expect.objectContaining({
                    field: 'hasLocalProducts',
                }),
            ]),
        );
        expect(() => assertValidVerticalPackReadModelContract(secondVerticalProofConfig, brokenProducts)).toThrow(
            /Invalid vertical pack read model contract/,
        );
    });
});
