import { describe, expect, it } from 'vitest';

import {
    resolveLocalVerticalPackPreviewByKey,
    resolveLocalVerticalPackPreviewByRoutePrefix,
} from '../localVerticalPackPreview';

describe('localVerticalPackPreview', () => {
    it('resolves the dev-only second vertical proof preview from a route prefix', () => {
        const preview = resolveLocalVerticalPackPreviewByRoutePrefix('/__qa/second-vertical-proof');

        expect(preview).not.toBeNull();
        expect(preview?.previewKey).toBe('second-vertical-proof');
        expect(preview?.previewLabel).toBe('Second Vertical Proof');
        expect(preview?.pack.id).toBe('second-vertical-proof');
        expect(preview?.routePrefix).toBe('/__qa/second-vertical-proof');
        expect(preview?.proves).toEqual([
            'Local preview selection from the dev-only QA surface',
            'Selected pack identity, route manifest, taxonomy hints, and proof products render together',
        ]);
        expect(preview?.doesNotProve).toEqual([
            'Production routing or generalized vertical switching',
            'Runtime multi-tenant behavior, DB-backed portability, or production readiness',
        ]);
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

    it('resolves the dev-only Vape/420 preview by preview key', () => {
        const preview = resolveLocalVerticalPackPreviewByKey('vape-420-preview');

        expect(preview).not.toBeNull();
        expect(preview?.previewKey).toBe('vape-420-preview');
        expect(preview?.previewLabel).toBe('Vape/420 Preview');
        expect(preview?.pack.id).toBe('vape-420');
        expect(preview?.proves).toEqual([
            'Local preview switching across multiple preview states',
            'Selected Vape/420 pack identity, route manifest, taxonomy hints, and explicit empty-state rendering',
        ]);
        expect(preview?.doesNotProve).toEqual([
            'Production routing or generalized vertical switching',
            'Runtime multi-tenant behavior, DB-backed portability, or production readiness',
        ]);
        expect(preview?.routeManifest).toEqual([
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
        expect(preview?.demoProductFamilies).toEqual([
            'Caliburn',
            'Nova Pod',
            'Mango Ice',
            'Vape Pen 22mm',
        ]);
        expect(preview?.products).toEqual([]);
    });

    it('matches nested proof routes under the same local route prefix', () => {
        const preview = resolveLocalVerticalPackPreviewByRoutePrefix('/__qa/second-vertical-proof/demo-home');

        expect(preview?.pack.label).toBe('Second Vertical Proof');
    });

    it('returns null for unrelated route prefixes', () => {
        expect(resolveLocalVerticalPackPreviewByRoutePrefix('/vape')).toBeNull();
        expect(resolveLocalVerticalPackPreviewByRoutePrefix('')).toBeNull();
        expect(resolveLocalVerticalPackPreviewByKey('')).toBeNull();
        expect(resolveLocalVerticalPackPreviewByKey('unknown')).toBeNull();
    });
});
