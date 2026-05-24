import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { vape420VerticalPackConfig, vsmStoreTenantConfig } from '..';

const productizationDir = dirname(fileURLToPath(import.meta.url)).replace(/\\__tests__$/, '');

const readProductizationImports = () =>
    ['index.ts', 'tenant.ts', 'types.ts', 'vape420VerticalPack.ts']
        .map((fileName) => readFileSync(join(productizationDir, fileName), 'utf8'))
        .flatMap((source) => source.split('\n').filter((line) => line.trim().startsWith('import ')))
        .join('\n');

describe('productization config boundary', () => {
    it('keeps tenant identity separate from vertical taxonomy', () => {
        expect(vsmStoreTenantConfig.displayName).toBe('VSM Store');
        expect(vsmStoreTenantConfig.locale).toBe('es-MX');
        expect(vsmStoreTenantConfig.currency.code).toBe('MXN');

        const tenantText = JSON.stringify(vsmStoreTenantConfig);
        expect(tenantText).not.toContain('"routePrefix"');
        expect(tenantText).not.toContain('"categoryTaxonomyHints"');
        expect(tenantText).not.toContain('"productAttributeHints"');
    });

    it('keeps Vape/420 taxonomy and specs in the vertical pack', () => {
        expect(vape420VerticalPackConfig.sections.map((section) => section.slug)).toEqual(['vape', '420']);
        expect(vape420VerticalPackConfig.categoryTaxonomyHints.map((category) => category.slug)).toEqual(
            expect.arrayContaining(['liquidos', 'mods', 'concentrados', 'accesorios-vape']),
        );
        expect(vape420VerticalPackConfig.productAttributeHints).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    categorySlug: 'liquidos',
                    attributes: expect.arrayContaining(['Nicotina', 'VG/PG', 'Volumen']),
                }),
                expect.objectContaining({
                    categorySlug: 'flores',
                    attributes: expect.arrayContaining(['THC%', 'CBD%', 'Terpenos']),
                }),
            ]),
        );
    });

    it('does not import runtime, provider, payment, database, search, or Cesarin dependencies', () => {
        const source = readProductizationImports();

        expect(source).not.toMatch(/@\/lib\/supabase|@supabase\/supabase-js|supabase/i);
        expect(source).not.toMatch(/mercadopago|payment|checkout/i);
        expect(source).not.toMatch(/product[-_ ]?search|search\.service/i);
        expect(source).not.toMatch(/cesarin|customer-intelligence|concierge\.service/i);
        expect(source).not.toMatch(/process\.env|import\.meta\.env|GEMINI|API_KEY/i);
        expect(source).not.toMatch(/@google\/genai|gemini/i);
    });
});
