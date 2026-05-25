import { describe, expect, it } from 'vitest';

import { buildVerticalPackReadModel, buildVerticalPackRouteManifest, resolveVerticalPackSection } from '..';
import { secondVerticalProofConfig, secondVerticalProofProducts } from '../secondVerticalProof';
import { vape420VerticalPackConfig } from '../vape420VerticalPack';

describe('verticalPackReadModel', () => {
    it('builds a generic route manifest from pack sections', () => {
        expect(buildVerticalPackRouteManifest(vape420VerticalPackConfig)).toEqual([
            {
                sectionSlug: 'vape',
                rootRoute: '/vape',
                slugRoutePattern: '/vape/:slug',
            },
            {
                sectionSlug: '420',
                rootRoute: '/420',
                slugRoutePattern: '/420/:slug',
            },
        ]);
    });

    it('builds a reusable read model for sections, product groups, and section lookup', () => {
        const readModel = buildVerticalPackReadModel(secondVerticalProofConfig, secondVerticalProofProducts);

        expect(readModel.pack.id).toBe('second-vertical-proof');
        expect(readModel.routeManifest).toEqual([
            {
                sectionSlug: 'demo-home',
                rootRoute: '/__qa/second-vertical-proof/demo-home',
                slugRoutePattern: '/__qa/second-vertical-proof/demo-home/:slug',
            },
            {
                sectionSlug: 'demo-studio',
                rootRoute: '/__qa/second-vertical-proof/demo-studio',
                slugRoutePattern: '/__qa/second-vertical-proof/demo-studio/:slug',
            },
        ]);
        expect(readModel.sections.map((section) => section.slug)).toEqual(['demo-home', 'demo-studio']);
        expect(readModel.sections.map((section) => section.localProductCount)).toEqual([1, 1]);
        expect(readModel.sectionProductGroups.map((group) => group.productCount)).toEqual([1, 1]);
        expect(readModel.hasLocalProducts).toBe(true);
        expect(resolveVerticalPackSection(readModel.sections, '/__qa/second-vertical-proof/demo-studio/example')).toBe(
            readModel.sections[1],
        );
        expect(resolveVerticalPackSection(readModel.sections, 'missing')).toBeNull();
    });

    it('marks an empty pack as having no local products', () => {
        const readModel = buildVerticalPackReadModel(vape420VerticalPackConfig);

        expect(readModel.hasLocalProducts).toBe(false);
        expect(readModel.sections.map((section) => section.hasLocalProducts)).toEqual([false, false]);
        expect(readModel.sectionProductGroups.map((group) => group.productCount)).toEqual([0, 0]);
    });
});
