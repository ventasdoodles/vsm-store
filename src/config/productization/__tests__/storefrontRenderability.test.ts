import { describe, expect, it } from 'vitest';
import { getVape420StorefrontRenderabilityConfig } from '../storefrontRenderability';

describe('storefront renderability productization', () => {
    it('keeps the shared grid and rail renderability contract stable', () => {
        expect(getVape420StorefrontRenderabilityConfig('vape')).toEqual(
            expect.objectContaining({
                rail: expect.objectContaining({
                    loadingSkeletonCount: 4,
                    emptyStateTitle: 'Catálogo en rotación',
                    emptyStateDescription:
                        'Estamos actualizando esta selección. Revisa el resto del catálogo mientras cargamos nuevas piezas.',
                    emptyStateCtaLabel: 'Explorar catálogo',
                    emptyStateCtaHref: '/vape',
                    emptyStateDesktopActionClassName:
                        'hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-theme-secondary/40 hover:bg-theme-secondary/60 backdrop-blur-md text-sm font-bold text-theme-primary uppercase tracking-wider transition-all duration-300 hover:scale-105',
                    emptyStateDesktopActionIconClassName: 'h-4 w-4',
                    emptyStateMobileActionClassName:
                        'flex flex-col items-center gap-3 text-theme-secondary hover:text-theme-primary transition-colors',
                    emptyStateMobileActionIconClassName: 'w-6 h-6',
                }),
                grid: expect.objectContaining({
                    loadingSkeletonCount: 8,
                    emptyStateTitle: 'No hay productos disponibles',
                    emptyStateSubtext: 'Intenta con otra categoría o sección',
                    emptyStateCtaLabel: 'Explorar catálogo',
                    emptyStateCtaHref: '/buscar',
                    emptyStateActionClassName:
                        'mt-6 inline-flex items-center gap-2 rounded-xl bg-vape-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-vape-500/20 transition-all hover:bg-vape-600 hover:-translate-y-0.5',
                    emptyStateActionIconClassName: 'h-4 w-4',
                }),
            }),
        );
    });

    it('keeps the fallback hrefs stable when no section is supplied', () => {
        const config = getVape420StorefrontRenderabilityConfig();

        expect(config.rail.emptyStateCtaHref).toBe('/buscar');
        expect(config.grid.emptyStateCtaHref).toBe('/buscar');
    });
});
