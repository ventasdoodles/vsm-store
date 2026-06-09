import type { Section } from '@/types/constants';
import type { VerticalPackConfig } from './types';

export interface StorefrontRenderabilityRailConfig {
    loadingSkeletonCount: number;
    emptyStateTitle: string;
    emptyStateDescription: string;
    emptyStateCtaLabel: string;
    emptyStateCtaHref: string;
    emptyStateDesktopActionClassName: string;
    emptyStateDesktopActionIconClassName: string;
    emptyStateMobileActionClassName: string;
    emptyStateMobileActionIconClassName: string;
}

export interface StorefrontRenderabilityGridConfig {
    loadingSkeletonCount: number;
    emptyStateTitle: string;
    emptyStateSubtext: string;
    emptyStateCtaLabel: string;
    emptyStateCtaHref: string;
    emptyStateActionClassName: string;
    emptyStateActionIconClassName: string;
}

export interface StorefrontRenderabilityProductizationConfig {
    rail: StorefrontRenderabilityRailConfig;
    grid: StorefrontRenderabilityGridConfig;
}

export const getVape420StorefrontRenderabilityConfig = (
    config: VerticalPackConfig,
    section?: Section,
): StorefrontRenderabilityProductizationConfig => {
    const sectionHref = section ? `/${section}` : '/buscar';

    let themeToken = 'vape';
    if (section) {
        const found = config.sections.find((s) => s.slug === section);
        if (found) {
            themeToken = found.themeToken;
        }
    } else {
        themeToken = config.sections[0]?.themeToken || 'vape';
    }

    let actionButtonClass = 'mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:-translate-y-0.5';
    if (themeToken === 'vape') {
        actionButtonClass = 'mt-6 inline-flex items-center gap-2 rounded-xl bg-vape-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-vape-500/20 transition-all hover:bg-vape-600 hover:-translate-y-0.5';
    } else if (themeToken === 'herbal' || themeToken === '420') {
        actionButtonClass = 'mt-6 inline-flex items-center gap-2 rounded-xl bg-herbal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-herbal-500/20 transition-all hover:bg-herbal-600 hover:-translate-y-0.5';
    }

    return {
        rail: {
            loadingSkeletonCount: 4,
            emptyStateTitle: 'Catálogo en rotación',
            emptyStateDescription:
                'Estamos actualizando esta selección. Revisa el resto del catálogo mientras cargamos nuevas piezas.',
            emptyStateCtaLabel: 'Explorar catálogo',
            emptyStateCtaHref: sectionHref,
            emptyStateDesktopActionClassName:
                'hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-theme-secondary/40 hover:bg-theme-secondary/60 backdrop-blur-md text-sm font-bold text-theme-primary uppercase tracking-wider transition-all duration-300 hover:scale-105',
            emptyStateDesktopActionIconClassName: 'h-4 w-4',
            emptyStateMobileActionClassName:
                'flex flex-col items-center gap-3 text-theme-secondary hover:text-theme-primary transition-colors',
            emptyStateMobileActionIconClassName: 'w-6 h-6',
        },
        grid: {
            loadingSkeletonCount: 8,
            emptyStateTitle: 'No hay productos disponibles',
            emptyStateSubtext: 'Intenta con otra categoría o sección',
            emptyStateCtaLabel: 'Explorar catálogo',
            emptyStateCtaHref: '/buscar',
            emptyStateActionClassName: actionButtonClass,
            emptyStateActionIconClassName: 'h-4 w-4',
        },
    };
};
