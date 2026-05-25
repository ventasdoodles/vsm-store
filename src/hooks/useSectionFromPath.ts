/**
 * Hook que determina la sección activa (vape | 420) basado en el pathname.
 * Centralizado para evitar duplicación en SectionPage, ProductDetail, etc.
 */
import { useLocation } from 'react-router-dom';
import { resolveSectionFromRouteManifest } from '@/config/productization';
import type { Section } from '@/types/constants';

export function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return resolveSectionFromRouteManifest(pathname);
}
