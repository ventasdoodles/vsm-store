import { describe, expect, it } from 'vitest';

import {
    buildAdminSectionCatalog,
    buildAdminSectionCounts,
    getAdminDefaultSectionSlug,
    getAdminSectionCatalogEntry,
} from '..';

import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

describe('adminSectionCatalog', () => {
    it('derives admin-facing metadata from the Vape/420 pack', () => {
        const config = getStorefrontSettingsFallback().vertical_pack_config!;
        const catalog = buildAdminSectionCatalog(config);

        expect(catalog.sections.map((section) => section.slug)).toEqual(['vape', '420']);
        expect(catalog.sections.map((section) => section.displayLabel)).toEqual(['💨 Vape', '🌿 420']);
        expect(catalog.sections.map((section) => section.filterLabel)).toEqual([
            '🌬️ Vape (Contexto)',
            '🌿 420 (Contexto)',
        ]);
        expect(catalog.sections.map((section) => section.formLabel)).toEqual([
            '🌬️ Sólo Vape',
            '🌿 Sólo 420',
        ]);
        expect(catalog.sections.map((section) => section.badgeClassName)).toEqual([
            'bg-violet-500/10 text-violet-400 ring-violet-500/20',
            'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        ]);
        expect(getAdminSectionCatalogEntry('vape', config)).toMatchObject({
            slug: 'vape',
            shortLabel: 'Vape',
        });
        expect(getAdminDefaultSectionSlug(config)).toBe('vape');
    });

    it('summarizes section counts for admin testimonials and similar surfaces', () => {
        const config = getStorefrontSettingsFallback().vertical_pack_config!;
        const counts = buildAdminSectionCounts([
            { section: 'vape' },
            { section: '420' },
            { section: 'vape' },
            { section: 'missing' },
            { section: null },
        ], config);

        expect(counts).toEqual({
            vape: 2,
            '420': 1,
        });
    });
});
