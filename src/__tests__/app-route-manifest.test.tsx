import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { getVape420PublicSectionRouteDeclarations } from '@/config/productization';

const appFilePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'App.tsx');

function normalizeSource(source: string) {
    return source.replace(/\r\n/g, '\n');
}

describe('App route manifest alignment', () => {
    it('keeps the public Vape/420 section routes aligned with the manifest-derived snapshot', () => {
        const appSource = normalizeSource(readFileSync(appFilePath, 'utf8'));

        const expectedRouteSnippets = getVape420PublicSectionRouteDeclarations().map(
            ({ path, elementName }) => `<Route path="${path}" element={<${elementName} />} />`,
        );

        let previousIndex = -1;
        for (const snippet of expectedRouteSnippets) {
            const currentIndex = appSource.indexOf(snippet);

            expect(currentIndex).toBeGreaterThan(previousIndex);
            expect(currentIndex).toBeGreaterThanOrEqual(0);
            previousIndex = currentIndex;
        }
    });
});
