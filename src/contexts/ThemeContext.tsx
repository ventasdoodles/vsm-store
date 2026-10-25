import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react';
import {
    DEFAULT_THEME_PRESET_ID,
    THEME_PRESET_LIST,
    THEME_PRESETS,
    applyThemeTokens,
    calculateContrastForeground,
    getStoredCustomTokens,
    getStoredPreset,
    hexToRgbString,
    resolveTokens,
    saveStoredCustomTokens,
    saveStoredPreset,
    type ThemeContextValue,
    type ThemePresetId,
    type ThemeTokens,
} from '@/lib/theme';

const defaultContextValue: ThemeContextValue = {
    activePreset: DEFAULT_THEME_PRESET_ID,
    themeTokens: THEME_PRESETS[DEFAULT_THEME_PRESET_ID].tokens,
    availablePresets: THEME_PRESET_LIST,
    setPreset: () => {},
    setCustomHexColors: () => {},
    resetToDefault: () => {},
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
    children: ReactNode;
    initialPreset?: ThemePresetId;
}

export function ThemeProvider({ children, initialPreset }: ThemeProviderProps) {
    const [activePreset, setActivePreset] = useState<ThemePresetId>(() => {
        if (initialPreset && initialPreset in THEME_PRESETS) {
            return initialPreset;
        }
        return getStoredPreset();
    });

    const [customOverrides, setCustomOverrides] = useState<Partial<ThemeTokens> | null>(() => {
        return getStoredCustomTokens();
    });

    // Multi-tab storage event listener
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'vsm_theme_preset_id' && e.newValue && e.newValue in THEME_PRESETS) {
                setActivePreset(e.newValue as ThemePresetId);
            }
            if (e.key === 'vsm_custom_theme_tokens') {
                try {
                    setCustomOverrides(e.newValue ? JSON.parse(e.newValue) : null);
                } catch {
                    // Ignore JSON parse error
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Compute active resolved tokens
    const themeTokens = useMemo(() => {
        return resolveTokens(activePreset, customOverrides ?? undefined);
    }, [activePreset, customOverrides]);

    // Apply tokens to document root whenever they change
    useEffect(() => {
        applyThemeTokens(themeTokens);
    }, [themeTokens]);

    const setPreset = (presetId: ThemePresetId) => {
        if (presetId in THEME_PRESETS) {
            setActivePreset(presetId);
            saveStoredPreset(presetId);
            if (presetId !== 'custom') {
                setCustomOverrides(null);
                saveStoredCustomTokens(null);
            }
        }
    };

    const setCustomHexColors = (colors: {
        accentPrimary?: string;
        accentSecondary?: string;
        bgPrimary?: string;
    }) => {
        const overrides: Partial<ThemeTokens> = {};

        if (colors.accentPrimary) {
            const rgb = hexToRgbString(colors.accentPrimary);
            if (rgb) {
                overrides.accentPrimary = rgb;
                overrides.vsmAccentPrimary = rgb;
                // Auto calculate accessible contrast foreground text
                overrides.accentForeground = calculateContrastForeground(colors.accentPrimary);
            }
        }

        if (colors.accentSecondary) {
            const rgb = hexToRgbString(colors.accentSecondary);
            if (rgb) {
                overrides.accentSecondary = rgb;
                overrides.vsmAccentSecondary = rgb;
            }
        }

        if (colors.bgPrimary) {
            const rgb = hexToRgbString(colors.bgPrimary);
            if (rgb) {
                overrides.bgPrimary = rgb;
            }
        }

        setActivePreset('custom');
        saveStoredPreset('custom');
        setCustomOverrides(overrides);
        saveStoredCustomTokens(overrides);
    };

    const resetToDefault = () => {
        setActivePreset(DEFAULT_THEME_PRESET_ID);
        saveStoredPreset(DEFAULT_THEME_PRESET_ID);
        setCustomOverrides(null);
        saveStoredCustomTokens(null);
    };

    const value: ThemeContextValue = useMemo(() => ({
        activePreset,
        themeTokens,
        availablePresets: THEME_PRESET_LIST,
        setPreset,
        setCustomHexColors,
        resetToDefault,
    }), [activePreset, themeTokens]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        if (import.meta.env.DEV) {
            console.warn('[useTheme] Hook called outside of <ThemeProvider>. Using default theme tokens.');
        }
        return defaultContextValue;
    }
    return context;
}
