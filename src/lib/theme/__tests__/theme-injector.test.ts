import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    hexToRgbString,
    rgbStringToHex,
    calculateContrastForeground,
    resolveTokens,
    applyThemeTokens,
    getStoredPreset,
    saveStoredPreset,
    saveStoredCustomTokens,
    getStoredCustomTokens,
} from '../theme-injector';
import { THEME_PRESETS } from '../presets';

describe('theme-injector', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('hexToRgbString', () => {
        it('converts standard 6-digit hex with hash', () => {
            expect(hexToRgbString('#3b82f6')).toBe('59 130 246');
            expect(hexToRgbString('#10b981')).toBe('16 185 129');
            expect(hexToRgbString('#000000')).toBe('0 0 0');
            expect(hexToRgbString('#ffffff')).toBe('255 255 255');
        });

        it('converts 6-digit hex without hash', () => {
            expect(hexToRgbString('3b82f6')).toBe('59 130 246');
        });

        it('converts 3-digit shorthand hex', () => {
            expect(hexToRgbString('#fff')).toBe('255 255 255');
            expect(hexToRgbString('#000')).toBe('0 0 0');
            expect(hexToRgbString('f00')).toBe('255 0 0');
        });

        it('returns null on invalid input', () => {
            expect(hexToRgbString('')).toBeNull();
            expect(hexToRgbString('invalid')).toBeNull();
            expect(hexToRgbString('#12')).toBeNull();
            expect(hexToRgbString('#1234567')).toBeNull();
            // @ts-expect-error test invalid types
            expect(hexToRgbString(null)).toBeNull();
        });
    });

    describe('calculateContrastForeground', () => {
        it('returns dark text for light background colors (WCAG AA/AAA)', () => {
            expect(calculateContrastForeground('#f4f4f5')).toBe('9 9 11'); // Zinc 100
            expect(calculateContrastForeground('#ffffff')).toBe('9 9 11'); // Pure White
            expect(calculateContrastForeground('#f59e0b')).toBe('9 9 11'); // Amber 500
            expect(calculateContrastForeground('#10b981')).toBe('9 9 11'); // Emerald 500
        });

        it('returns white text for dark/saturated background colors', () => {
            expect(calculateContrastForeground('#3b82f6')).toBe('255 255 255'); // Electric Blue
            expect(calculateContrastForeground('#ef4444')).toBe('255 255 255'); // Crimson
            expect(calculateContrastForeground('#09090b')).toBe('255 255 255'); // Dark Slate
        });

        it('safely falls back to white text on invalid hex', () => {
            expect(calculateContrastForeground('invalid')).toBe('255 255 255');
        });
    });

    describe('rgbStringToHex', () => {
        it('converts rgb triplet string to hex', () => {
            expect(rgbStringToHex('59 130 246')).toBe('#3b82f6');
            expect(rgbStringToHex('16 185 129')).toBe('#10b981');
            expect(rgbStringToHex('0 0 0')).toBe('#000000');
            expect(rgbStringToHex('255 255 255')).toBe('#ffffff');
        });

        it('handles invalid rgb triplet input gracefully', () => {
            expect(rgbStringToHex('')).toBe('#000000');
            expect(rgbStringToHex('not rgb')).toBe('#000000');
            expect(rgbStringToHex('999 999 999')).toBe('#000000');
        });
    });

    describe('resolveTokens', () => {
        it('resolves preset tokens accurately', () => {
            const herbalTokens = resolveTokens('herbal-420');
            expect(herbalTokens.accentPrimary).toBe('16 185 129');
            expect(herbalTokens.bgPrimary).toBe('10 15 13');
            expect(herbalTokens.accentForeground).toBe('10 15 13');
        });

        it('applies partial overrides to preset tokens', () => {
            const customTokens = resolveTokens('vape-neon', {
                accentPrimary: '255 0 128',
            });
            expect(customTokens.accentPrimary).toBe('255 0 128');
            expect(customTokens.bgPrimary).toBe(THEME_PRESETS['vape-neon'].tokens.bgPrimary);
        });

        it('falls back to default preset on unknown preset ID', () => {
            // @ts-expect-error testing invalid preset id
            const tokens = resolveTokens('unknown-id');
            expect(tokens.accentPrimary).toBe(THEME_PRESETS['vape-neon'].tokens.accentPrimary);
        });
    });

    describe('applyThemeTokens', () => {
        it('sets CSS variables on a mock DOM element', () => {
            const element = document.createElement('div');
            const tokens = THEME_PRESETS['amber-motor'].tokens;

            applyThemeTokens(tokens, element);

            expect(element.style.getPropertyValue('--accent-primary')).toBe('245 158 11');
            expect(element.style.getPropertyValue('--accent-secondary')).toBe('234 88 12');
            expect(element.style.getPropertyValue('--accent-foreground')).toBe('12 12 14');
            expect(element.style.getPropertyValue('--bg-primary')).toBe('12 12 14');
        });
    });

    describe('localStorage persistence', () => {
        it('stores and retrieves theme preset', () => {
            expect(getStoredPreset()).toBe('vape-neon');

            saveStoredPreset('amber-motor');
            expect(getStoredPreset()).toBe('amber-motor');
        });

        it('stores and retrieves custom tokens', () => {
            expect(getStoredCustomTokens()).toBeNull();

            const custom = { accentPrimary: '123 45 67' };
            saveStoredCustomTokens(custom);
            expect(getStoredCustomTokens()).toEqual(custom);

            saveStoredCustomTokens(null);
            expect(getStoredCustomTokens()).toBeNull();
        });
    });
});
