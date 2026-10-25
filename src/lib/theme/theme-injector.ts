/**
 * Theme Injector - Dynamic CSS Custom Properties Injector
 * Injects RGB channel tokens into document.documentElement for Tailwind compatibility.
 */

import { DEFAULT_THEME_PRESET_ID, THEME_PRESETS } from './presets';
import type { ThemePresetId, ThemeTokens } from './types';

const STORAGE_KEY = 'vsm_theme_preset_id';
const CUSTOM_TOKENS_KEY = 'vsm_custom_theme_tokens';

/**
 * Converts a hex color string (e.g. "#3b82f6" or "3b82f6" or "#fff") into an RGB channel triplet string "R G B".
 */
export function hexToRgbString(hex: string): string | null {
    if (!hex || typeof hex !== 'string') return null;

    let clean = hex.trim().replace(/^#/, '');

    if (clean.length === 3) {
        clean = clean
            .split('')
            .map(c => c + c)
            .join('');
    }

    if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) {
        return null;
    }

    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    return `${r} ${g} ${b}`;
}

/**
 * Calculates accessible foreground text color ("255 255 255" or "9 9 11") based on relative luminance.
 */
export function calculateContrastForeground(hex: string): string {
    const rgbStr = hexToRgbString(hex);
    if (!rgbStr) return '255 255 255';
    const parts = rgbStr.split(' ').map(Number);
    const r = parts[0] ?? 0;
    const g = parts[1] ?? 0;
    const b = parts[2] ?? 0;
    // Standard perceptual luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '9 9 11' : '255 255 255';
}

/**
 * Converts an RGB channel triplet string "R G B" into a hex string "#rrggbb".
 */
export function rgbStringToHex(rgb: string): string {
    if (!rgb || typeof rgb !== 'string') return '#000000';
    const parts = rgb.trim().split(/\s+/).map(Number);
    if (parts.length < 3 || parts.some(n => isNaN(n) || n < 0 || n > 255)) {
        return '#000000';
    }
    const r = parts[0] ?? 0;
    const g = parts[1] ?? 0;
    const b = parts[2] ?? 0;
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Maps ThemeTokens to their corresponding CSS custom properties and sets them on the target element.
 */
export function applyThemeTokens(tokens: ThemeTokens, target?: HTMLElement): void {
    if (typeof document === 'undefined') return;

    const root = target || document.documentElement;

    root.style.setProperty('--text-primary', tokens.textPrimary);
    root.style.setProperty('--text-secondary', tokens.textSecondary);
    root.style.setProperty('--text-tertiary', tokens.textTertiary);

    root.style.setProperty('--bg-primary', tokens.bgPrimary);
    root.style.setProperty('--bg-secondary', tokens.bgSecondary);
    root.style.setProperty('--bg-tertiary', tokens.bgTertiary);

    root.style.setProperty('--border-primary', tokens.borderPrimary);

    root.style.setProperty('--accent-primary', tokens.accentPrimary);
    root.style.setProperty('--accent-secondary', tokens.accentSecondary);
    root.style.setProperty('--accent-foreground', tokens.accentForeground);

    root.style.setProperty('--vsm-accent-primary', tokens.vsmAccentPrimary);
    root.style.setProperty('--vsm-accent-secondary', tokens.vsmAccentSecondary);

    root.style.setProperty('--status-success', tokens.statusSuccess);
    root.style.setProperty('--status-error', tokens.statusError);
}

/**
 * Resolves full tokens from a preset ID, optionally merged with partial overrides.
 */
export function resolveTokens(
    presetId: ThemePresetId,
    overrides?: Partial<ThemeTokens>
): ThemeTokens {
    const basePreset = THEME_PRESETS[presetId] || THEME_PRESETS[DEFAULT_THEME_PRESET_ID];
    if (!overrides) {
        return { ...basePreset.tokens };
    }
    return {
        ...basePreset.tokens,
        ...overrides,
    };
}

/**
 * Retrieves the stored theme preset from localStorage.
 */
export function getStoredPreset(): ThemePresetId {
    if (typeof window === 'undefined') return DEFAULT_THEME_PRESET_ID;
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemePresetId | null;
        if (stored && stored in THEME_PRESETS) {
            return stored;
        }
    } catch {
        // LocalStorage unreadable/blocked
    }
    return DEFAULT_THEME_PRESET_ID;
}

/**
 * Stores the active theme preset ID in localStorage.
 */
export function saveStoredPreset(presetId: ThemePresetId): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, presetId);
    } catch {
        // Ignore storage write errors
    }
}

/**
 * Retrieves custom tokens from localStorage.
 */
export function getStoredCustomTokens(): Partial<ThemeTokens> | null {
    if (typeof window === 'undefined') return null;
    try {
        const json = localStorage.getItem(CUSTOM_TOKENS_KEY);
        if (json) {
            return JSON.parse(json);
        }
    } catch {
        // Ignore JSON error
    }
    return null;
}

/**
 * Saves custom tokens to localStorage.
 */
export function saveStoredCustomTokens(tokens: Partial<ThemeTokens> | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (!tokens) {
            localStorage.removeItem(CUSTOM_TOKENS_KEY);
        } else {
            localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(tokens));
        }
    } catch {
        // Ignore storage write errors
    }
}
