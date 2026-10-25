/**
 * Theme Engine Types - VSM Multi-Vertical E-Commerce
 * Standardized CSS Custom Properties and Theme Presets.
 */

export type ThemePresetId =
    | 'vape-neon'
    | 'herbal-420'
    | 'amber-motor'
    | 'monochrome-minimal'
    | 'cyber-crimson'
    | 'custom';

export interface ThemeTokens {
    // Text tokens (RGB channel triplet: "R G B")
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;

    // Background tokens (RGB channel triplet: "R G B")
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;

    // Border tokens
    borderPrimary: string;

    // Primary Accents (RGB channel triplet: "R G B")
    accentPrimary: string;
    accentSecondary: string;

    // Adaptive Identity Accents
    vsmAccentPrimary: string;
    vsmAccentSecondary: string;

    // Status tokens
    statusSuccess: string;
    statusError: string;
}

export interface ThemePreset {
    id: ThemePresetId;
    name: string;
    description: string;
    vertical: string;
    tokens: ThemeTokens;
    preview: {
        primaryHex: string;
        secondaryHex: string;
        bgHex: string;
    };
}

export interface CustomThemeConfig {
    presetId: ThemePresetId;
    customTokens?: Partial<ThemeTokens>;
    customHexColors?: {
        accentPrimary?: string;
        accentSecondary?: string;
        bgPrimary?: string;
    };
}

export interface ThemeContextValue {
    activePreset: ThemePresetId;
    themeTokens: ThemeTokens;
    availablePresets: ThemePreset[];
    setPreset: (presetId: ThemePresetId) => void;
    setCustomHexColors: (colors: { accentPrimary?: string; accentSecondary?: string; bgPrimary?: string }) => void;
    resetToDefault: () => void;
}
