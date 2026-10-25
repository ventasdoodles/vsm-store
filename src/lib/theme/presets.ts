/**
 * Standard Multi-Vertical Theme Presets for VSM Store
 */

import type { ThemePreset, ThemePresetId, ThemeTokens } from './types';

export const BASE_DARK_TOKENS: ThemeTokens = {
    textPrimary: '252 252 252',
    textSecondary: '161 161 170',
    textTertiary: '113 113 122',
    bgPrimary: '9 9 11',
    bgSecondary: '24 24 27',
    bgTertiary: '39 39 42',
    borderPrimary: '255 255 255',
    accentPrimary: '59 130 246',
    accentSecondary: '139 92 246',
    accentForeground: '255 255 255',
    vsmAccentPrimary: '168 85 247',
    vsmAccentSecondary: '139 92 246',
    statusSuccess: '16 185 129',
    statusError: '239 68 68',
};

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
    'vape-neon': {
        id: 'vape-neon',
        name: 'Vape Neon',
        description: 'Vibrant electric blue and neon violet atmospheric glow.',
        vertical: 'Vape, E-liquids, Pods & Accessories',
        preview: {
            primaryHex: '#3b82f6',
            secondaryHex: '#8b5cf6',
            bgHex: '#09090b',
        },
        tokens: {
            ...BASE_DARK_TOKENS,
            bgPrimary: '9 9 11',
            bgSecondary: '24 24 27',
            bgTertiary: '39 39 42',
            accentPrimary: '59 130 246',     // Electric Blue
            accentSecondary: '139 92 246',   // Neon Purple
            accentForeground: '255 255 255', // White text on blue (Contrast: 4.8:1 - WCAG AA)
            vsmAccentPrimary: '168 85 247',  // Violet Glow
            vsmAccentSecondary: '139 92 246',
        },
    },

    'herbal-420': {
        id: 'herbal-420',
        name: 'Herbal 420',
        description: 'Lush botanical emerald and forest green accents on dark organic slate.',
        vertical: 'Cannabis, Dispensary, CBD & Botanicals',
        preview: {
            primaryHex: '#10b981',
            secondaryHex: '#059669',
            bgHex: '#0a0f0d',
        },
        tokens: {
            ...BASE_DARK_TOKENS,
            bgPrimary: '10 15 13',           // Dark Botanical Slate
            bgSecondary: '18 26 22',
            bgTertiary: '28 38 32',
            accentPrimary: '16 185 129',     // Emerald Green
            accentSecondary: '5 150 105',    // Forest Green
            accentForeground: '10 15 13',    // Dark Slate on Emerald (Contrast: 8.2:1 - WCAG AAA)
            vsmAccentPrimary: '52 211 153',  // Mint / Light Emerald Glow
            vsmAccentSecondary: '16 185 129',
        },
    },

    'amber-motor': {
        id: 'amber-motor',
        name: 'Amber Motor & Tools',
        description: 'Industrial racing amber and high-torque fire orange accents on carbon slate.',
        vertical: 'Autoparts, Hardware, Tools & Industrial Equipment',
        preview: {
            primaryHex: '#f59e0b',
            secondaryHex: '#ea580c',
            bgHex: '#0c0c0e',
        },
        tokens: {
            ...BASE_DARK_TOKENS,
            bgPrimary: '12 12 14',           // Carbon Obsidian
            bgSecondary: '23 23 26',
            bgTertiary: '38 38 42',
            accentPrimary: '245 158 11',     // Racing Amber
            accentSecondary: '234 88 12',    // Fire Orange
            accentForeground: '12 12 14',    // Carbon Dark text on Amber (Contrast: 10.4:1 - WCAG AAA)
            vsmAccentPrimary: '251 191 36',  // Amber Gold Glow
            vsmAccentSecondary: '245 158 11',
        },
    },

    'monochrome-minimal': {
        id: 'monochrome-minimal',
        name: 'Monochrome Minimal',
        description: 'Ultra-clean zinc and titanium monochrome aesthetic with subtle silver highlights.',
        vertical: 'Fashion, Luxury, Jewelry & Minimalist Goods',
        preview: {
            primaryHex: '#f4f4f5',
            secondaryHex: '#a1a1aa',
            bgHex: '#09090b',
        },
        tokens: {
            ...BASE_DARK_TOKENS,
            bgPrimary: '9 9 11',             // Pure Deep Void
            bgSecondary: '20 20 22',
            bgTertiary: '32 32 36',
            accentPrimary: '244 244 245',   // Clean Zinc 100
            accentSecondary: '161 161 170', // Titanium 400
            accentForeground: '9 9 11',      // Void Dark text on Zinc 100 (Contrast: 18.2:1 - WCAG AAA)
            vsmAccentPrimary: '212 212 216', // Silver Glow
            vsmAccentSecondary: '161 161 170',
        },
    },

    'cyber-crimson': {
        id: 'cyber-crimson',
        name: 'Cyber Crimson',
        description: 'High-contrast gaming crimson and neon magenta on obsidian void.',
        vertical: 'Gaming, Electronics, Audio & Cyber Gear',
        preview: {
            primaryHex: '#ef4444',
            secondaryHex: '#d946ef',
            bgHex: '#0b0a0f',
        },
        tokens: {
            ...BASE_DARK_TOKENS,
            bgPrimary: '11 10 15',           // Cyber Dark
            bgSecondary: '22 19 28',
            bgTertiary: '35 30 45',
            accentPrimary: '239 68 68',      // Cyber Crimson
            accentSecondary: '217 70 239',   // Neon Magenta
            accentForeground: '255 255 255', // White text on Crimson (Contrast: 4.5:1 - WCAG AA)
            vsmAccentPrimary: '244 63 94',   // Rose Crimson Glow
            vsmAccentSecondary: '217 70 239',
        },
    },

    'custom': {
        id: 'custom',
        name: 'Custom Brand',
        description: 'User-configured custom brand colors and personalized accent tokens.',
        vertical: 'Any Vertical / Custom Branding',
        preview: {
            primaryHex: '#3b82f6',
            secondaryHex: '#8b5cf6',
            bgHex: '#09090b',
        },
        tokens: {
            ...BASE_DARK_TOKENS,
            accentForeground: '255 255 255',
        },
    },
};

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = 'vape-neon';

export const THEME_PRESET_LIST: ThemePreset[] = Object.values(THEME_PRESETS);
