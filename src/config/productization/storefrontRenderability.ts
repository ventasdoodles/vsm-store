import type { Section } from '@/types/constants';

export interface StorefrontRenderabilityRailConfig {
    loadingSkeletonCount: number;
    emptyStateTitle: string;
    emptyStateDescription: string;
    emptyStateCtaLabel: string;
    emptyStateCtaHref: string;
}

export interface StorefrontRenderabilityGridConfig {
    loadingSkeletonCount: number;
    emptyStateTitle: string;
    emptyStateSubtext: string;
    emptyStateCtaLabel: string;
    emptyStateCtaHref: string;
}

export interface StorefrontRenderabilityProductizationConfig {
    rail: StorefrontRenderabilityRailConfig;
    grid: StorefrontRenderabilityGridConfig;
}

export const getVape420StorefrontRenderabilityConfig = (
    section?: Section,
): StorefrontRenderabilityProductizationConfig => {
    const sectionHref = section ? `/${section}` : '/buscar';

    return {
        rail: {
            loadingSkeletonCount: 4,
            emptyStateTitle: 'Catálogo en rotación',
            emptyStateDescription:
                'Estamos actualizando esta selección. Revisa el resto del catálogo mientras cargamos nuevas piezas.',
            emptyStateCtaLabel: 'Explorar catálogo',
            emptyStateCtaHref: sectionHref,
        },
        grid: {
            loadingSkeletonCount: 8,
            emptyStateTitle: 'No hay productos disponibles',
            emptyStateSubtext: 'Intenta con otra categoría o sección',
            emptyStateCtaLabel: 'Explorar catálogo',
            emptyStateCtaHref: '/buscar',
        },
    };
};
