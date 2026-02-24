import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipe } from '../useSwipe';
import { createRef } from 'react';

describe('useSwipe Hook', () => {
    it('debería registrar y limpiar los event listeners correctamente', () => {
        const ref = createRef<HTMLElement>();
        const mockElement = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as unknown as HTMLElement;
        
        // @ts-ignore - Forzamos el ref para la prueba
        ref.current = mockElement;

        const { unmount } = renderHook(() => useSwipe(ref, {}));

        // Verificar que se agregaron los listeners
        expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
        expect(mockElement.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true });
        expect(mockElement.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));

        // Desmontar y verificar limpieza
        unmount();
        expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
        expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
        expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    // Nota: Simular eventos táctiles completos en JSDOM es complejo y propenso a errores.
    // La prueba principal aquí es asegurar que el hook se monta/desmonta sin errores
    // y maneja correctamente las referencias nulas.
    
    it('no debería fallar si el ref es null', () => {
        const ref = createRef<HTMLElement>();
        const { result } = renderHook(() => useSwipe(ref, {}));
        expect(result.current).toBeUndefined(); // El hook no retorna nada
    });
});
