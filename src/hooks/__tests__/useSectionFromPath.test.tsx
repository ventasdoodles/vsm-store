import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { getVape420SectionRouteManifest } from '@/config/productization';
import { useSectionFromPath } from '../useSectionFromPath';

function renderUseSectionFromPath(initialPath: string) {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    );

    return renderHook(() => useSectionFromPath(), { wrapper });
}

describe('useSectionFromPath', () => {
    it('keeps current root routes aligned with the static productization route manifest', () => {
        const routeManifest = getVape420SectionRouteManifest();

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
        const routeManifest = getVape420SectionRouteManifest();

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
});
