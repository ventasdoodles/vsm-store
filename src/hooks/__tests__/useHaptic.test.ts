import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHaptic } from '../useHaptic';

describe('useHaptic Hook', () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
        // Mockear navigator.vibrate
        Object.defineProperty(global, 'navigator', {
            value: {
                vibrate: vi.fn(),
            },
            writable: true,
        });
    });

    afterEach(() => {
        // Restaurar navigator original
        Object.defineProperty(global, 'navigator', {
            value: originalNavigator,
            writable: true,
        });
        vi.clearAllMocks();
    });

    it('debería llamar a navigator.vibrate con 10ms para "light"', () => {
        const { result } = renderHook(() => useHaptic());
        result.current.trigger('light');
        expect(global.navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('debería llamar a navigator.vibrate con 40ms para "medium"', () => {
        const { result } = renderHook(() => useHaptic());
        result.current.trigger('medium');
        expect(global.navigator.vibrate).toHaveBeenCalledWith(40);
    });

    it('debería llamar a navigator.vibrate con 80ms para "heavy"', () => {
        const { result } = renderHook(() => useHaptic());
        result.current.trigger('heavy');
        expect(global.navigator.vibrate).toHaveBeenCalledWith(80);
    });

    it('debería llamar a navigator.vibrate con patrón para "success"', () => {
        const { result } = renderHook(() => useHaptic());
        result.current.trigger('success');
        expect(global.navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
    });

    it('debería llamar a navigator.vibrate con patrón para "error"', () => {
        const { result } = renderHook(() => useHaptic());
        result.current.trigger('error');
        expect(global.navigator.vibrate).toHaveBeenCalledWith([50, 30, 50, 30, 50]);
    });

    it('no debería fallar si navigator.vibrate no está disponible (ej. iOS Safari antiguo)', () => {
        Object.defineProperty(global, 'navigator', {
            value: {}, // Sin vibrate
            writable: true,
        });

        const { result } = renderHook(() => useHaptic());
        expect(() => result.current.trigger('light')).not.toThrow();
    });
});
