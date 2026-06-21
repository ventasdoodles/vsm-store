import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import type { VerticalPackConfig } from '@/config/productization/types';
import { activeVerticalPackConfig } from '@/config/productization/active';

interface VerticalPackContextValue {
    config: VerticalPackConfig | null;
    isLoading: boolean;
}

export const VerticalPackContext = createContext<VerticalPackContextValue>({
    config: null,
    isLoading: true,
});

export function VerticalPackProvider({ children }: { children: ReactNode }) {
    const { data: settings, isLoading } = useStoreSettings();

    const config = settings?.vertical_pack_config ?? activeVerticalPackConfig;

    const value = useMemo(() => ({
        config,
        isLoading
    }), [config, isLoading]);

    return (
        <VerticalPackContext.Provider value={value}>
            {children}
        </VerticalPackContext.Provider>
    );
}

export function useActiveVerticalPack() {
    const context = useContext(VerticalPackContext);
    if (!context) {
        throw new Error('useActiveVerticalPack must be used within a VerticalPackProvider');
    }
    return context;
}
