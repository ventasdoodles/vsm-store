/**
 * Hook que determina la sección activa (vape | 420) basado en el pathname.
 * Centralizado para evitar duplicación en SectionPage, ProductDetail, etc.
 */
import { useLocation } from '@tanstack/react-router';
import { resolveSectionFromRouteManifest } from '@/config/productization';
import type { Section } from '@/types/constants';

import type { VerticalPackConfig } from '@/config/productization/types';

export function useSectionFromPath(config?: VerticalPackConfig | null): Section {
    const { pathname } = useLocation();
    if (!config) return 'vape' as Section; // Fallback during load
    return resolveSectionFromRouteManifest(pathname, config);
}
