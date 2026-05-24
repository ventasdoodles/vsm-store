import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SITE_CONFIG } from '@/config/site';
import { NATIONAL_HOME_HERO_COPY } from '@/constants/homeHero';
import { STORE_META_COPY } from '@/constants/storeMeta';
import { getVape420SectionPageConfig, vape420VerticalPackConfig, vsmStoreTenantConfig } from '..';

const productizationDir = dirname(fileURLToPath(import.meta.url)).replace(/\\__tests__$/, '');

const readProductizationImports = () =>
    ['index.ts', 'tenant.ts', 'types.ts', 'vape420VerticalPack.ts', 'sectionPage.ts']
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
        expect(tenantText).not.toContain('"homeHero"');
        expect(tenantText).not.toContain('"primaryCopy"');
    });

    it('feeds existing site metadata from tenant config without changing exported shapes', () => {
        expect(SITE_CONFIG.name).toBe(vsmStoreTenantConfig.displayName);
        expect(SITE_CONFIG.description).toBe(vsmStoreTenantConfig.description);
        expect(SITE_CONFIG.logo).toBe(vsmStoreTenantConfig.brand.logoPath);
        expect(SITE_CONFIG.whatsapp.number).toBe(vsmStoreTenantConfig.support.whatsappNumber);
        expect(SITE_CONFIG.whatsapp.defaultMessage).toBe(vsmStoreTenantConfig.support.whatsappDefaultMessage);
        expect(SITE_CONFIG.contact.email).toBe(vsmStoreTenantConfig.support.email);
        expect(SITE_CONFIG.contact.phone).toBe(vsmStoreTenantConfig.support.phone);
        expect(SITE_CONFIG.location).toEqual(vsmStoreTenantConfig.location);
        expect(SITE_CONFIG.social).toEqual(vsmStoreTenantConfig.social);
        expect(SITE_CONFIG.store).toEqual({
            currency: vsmStoreTenantConfig.currency.code,
            currencySymbol: vsmStoreTenantConfig.currency.symbol,
            locale: vsmStoreTenantConfig.locale,
            timezone: vsmStoreTenantConfig.timezone,
        });
        expect(STORE_META_COPY.home.hiddenHeading).toContain(vsmStoreTenantConfig.displayName);
    });

    it('keeps Vape/420 taxonomy and specs in the vertical pack', () => {
        expect(vape420VerticalPackConfig.sections.map((section) => section.slug)).toEqual(['vape', '420']);
        expect(getVape420SectionPageConfig('vape')).toEqual(
            expect.objectContaining({
                title: 'Vape Collection',
                subtitle: 'Pods, l\u00edquidos, accesorios y todo lo que necesitas para vapear.',
                seoDescription: 'Explora toda nuestra colecci\u00f3n de vapeo: pods, l\u00edquidos, accesorios y m\u00e1s.',
                routePrefix: '/vape',
                themeToken: 'vape',
            }),
        );
        expect(getVape420SectionPageConfig('420')).toEqual(
            expect.objectContaining({
                title: '420 Zone',
                subtitle: 'Herbal, grinders, papel, accesorios y m\u00e1s para tu sesi\u00f3n perfecta.',
                seoDescription: 'Descubre nuestra selecci\u00f3n completa de productos 420: herbal, accesorios y m\u00e1s.',
                routePrefix: '/420',
                themeToken: 'herbal',
            }),
        );
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
        expect(vape420VerticalPackConfig.marketing.homeHero.primaryCopy).toEqual({
            title: 'Vapes y 420',
            subtitle: 'seleccionados',
            description:
                'Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.',
            tag: 'Envíos Nacionales',
        });
        expect(NATIONAL_HOME_HERO_COPY).toEqual(vape420VerticalPackConfig.marketing.homeHero.primaryCopy);
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
