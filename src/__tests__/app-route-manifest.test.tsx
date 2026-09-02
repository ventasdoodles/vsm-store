import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { getVape420PublicSectionRouteDeclarations } from '@/config/productization';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

const routerFilePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'router.tsx');

function normalizeSource(source: string) {
    return source.replace(/\r\n/g, '\n');
}

describe('App route manifest alignment', () => {
    it('wires the public Vape/420 section routes through TanStack Router declarations', () => {
        const routerSource = normalizeSource(readFileSync(routerFilePath, 'utf8'));

        const config = getStorefrontSettingsFallback().vertical_pack_config!;

        expect(routerSource).toContain("path: '/$section'");
        expect(routerSource).toContain("path: '/$section/$slug'");
        expect(routerSource).toContain('SectionSlugResolver');
        expect(routerSource).toContain('CategoryPage');
        expect(getVape420PublicSectionRouteDeclarations(config)).toHaveLength(4);
    });
});
