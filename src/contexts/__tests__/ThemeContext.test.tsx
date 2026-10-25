import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext & useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.style.cssText = '';
    });

    it('initializes with default vape-neon preset', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.activePreset).toBe('vape-neon');
        expect(result.current.themeTokens.accentPrimary).toBe('59 130 246');
        expect(result.current.availablePresets.length).toBeGreaterThanOrEqual(5);
    });

    it('changes theme preset and applies CSS variables to root', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setPreset('herbal-420');
        });

        expect(result.current.activePreset).toBe('herbal-420');
        expect(result.current.themeTokens.accentPrimary).toBe('16 185 129');
        expect(document.documentElement.style.getPropertyValue('--accent-primary')).toBe('16 185 129');
        expect(document.documentElement.style.getPropertyValue('--accent-foreground')).toBe('10 15 13');
    });

    it('supports custom hex colors with automatic contrast foreground calculation', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setCustomHexColors({
                accentPrimary: '#facc15', // Yellow 400 (light background)
            });
        });

        expect(result.current.activePreset).toBe('custom');
        expect(result.current.themeTokens.accentForeground).toBe('9 9 11'); // Dark text on yellow for AAA contrast
        expect(document.documentElement.style.getPropertyValue('--accent-foreground')).toBe('9 9 11');
    });

    it('syncs theme across tabs on window storage events', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'vsm_theme_preset_id',
                    newValue: 'cyber-crimson',
                })
            );
        });

        expect(result.current.activePreset).toBe('cyber-crimson');
        expect(result.current.themeTokens.accentPrimary).toBe('239 68 68');
        expect(document.documentElement.style.getPropertyValue('--accent-primary')).toBe('239 68 68');
    });

    it('resets to default preset', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setPreset('amber-motor');
        });
        expect(result.current.activePreset).toBe('amber-motor');

        act(() => {
            result.current.resetToDefault();
        });
        expect(result.current.activePreset).toBe('vape-neon');
        expect(document.documentElement.style.getPropertyValue('--accent-primary')).toBe('59 130 246');
    });
});
