import { describe, expect, it } from 'vitest';

import {
    getSecondVerticalProofSections,
    secondVerticalProofConfig,
    secondVerticalProofProducts,
} from '../secondVerticalProof';
import type { VerticalPackConfig } from '../types';

describe('second vertical proof config', () => {
    it('represents a non-Vape/420 vertical as static productization config', () => {
        const config: VerticalPackConfig = secondVerticalProofConfig;

        expect(config.id).toBe('second-vertical-proof');
        expect(config.sections.map((section) => section.slug)).toEqual(['demo-home', 'demo-studio']);
        expect(config.sections.map((section) => section.slug)).not.toContain('vape');
        expect(config.sections.map((section) => section.slug)).not.toContain('420');
        expect(getSecondVerticalProofSections()).toBe(config.sections);
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
});
