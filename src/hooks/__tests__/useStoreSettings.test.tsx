import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';
import { useStoreSettings } from '../useStoreSettings';

const getStoreSettingsMock = vi.hoisted(() => vi.fn());
const updateStoreSettingsMock = vi.hoisted(() => vi.fn());

vi.mock('@/services', () => ({
    getStoreSettings: () => getStoreSettingsMock(),
    updateStoreSettings: (...args: unknown[]) => updateStoreSettingsMock(...args),
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe('useStoreSettings', () => {
    beforeEach(() => {
        getStoreSettingsMock.mockReset();
        updateStoreSettingsMock.mockReset();
    });

    it('delegates the DB-empty fallback to the storefront settings helper', async () => {
        getStoreSettingsMock.mockResolvedValue(null);

        const { result } = renderHook(() => useStoreSettings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(getStorefrontSettingsFallback());
        });
    });

    it('preserves store settings returned by the service', async () => {
        const serviceSettings = {
            ...getStorefrontSettingsFallback(),
            site_name: 'Admin configured store',
            hero_sliders: [],
        };
        getStoreSettingsMock.mockResolvedValue(serviceSettings);

        const { result } = renderHook(() => useStoreSettings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.data).toBe(serviceSettings);
        });
    });
});
