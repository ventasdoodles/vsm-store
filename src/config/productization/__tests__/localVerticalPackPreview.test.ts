import { describe, expect, it } from 'vitest';

import { resolveLocalVerticalPackPreviewByRoutePrefix } from '../localVerticalPackPreview';

describe('localVerticalPackPreview', () => {
    it('resolves the dev-only second vertical proof preview from a route prefix', () => {
        const preview = resolveLocalVerticalPackPreviewByRoutePrefix('/__qa/second-vertical-proof');

        expect(preview).not.toBeNull();
        expect(preview?.pack.id).toBe('second-vertical-proof');
        expect(preview?.routePrefix).toBe('/__qa/second-vertical-proof');
        expect(preview?.routeManifest).toEqual([
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
        expect(preview?.categoryTaxonomyHints.map((hint) => hint.slug)).toEqual(['organizers', 'desk-tools']);
        expect(preview?.productAttributeHints.map((hint) => hint.categorySlug)).toEqual([
            'organizers',
            'desk-tools',
        ]);
        expect(preview?.demoProductFamilies).toEqual(['Modular Organizer', 'Desk Dock']);
        expect(preview?.pack.sections.map((section) => section.routePrefix)).toEqual([
            '/__qa/second-vertical-proof/demo-home',
            '/__qa/second-vertical-proof/demo-studio',
        ]);
        expect(preview?.products.map((product) => product.sectionSlug)).toEqual([
            'demo-home',
            'demo-studio',
        ]);
    });

    it('matches nested proof routes under the same local route prefix', () => {
        const preview = resolveLocalVerticalPackPreviewByRoutePrefix('/__qa/second-vertical-proof/demo-home');

        expect(preview?.pack.label).toBe('Second Vertical Proof');
    });

    it('returns null for unrelated route prefixes', () => {
        expect(resolveLocalVerticalPackPreviewByRoutePrefix('/vape')).toBeNull();
        expect(resolveLocalVerticalPackPreviewByRoutePrefix('')).toBeNull();
    });
});
