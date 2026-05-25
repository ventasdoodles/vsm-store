import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SITE_CONFIG } from '@/config/site';
import { NATIONAL_HOME_HERO_COPY } from '@/constants/homeHero';
import { STORE_META_COPY } from '@/constants/storeMeta';
import {
    buildVerticalPackRouteManifest,
    assertValidVerticalPackContract,
    defineVerticalPack,
    getVape420CategoryShowcaseFallbackCategories,
    getVape420SectionRouteManifest,
    getVape420SectionDefaultSpecs,
    getVape420SectionPageConfig,
    getVape420SectionPresentationConfig,
    getVape420ProductDetailPresentationConfig,
    getVape420ProductSurfacePresentationConfig,
    getVape420StorefrontRenderabilityConfig,
    getVape420SpecKeyNormalization,
    getVape420SuggestedSpecs,
    getVape420PublicSectionRouteDeclarations,
    normalizeVape420SpecKey,
    resolveSectionFromRouteManifest,
    VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS,
    vape420VerticalPackConfig,
    verticalPackAuthoringTemplate,
    vsmStoreTenantConfig,
} from '..';
import { getVape420CategoryShowcaseFallbackImageUrl } from '../categoryShowcase';
import { getVape420HomeHeroFallbackImageUrl, getVape420HomeHeroSliderFallbacks } from '../homeHero';

const productizationDir = dirname(fileURLToPath(import.meta.url)).replace(/\\__tests__$/, '');

