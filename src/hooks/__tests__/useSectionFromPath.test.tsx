import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TestRouter } from "@/lib/test-router";
import { describe, expect, it } from 'vitest';

import { getVape420SectionRouteManifest, resolveSectionFromRouteManifest, vape420VerticalPackConfig } from '@/config/productization';
import { useSectionFromPath } from '../useSectionFromPath';
import { VerticalPackProvider } from '@/contexts/VerticalPackContext';

import { vi } from 'vitest';

vi.mock('@/hooks/useStoreSettings', () => ({
    useStoreSettings: () => ({ data: { vertical_pack_config: vape420VerticalPackConfig }, isLoading: false })
}));

function renderUseSectionFromPath(initialPath: string) {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <VerticalPackProvider>
            <TestRouter initialEntries={[initialPath]}>{children}</TestRouter>
        </VerticalPackProvider>
    );

    return renderHook(() => useSectionFromPath(vape420VerticalPackConfig), { wrapper });
}

describe('useSectionFromPath', () => {
    it('keeps current root routes aligned with the static productization route manifest', () => {
        const routeManifest = getVape420SectionRouteManifest(vape420VerticalPackConfig);

        expect(
            routeManifest.map((route) => ({
                path: route.rootRoute,
                section: renderUseSectionFromPath(route.rootRoute).result.current,
            })),
        ).toEqual([
            { path: '/vape', section: 'vape' },
            { path: '/420', section: '420' },
        ]);
    });

    it('keeps current slug routes aligned with the static productization route manifest', () => {
        const routeManifest = getVape420SectionRouteManifest(vape420VerticalPackConfig);

        expect(
            routeManifest.map((route) => {
                const slugPath = route.slugRoutePattern.replace(':slug', 'manifest-test-slug');

                return {
                    path: slugPath,
                    section: renderUseSectionFromPath(slugPath).result.current,
                };
            }),
        ).toEqual([
            { path: '/vape/manifest-test-slug', section: 'vape' },
            { path: '/420/manifest-test-slug', section: '420' },
        ]);
    });

    it('keeps the binary path resolver aligned with the route manifest helper', () => {
        expect(resolveSectionFromRouteManifest('/vape', vape420VerticalPackConfig)).toBe('vape');
        expect(resolveSectionFromRouteManifest('/vape/manifest-test-slug', vape420VerticalPackConfig)).toBe('vape');
        expect(resolveSectionFromRouteManifest('/420', vape420VerticalPackConfig)).toBe('420');
        expect(resolveSectionFromRouteManifest('/420/manifest-test-slug', vape420VerticalPackConfig)).toBe('420');
        expect(resolveSectionFromRouteManifest('/not-a-section', vape420VerticalPackConfig)).toBe('vape');
        expect(
            renderUseSectionFromPath('/not-a-section').result.current,
        ).toBe(resolveSectionFromRouteManifest('/not-a-section', vape420VerticalPackConfig));
    });
});
