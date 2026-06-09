import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { getVape420PublicSectionRouteDeclarations } from '@/config/productization';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

const appFilePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'App.tsx');

function normalizeSource(source: string) {
    return source.replace(/\r\n/g, '\n');
}

describe('App route manifest alignment', () => {
    it('wires the public Vape/420 section routes through the manifest-derived declarations', () => {
        const appSource = normalizeSource(readFileSync(appFilePath, 'utf8'));

        const config = getStorefrontSettingsFallback().vertical_pack_config!;

        expect(appSource).toContain('getVape420PublicSectionRouteDeclarations(');
        expect(appSource).toContain('publicSectionRouteDeclarations.map((route) =>');
        expect(appSource).toContain("route.elementName === 'SectionPage'");
        expect(appSource).toContain('<SectionSlugResolver />');
        expect(appSource).toContain('<SectionPage />');
        expect(getVape420PublicSectionRouteDeclarations(config)).toHaveLength(4);
    });
});