const readProductizationImports = () =>
    [
        'index.ts',
        'tenant.ts',
        'types.ts',
        'vape420VerticalPack.ts',
        'homeHero.ts',
        'categoryShowcase.ts',
        'sectionPresentation.ts',
        'sectionPage.ts',
        'routes.ts',
        'specs.ts',
        'verticalPackContract.ts',
        'verticalPackAuthoring.ts',
    ]
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
        expect(() => assertValidVerticalPackContract(vape420VerticalPackConfig)).not.toThrow();
        expect(getVape420SectionRouteManifest()).toEqual(buildVerticalPackRouteManifest(vape420VerticalPackConfig));
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
        expect(getVape420SectionPresentationConfig('vape')).toEqual(
            expect.objectContaining({
                title: 'Vape Collection',
                subtitle: 'Pods, l\u00edquidos, accesorios y todo lo que necesitas para vapear.',
                isVape: true,
                heroBlobClassName: 'bg-vape-500',
                sortActiveClassName: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
                sortHighlightClassName: 'bg-vape-500/10 font-semibold text-vape-400',
            }),
        );
        expect(getVape420SectionPresentationConfig('420')).toEqual(
            expect.objectContaining({
                title: '420 Zone',
                subtitle: 'Herbal, grinders, papel, accesorios y m\u00e1s para tu sesi\u00f3n perfecta.',
                isVape: false,
                heroBlobClassName: 'bg-herbal-500',
                sortActiveClassName: 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
                sortHighlightClassName: 'bg-herbal-500/10 font-semibold text-herbal-400',
            }),
        );
        expect(getVape420ProductSurfacePresentationConfig('vape')).toEqual(
            expect.objectContaining({
                isVape: true,
                priceAccentTextClassName: 'text-vape-400',
                badgeSurfaceClassName: 'bg-vape-500/15 text-vape-400 border-vape-500/30',
                productChipClassName: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
                productTitleHoverClassName: 'group-hover:text-vape-400',
                categoryHoverShadowClassName: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] glow-vape-hover',
                categoryIconContainerClassName: 'bg-vape-500/10 text-vape-400 group-hover:bg-vape-500/20 group-hover:scale-110',
                categoryIconGlowClassName: 'bg-vape-500',
                categoryDotClassName: 'bg-vape-500/20 group-hover:bg-vape-400',
                quickViewSelectedVariantClassName: 'border-vape-500 bg-vape-500/10 text-vape-400',
            }),
        );
        expect(getVape420ProductSurfacePresentationConfig('420')).toEqual(
            expect.objectContaining({
                isVape: false,
                priceAccentTextClassName: 'text-herbal-400',
                badgeSurfaceClassName: 'bg-herbal-500/15 text-herbal-400 border-herbal-500/30',
                productChipClassName: 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
                productTitleHoverClassName: 'group-hover:text-herbal-400',
                categoryHoverShadowClassName: 'hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] glow-herbal-hover',
                categoryIconContainerClassName: 'bg-herbal-500/10 text-herbal-400 group-hover:bg-herbal-500/20 group-hover:scale-110',
                categoryIconGlowClassName: 'bg-herbal-500',
                categoryDotClassName: 'bg-herbal-500/20 group-hover:bg-herbal-400',
                quickViewSelectedVariantClassName: 'border-herbal-500 bg-herbal-500/10 text-herbal-400',
            }),
        );
        expect(getVape420ProductDetailPresentationConfig('vape')).toEqual(
            expect.objectContaining({
                isVape: true,
                breadcrumbLinkHoverClassName: 'hover:text-vape-400',
                actionSelectedVariantClassName: 'border-vape-500 bg-vape-500/10 text-vape-400',
                actionPrimaryButtonClassName: 'bg-gradient-to-r from-vape-600 to-vape-500 text-white shadow-xl shadow-vape-500/30 ring-1 ring-vape-400/50',
                stickyPriceAccentTextClassName: 'text-vape-400',
                stickyActionButtonGradientClassName: 'from-vape-500 to-vape-600 shadow-vape-500/20',
                frequentlyBoughtTogetherAccentClassName: 'bg-vape-500',
                productInfoTagHoverClassName: 'hover:text-vape-400 hover:border-vape-400/50',
                quickViewSelectedVariantClassName: 'border-vape-500 bg-vape-500/10 text-vape-400',
                quickViewSelectedThumbnailClassName: 'border-vape-500 ring-4 ring-vape-500/20 shadow-lg shadow-vape-500/20',
            }),
        );
        expect(getVape420ProductDetailPresentationConfig('420')).toEqual(
            expect.objectContaining({
                isVape: false,
                breadcrumbLinkHoverClassName: 'hover:text-herbal-400',
                actionSelectedVariantClassName: 'border-herbal-500 bg-herbal-500/10 text-herbal-400',
                actionPrimaryButtonClassName: 'bg-gradient-to-r from-herbal-600 to-herbal-500 text-white shadow-xl shadow-herbal-500/30 ring-1 ring-herbal-400/50',
                stickyPriceAccentTextClassName: 'text-herbal-400',
                stickyActionButtonGradientClassName: 'from-herbal-500 to-herbal-600 shadow-herbal-500/20',
                frequentlyBoughtTogetherAccentClassName: 'bg-herbal-500',
                productInfoTagHoverClassName: 'hover:text-herbal-400 hover:border-herbal-400/50',
                quickViewSelectedVariantClassName: 'border-herbal-500 bg-herbal-500/10 text-herbal-400',
                quickViewSelectedThumbnailClassName: 'border-herbal-500 ring-4 ring-herbal-500/20 shadow-lg shadow-herbal-500/20',
            }),
        );
        expect(getVape420StorefrontRenderabilityConfig('vape')).toEqual(
            expect.objectContaining({
                rail: expect.objectContaining({
                    loadingSkeletonCount: 4,
                    emptyStateTitle: 'Catálogo en rotación',
                    emptyStateDescription:
                        'Estamos actualizando esta selección. Revisa el resto del catálogo mientras cargamos nuevas piezas.',
                    emptyStateCtaLabel: 'Explorar catálogo',
                    emptyStateCtaHref: '/vape',
                }),
                grid: expect.objectContaining({
                    loadingSkeletonCount: 8,
                    emptyStateTitle: 'No hay productos disponibles',
                    emptyStateSubtext: 'Intenta con otra categoría o sección',
                    emptyStateCtaLabel: 'Explorar catálogo',
                    emptyStateCtaHref: '/buscar',
                }),
            }),
        );
        expect(getVape420StorefrontRenderabilityConfig()).toEqual(
            expect.objectContaining({
                rail: expect.objectContaining({
                    emptyStateCtaHref: '/buscar',
                }),
                grid: expect.objectContaining({
                    emptyStateCtaHref: '/buscar',
                }),
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
        expect(vape420VerticalPackConfig.attributeSchema.suggestedSpecsByCategorySlug.disposables).toEqual([
            'Puffs',
            'Capacidad',
            'Batería',
            'Nicotina',
            'Puerto de Carga',
        ]);
        expect(vape420VerticalPackConfig.attributeSchema.suggestedSpecsByCategorySlug.extractos).toEqual([
            'Concentración',
            'Método de Extracción',
            'Tipo',
            'THC%',
        ]);
        expect(getVape420SuggestedSpecs()).toBe(vape420VerticalPackConfig.attributeSchema.suggestedSpecsByCategorySlug);
        expect(getVape420SectionDefaultSpecs()).toEqual({
            vape: ['Marca', 'Modelo', 'Color'],
            '420': ['Marca', 'Tipo', 'Efecto'],
        });
        expect(getVape420SpecKeyNormalization().battery).toBe('Batería');
        expect(normalizeVape420SpecKey(' battery:')).toBe('Batería');
        expect(vape420VerticalPackConfig.marketing.homeHero.primaryCopy).toEqual({
            title: 'Vapes y 420',
            subtitle: 'seleccionados',
            description:
                'Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.',
            tag: 'Envíos Nacionales',
        });
        expect(NATIONAL_HOME_HERO_COPY).toEqual(vape420VerticalPackConfig.marketing.homeHero.primaryCopy);
        expect(getVape420HomeHeroSliderFallbacks()).toEqual([
            expect.objectContaining({
                id: '1',
                title: 'Vapes y 420',
                image: '/images/storefront-fallbacks/hero-vape.svg',
                ctaLink: '/vape',
            }),
            expect.objectContaining({
                id: '2',
                title: 'Productos Premium 420',
                image: '/images/storefront-fallbacks/hero-extracts.svg',
                ctaLink: '/420',
            }),
            expect.objectContaining({
                id: '3',
                title: 'Más de 50 Sabores',
                image: '/images/storefront-fallbacks/hero-generic.svg',
                ctaLink: '/vape/liquidos',
            }),
        ]);
        expect(getVape420HomeHeroFallbackImageUrl('/images/storefront-fallbacks/hero-vape.svg')).toBe(
            new URL('/images/storefront-fallbacks/hero-vape.svg', window.location.origin).toString(),
        );
        expect(getVape420CategoryShowcaseFallbackCategories()).toBe(
            vape420VerticalPackConfig.marketing.categoryShowcase.fallbackCategories,
        );
        expect(getVape420SectionRouteManifest()).toEqual([
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
        expect(getVape420SectionRouteManifest().map((route) => route.rootRoute)).toEqual(
            vape420VerticalPackConfig.sections.map((section) => section.routePrefix),
        );
        expect(getVape420PublicSectionRouteDeclarations()).toEqual([
            {
                sectionSlug: 'vape',
                path: '/vape',
                elementName: 'SectionPage',
            },
            {
                sectionSlug: 'vape',
                path: '/vape/:slug',
                elementName: 'SectionSlugResolver',
            },
            {
                sectionSlug: '420',
                path: '/420',
                elementName: 'SectionPage',
            },
            {
                sectionSlug: '420',
                path: '/420/:slug',
                elementName: 'SectionSlugResolver',
            },
        ]);
        expect(resolveSectionFromRouteManifest('/vape')).toBe('vape');
        expect(resolveSectionFromRouteManifest('/vape/manifest-test-slug')).toBe('vape');
        expect(resolveSectionFromRouteManifest('/420')).toBe('420');
        expect(resolveSectionFromRouteManifest('/420/manifest-test-slug')).toBe('420');
        expect(resolveSectionFromRouteManifest('/unmatched-route')).toBe('vape');
        expect(vape420VerticalPackConfig.marketing.categoryShowcase.fallbackCategories).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: '1',
                name: 'Líquidos',
                slug: 'liquidos',
                sectionSlug: 'vape',
                iconName: 'Flame',
                fallbackImagePath: '/images/storefront-fallbacks/category-liquidos.svg',
                presetId: 'orange-red',
            }),
            expect.objectContaining({
                id: '3',
                name: 'Cannabis Premium',
                slug: 'concentrados',
                sectionSlug: '420',
                iconName: 'Leaf',
                fallbackImagePath: '/images/storefront-fallbacks/category-cannabis.svg',
                presetId: 'green-emerald',
            }),
        ]));
        expect(getVape420CategoryShowcaseFallbackImageUrl('/images/storefront-fallbacks/category-liquidos.svg')).toBe(
            new URL('/images/storefront-fallbacks/category-liquidos.svg', window.location.origin).toString(),
        );
        expect(vape420VerticalPackConfig.fixtureMetadata.demoCategorySlugs).toEqual([
            'liquidos',
            'mods',
            'concentrados',
            'accesorios-vape',
        ]);
        expect(vape420VerticalPackConfig.fixtureMetadata.fallbackImageKeys).toEqual([
            'category-liquidos',
            'category-pods',
            'category-cannabis',
            'category-accesorios',
        ]);
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

    it('exports a practical authoring scaffold for future vertical packs', () => {
        expect(VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS.pack).toEqual(
            expect.arrayContaining([
                'id',
                'sections',
                'categoryTaxonomyHints',
                'attributeSchema',
                'marketing.homeHero.primaryCopy',
                'fixtureMetadata.demoCategorySlugs',
            ]),
        );
        expect(() => assertValidVerticalPackContract(verticalPackAuthoringTemplate)).not.toThrow();
        expect(() => defineVerticalPack(verticalPackAuthoringTemplate)).not.toThrow();
        expect(verticalPackAuthoringTemplate.id).toBe('template-vertical-pack');
        expect(verticalPackAuthoringTemplate.sections.map((section) => section.slug)).toEqual([
            'template-main',
            'template-alt',
        ]);
    });
});
